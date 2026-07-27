"""XP, level up, dan istirahat. Deterministik, bebas LLM."""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass

from engine.checks import ability_mod

# Ambang XP kumulatif per level (SRD 5.1).
XP_THRESHOLDS = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
]


def level_for_xp(xp: int) -> int:
    """Level yang sesuai dengan total XP."""
    level = 1
    for i, threshold in enumerate(XP_THRESHOLDS):
        if xp >= threshold:
            level = i + 1
    return level


@dataclass
class LevelUp:
    """Ringkasan kenaikan level."""

    old_level: int
    new_level: int
    hp_gained: int
    new_hp_max: int


def award_xp(
    conn: sqlite3.Connection,
    character_id: int,
    amount: int,
    *,
    hit_die: int = 8,
) -> LevelUp | None:
    """Tambah XP dan naikkan level bila melewati ambang. None bila tidak naik.

    Kenaikan HP per level = rata-rata hit die + modifier CON (minimal 1).
    """
    ch = conn.execute(
        "SELECT level, xp, con_score, hp_max, hp_cur FROM character WHERE id = ?",
        (character_id,),
    ).fetchone()
    old_level = int(ch["level"])
    new_xp = int(ch["xp"]) + amount
    new_level = level_for_xp(new_xp)

    conn.execute("UPDATE character SET xp = ? WHERE id = ?", (new_xp, character_id))
    if new_level <= old_level:
        return None

    con_mod = ability_mod(int(ch["con_score"]))
    per_level = max(1, hit_die // 2 + 1 + con_mod)
    hp_gained = per_level * (new_level - old_level)
    new_hp_max = int(ch["hp_max"]) + hp_gained
    new_hp_cur = int(ch["hp_cur"]) + hp_gained  # kenaikan level ikut menaikkan HP saat ini

    conn.execute(
        "UPDATE character SET level = ?, hp_max = ?, hp_cur = ? WHERE id = ?",
        (new_level, new_hp_max, new_hp_cur, character_id),
    )
    return LevelUp(old_level, new_level, hp_gained, new_hp_max)


def long_rest(conn: sqlite3.Connection, character_id: int) -> int:
    """Istirahat panjang: HP pulih penuh. Kembalikan HP setelah pulih."""
    ch = conn.execute(
        "SELECT hp_max FROM character WHERE id = ?", (character_id,)
    ).fetchone()
    hp_max = int(ch["hp_max"])
    conn.execute("UPDATE character SET hp_cur = ? WHERE id = ?", (hp_max, character_id))
    return hp_max


def short_rest(conn: sqlite3.Connection, character_id: int, heal: int) -> int:
    """Istirahat pendek: pulih sebagian, tidak melebihi hp_max."""
    ch = conn.execute(
        "SELECT hp_cur, hp_max FROM character WHERE id = ?", (character_id,)
    ).fetchone()
    new_hp = min(int(ch["hp_max"]), int(ch["hp_cur"]) + max(0, heal))
    conn.execute("UPDATE character SET hp_cur = ? WHERE id = ?", (new_hp, character_id))
    return new_hp
