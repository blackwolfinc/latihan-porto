"""Query tingkat lebih tinggi + perakitan state snapshot untuk prompt.

`state_snapshot` menghasilkan objek read-only yang diberikan ke LLM. LLM hanya
membaca ini; ia tidak pernah menulis balik (Invarian I1).
"""
from __future__ import annotations

import json
import sqlite3
from typing import Any

from engine.checks import ability_mod
from engine.inventory import carry_capacity, current_weight, list_inventory


def use_cursor(conn: sqlite3.Connection, campaign_id: int) -> tuple[int, int]:
    """Ambil (seed, cursor) untuk satu lemparan, lalu majukan cursor di DB.

    Ini yang membuat urutan dadu bisa dilanjutkan setelah save/load.
    """
    row = conn.execute(
        "SELECT seed, dice_cursor FROM campaign WHERE id = ?", (campaign_id,)
    ).fetchone()
    seed, cursor = int(row["seed"]), int(row["dice_cursor"])
    conn.execute(
        "UPDATE campaign SET dice_cursor = dice_cursor + 1 WHERE id = ?", (campaign_id,)
    )
    return seed, cursor


def get_campaign(conn: sqlite3.Connection, campaign_id: int) -> sqlite3.Row:
    return conn.execute("SELECT * FROM campaign WHERE id = ?", (campaign_id,)).fetchone()


def get_character(conn: sqlite3.Connection, campaign_id: int) -> sqlite3.Row:
    return conn.execute(
        "SELECT * FROM character WHERE campaign_id = ? LIMIT 1", (campaign_id,)
    ).fetchone()


def active_encounter(conn: sqlite3.Connection, campaign_id: int) -> sqlite3.Row | None:
    return conn.execute(
        "SELECT * FROM encounter WHERE campaign_id = ? AND status = 'active' LIMIT 1",
        (campaign_id,),
    ).fetchone()


def current_location(conn: sqlite3.Connection, character: sqlite3.Row) -> sqlite3.Row | None:
    if character is None or character["location_id"] is None:
        return None
    return conn.execute(
        "SELECT * FROM location WHERE id = ?", (character["location_id"],)
    ).fetchone()


def canon_facts(conn: sqlite3.Connection, campaign_id: int) -> list[str]:
    rows = conn.execute(
        "SELECT text FROM canon_fact WHERE campaign_id = ? ORDER BY id", (campaign_id,)
    ).fetchall()
    return [r["text"] for r in rows]


def recent_messages(
    conn: sqlite3.Connection, campaign_id: int, limit: int = 8
) -> list[sqlite3.Row]:
    rows = conn.execute(
        "SELECT role, content, turn FROM message WHERE campaign_id = ? "
        "ORDER BY id DESC LIMIT ?",
        (campaign_id, limit),
    ).fetchall()
    return list(reversed(rows))


def latest_summary(conn: sqlite3.Connection, campaign_id: int) -> str | None:
    row = conn.execute(
        "SELECT text FROM scene_summary WHERE campaign_id = ? ORDER BY id DESC LIMIT 1",
        (campaign_id,),
    ).fetchone()
    return row["text"] if row else None


def recent_events(
    conn: sqlite3.Connection, campaign_id: int, limit: int = 20
) -> list[sqlite3.Row]:
    return conn.execute(
        "SELECT turn, type, payload FROM event WHERE campaign_id = ? "
        "ORDER BY id DESC LIMIT ?",
        (campaign_id, limit),
    ).fetchall()


def combatants(conn: sqlite3.Connection, encounter_id: int) -> list[sqlite3.Row]:
    return conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? ORDER BY initiative DESC, id",
        (encounter_id,),
    ).fetchall()


def state_snapshot(conn: sqlite3.Connection, campaign_id: int) -> dict[str, Any]:
    """Objek read-only yang dilihat LLM. Ringkas tapi otoritatif."""
    ch = get_character(conn, campaign_id)
    loc = current_location(conn, ch)
    enc = active_encounter(conn, campaign_id)

    snapshot: dict[str, Any] = {
        "karakter": {
            "nama": ch["name"],
            "kelas": ch["class_slug"],
            "level": ch["level"],
            "hp": [ch["hp_cur"], ch["hp_max"]],
            "ac": ch["ac"],
            "gold": ch["gold"],
            "ability": {
                "str": ch["str_score"], "dex": ch["dex_score"], "con": ch["con_score"],
                "int": ch["int_score"], "wis": ch["wis_score"], "cha": ch["cha_score"],
            },
            "mod": {
                "str": ability_mod(ch["str_score"]), "dex": ability_mod(ch["dex_score"]),
                "con": ability_mod(ch["con_score"]), "int": ability_mod(ch["int_score"]),
                "wis": ability_mod(ch["wis_score"]), "cha": ability_mod(ch["cha_score"]),
            },
            "proficiencies": json.loads(ch["proficiencies"]),
        },
        "lokasi": {"nama": loc["name"], "deskripsi": loc["description"]} if loc else None,
        "tas": [
            {"nama": ln.name, "jumlah": ln.quantity, "dikenakan": ln.is_equipped}
            for ln in list_inventory(conn, ch["id"])
        ],
        "beban": [round(current_weight(conn, ch["id"]), 1),
                  carry_capacity(ch["str_score"])],
        "dalam_combat": bool(enc),
    }

    if enc:
        snapshot["combat"] = {
            "ronde": enc["round"],
            "peserta": [
                {"nama": c["name"], "hp": [c["hp_cur"], c["hp_max"]],
                 "player": bool(c["is_player"]), "hidup": bool(c["is_alive"])}
                for c in combatants(conn, enc["id"])
            ],
        }

    npcs = conn.execute(
        "SELECT name, disposition, affinity FROM npc WHERE campaign_id = ? ORDER BY name",
        (campaign_id,),
    ).fetchall()
    if npcs:
        snapshot["npc"] = [
            {"nama": n["name"], "sikap": n["disposition"], "afinitas": n["affinity"]}
            for n in npcs
        ]

    quests = conn.execute(
        "SELECT title, status FROM quest WHERE campaign_id = ? AND status = 'active'",
        (campaign_id,),
    ).fetchall()
    if quests:
        snapshot["quest"] = [{"judul": q["title"], "status": q["status"]} for q in quests]

    return snapshot
