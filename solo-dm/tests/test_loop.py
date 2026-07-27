"""Turn loop end-to-end dalam mode mock — tanpa API key.

Membuktikan: parse → validate → resolve → commit → narrate berjalan, combat
auto-start dari serangan di luar combat, dan aksi ilegal ditolak tanpa memanggil
narator (Invarian I6).
"""
from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ["DM_MOCK"] = "1"

from llm.client import DeepSeekClient
from orchestrator import Orchestrator
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


def build():
    conn = connect_memory()
    cid = create_campaign(
        conn, campaign_name="Uji", character_name="Uji", class_slug="fighter", seed=7
    )
    client = DeepSeekClient(mock=True)
    return conn, cid, client, Orchestrator(conn, cid, client)


def test_narrate_only_flow() -> None:
    conn, cid, client, orch = build()
    r = orch.take_turn("aku berdiri menikmati suasana pagi")
    check("narrate_only menghasilkan prosa", r.action == "narrate_only" and len(r.prose) > 0)
    check("narator dipanggil (calls > 0)", client.calls > 0)


def test_parse_attack_prefix() -> None:
    conn, cid, client, orch = build()
    # 'menyerang' harus dikenali lewat substring 'nyerang', bukan 'serang'.
    req = client.parse_intent("", {}, "menyerang goblin dengan pedang")
    check("'menyerang' → action attack", req.action == "attack")
    check("target ter-ekstrak", "goblin" in (req.args.get("target") or ""))


def test_combat_autostart() -> None:
    conn, cid, client, orch = build()
    check("belum ada combat di awal", active_encounter(conn, cid) is None)
    orch.take_turn("serang goblin")
    check("combat auto-start dari serangan di luar combat",
          active_encounter(conn, cid) is not None)


def test_illegal_rejected_without_narrate() -> None:
    conn, cid, client, orch = build()
    calls_before = client.calls
    r = orch.take_turn("minum ramuan naga langka")  # tidak ada di tas
    check("aksi ilegal ditandai illegal", r.illegal)
    check("ada alasan penolakan", len(r.reason) > 0)
    check("narator TIDAK dipanggil untuk aksi ilegal", client.calls == calls_before)


def test_full_turn_mutates_state() -> None:
    conn, cid, client, orch = build()
    ch0 = get_character(conn, cid)
    conn.execute("UPDATE character SET hp_cur=5 WHERE id=?", (ch0["id"],))
    conn.commit()
    orch.take_turn("minum ramuan penyembuh")  # ada di inventory fighter? cek dulu
    # fighter tak punya ramuan; pakai rest panjang untuk membuktikan mutasi state.
    orch.take_turn("tidur sampai pagi untuk memulihkan diri")
    ch1 = get_character(conn, cid)
    check("state termutasi oleh turn loop (HP pulih via rest)",
          int(ch1["hp_cur"]) > 5)


def main() -> None:
    print("== test_loop (mode mock) ==")
    for fn in (test_narrate_only_flow, test_parse_attack_prefix, test_combat_autostart,
               test_illegal_rejected_without_narrate, test_full_turn_mutates_state):
        fn()
    print(f"\n{PASSED} pemeriksaan LULUS.")


if __name__ == "__main__":
    main()
