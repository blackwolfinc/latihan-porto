"""Koneksi SQLite, inisialisasi skema, dan penulisan event/message.

Tidak ada logika mekanik di sini — hanya lapisan penyimpanan mentah.
"""
from __future__ import annotations

import json
import re
import sqlite3
import unicodedata
from pathlib import Path
from typing import Any

SCHEMA_PATH = Path(__file__).with_name("schema.sql")


def slugify(name: str) -> str:
    """Ubah nama bebas menjadi slug kanonik stabil (Invarian I4)."""
    text = unicodedata.normalize("NFKD", name or "")
    text = text.encode("ascii", "ignore").decode("ascii").lower()
    text = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return text or "tanpa-nama"


def connect(db_path: str | Path) -> sqlite3.Connection:
    """Buka koneksi SQLite dengan row factory dict-like dan FK aktif."""
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def connect_memory() -> sqlite3.Connection:
    """Koneksi in-memory untuk test. Tetap memuat skema penuh."""
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    init_schema(conn)
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    """Jalankan DDL. Idempoten karena semua CREATE pakai IF NOT EXISTS."""
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.commit()


def log_event(
    conn: sqlite3.Connection,
    campaign_id: int,
    turn: int,
    type: str,
    payload: dict[str, Any] | None = None,
) -> int:
    """Tulis satu baris event append-only. Kembalikan id-nya."""
    cur = conn.execute(
        "INSERT INTO event (campaign_id, turn, type, payload) VALUES (?, ?, ?, ?)",
        (campaign_id, turn, type, json.dumps(payload or {}, ensure_ascii=False)),
    )
    return int(cur.lastrowid)


def log_message(
    conn: sqlite3.Connection,
    campaign_id: int,
    turn: int,
    role: str,
    content: str,
) -> int:
    """Tulis satu baris riwayat percakapan (player / gm)."""
    cur = conn.execute(
        "INSERT INTO message (campaign_id, turn, role, content) VALUES (?, ?, ?, ?)",
        (campaign_id, turn, role, content),
    )
    return int(cur.lastrowid)


def index_memory(
    conn: sqlite3.Connection,
    content: str,
    kind: str,
    turn: int,
) -> None:
    """Masukkan potongan teks ke FTS5 untuk retrieval nanti."""
    conn.execute(
        "INSERT INTO memory_fts (content, kind, turn) VALUES (?, ?, ?)",
        (content, kind, turn),
    )
