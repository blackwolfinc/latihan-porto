"""Klien DeepSeek (OpenAI-compatible) + mode mock penuh.

Mode mock (DM_MOCK=1) membuat seluruh sistem jalan tanpa API key: parser berbasis
kata kunci, narasi placeholder. Wajib ada agar test end-to-end gratis (bagian 6).

CATATAN MODEL: gunakan 'deepseek-v4-flash' / 'deepseek-v4-pro'. Nama lama
'deepseek-chat' / 'deepseek-reasoner' sudah pensiun 24 Juli 2026.
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field
from typing import Any

from engine.validator import ActionRequest
from llm.tools import INTENT_TOOLS, NARRATOR_TOOLS

BASE_URL = "https://api.deepseek.com"

# Tarif kasar per 1 juta token (USD). Hanya untuk perkiraan panel /biaya.
PRICE_IN = {"deepseek-v4-flash": 0.14, "deepseek-v4-pro": 0.55}
PRICE_OUT = {"deepseek-v4-flash": 0.28, "deepseek-v4-pro": 2.19}


@dataclass
class NarrateResult:
    """Hasil panggilan narator."""

    prose: str
    tool_calls: list[dict] = field(default_factory=list)


# Kata kunci parser mock. Awalan Indonesia: 'menyerang' mengandung 'nyerang'.
_ATTACK_KW = ["nyerang", "serang", "serbu", "pukul", "tebas", "hantam", "tikam", "bunuh"]
_EQUIP_KW = ["kenakan", "pasang", "lengkapi", "equip", "sarungkan", "kenakn"]
_USE_KW = ["minum", "teguk", "makan", "gunakan", "pakai", "seruput"]
_MOVE_KW = ["pergi", "menuju", "masuk", "pindah", "jalan", "melangkah"]
_TALK_KW = ["bicara", "tanya", "sapa", "ngobrol", "ajak", "berbicara"]
_REST_KW = ["istirahat", "tidur", "rehat", "berkemah", "camp", "bermalam"]
_CHECK_KW = {
    "sembunyi": "stealth", "endap": "stealth", "mengendap": "stealth",
    "bujuk": "persuasion", "membujuk": "persuasion", "rayu": "persuasion",
    "gertak": "intimidation", "ancam": "intimidation",
    "panjat": "athletics", "lompat": "athletics", "dorong": "athletics",
    "angkat": "athletics", "terjang": "athletics",
    "periksa": "investigation", "selidiki": "investigation", "geledah": "investigation",
    "intip": "perception", "amati": "perception", "dengar": "perception",
    "obati": "medicine", "baca": "arcana",
}


class DeepSeekClient:
    """Bungkus DeepSeek. Semua akses LLM lewat sini agar mudah di-mock & dilacak."""

    def __init__(
        self,
        *,
        mock: bool | None = None,
        api_key: str | None = None,
        model_flash: str = "deepseek-v4-flash",
        model_pro: str = "deepseek-v4-pro",
    ) -> None:
        self.mock = os.getenv("DM_MOCK") == "1" if mock is None else mock
        self.model_flash = model_flash
        self.model_pro = model_pro
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.calls = 0
        self._client = None
        if not self.mock:
            from openai import OpenAI  # import malas agar mock tak butuh paket

            self._client = OpenAI(
                api_key=api_key or os.getenv("DEEPSEEK_API_KEY"),
                base_url=BASE_URL,
            )

    # ------------------------------------------------------------------ parse
    def parse_intent(
        self, system_prompt: str, snapshot: dict[str, Any], player_input: str
    ) -> ActionRequest:
        """LLM call #1. Kembalikan satu ActionRequest dari INTENT_TOOLS."""
        if self.mock:
            return self._mock_parse(player_input)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content":
                f"STATE:\n{json.dumps(snapshot, ensure_ascii=False)}\n\n"
                f"INPUT PEMAIN:\n{player_input}"},
        ]
        resp = self._client.chat.completions.create(
            model=self.model_flash, messages=messages, tools=INTENT_TOOLS,
            tool_choice="required", temperature=0.0,
        )
        self._track(resp)
        call = resp.choices[0].message.tool_calls[0]
        args = json.loads(call.function.arguments or "{}")
        return ActionRequest(call.function.name, args, player_input)

    # ---------------------------------------------------------------- narrate
    def narrate(
        self,
        *,
        model: str,
        system_prompt: str,
        context: str,
        resolution_text: str,
        player_input: str,
        allow_tools: bool = True,
    ) -> NarrateResult:
        """LLM call #2. Kembalikan prosa + tool call mutasi naratif."""
        if self.mock:
            return self._mock_narrate(resolution_text, player_input)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content":
                f"{context}\n\n[RESOLUTION]\n{resolution_text}\n\n"
                f"[INPUT PEMAIN]\n{player_input}"},
        ]
        kwargs: dict[str, Any] = {"model": model, "messages": messages, "temperature": 0.8}
        if allow_tools:
            kwargs["tools"] = NARRATOR_TOOLS
            kwargs["tool_choice"] = "auto"
        resp = self._client.chat.completions.create(**kwargs)
        self._track(resp)
        msg = resp.choices[0].message
        calls = []
        for tc in (msg.tool_calls or []):
            calls.append({"name": tc.function.name,
                          "args": json.loads(tc.function.arguments or "{}")})
        return NarrateResult(msg.content or "", calls)

    # ------------------------------------------------------------- completion
    def complete(self, system: str, user: str, model: str | None = None) -> str:
        """Panggilan teks polos untuk ringkasan/ekstraksi (di luar jalur giliran)."""
        if self.mock:
            return ""
        resp = self._client.chat.completions.create(
            model=model or self.model_flash,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
            temperature=0.3,
        )
        self._track(resp)
        return resp.choices[0].message.content or ""

    # --------------------------------------------------------------- tracking
    def _track(self, resp: Any) -> None:
        self.calls += 1
        usage = getattr(resp, "usage", None)
        if usage:
            self.prompt_tokens += getattr(usage, "prompt_tokens", 0)
            self.completion_tokens += getattr(usage, "completion_tokens", 0)

    def estimate_cost(self) -> float:
        """Perkiraan biaya USD kumulatif (asumsi model flash)."""
        pin = PRICE_IN[self.model_flash] / 1_000_000
        pout = PRICE_OUT[self.model_flash] / 1_000_000
        return self.prompt_tokens * pin + self.completion_tokens * pout

    # ------------------------------------------------------------------ mocks
    def _mock_parse(self, text: str) -> ActionRequest:
        low = " " + text.lower().strip() + " "

        def after(keywords: list[str]) -> str:
            for kw in keywords:
                idx = low.find(kw)
                if idx >= 0:
                    tail = low[idx + len(kw):].strip()
                    return tail.strip(" .,!?") or ""
            return ""

        if any(k in low for k in _ATTACK_KW):
            return ActionRequest("attack", {"target": after(_ATTACK_KW)}, text)
        if any(k in low for k in _EQUIP_KW):
            return ActionRequest("equip_item", {"item": after(_EQUIP_KW)}, text)
        if any(k in low for k in _USE_KW):
            return ActionRequest("use_item", {"item": after(_USE_KW)}, text)
        if any(k in low for k in _REST_KW):
            kind = "panjang" if ("tidur" in low or "panjang" in low or "bermalam" in low) \
                else "pendek"
            return ActionRequest("rest", {"kind": kind}, text)
        if any(k in low for k in _TALK_KW):
            return ActionRequest("talk_to", {"who": after(_TALK_KW)}, text)
        if any(k in low for k in _MOVE_KW):
            return ActionRequest("move_to", {"destination": after(_MOVE_KW)}, text)
        for kw, skill in _CHECK_KW.items():
            if kw in low:
                return ActionRequest("roll_check",
                                     {"skill": skill, "difficulty": "sedang"}, text)
        return ActionRequest("narrate_only", {"summary": text.strip()}, text)

    def _mock_narrate(self, resolution_text: str, player_input: str) -> NarrateResult:
        self.calls += 1
        prose = (
            f"Kamu {player_input.strip() or 'menunggu'}. "
            f"{resolution_text} "
            "Dunia bergerak di sekitarmu, tak acuh dan hidup."
        )
        return NarrateResult(prose.strip(), [])
