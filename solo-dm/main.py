"""CLI Solo AI Dungeon Master. Satu-satunya modul yang boleh memakai print().

Panel status SELALU dirender dari STATE (tabel), tidak pernah dari prosa narator
(Invarian I8 / anti-pattern di CLAUDE.md).
"""
from __future__ import annotations

import json
import os
import random
import sys
from pathlib import Path

from llm.client import DeepSeekClient
from orchestrator import Orchestrator
from setup import create_campaign, load_json
from store.db import connect
from store.repo import (active_encounter, combatants, current_location,
                        get_campaign, get_character, recent_events)

DB_PATH = Path(__file__).parent / "saves" / "campaign.db"


def _input(prompt: str) -> str:
    try:
        return input(prompt)
    except EOFError:
        return "/keluar"


def new_campaign(conn) -> int:
    print("\n=== Campaign Baru ===")
    classes = load_json("classes.json")
    name = _input("Nama karaktermu: ").strip() or "Pengembara"
    print("Kelas tersedia:")
    for slug, c in classes.items():
        print(f"  - {slug}: {c['name']}")
    class_slug = _input("Pilih kelas [fighter]: ").strip() or "fighter"
    if class_slug not in classes:
        class_slug = "fighter"
    seed = random.randint(1, 2**31)
    cid = create_campaign(
        conn, campaign_name=f"Petualangan {name}", character_name=name,
        class_slug=class_slug, seed=seed,
    )
    print(f"\nSelamat datang, {name} sang {classes[class_slug]['name']}.\n")
    return cid


def render_panel(conn, campaign_id: int) -> None:
    ch = get_character(conn, campaign_id)
    loc = current_location(conn, ch)
    enc = active_encounter(conn, campaign_id)
    bar = "─" * 60
    print(bar)
    place = loc["name"] if loc else "Antah-berantah"
    print(f" {ch['name']} · Lv{ch['level']} {ch['class_slug']} · "
          f"HP {ch['hp_cur']}/{ch['hp_max']} · AC {ch['ac']} · {ch['gold']} gold")
    print(f" Lokasi: {place}")
    if enc:
        foes = [f"{c['name']}({c['hp_cur']}/{c['hp_max']})"
                for c in combatants(conn, enc["id"])
                if not c["is_player"] and c["is_alive"]]
        print(f" ⚔ COMBAT ronde {enc['round']} — musuh: {', '.join(foes) or 'tidak ada'}")
    print(bar)


def cmd_tas(conn, campaign_id: int) -> None:
    from engine.inventory import carry_capacity, current_weight, list_inventory
    ch = get_character(conn, campaign_id)
    print("── Tas ──")
    lines = list_inventory(conn, int(ch["id"]))
    if not lines:
        print("  (kosong)")
    for ln in lines:
        tag = " [dikenakan]" if ln.is_equipped else ""
        qty = f" x{ln.quantity}" if ln.quantity > 1 else ""
        print(f"  {ln.name}{qty}{tag}")
    w = current_weight(conn, int(ch["id"]))
    print(f"  Beban: {w:.1f} / {carry_capacity(ch['str_score']):.0f}")


def cmd_sheet(conn, campaign_id: int) -> None:
    ch = get_character(conn, campaign_id)
    from engine.checks import ability_mod
    print("── Lembar Karakter ──")
    print(f"  {ch['name']} — Lv{ch['level']} {ch['class_slug']} (XP {ch['xp']})")
    for ab in ("str", "dex", "con", "int", "wis", "cha"):
        s = ch[f"{ab}_score"]
        print(f"  {ab.upper()}: {s} ({ability_mod(s):+d})")
    print(f"  HP {ch['hp_cur']}/{ch['hp_max']} · AC {ch['ac']} · Gold {ch['gold']}")
    print(f"  Proficiencies: {', '.join(json.loads(ch['proficiencies'])) or '-'}")


def cmd_log(conn, campaign_id: int) -> None:
    print("── 20 Event Terakhir ──")
    for e in recent_events(conn, campaign_id, 20):
        payload = json.loads(e["payload"])
        print(f"  [t{e['turn']}] {e['type']}: "
              f"{json.dumps(payload, ensure_ascii=False)}")


