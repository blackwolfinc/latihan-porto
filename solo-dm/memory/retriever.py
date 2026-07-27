"""Retrieval memori memakai SQLite FTS5 + bm25. Tanpa embedding/vector DB.

Untuk satu pemain ini cukup akurat, nol dependency, gratis (bagian 6 CLAUDE.md).
"""
from __future__ import annotations

import re
import sqlite3

_TOKEN_RE = re.compile(r"[a-z0-9]+")


def _fts_query(text: str) -> str:
    """Ubah teks bebas menjadi query FTS5 yang aman (token OR token)."""
    tokens = _TOKEN_RE.findall((text or "").lower())
    tokens = [t for t in tokens if len(t) >= 3][:12]
    return " OR ".join(tokens)


def search(conn: sqlite3.Connection, text: str, limit: int = 4) -> list[str]:
    """Kembalikan potongan memori paling relevan dengan `text`."""
    query = _fts_query(text)
    if not query:
        return []
    try:
        rows = conn.execute(
            "SELECT content FROM memory_fts WHERE memory_fts MATCH ? "
            "ORDER BY bm25(memory_fts) LIMIT ?",
            (query, limit),
        ).fetchall()
    except sqlite3.OperationalError:
        return []
    return [r["content"] for r in rows]
