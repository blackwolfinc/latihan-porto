"""Gerbang legalitas aksi (langkah 3 turn loop).

Aksi yang gagal di sini DITOLAK sebelum narator dipanggil (Invarian I6).
Tidak ada LLM di modul ini.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass, field
from typing import Any

from engine.inventory import find_template_by_name
from store.repo import active_encounter, get_character


class Illegal(Exception):
    """Aksi tidak sah. Pesannya adalah alasan yang ditampilkan ke pemain."""


@dataclass
class ActionRequest:
    """Niat aksi hasil parser. Hanya niat + argumen, tidak pernah angka mekanik."""

    action: str
    args: dict[str, Any] = field(default_factory=dict)
    raw_input: str = ""


def validate(conn: sqlite3.Connection, campaign_id: int, req: ActionRequest) -> None:
    """Lempar Illegal bila aksi tidak sah pada state sekarang. Diam bila sah."""
    ch = get_character(conn, campaign_id)
    if ch is None:
        raise Illegal("Belum ada karakter di campaign ini.")

    enc = active_encounter(conn, campaign_id)
    action = req.action
    args = req.args

    # Karakter roboh (HP 0) tak bisa bertindak aktif — hanya bertahan/dipulihkan.
    if int(ch["hp_cur"]) <= 0 and action in ("attack", "move_to", "equip_item", "roll_check"):
        raise Illegal("Kamu roboh dan tak berdaya. Butuh pertolongan atau keajaiban "
                      "untuk bangkit (coba minum ramuan, beristirahat, atau /hp).")

    if action in ("use_item", "equip_item"):
        name = (args.get("item") or "").strip()
        if not name:
            raise Illegal("Item apa yang kamu maksud?")
        template = find_template_by_name(conn, name)
        owned = None
        if template:
            owned = conn.execute(
                """SELECT 1 FROM inventory_item
                   WHERE owner_id = ? AND template_id = ? LIMIT 1""",
                (ch["id"], template["id"]),
            ).fetchone()
        if not owned:
            raise Illegal(f"Kamu tidak membawa {name}.")

    elif action == "attack":
        target = (args.get("target") or "").strip()
        if not target:
            raise Illegal("Serang siapa?")
        if enc is not None:
            alive = conn.execute(
                """SELECT 1 FROM combatant
                   WHERE encounter_id = ? AND lower(name) = lower(?)
                     AND is_alive = 1 AND is_player = 0""",
                (enc["id"], target),
            ).fetchone()
            if not alive:
                raise Illegal(f"Tidak ada '{target}' yang bisa diserang di sini.")

    elif action == "rest":
        if enc is not None:
            raise Illegal("Tidak bisa beristirahat di tengah pertarungan.")

    # roll_check, move_to, talk_to, narrate_only: selalu sah pada tahap ini.
