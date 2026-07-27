"""Katalog item kanonik + kepemilikan + equip + AC + carry weight.

Semua deterministik dan bebas LLM. Stacking dijamin oleh unique index parsial
di schema.sql, bukan oleh logika prompt.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass

from engine.checks import ability_mod
from store.db import slugify


@dataclass
class InvLine:
    """Satu baris tampilan inventory."""

    item_id: int
    name: str
    kind: str
    quantity: int
    weight: float
    is_equipped: bool
    enchantment: str


def ensure_template(
    conn: sqlite3.Connection,
    name: str,
    *,
    kind: str = "misc",
    weight: float = 0.0,
    damage: str | None = None,
    ac_base: int | None = None,
    ac_bonus: int = 0,
    description: str = "",
) -> int:
    """Daftarkan template item bila slug-nya belum ada. Kembalikan template id.

    Nama sama -> slug sama -> tidak pernah membuat template kedua (Invarian I4).
    """
    slug = slugify(name)
    row = conn.execute(
        "SELECT id FROM item_template WHERE slug = ?", (slug,)
    ).fetchone()
    if row:
        return int(row["id"])

    cur = conn.execute(
        """INSERT INTO item_template
               (slug, name, kind, weight, damage, ac_base, ac_bonus, description)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (slug, name, kind, weight, damage, ac_base, ac_bonus, description),
    )
    return int(cur.lastrowid)


def grant_item(
    conn: sqlite3.Connection,
    owner_id: int,
    template_id: int,
    quantity: int = 1,
    enchantment: str = "",
) -> int:
    """Tambah item ke tas. Item identik & tak dikenakan menumpuk jadi satu baris.

    Kembalikan quantity total baris setelah penambahan.
    """
    conn.execute(
        """INSERT INTO inventory_item (owner_id, template_id, quantity, enchantment)
           VALUES (?, ?, ?, ?)
           ON CONFLICT(owner_id, template_id, enchantment) WHERE is_equipped = 0
           DO UPDATE SET quantity = quantity + excluded.quantity""",
        (owner_id, template_id, quantity, enchantment),
    )
    row = conn.execute(
        """SELECT quantity FROM inventory_item
           WHERE owner_id = ? AND template_id = ? AND enchantment = ? AND is_equipped = 0""",
        (owner_id, template_id, enchantment),
    ).fetchone()
    return int(row["quantity"]) if row else 0


def remove_item(
    conn: sqlite3.Connection,
    owner_id: int,
    template_id: int,
    quantity: int = 1,
    enchantment: str = "",
) -> bool:
    """Kurangi/keluarkan item. Kembalikan True bila ada yang benar-benar dihapus."""
    row = conn.execute(
        """SELECT id, quantity FROM inventory_item
           WHERE owner_id = ? AND template_id = ? AND enchantment = ? AND is_equipped = 0""",
        (owner_id, template_id, enchantment),
    ).fetchone()
    if not row:
        return False
    remaining = int(row["quantity"]) - quantity
    if remaining > 0:
        conn.execute(
            "UPDATE inventory_item SET quantity = ? WHERE id = ?", (remaining, row["id"])
        )
    else:
        conn.execute("DELETE FROM inventory_item WHERE id = ?", (row["id"],))
    return True


def equip(conn: sqlite3.Connection, item_id: int) -> None:
    """Kenakan satu item. Bila menumpuk, pisahkan satu unit lalu tandai dikenakan."""
    row = conn.execute(
        "SELECT owner_id, template_id, quantity, enchantment FROM inventory_item WHERE id = ?",
        (item_id,),
    ).fetchone()
    if not row:
        raise ValueError(f"item {item_id} tidak ditemukan")

    if int(row["quantity"]) > 1:
        conn.execute(
            "UPDATE inventory_item SET quantity = quantity - 1 WHERE id = ?", (item_id,)
        )
        cur = conn.execute(
            """INSERT INTO inventory_item
                   (owner_id, template_id, quantity, enchantment, is_equipped)
               VALUES (?, ?, 1, ?, 1)""",
            (row["owner_id"], row["template_id"], row["enchantment"]),
        )
        equipped_id = int(cur.lastrowid)
    else:
        conn.execute("UPDATE inventory_item SET is_equipped = 1 WHERE id = ?", (item_id,))
        equipped_id = item_id

    recalc_ac(conn, int(row["owner_id"]))
    _unequip_conflicts(conn, int(row["owner_id"]), equipped_id)
    recalc_ac(conn, int(row["owner_id"]))


