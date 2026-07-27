# Solo AI Dungeon Master

Game roleplay teks fantasi **satu pemain, dipakai pribadi**. AI berperan sebagai
Game Master: kamu mengetik apa yang kamu lakukan, AI menarasikan konsekuensinya.
Mekanik bergaya tabletop — dadu, HP, inventory, combat, level up — tapi **semua
angka dipegang engine, bukan LLM**.

Baca `CLAUDE.md` untuk konstitusi arsitektur lengkap. Ringkasnya: LLM hanya
membaca snapshot state dan menarasikan; engine deterministik yang melempar dadu,
menghitung damage, dan menjaga kebenaran dunia. Ini yang mencegah lima kegagalan
klasik game sejenis (inventory kacau, dadu tak konsisten, combat menggantung,
memori memburuk, AI jadi yes-man).

## Menjalankan

```bash
# 1. (opsional) buat virtualenv
python -m venv .venv && source .venv/bin/activate

# 2. main tanpa API — mode mock (gratis, parser kata kunci)
DM_MOCK=1 python main.py --new

# 3. main dengan DeepSeek sungguhan
pip install -r requirements.txt
cp .env.example .env      # isi DEEPSEEK_API_KEY, set DM_MOCK=0
python main.py
```

Save tersimpan di `saves/campaign.db`. Backup = salin file itu. Jalankan
`python main.py` tanpa `--new` untuk melanjutkan campaign terakhir.

## Perintah dalam permainan

| Perintah | Fungsi | Perintah | Fungsi |
|---|---|---|---|
| `/tas` | inventory | `/debug` | prompt & resolution terakhir |
| `/sheet` | lembar karakter | `/hp <n>` | GM override HP |
| `/log` | 20 event terakhir | `/gold <n>` | GM override gold |
| `/biaya` | pemakaian token | `/keluar` | simpan & keluar |

Semua perintah slash jalan lokal, tanpa LLM.

## Testing

```bash
python tests/test_engine.py    # unit engine, < 2 detik, tanpa LLM
python tests/test_loop.py      # turn loop end-to-end, mode mock
```

## Struktur

```
engine/    logika deterministik (dice, checks, combat, inventory, progression, validator)
llm/       klien DeepSeek + kontrak tool + prompt
memory/    context builder + FTS retrieval + summarizer
store/     skema SQLite + query + state snapshot
data/srd/  katalog kelas, item, monster (SRD 5.1, CC-BY 4.0)
```

## Provider LLM

DeepSeek (OpenAI-compatible, `https://api.deepseek.com`). Model:
`deepseek-v4-flash` dan `deepseek-v4-pro`. **Jangan** pakai `deepseek-chat` /
`deepseek-reasoner` — sudah pensiun 24 Juli 2026.

## Lisensi konten

`data/srd/` diturunkan dari SRD 5.1 (Wizards of the Coast), lisensi
Creative Commons Attribution 4.0.
