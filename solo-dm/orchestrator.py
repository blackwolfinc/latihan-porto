"""Turn loop 8 langkah. Satu-satunya tempat engine, LLM, dan store bertemu.

Turn loop TIDAK BERUBAH saat menambah fitur — hanya cabang di _resolve dan
handler di _apply_narrator_tool yang bertambah (bagian 15 CLAUDE.md).
"""
from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass, field
from pathlib import Path

from engine import combat, inventory, progression
from engine.checks import SKILL_ABILITY, resolve_check
from engine.dice import parse_and_roll
from engine.validator import ActionRequest, Illegal, validate
from llm.client import DeepSeekClient
from llm.tools import DIFFICULTY_DC, NARRATOR_TOOL_NAMES
from memory import context as memctx
from memory import retriever, summarizer
from store.db import index_memory, log_event, log_message, slugify
from store.repo import (active_encounter, get_campaign, get_character, use_cursor)

DATA_DIR = Path(__file__).parent / "data" / "srd"
PROMPT_DIR = Path(__file__).parent / "llm" / "prompts"


@dataclass
class Resolution:
    """Hasil langkah RESOLVE: fakta mekanik untuk narator + metadata routing."""

    text: str = ""
    big_moment: bool = False
    trigger: str | None = None
    allow_narrator_tools: bool = True
    extra_events: list[dict] = field(default_factory=list)


@dataclass
class TurnResult:
    """Keluaran satu giliran, dipakai main.py untuk render."""

    action: str
    prose: str = ""
    resolution_text: str = ""
    illegal: bool = False
    reason: str = ""
    model_used: str = "mock"