def cmd_debug(orch: Orchestrator) -> None:
    print("── Debug: context terakhir ──")
    print(orch.last_context or "(belum ada)")
    print("── Resolution terakhir ──")
    print(orch.last_resolution or "(belum ada)")


def cmd_hp(conn, campaign_id: int, arg: str) -> None:
    ch = get_character(conn, campaign_id)
    try:
        val = int(arg)
    except ValueError:
        print("  Pakai: /hp <angka>")
        return
    val = max(0, min(int(ch["hp_max"]), val))
    conn.execute("UPDATE character SET hp_cur = ? WHERE id = ?", (val, ch["id"]))
    conn.commit()
    print(f"  HP di-set ke {val}/{ch['hp_max']}.")


def cmd_gold(conn, campaign_id: int, arg: str) -> None:
    ch = get_character(conn, campaign_id)
    try:
        val = max(0, int(arg))
    except ValueError:
        print("  Pakai: /gold <angka>")
        return
    conn.execute("UPDATE character SET gold = ? WHERE id = ?", (val, ch["id"]))
    conn.commit()
    print(f"  Gold di-set ke {val}.")


def cmd_biaya(client: DeepSeekClient) -> None:
    print("── Pemakaian Token ──")
    print(f"  Panggilan LLM : {client.calls}")
    print(f"  Token masuk   : {client.prompt_tokens}")
    print(f"  Token keluar  : {client.completion_tokens}")
    print(f"  Perkiraan     : ${client.estimate_cost():.4f}"
          + ("  (mode mock, gratis)" if client.mock else ""))


def handle_slash(cmd: str, conn, campaign_id: int, orch, client) -> bool:
    """Jalankan perintah slash secara LOKAL tanpa LLM. True = lanjut, False = keluar."""
    parts = cmd.split(maxsplit=1)
    name = parts[0].lower()
    arg = parts[1] if len(parts) > 1 else ""
    if name in ("/keluar", "/quit", "/exit"):
        return False
    if name == "/tas":
        cmd_tas(conn, campaign_id)
    elif name == "/sheet":
        cmd_sheet(conn, campaign_id)
    elif name == "/log":
        cmd_log(conn, campaign_id)
    elif name == "/debug":
        cmd_debug(orch)
    elif name == "/hp":
        cmd_hp(conn, campaign_id, arg)
    elif name == "/gold":
        cmd_gold(conn, campaign_id, arg)
    elif name == "/biaya":
        cmd_biaya(client)
    else:
        print(f"  Perintah tak dikenal: {name}")
    return True


def main() -> None:
    conn = connect(DB_PATH)
    from store.db import init_schema
    init_schema(conn)

    existing = conn.execute("SELECT id FROM campaign ORDER BY id DESC LIMIT 1").fetchone()
    if existing and "--new" not in sys.argv:
        campaign_id = int(existing["id"])
        print(f"Melanjutkan campaign #{campaign_id}. (jalankan dengan --new untuk mulai ulang)")
    else:
        campaign_id = new_campaign(conn)

    client = DeepSeekClient()
    if client.mock:
        print("[Mode mock aktif — tanpa API. Set DM_MOCK=0 dan DEEPSEEK_API_KEY untuk LLM.]")
    orch = Orchestrator(conn, campaign_id, client)

    print("Ketik aksimu. Perintah: /tas /sheet /log /debug /hp /gold /biaya /keluar\n")
    while True:
        render_panel(conn, campaign_id)
        text = _input("> ").strip()
        if not text:
            continue
        if text.startswith("/"):
            if not handle_slash(text, conn, campaign_id, orch, client):
                break
            continue
        result = orch.take_turn(text)
        print()
        if result.illegal:
            print(f"  ✗ {result.reason}")
        else:
            print(result.prose)
        print()

    conn.commit()
    conn.close()
    print("Tersimpan. Sampai jumpa.")


if __name__ == "__main__":
    main()
