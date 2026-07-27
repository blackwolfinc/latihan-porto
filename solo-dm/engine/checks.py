"""Ability modifier, proficiency bonus, dan resolusi skill check.

Semua deterministik. Tidak ada state di sini — fungsi murni yang menerima
angka dan mengembalikan hasil.
"""
from __future__ import annotations

from dataclasses import dataclass

from engine.dice import Roll, roll_d20

# Skill -> ability yang mendasarinya (subset SRD yang relevan).
SKILL_ABILITY = {
    "athletics": "str",
    "acrobatics": "dex",
    "stealth": "dex",
    "sleight_of_hand": "dex",
    "arcana": "int",
    "history": "int",
    "investigation": "int",
    "nature": "int",
    "religion": "int",
    "insight": "wis",
    "medicine": "wis",
    "perception": "wis",
    "survival": "wis",
    "animal_handling": "wis",
    "deception": "cha",
    "intimidation": "cha",
    "performance": "cha",
    "persuasion": "cha",
}


def ability_mod(score: int) -> int:
    """Modifier ability standar: (score - 10) dibagi 2, dibulatkan ke bawah."""
    return (score - 10) // 2


def proficiency_bonus(level: int) -> int:
    """Proficiency bonus per level: +2 di 1-4, +3 di 5-8, dst."""
    return 2 + (max(1, level) - 1) // 4


@dataclass
class CheckResult:
    """Hasil satu skill/ability check."""

    ability: str
    dc: int
    roll: Roll
    total: int
    success: bool
    margin: int          # total - dc; negatif = gagal
    critical: int        # 1 nat20, -1 nat1, 0 lainnya


def resolve_check(
    seed: int,
    cursor: int,
    *,
    ability_score: int,
    dc: int,
    level: int = 1,
    proficient: bool = False,
    ability: str = "str",
    advantage: int = 0,
) -> CheckResult:
    """Lempar d20 + ability mod (+ proficiency bila mahir), bandingkan ke DC."""
    modifier = ability_mod(ability_score)
    if proficient:
        modifier += proficiency_bonus(level)

    r = roll_d20(seed, cursor, modifier, advantage)
    nat = r.kept[0]
    critical = 1 if nat == 20 else (-1 if nat == 1 else 0)
    # Nat 20 selalu sukses, nat 1 selalu gagal (konvensi meja yang jamak).
    if critical == 1:
        success = True
    elif critical == -1:
        success = False
    else:
        success = r.total >= dc

    return CheckResult(ability, dc, r, r.total, success, r.total - dc, critical)


def describe_margin(result: CheckResult) -> str:
    """Terjemahkan margin ke label naratif (bukan angka mentah)."""
    if result.critical == 1:
        return "sukses kritis"
    if result.critical == -1:
        return "gagal telak"
    m = result.margin
    if m >= 10:
        return "sukses gemilang"
    if m >= 0:
        return "sukses tipis" if m < 3 else "sukses"
    if m > -5:
        return "nyaris berhasil"
    return "gagal"