class Orchestrator:
    def __init__(self, conn: sqlite3.Connection, campaign_id: int, client: DeepSeekClient):
        self.conn = conn
        self.campaign_id = campaign_id
        self.client = client
        self.monsters = json.loads((DATA_DIR / "monsters.json").read_text("utf-8"))
        self.system_gm = (PROMPT_DIR / "system_gm.md").read_text("utf-8")
        self.intent_prompt = (PROMPT_DIR / "intent_parser.md").read_text("utf-8")
        self.last_context = ""
        self.last_resolution = ""

    # ============================================================= turn loop
    def take_turn(self, player_input: str) -> TurnResult:
        camp = get_campaign(self.conn, self.campaign_id)
        turn = int(camp["turn_count"]) + 1

        from store.repo import state_snapshot

        # [2] PARSE
        snapshot = state_snapshot(self.conn, self.campaign_id)
        req = self.client.parse_intent(self.intent_prompt, snapshot, player_input)

        # [3] VALIDATE — gagal = SELESAI tanpa biaya narasi (Invarian I6)
        try:
            validate(self.conn, self.campaign_id, req)
        except Illegal as e:
            log_message(self.conn, self.campaign_id, turn, "player", player_input)
            self.conn.commit()
            return TurnResult(req.action, illegal=True, reason=str(e))

        # [4] RESOLVE
        resolution = self._resolve(req, turn)

        # [5] COMMIT
        log_message(self.conn, self.campaign_id, turn, "player", player_input)
        self.conn.execute(
            "UPDATE campaign SET turn_count = ? WHERE id = ?", (turn, self.campaign_id)
        )
        self.conn.commit()

        # [6] NARRATE
        retrieved = retriever.search(self.conn, player_input, limit=4)
        context = memctx.build_context(self.conn, self.campaign_id, retrieved=retrieved)
        model = self.client.model_pro if resolution.big_moment else self.client.model_flash
        result = self.client.narrate(
            model=model, system_prompt=self.system_gm, context=context,
            resolution_text=resolution.text or "(tidak ada perubahan mekanik)",
            player_input=player_input, allow_tools=resolution.allow_narrator_tools,
        )
        self.last_context, self.last_resolution = context, resolution.text

        for call in result.tool_calls:
            if call["name"] in NARRATOR_TOOL_NAMES:
                self._apply_narrator_tool(call["name"], call["args"], turn)

        log_message(self.conn, self.campaign_id, turn, "gm", result.prose)
        index_memory(self.conn, result.prose, "turn", turn)
        self.conn.commit()

        # [7] REMEMBER
        self._maybe_summarize(resolution.trigger, turn)

        return TurnResult(req.action, result.prose, resolution.text, model_used=model)

    # ============================================================== resolve
    def _resolve(self, req: ActionRequest, turn: int) -> Resolution:
        handler = getattr(self, f"_do_{req.action}", None)
        if handler is None:
            return Resolution()
        return handler(req, turn)

    def _do_narrate_only(self, req: ActionRequest, turn: int) -> Resolution:
        return Resolution(text="")

    def _do_roll_check(self, req: ActionRequest, turn: int) -> Resolution:
        ch = get_character(self.conn, self.campaign_id)
        skill = (req.args.get("skill") or "").lower().replace(" ", "_")
        ability = SKILL_ABILITY.get(skill, "str")
        dc = DIFFICULTY_DC.get(req.args.get("difficulty", "sedang"), 13)
        profs = json.loads(ch["proficiencies"])
        seed, cursor = use_cursor(self.conn, self.campaign_id)
        res = resolve_check(
            seed, cursor, ability_score=int(ch[f"{ability}_score"]), dc=dc,
            level=int(ch["level"]), proficient=skill in profs, ability=ability,
        )
        from engine.checks import describe_margin

        label = describe_margin(res)
        log_event(self.conn, self.campaign_id, turn, "check",
                  {"skill": skill, "dc": dc, "total": res.total, "success": res.success})
        text = (f"Skill check {skill} ({req.args.get('difficulty', 'sedang')}): "
                f"{'SUKSES' if res.success else 'GAGAL'} — {label} "
                f"[{res.roll.describe()} vs DC {dc}]")
        return Resolution(text=text, big_moment=res.critical != 0)

    def _do_attack(self, req: ActionRequest, turn: int) -> Resolution:
        target = (req.args.get("target") or "").strip()
        enc = active_encounter(self.conn, self.campaign_id)
        if enc is None:
            spec = self._monster_spec(target)
            combat.start_combat(self.conn, self.campaign_id, [spec])
            enc = active_encounter(self.conn, self.campaign_id)
            target = spec["name"]

        resu = combat.player_attack(self.conn, self.campaign_id, enc["id"], target)
        lines = []
        for a in resu.events:
            if a.hit:
                crit = " KRITIS" if a.critical else ""
                lines.append(f"{a.attacker} mengenai {a.target}{crit} "
                             f"(-{a.damage}, HP {a.target}: {a.target_hp})")
            else:
                lines.append(f"{a.attacker} meleset menyerang {a.target}")
            if a.target_down:
                lines.append(f"{a.target} tumbang!")
        status_txt = {"won": "Pertarungan dimenangkan.",
                      "lost": "Kamu kalah dan roboh.",
                      "active": f"Ronde {resu.round} berlanjut."}[resu.status]
        big = resu.status in ("won", "lost") or any(a.critical for a in resu.events)
        trigger = "combat_end" if resu.status in ("won", "lost") else None
        text = "Combat — " + " | ".join(lines) + f" | {status_txt}"
        return Resolution(text=text, big_moment=big, trigger=trigger)

    def _do_use_item(self, req: ActionRequest, turn: int) -> Resolution:
        ch = get_character(self.conn, self.campaign_id)
        name = (req.args.get("item") or "").strip()
        tpl = inventory.find_template_by_name(self.conn, name)
        text = f"Kamu memakai {name}."
        big = False
        if tpl and slugify(tpl["name"]) == "ramuan-penyembuh":
            seed, cursor = use_cursor(self.conn, self.campaign_id)
            heal = parse_and_roll(seed, cursor, tpl["damage"] or "2d4").total
            new_hp = min(int(ch["hp_max"]), int(ch["hp_cur"]) + heal)
            self.conn.execute("UPDATE character SET hp_cur = ? WHERE id = ?",
                              (new_hp, ch["id"]))
            text = f"Kamu meneguk ramuan penyembuh (+{heal} HP → {new_hp}/{ch['hp_max']})."
            big = False
        if tpl:
            inventory.remove_item(self.conn, int(ch["id"]), int(tpl["id"]), 1)
            log_event(self.conn, self.campaign_id, turn, "item_use", {"item": name})
        return Resolution(text=text, big_moment=big, allow_narrator_tools=True)

    def _do_equip_item(self, req: ActionRequest, turn: int) -> Resolution:
        ch = get_character(self.conn, self.campaign_id)
        name = (req.args.get("item") or "").strip()
        tpl = inventory.find_template_by_name(self.conn, name)
        if not tpl:
            return Resolution(text=f"Kamu mencoba mengenakan {name}.")
        item = self.conn.execute(
            "SELECT id FROM inventory_item WHERE owner_id = ? AND template_id = ? LIMIT 1",
            (ch["id"], tpl["id"]),
        ).fetchone()
        if not item:
            return Resolution(text=f"Kamu mencoba mengenakan {name}.")
        inventory.equip(self.conn, int(item["id"]))
        new = get_character(self.conn, self.campaign_id)
        log_event(self.conn, self.campaign_id, turn, "equip", {"item": name})
        return Resolution(text=f"Kamu mengenakan {name}. AC sekarang {new['ac']}.")

    def _do_move_to(self, req: ActionRequest, turn: int) -> Resolution:
        ch = get_character(self.conn, self.campaign_id)
        dest = (req.args.get("destination") or "").strip()
        loc_id = self._ensure_location(dest, "")
        self.conn.execute("UPDATE character SET location_id = ? WHERE id = ?",
                          (loc_id, ch["id"]))
        log_event(self.conn, self.campaign_id, turn, "move", {"to": dest})
        return Resolution(text=f"Kamu berpindah menuju {dest}.", trigger="move")

    def _do_talk_to(self, req: ActionRequest, turn: int) -> Resolution:
        return Resolution(text=f"Kamu mendekati {req.args.get('who', 'seseorang')}.")

    def _do_rest(self, req: ActionRequest, turn: int) -> Resolution:
        ch = get_character(self.conn, self.campaign_id)
        if req.args.get("kind") == "panjang":
            hp = progression.long_rest(self.conn, int(ch["id"]))
            log_event(self.conn, self.campaign_id, turn, "long_rest", {"hp": hp})
            return Resolution(text=f"Istirahat panjang. HP pulih penuh ({hp}/{hp}).",
                              trigger="long_rest")
        seed, cursor = use_cursor(self.conn, self.campaign_id)
        heal = parse_and_roll(seed, cursor, "1d8").total
        hp = progression.short_rest(self.conn, int(ch["id"]), heal)
        log_event(self.conn, self.campaign_id, turn, "short_rest", {"hp": hp})
        return Resolution(text=f"Istirahat pendek. HP sekarang {hp}/{ch['hp_max']}.")

    # ====================================================== narrator mutations
    def _apply_narrator_tool(self, name: str, args: dict, turn: int) -> None:
        ch = get_character(self.conn, self.campaign_id)
        if name == "grant_item":
            tpl = inventory.ensure_template(
                self.conn, args["name"], kind=args.get("kind", "misc"),
                damage=args.get("damage"), weight=float(args.get("weight", 0) or 0),
            )
            inventory.grant_item(self.conn, int(ch["id"]), tpl, int(args.get("quantity", 1)))
            log_event(self.conn, self.campaign_id, turn, "item_gain",
                      {"item": args["name"], "qty": args.get("quantity", 1)})
        elif name == "remove_item":
            tpl = inventory.find_template_by_name(self.conn, args["name"])
            if tpl:
                inventory.remove_item(self.conn, int(ch["id"]), int(tpl["id"]),
                                     int(args.get("quantity", 1)))
        elif name == "adjust_gold":
            new_gold = max(0, int(ch["gold"]) + int(args["delta"]))
            self.conn.execute("UPDATE character SET gold = ? WHERE id = ?",
                              (new_gold, ch["id"]))
            log_event(self.conn, self.campaign_id, turn, "gold_change",
                      {"delta": args["delta"], "gold": new_gold})
        elif name == "create_npc":
            self._ensure_npc(args["name"], args.get("description", ""),
                             args.get("disposition", "neutral"))
        elif name == "update_relationship":
            self._update_relationship(args["npc"], int(args.get("affinity_delta", 0)))
        elif name == "discover_location":
            self._ensure_location(args["name"], args.get("description", ""))
        elif name == "update_quest":
            self._upsert_quest(args["title"], args.get("description", ""),
                               args.get("status", "active"))
        elif name == "record_canon_fact":
            self._record_fact(args["text"], args.get("category", "misc"), turn)
        elif name == "start_combat":
            specs = [self._monster_spec_by_slug(m["slug"], int(m.get("count", 1)))
                     for m in args.get("monsters", [])]
            specs = [s for s in specs if s]
            if specs and active_encounter(self.conn, self.campaign_id) is None:
                combat.start_combat(self.conn, self.campaign_id, specs)

    # ============================================================== helpers
    def _monster_spec(self, target: str) -> dict:
        """Cocokkan nama target ke katalog SRD; kalau tak ada, buat generik."""
        slug = slugify(target)
        if slug in self.monsters:
            return {"slug": slug, **self.monsters[slug], "count": 1}
        for s, m in self.monsters.items():
            if s in slug or slug in s:
                return {"slug": s, **m, "count": 1}
        return {"slug": slug, "name": target or "Musuh", "hp": 10, "ac": 12,
                "attack_bonus": 3, "damage": "1d6", "count": 1}

    def _monster_spec_by_slug(self, slug: str, count: int) -> dict | None:
        slug = slugify(slug)
        if slug in self.monsters:
            return {"slug": slug, **self.monsters[slug], "count": count}
        return None

    def _ensure_location(self, name: str, description: str) -> int:
        slug = slugify(name)
        row = self.conn.execute(
            "SELECT id FROM location WHERE campaign_id = ? AND slug = ?",
            (self.campaign_id, slug),
        ).fetchone()
        if row:
            return int(row["id"])
        cur = self.conn.execute(
            "INSERT INTO location (campaign_id, slug, name, description) VALUES (?, ?, ?, ?)",
            (self.campaign_id, slug, name, description),
        )
        return int(cur.lastrowid)

    def _ensure_npc(self, name: str, description: str, disposition: str) -> int:
        slug = slugify(name)
        row = self.conn.execute(
            "SELECT id FROM npc WHERE campaign_id = ? AND slug = ?",
            (self.campaign_id, slug),
        ).fetchone()
        if row:
            return int(row["id"])
        cur = self.conn.execute(
            "INSERT INTO npc (campaign_id, slug, name, description, disposition) "
            "VALUES (?, ?, ?, ?, ?)",
            (self.campaign_id, slug, name, description, disposition),
        )
        return int(cur.lastrowid)

    def _update_relationship(self, npc_name: str, delta: int) -> None:
        npc_id = self._ensure_npc(npc_name, "", "neutral")
        delta = max(-20, min(20, delta))
        row = self.conn.execute("SELECT affinity FROM npc WHERE id = ?", (npc_id,)).fetchone()
        new_aff = max(-100, min(100, int(row["affinity"]) + delta))
        self.conn.execute("UPDATE npc SET affinity = ? WHERE id = ?", (new_aff, npc_id))

    def _upsert_quest(self, title: str, description: str, status: str) -> None:
        slug = slugify(title)
        row = self.conn.execute(
            "SELECT id FROM quest WHERE campaign_id = ? AND slug = ?",
            (self.campaign_id, slug),
        ).fetchone()
        if row:
            self.conn.execute("UPDATE quest SET status = ? WHERE id = ?", (status, row["id"]))
        else:
            self.conn.execute(
                "INSERT INTO quest (campaign_id, slug, title, description, status) "
                "VALUES (?, ?, ?, ?, ?)",
                (self.campaign_id, slug, title, description, status),
            )

    def _record_fact(self, text: str, category: str, turn: int) -> None:
        self.conn.execute(
            "INSERT INTO canon_fact (campaign_id, turn, category, text) VALUES (?, ?, ?, ?)",
            (self.campaign_id, turn, category, text),
        )
        index_memory(self.conn, text, "canon", turn)

    def _maybe_summarize(self, trigger: str | None, turn: int) -> None:
        last = self.conn.execute(
            "SELECT turn FROM scene_summary WHERE campaign_id = ? ORDER BY id DESC LIMIT 1",
            (self.campaign_id,),
        ).fetchone()
        since = turn - (int(last["turn"]) if last else 0)
        if summarizer.should_summarize(trigger or "", since):
            summarizer.summarize(self.conn, self.campaign_id, turn, self.client)
