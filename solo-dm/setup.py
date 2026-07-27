"""Pembuatan campaign & karakter, dan seeding katalog SRD.

Dipanggil sekali saat memulai campaign baru. Setelah ini, dunia berjalan lewat
orchestrator. Tidak ada LLM di sini.
"""
from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from engine.checks import ability_mod
from engine.inventory import ensure_template, equip, grant_item, recalc_ac
from store.db import init_schema, log_event, slugify

DATA_DIR = Path(__file__).parent / "data" / "srd"


def load_json(name: str) -> dict:
    return json.loads((DATA_DIR / name).read_text(encoding="utf-8"))


def seed_items(conn: sqlite3.Connection) -> dict[str, int]:
    """Daftarkan semua template item dari items.json. Kembalikan map slug->id."""
    items = load_json("items.json")
    mapping: dict[str, int] = {}
    for slug, data in items.items():
        tid = ensure_template(
            conn, data["name"], kind=data.get("kind", "misc"),
            weight=float(data.get("weight", 0)), damage=data.get("damage"),
            ac_base=data.get("ac_base"), ac_bonus=int(data.get("ac_bonus", 0)),
            description=data.get("description", ""),
        )
        mapping[slug] = tid
    return mapping


def default_scores(class_slug: str, classes: dict) -> dict[str, int]:
    """Alokasi ability sederhana: primary tinggi, sisanya menengah."""
    primary = classes[class_slug]["primary"]
    order = ["str", "dex", "con", "int", "wis", "cha"]
    pool = {"a": 15, "b": 14, "c": 13, "d": 12, "e": 10, "f": 8}
    values = list(pool.values())
    scores: dict[str, int] = {}
    # primary dapat 15/14, sisanya urut menurun.
    remaining = [a for a in order if a not in primary]
    for i, ab in enumerate(primary):
        scores[ab] = values[i]
    idx = len(primary)
    for ab in remaining:
        scores[ab] = values[idx]
        idx += 1
    return scores


def create_campaign(
    conn: sqlite3.Connection,
    *,
    campaign_name: str,
    character_name: str,
    class_slug: str,
    seed: int,
    scores: dict[str, int] | None = None,
) -> int:
    """Buat campaign + karakter + seed item + gear awal. Kembalikan campaign_id."""
    init_schema(conn)
    classes = load_json("classes.json")
    if class_slug not in classes:
        raise ValueError(f"kelas tidak dikenal: {class_slug}")
    cls = classes[class_slug]
    scores = scores or default_scores(class_slug, classes)

    cur = conn.execute(
        "INSERT INTO campaign (name, seed) VALUES (?, ?)", (campaign_name, seed)
    )
    campaign_id = int(cur.lastrowid)

    con_mod = ability_mod(scores["con"])
    dex_mod = ability_mod(scores["dex"])
    hp_max = max(1, cls["base_hp"] + con_mod)
    ac = 10 + dex_mod

    cur = conn.execute(
        """INSERT INTO character
               (campaign_id, name, class_slug, level, xp,
                str_score, dex_score, con_score, int_score, wis_score, cha_score,
                hp_cur, hp_max, ac, gold, proficiencies)
           VALUES (?, ?, ?, 1, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (campaign_id, character_name, class_slug,
         scores["str"], scores["dex"], scores["con"],
         scores["int"], scores["wis"], scores["cha"],
         hp_max, hp_max, ac, cls["starting_gold"],
         json.dumps(cls["proficiencies"])),
    )
    character_id = int(cur.lastrowid)

    # Lokasi awal.
    loc = conn.execute(
        "INSERT INTO location (campaign_id, slug, name, description) VALUES (?, ?, ?, ?)",
        (campaign_id, "gerbang-desa", "Gerbang Desa Ambarwastu",
         "Gerbang kayu tua di tepi hutan, tempat setiap petualangan bermula."),
    )
    conn.execute("UPDATE character SET location_id = ? WHERE id = ?",
                 (int(loc.lastrowid), character_id))

    # Item awal.
    item_ids = seed_items(conn)
    for slug in cls["starting_items"]:
        tid = item_ids.get(slug)
        if tid:
            grant_item(conn, character_id, tid, 1)
            log_event(conn, campaign_id, 0, "item_gain", {"item": slug, "qty": 1})

    # Kenakan zirah & senjata pertama yang dimiliki.
    _auto_equip(conn, character_id)
    recalc_ac(conn, character_id)

    log_event(conn, campaign_id, 0, "campaign_start",
              {"character": character_name, "class": class_slug})
    conn.commit()
    return campaign_id


def _auto_equip(conn: sqlite3.Connection, character_id: int) -> None:
    """Kenakan satu armor, satu weapon, dan satu shield bila ada di tas."""
    for kind in ("armor", "weapon", "shield"):
        row = conn.execute(
            """SELECT i.id FROM inventory_item i JOIN item_template t ON t.id = i.template_id
               WHERE i.owner_id = ? AND t.kind = ? AND i.is_equipped = 0 LIMIT 1""",
            (character_id, kind),
        ).fetchone()
        if row:
            equip(conn, int(row["id"]))
