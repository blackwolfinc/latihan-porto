"""Unit test engine — TANPA LLM, harus selesai < 2 detik (Invarian I5)."""
from __future__ import annotations

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from engine.checks import ability_mod, proficiency_bonus, resolve_check
from engine.combat import player_attack, start_combat
from engine.dice import roll, roll_d20
from engine.inventory import (carry_capacity, ensure_template, grant_item,
                              recalc_ac)
from engine.progression import award_xp, long_rest
from setup import create_campaign
from store.db import connect_memory
from store.repo import active_encounter, get_character

PASSED = 0


def check(name: str, cond: bool) -> None:
    global PASSED
    if not cond:
        raise AssertionError(f"GAGAL: {name}")
    PASSED += 1
    print(f"  ok · {name}")


def fresh_campaign():
    conn = connect_memory()
    cid = create_campaign(
        conn, campaign_name="Uji", character_name="Uji", class_slug="fighter", seed=1234
    )
    return conn, cid


def test_dice() -> None:
    a = roll_d20(999, 7, modifier=3)
    b = roll_d20(999, 7, modifier=3)
    check("dadu deterministik (seed+cursor sama → hasil sama)", a.total == b.total)

    vals = [roll_d20(42, c).kept[0] for c in range(200)]
    check("200 d20 semua 1..20", all(1 <= v <= 20 for v in vals))
    check("d20 punya variasi", len(set(vals)) > 5)

    two = roll(7, 1, sides=6, count=2)
    check("2d6 dua dadu", len(two.kept) == 2 and 2 <= two.total <= 12)


def test_modifiers() -> None:
    check("ability_mod(18) == 4", ability_mod(18) == 4)
    check("ability_mod(7) == -2", ability_mod(7) == -2)
    check("proficiency_bonus(5) == 3", proficiency_bonus(5) == 3)
    check("proficiency_bonus(1) == 2", proficiency_bonus(1) == 2)


def test_skill_check() -> None:
    r_no = resolve_check(55, 3, ability_score=14, dc=12, level=5,
                         proficient=False, ability="dex")
    r_yes = resolve_check(55, 3, ability_score=14, dc=12, level=5,
                          proficient=True, ability="dex")
    check("proficiency menambah bonus saat mahir",
          r_yes.total - r_no.total == proficiency_bonus(5))


def test_inventory_stacking() -> None:
    conn, cid = fresh_campaign()
    ch = get_character(conn, cid)
    tid = ensure_template(conn, "Panah", kind="misc", weight=0.05)
    grant_item(conn, int(ch["id"]), tid, 2)
    grant_item(conn, int(ch["id"]), tid, 3)
    rows = conn.execute(
        "SELECT quantity FROM inventory_item WHERE owner_id=? AND template_id=? "
        "AND is_equipped=0", (ch["id"], tid),
    ).fetchall()
    check("grant 2 + grant 3 → satu baris qty 5",
          len(rows) == 1 and rows[0]["quantity"] == 5)


def test_canonical_catalog() -> None:
    conn, _ = fresh_campaign()
    a = ensure_template(conn, "Pedang Panjang", kind="weapon", damage="1d8")
    b = ensure_template(conn, "Pedang Panjang", kind="weapon", damage="1d8")
    n = conn.execute(
        "SELECT COUNT(*) c FROM item_template WHERE slug='pedang-panjang'"
    ).fetchone()["c"]
    check("nama sama tidak membuat template kedua", a == b and n == 1)


def test_ac_recalc() -> None:
    conn, cid = fresh_campaign()
    ch = get_character(conn, cid)
    dex = ability_mod(int(ch["dex_score"]))
    ac_equipped = recalc_ac(conn, int(ch["id"]))
    conn.execute("UPDATE inventory_item SET is_equipped=0 WHERE owner_id=?", (ch["id"],))
    ac_naked = recalc_ac(conn, int(ch["id"]))
    check("AC dihitung ulang dari equipment", ac_equipped > ac_naked)
    check("AC telanjang = 10 + dex mod", ac_naked == 10 + dex)


def test_combat_terminates() -> None:
    conn, cid = fresh_campaign()
    start_combat(conn, cid, [{"slug": "goblin", "name": "Goblin", "hp": 7, "ac": 15,
                              "attack_bonus": 4, "damage": "1d6+2", "count": 2}])
    enc = active_encounter(conn, cid)
    status, steps = "active", 0
    while status == "active" and steps < 300:
        status = player_attack(conn, cid, int(enc["id"])).status
        steps += 1
    check(f"combat berakhir ({status}) dalam < 300 langkah ({steps})",
          status in ("won", "lost") and steps < 300)


def test_level_up() -> None:
    conn, cid = fresh_campaign()
    ch = get_character(conn, cid)
    old_hp = int(ch["hp_max"])
    result = award_xp(conn, int(ch["id"]), 1000, hit_die=10)
    ch2 = get_character(conn, cid)
    check("xp 1000 → level 3", result is not None and ch2["level"] == 3)
    check("hp_max bertambah saat naik level", int(ch2["hp_max"]) > old_hp)


def test_event_log() -> None:
    conn, cid = fresh_campaign()
    types = {r["type"] for r in conn.execute(
        "SELECT type FROM event WHERE campaign_id=?", (cid,)).fetchall()}
    check("event log berisi campaign_start", "campaign_start" in types)
    check("event log berisi item_gain", "item_gain" in types)


def test_rest() -> None:
    conn, cid = fresh_campaign()
    ch = get_character(conn, cid)
    conn.execute("UPDATE character SET hp_cur=1 WHERE id=?", (ch["id"],))
    hp = long_rest(conn, int(ch["id"]))
    ch2 = get_character(conn, cid)
    check("long rest memulihkan HP penuh", ch2["hp_cur"] == ch2["hp_max"] == hp)


def test_carry_capacity() -> None:
    check("carry_capacity = str * 15", carry_capacity(15) == 225.0)


def main() -> None:
    print("== test_engine ==")
    for fn in (test_dice, test_modifiers, test_skill_check, test_inventory_stacking,
               test_canonical_catalog, test_ac_recalc, test_combat_terminates,
               test_level_up, test_event_log, test_rest, test_carry_capacity):
        fn()
    print(f"\n{PASSED} pemeriksaan LULUS.")


if __name__ == "__main__":
    main()
