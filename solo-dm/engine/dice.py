"""RNG dadu bertanda benih. Deterministik: seed + cursor yang sama -> hasil sama.

Ini jantung Invarian I2: engine yang melempar dadu, bukan LLM. Cursor disimpan
di campaign.dice_cursor supaya urutan lemparan bisa dilanjutkan setelah game
ditutup dan dibuka lagi.
"""
from __future__ import annotations

import random
import re
from dataclasses import dataclass

DICE_RE = re.compile(r"^\s*(\d*)d(\d+)\s*([+-]\s*\d+)?\s*$", re.IGNORECASE)


@dataclass
class Roll:
    """Hasil satu lemparan, lengkap dengan rincian agar bisa dinarasikan."""

    sides: int
    count: int
    raw: list[int]        # semua angka yang keluar (termasuk yang dibuang adv/disadv)
    kept: list[int]       # angka yang dipakai
    modifier: int
    advantage: int        # -1 disadvantage, 0 normal, +1 advantage
    total: int

    def describe(self) -> str:
        """Deskripsi ringkas, mis. 'd20: 14 +3 = 17'."""
        tag = {1: " (advantage)", -1: " (disadvantage)", 0: ""}[self.advantage]
        base = "+".join(str(v) for v in self.kept)
        mod = f" {self.modifier:+d}" if self.modifier else ""
        return f"{self.count}d{self.sides}: {base}{mod} = {self.total}{tag}"


def _rng(seed: int, cursor: int) -> random.Random:
    """RNG independen per-cursor. Beda cursor -> aliran angka berbeda."""
    return random.Random(f"{seed}::{cursor}")


def roll(
    seed: int,
    cursor: int,
    sides: int,
    count: int = 1,
    modifier: int = 0,
    advantage: int = 0,
) -> Roll:
    """Lempar `count`d`sides` + modifier. advantage hanya berlaku untuk satu d20."""
    rng = _rng(seed, cursor)
    advantage = max(-1, min(1, advantage))

    if advantage != 0 and count == 1:
        raw = [rng.randint(1, sides), rng.randint(1, sides)]
        kept = [max(raw)] if advantage > 0 else [min(raw)]
    else:
        raw = [rng.randint(1, sides) for _ in range(count)]
        kept = list(raw)
        advantage = 0

    total = sum(kept) + modifier
    return Roll(sides, count, raw, kept, modifier, advantage, total)


def roll_d20(seed: int, cursor: int, modifier: int = 0, advantage: int = 0) -> Roll:
    """Pintasan untuk d20 — lemparan paling sering dalam game."""
    return roll(seed, cursor, 20, 1, modifier, advantage)


def parse_and_roll(seed: int, cursor: int, expr: str, modifier: int = 0) -> Roll:
    """Lempar dari ekspresi teks seperti '2d6+1' atau '1d8'."""
    m = DICE_RE.match(expr or "")
    if not m:
        raise ValueError(f"ekspresi dadu tidak valid: {expr!r}")
    count = int(m.group(1) or 1)
    sides = int(m.group(2))
    inline_mod = int(m.group(3).replace(" ", "")) if m.group(3) else 0
    return roll(seed, cursor, sides, count, modifier + inline_mod)
