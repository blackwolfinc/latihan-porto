"""State machine combat. Panel dirender dari tabel encounter/combatant, bukan prosa.

Combat dijamin terminasi: setiap serangan yang kena menurunkan HP minimal 1,
dan `check_end` selalu menutup pertarungan menjadi won/lost/fled.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass

from engine.checks import ability_mod
from engine.dice import parse_and_roll, roll_d20
from engine.enemy_ai import decide
from store.db import log_event
from store.repo import combatants, get_character, use_cursor


@dataclass
class AttackResult:
    """Hasil satu serangan, siap dinarasikan."""

    attacker: str
    target: str
    hit: bool
    critical: bool
    attack_total: int
    target_ac: int
    damage: int
    target_hp: int
    target_down: bool


@dataclass
class CombatResolution:
    """Hasil satu langkah combat gabungan (aksi pemain + giliran musuh)."""

    events: list[AttackResult]
    status: str          # active / won / lost / fled
    round: int


def start_combat(
    conn: sqlite3.Connection,
    campaign_id: int,
    monsters: list[dict],
) -> int:
    """Mulai encounter baru. `monsters` = list spesifikasi monster.

    Tiap spec: {slug, name, hp, ac, attack_bonus, damage, count}.
    Kembalikan encounter_id.
    """
    ch = get_character(conn, campaign_id)
    cur = conn.execute(
        "INSERT INTO encounter (campaign_id, status, round) VALUES (?, 'active', 1)",
        (campaign_id,),
    )
    enc_id = int(cur.lastrowid)

    # Combatant pemain.
    dex_mod = ability_mod(int(ch["dex_score"]))
    seed, c = use_cursor(conn, campaign_id)
    p_init = roll_d20(seed, c, dex_mod).total
    weapon = _player_weapon(conn, int(ch["id"]))
    conn.execute(
        """INSERT INTO combatant
               (encounter_id, ref_type, ref_slug, name, hp_cur, hp_max, ac,
                attack_bonus, damage, initiative, is_player, is_alive)
           VALUES (?, 'player', NULL, ?, ?, ?, ?, ?, ?, ?, 1, 1)""",
        (enc_id, ch["name"], ch["hp_cur"], ch["hp_max"], ch["ac"],
         dex_mod + 2, weapon, p_init),
    )

    # Combatant musuh.
    for spec in monsters:
        for i in range(int(spec.get("count", 1))):
            name = spec["name"] if int(spec.get("count", 1)) == 1 else f"{spec['name']} {i + 1}"
            seed, c = use_cursor(conn, campaign_id)
            m_init = roll_d20(seed, c, 0).total
            conn.execute(
                """INSERT INTO combatant
                       (encounter_id, ref_type, ref_slug, name, hp_cur, hp_max, ac,
                        attack_bonus, damage, initiative, is_player, is_alive)
                   VALUES (?, 'monster', ?, ?, ?, ?, ?, ?, ?, ?, 0, 1)""",
                (enc_id, spec.get("slug"), name, spec["hp"], spec["hp"], spec["ac"],
                 spec.get("attack_bonus", 3), spec.get("damage", "1d6"), m_init),
            )

    log_event(conn, campaign_id, 0, "combat_start",
              {"encounter": enc_id, "monsters": [m["name"] for m in monsters]})
    return enc_id


def _player_weapon(conn: sqlite3.Connection, character_id: int) -> str:
    """Ambil ekspresi damage senjata yang dikenakan, default pukulan 1d4."""
    row = conn.execute(
        """SELECT t.damage FROM inventory_item i JOIN item_template t ON t.id = i.template_id
           WHERE i.owner_id = ? AND i.is_equipped = 1 AND t.kind = 'weapon'
             AND t.damage IS NOT NULL LIMIT 1""",
        (character_id,),
    ).fetchone()
    return row["damage"] if row else "1d4"


def _resolve_attack(
    conn: sqlite3.Connection,
    campaign_id: int,
    attacker: sqlite3.Row,
    target: sqlite3.Row,
) -> AttackResult:
    """Lempar serangan, terapkan damage bila kena, simpan HP baru."""
    seed, c = use_cursor(conn, campaign_id)
    atk = roll_d20(seed, c, int(attacker["attack_bonus"]))
    nat = atk.kept[0]
    critical = nat == 20
    hit = critical or (nat != 1 and atk.total >= int(target["ac"]))

    damage = 0
    if hit:
        seed, c = use_cursor(conn, campaign_id)
        dmg_roll = parse_and_roll(seed, c, attacker["damage"])
        damage = max(1, dmg_roll.total)
        if critical:
            seed, c = use_cursor(conn, campaign_id)
            damage += max(1, parse_and_roll(seed, c, attacker["damage"]).total)

    new_hp = max(0, int(target["hp_cur"]) - damage)
    down = new_hp <= 0
    conn.execute(
        "UPDATE combatant SET hp_cur = ?, is_alive = ? WHERE id = ?",
        (new_hp, 0 if down else 1, target["id"]),
    )
    log_event(conn, campaign_id, 0, "attack", {
        "attacker": attacker["name"], "target": target["name"],
        "hit": hit, "damage": damage, "target_hp": new_hp,
    })
    return AttackResult(
        attacker["name"], target["name"], hit, critical,
        atk.total, int(target["ac"]), damage, new_hp, down,
    )


def _first_living_monster(conn: sqlite3.Connection, enc_id: int) -> sqlite3.Row | None:
    return conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? AND is_player = 0 AND is_alive = 1 "
        "ORDER BY id LIMIT 1",
        (enc_id,),
    ).fetchone()


def _by_name(conn: sqlite3.Connection, enc_id: int, name: str) -> sqlite3.Row | None:
    return conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? AND lower(name) = lower(?) "
        "AND is_alive = 1 AND is_player = 0 ORDER BY id LIMIT 1",
        (enc_id, name),
    ).fetchone()


def check_end(conn: sqlite3.Connection, campaign_id: int, enc_id: int) -> str:
    """Tentukan status combat. Selalu menutup ke won/lost bila salah satu sisi habis."""
    rows = combatants(conn, enc_id)
    players = [c for c in rows if c["is_player"] and c["is_alive"]]
    monsters = [c for c in rows if not c["is_player"] and c["is_alive"]]

    status = "active"
    if not players:
        status = "lost"
    elif not monsters:
        status = "won"

    if status != "active":
        conn.execute("UPDATE encounter SET status = ? WHERE id = ?", (status, enc_id))
        log_event(conn, campaign_id, 0, "combat_end", {"encounter": enc_id, "status": status})
        _sync_player_hp(conn, campaign_id, enc_id)
    return status


def _sync_player_hp(conn: sqlite3.Connection, campaign_id: int, enc_id: int) -> None:
    """Salin HP pemain dari combatant kembali ke character setelah combat."""
    p = conn.execute(
        "SELECT hp_cur FROM combatant WHERE encounter_id = ? AND is_player = 1 LIMIT 1",
        (enc_id,),
    ).fetchone()
    ch = get_character(conn, campaign_id)
    if p and ch:
        conn.execute(
            "UPDATE character SET hp_cur = ? WHERE id = ?", (max(0, int(p["hp_cur"])), ch["id"])
        )


def player_attack(
    conn: sqlite3.Connection,
    campaign_id: int,
    enc_id: int,
    target_name: str | None = None,
) -> CombatResolution:
    """Pemain menyerang, lalu semua musuh hidup mengambil giliran. Satu langkah penuh."""
    results: list[AttackResult] = []
    player = conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? AND is_player = 1 LIMIT 1", (enc_id,)
    ).fetchone()

    target = _by_name(conn, enc_id, target_name) if target_name else None
    if target is None:
        target = _first_living_monster(conn, enc_id)

    if player["is_alive"] and target is not None:
        results.append(_resolve_attack(conn, campaign_id, player, target))

    status = check_end(conn, campaign_id, enc_id)
    if status == "active":
        results.extend(_npc_turns(conn, campaign_id, enc_id))
        status = check_end(conn, campaign_id, enc_id)
        conn.execute("UPDATE encounter SET round = round + 1 WHERE id = ?", (enc_id,))

    enc = conn.execute("SELECT round FROM encounter WHERE id = ?", (enc_id,)).fetchone()
    return CombatResolution(results, status, int(enc["round"]))


def _npc_turns(
    conn: sqlite3.Connection, campaign_id: int, enc_id: int
) -> list[AttackResult]:
    """Semua musuh hidup mengambil giliran memakai enemy_ai."""
    results: list[AttackResult] = []
    monsters = conn.execute(
        "SELECT * FROM combatant WHERE encounter_id = ? AND is_player = 0 AND is_alive = 1 "
        "ORDER BY initiative DESC, id",
        (enc_id,),
    ).fetchall()
    for m in monsters:
        m = conn.execute("SELECT * FROM combatant WHERE id = ?", (m["id"],)).fetchone()
        if not m["is_alive"]:
            continue
        decision = decide(conn, m)
        if decision.action != "attack" or decision.target_id is None:
            continue
        target = conn.execute(
            "SELECT * FROM combatant WHERE id = ?", (decision.target_id,)
        ).fetchone()
        if target and target["is_alive"]:
            results.append(_resolve_attack(conn, campaign_id, m, target))
    return results
