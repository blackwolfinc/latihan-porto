"""Ringkasan adegan + indexing FTS. Jalan SESEKALI, di luar jalur giliran.

Ini tidak menambah panggilan LLM per giliran (Invarian I7). Di mode mock, ringkasan
dibuat naif dari pesan terakhir agar test tetap jalan tanpa API.
"""
from __future__ import annotations

import sqlite3
from pathlib import Path

from store.db import index_memory
from store.repo import recent_messages

_PROMPT = (Path(__file__).parents[1] / "llm" / "prompts" / "summarizer.md")


def should_summarize(
    trigger: str, turns_since_last: int, threshold: int = 15
) -> bool:
    """Trigger ringkasan: pindah lokasi, combat berakhir, quest berubah, long
    rest, atau lewat `threshold` giliran sejak ringkasan terakhir."""
    if trigger in ("move", "combat_end", "quest_change", "long_rest"):
        return True
    return turns_since_last >= threshold


def summarize(conn: sqlite3.Connection, campaign_id: int, turn: int, client) -> str:
    """Buat ringkasan babak, simpan ke scene_summary, dan index ke FTS."""
    msgs = recent_messages(conn, campaign_id, limit=16)
    transcript = "\n".join(
        f"{'PEMAIN' if m['role'] == 'player' else 'GM'}: {m['content']}" for m in msgs
    )

    if client.mock or not transcript.strip():
        gm_lines = [m["content"] for m in msgs if m["role"] == "gm"]
        text = " ".join(gm_lines)[-400:] or "Babak berlalu tanpa kejadian berarti."
    else:
        system = _PROMPT.read_text(encoding="utf-8")
        text = client.complete(system, transcript) or transcript[-400:]

    conn.execute(
        "INSERT INTO scene_summary (campaign_id, turn, text) VALUES (?, ?, ?)",
        (campaign_id, turn, text),
    )
    index_memory(conn, text, "summary", turn)
    conn.commit()
    return text