def _unequip_conflicts(conn: sqlite3.Connection, owner_id: int, keep_id: int) -> None:
    """Pastikan hanya satu armor dan satu weapon dikenakan sekaligus."""
    keep_kind = conn.execute(
        """SELECT t.kind FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.id = ?""",
        (keep_id,),
    ).fetchone()
    if not keep_kind or keep_kind["kind"] not in ("armor", "weapon"):
        return
    conn.execute(
        """UPDATE inventory_item SET is_equipped = 0
           WHERE owner_id = ? AND id != ? AND is_equipped = 1
             AND template_id IN (SELECT id FROM item_template WHERE kind = ?)""",
        (owner_id, keep_id, keep_kind["kind"]),
    )


def unequip(conn: sqlite3.Connection, item_id: int) -> None:
    """Lepas item lalu hitung ulang AC."""
    row = conn.execute(
        "SELECT owner_id FROM inventory_item WHERE id = ?", (item_id,)
    ).fetchone()
    if not row:
        return
    conn.execute("UPDATE inventory_item SET is_equipped = 0 WHERE id = ?", (item_id,))
    recalc_ac(conn, int(row["owner_id"]))


def recalc_ac(conn: sqlite3.Connection, character_id: int) -> int:
    """Hitung AC dari equipment + dex, simpan ke character. Bukan nilai buta."""
    ch = conn.execute(
        "SELECT dex_score FROM character WHERE id = ?", (character_id,)
    ).fetchone()
    dex = ability_mod(int(ch["dex_score"]))

    armor = conn.execute(
        """SELECT t.ac_base FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.owner_id = ? AND i.is_equipped = 1 AND t.kind = 'armor'
             AND t.ac_base IS NOT NULL LIMIT 1""",
        (character_id,),
    ).fetchone()

    if armor:
        ac = int(armor["ac_base"]) + min(dex, 2)   # armor menengah membatasi dex
    else:
        ac = 10 + dex

    bonus = conn.execute(
        """SELECT COALESCE(SUM(t.ac_bonus), 0) AS b
           FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.owner_id = ? AND i.is_equipped = 1""",
        (character_id,),
    ).fetchone()
    ac += int(bonus["b"])

    conn.execute("UPDATE character SET ac = ? WHERE id = ?", (ac, character_id))
    return ac


def carry_capacity(str_score: int) -> float:
    """Kapasitas angkut = str_score * 15. Tidak pernah 'maksimal N item'."""
    return str_score * 15.0


def current_weight(conn: sqlite3.Connection, character_id: int) -> float:
    """Total berat semua item yang dibawa."""
    row = conn.execute(
        """SELECT COALESCE(SUM(t.weight * i.quantity), 0) AS w
           FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.owner_id = ?""",
        (character_id,),
    ).fetchone()
    return float(row["w"])


def list_inventory(conn: sqlite3.Connection, character_id: int) -> list[InvLine]:
    """Daftar isi tas untuk panel /tas."""
    rows = conn.execute(
        """SELECT i.id, t.name, t.kind, i.quantity, t.weight, i.is_equipped, i.enchantment
           FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.owner_id = ? ORDER BY i.is_equipped DESC, t.name""",
        (character_id,),
    ).fetchall()
    return [
        InvLine(
            int(r["id"]), r["name"], r["kind"], int(r["quantity"]),
            float(r["weight"]), bool(r["is_equipped"]), r["enchantment"],
        )
        for r in rows
    ]


def find_template_by_name(conn: sqlite3.Connection, name: str) -> sqlite3.Row | None:
    """Cari template berdasar nama (via slug). Dipakai validator & use_item."""
    return conn.execute(
        "SELECT * FROM item_template WHERE slug = ?", (slugify(name),)
    ).fetchone()
