"""Pohon prioritas taktis musuh. TIDAK memakai LLM (anti-pattern di CLAUDE.md).

Keputusan musuh murni deterministik dan bisa diuji.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass


@dataclass
class EnemyDecision:
    """Keputusan satu musuh untuk satu giliran."""

    action: str          # 'attack' atau 'flee'
    target_id: int | None


def _living_players(conn: sqlite3.Connection, encounter_id: int) -> list[sqlite3.Row]:
    return conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? AND is_player = 1 AND is_alive = 1",
        (encounter_id,),
    ).fetchall()


def decide(conn: sqlite3.Connection, actor: sqlite3.Row) -> EnemyDecision:
    """Pilih aksi untuk `actor`.

    Prioritas:
    1. Tidak ada target hidup -> tidak melakukan apa-apa.
    2. HP actor sangat rendah (< 20%) DAN bukan brute -> kabur.
    3. Selain itu -> serang target dengan HP terendah (habisi yang sekarat).
    """
    targets = _living_players(conn, int(actor["encounter_id"]))
    if not targets:
        return EnemyDecision("flee", None)

    hp_ratio = actor["hp_cur"] / max(1, actor["hp_max"])
    is_brute = actor["hp_max"] >= 30  # makhluk besar bertahan, tidak kabur
    if hp_ratio < 0.2 and not is_brute:
        return EnemyDecision("flee", None)

    target = min(targets, key=lambda t: t["hp_cur"])
    return EnemyDecision("attack", int(target["id"]))
