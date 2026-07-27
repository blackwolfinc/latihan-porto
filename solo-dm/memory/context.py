"""Perakit context window dengan urutan RAMAH CACHE (bagian 6 CLAUDE.md).

Urutan wajib: blok statis dulu (cache-hit), blok dinamis belakangan. Fungsi ini
merakit blok [2]..[7]; blok [1] system prompt dikirim terpisah sebagai system
message, blok [8] RESOLUTION & [9] input pemain ditambahkan oleh client.narrate.
"""
from __future__ import annotations

import json
import sqlite3

from store.repo import canon_facts, latest_summary, recent_messages, state_snapshot

# Blok [2] world bible — statis sepanjang campaign, aman untuk cache.
DEFAULT_WORLD_BIBLE = (
    "DUNIA: Negeri fantasi rendah bernama Ambarwastu — kerajaan kecil di antara "
    "hutan tua, reruntuhan, dan jalur dagang berbahaya. Sihir langka dan ditakuti. "
    "Dewa jauh. Uang berupa keping emas. Bahaya nyata dan kematian mungkin terjadi."
)


def build_context(
    conn: sqlite3.Connection,
    campaign_id: int,
    *,
    world_bible: str = DEFAULT_WORLD_BIBLE,
    retrieved: list[str] | None = None,
) -> str:
    """Rakit blok [2]..[7] sebagai satu string berlabel, urutan statis-dulu."""
    parts: list[str] = []

    # [2] world bible (statis)
    parts.append(f"[WORLD]\n{world_bible}")

    # [3] canon facts (lambat berubah) — selalu penuh, tak pernah diringkas
    facts = canon_facts(conn, campaign_id)
    if facts:
        parts.append("[FAKTA KANON]\n" + "\n".join(f"- {f}" for f in facts))

    # [4] state snapshot (tiap giliran)
    snap = state_snapshot(conn, campaign_id)
    parts.append("[STATE]\n" + json.dumps(snap, ensure_ascii=False, indent=1))

    # [5] retrieved memory (tiap giliran)
    if retrieved:
        parts.append("[MEMORI TERKAIT]\n" + "\n".join(f"- {m}" for m in retrieved))

    # [6] arc summary (lambat berubah)
    summary = latest_summary(conn, campaign_id)
    if summary:
        parts.append(f"[RINGKASAN SEJAUH INI]\n{summary}")

    # [7] recent turns (tiap giliran)
    msgs = recent_messages(conn, campaign_id, limit=8)
    if msgs:
        lines = []
        for m in msgs:
            who = "PEMAIN" if m["role"] == "player" else "GM"
            lines.append(f"{who}: {m['content']}")
        parts.append("[GILIRAN TERAKHIR]\n" + "\n".join(lines))

    return "\n\n".join(parts)
