"""Kontrak tool untuk parser (INTENT) dan narator (NARRATOR).

Skema ini adalah SATU-SATUNYA cara LLM memengaruhi dunia. Perhatikan: tidak ada
tool yang menerima nilai absolut hasil mekanik (set_hp/set_gold/deal_damage).
Yang ada hanya niat aksi dan delta (Invarian I2).
"""
from __future__ import annotations


def _fn(name: str, description: str, properties: dict, required: list[str]) -> dict:
    return {
        "type": "function",
        "function": {
            "name": name,
            "description": description,
            "parameters": {
                "type": "object",
                "properties": properties,
                "required": required,
                "additionalProperties": False,
            },
        },
    }


# --- INTENT_TOOLS: dipanggil parser untuk menerjemahkan input pemain ---
INTENT_TOOLS = [
    _fn("narrate_only",
        "Pilih ini untuk SEBAGIAN BESAR giliran: bicara, mengamati, bergerak "
        "biasa, atau apa pun yang hasilnya tidak benar-benar tidak pasti.",
        {"summary": {"type": "string", "description": "ringkasan singkat niat pemain"}},
        ["summary"]),
    _fn("roll_check",
        "HANYA bila hasil benar-benar tidak pasti DAN kegagalan punya konsekuensi "
        "menarik. Jangan memaksakan lemparan dadu.",
        {"skill": {"type": "string",
                   "description": "skill/ability, mis. 'stealth', 'persuasion', 'athletics'"},
         "difficulty": {"type": "string", "enum": ["mudah", "sedang", "sulit", "sangat_sulit"]}},
        ["skill", "difficulty"]),
    _fn("attack",
        "Pemain menyerang sasaran. Bila belum dalam combat, ini memulai combat.",
        {"target": {"type": "string", "description": "nama musuh yang diserang"}},
        ["target"]),
    _fn("use_item",
        "Memakai/mengonsumsi item dari tas.",
        {"item": {"type": "string", "description": "nama item"}},
        ["item"]),
    _fn("equip_item",
        "Mengenakan senjata atau zirah dari tas.",
        {"item": {"type": "string", "description": "nama item"}},
        ["item"]),
    _fn("move_to",
        "Berpindah ke lokasi lain.",
        {"destination": {"type": "string", "description": "nama tujuan"}},
        ["destination"]),
    _fn("talk_to",
        "Berbicara kepada seorang NPC.",
        {"who": {"type": "string", "description": "nama NPC"}},
        ["who"]),
    _fn("rest",
        "Beristirahat untuk memulihkan tenaga.",
        {"kind": {"type": "string", "enum": ["pendek", "panjang"]}},
        ["kind"]),
]


# --- NARRATOR_TOOLS: dipanggil narator untuk mutasi naratif ---
NARRATOR_TOOLS = [
    _fn("grant_item",
        "Beri item kepada pemain. Engine yang mendaftarkan template kanonik.",
        {"name": {"type": "string"},
         "kind": {"type": "string",
                  "enum": ["weapon", "armor", "shield", "consumable", "misc"]},
         "quantity": {"type": "integer", "minimum": 1},
         "damage": {"type": "string", "description": "ekspresi dadu untuk weapon, mis. '1d8'"},
         "weight": {"type": "number"}},
        ["name", "kind", "quantity"]),
    _fn("remove_item",
        "Keluarkan item dari tas pemain.",
        {"name": {"type": "string"}, "quantity": {"type": "integer", "minimum": 1}},
        ["name", "quantity"]),
    _fn("adjust_gold",
        "Ubah gold pemain dengan DELTA (bukan nilai absolut).",
        {"delta": {"type": "integer", "description": "positif = dapat, negatif = keluar"}},
        ["delta"]),
    _fn("create_npc",
        "Perkenalkan NPC baru. Engine memberi slug kanonik.",
        {"name": {"type": "string"},
         "description": {"type": "string"},
         "disposition": {"type": "string",
                         "enum": ["friendly", "neutral", "wary", "hostile"]}},
        ["name", "description", "disposition"]),
    _fn("update_relationship",
        "Ubah afinitas seorang NPC. affinity_delta di-clamp -20..20 oleh engine.",
        {"npc": {"type": "string"}, "affinity_delta": {"type": "integer"}},
        ["npc", "affinity_delta"]),
    _fn("discover_location",
        "Perkenalkan/ungkap sebuah lokasi baru.",
        {"name": {"type": "string"}, "description": {"type": "string"}},
        ["name", "description"]),
    _fn("update_quest",
        "Buat atau ubah status quest.",
        {"title": {"type": "string"},
         "description": {"type": "string"},
         "status": {"type": "string", "enum": ["active", "done", "failed"]}},
        ["title", "status"]),
    _fn("record_canon_fact",
        "Catat fakta kanon permanen (janji, hutang, rahasia, kematian, identitas).",
        {"text": {"type": "string"},
         "category": {"type": "string",
                      "enum": ["janji", "hutang", "rahasia", "kematian",
                               "hubungan", "identitas", "misc"]}},
        ["text", "category"]),
    _fn("start_combat",
        "Mulai pertarungan dengan satu atau lebih monster dari katalog SRD.",
        {"monsters": {"type": "array", "items": {
            "type": "object",
            "properties": {
                "slug": {"type": "string", "description": "slug monster, mis. 'goblin'"},
                "count": {"type": "integer", "minimum": 1}},
            "required": ["slug"]}}},
        ["monsters"]),
]

INTENT_TOOL_NAMES = {t["function"]["name"] for t in INTENT_TOOLS}
NARRATOR_TOOL_NAMES = {t["function"]["name"] for t in NARRATOR_TOOLS}

# Peta tingkat kesulitan -> DC (dipakai orchestrator, bukan LLM).
DIFFICULTY_DC = {"mudah": 10, "sedang": 13, "sulit": 16, "sangat_sulit": 20}
