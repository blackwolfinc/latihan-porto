# CLAUDE.md — Solo AI Dungeon Master

Dokumen ini adalah **konstitusi proyek**. Baca seluruhnya sebelum menulis atau
mengubah kode apa pun. Kalau ada instruksi lain yang bertabrakan dengan bagian
"Invarian" di bawah, bagian Invarian yang menang.

Pakai dokumen ini untuk dua hal:
1. Membangun proyek dari nol kalau folder masih kosong.
2. Menjadi acuan tetap saat melanjutkan, memperbaiki, atau menambah fitur.

---

## 1. Apa yang dibangun

Game roleplay teks fantasi, **satu pemain, satu pengguna, dipakai pribadi**.
AI berperan sebagai Game Master. Pemain mengetik apa yang ia lakukan; AI
menarasikan konsekuensinya. Mekanik bergaya tabletop: lempar dadu, HP, inventory,
combat, level up.

**Bukan** produk komersial. Tidak ada autentikasi, billing, kuota pesan, multi-tenant,
moderasi konten, analytics, atau onboarding funnel. Setiap kali tergoda menambahkan
salah satu dari itu, jangan.

**Provider LLM: DeepSeek.** Lihat bagian 6 untuk detail yang tidak boleh salah.

### Masalah yang secara spesifik harus dihindari

Produk sejenis di pasar (Everweave, AI Dungeon) gagal di titik yang sama dan
selalu karena satu penyebab: **game state diserahkan ke LLM.** Akibatnya:

- Inventory tidak dikenali DM, item terduplikasi dengan penamaan berbeda,
  aplikasi rusak setelah sekian item
- Dadu tidak konsisten; AI "memutuskan" hasil alih-alih melaporkannya
- Combat menggantung, error, harus mengulang giliran
- Memori memburuk; dunia lupa apa yang sudah terjadi
- AI jadi yes-man: apa pun yang diketik pemain selalu berhasil, jadi tidak ada taruhan

Seluruh arsitektur di bawah ada untuk membuat lima kegagalan itu **mustahil secara
struktural**, bukan sekadar "diusahakan tidak terjadi".

---

## 2. Invarian — tidak boleh dilanggar

Ini bukan preferensi gaya. Ini kontrak arsitektural.

**I1. LLM tidak pernah memegang game state.**
HP, isi tas, gold, hasil dadu, posisi, ronde combat — semuanya hidup di SQLite.
LLM hanya membaca snapshot read-only dan menarasikan.

**I2. LLM tidak pernah mengeluarkan angka mekanik.**
LLM *meminta* aksi lewat tool call (`roll_check`, `attack`). Engine yang melempar
dadu, menghitung, dan mengembalikan hasil final. LLM menarasikan hasil itu apa adanya.
Dilarang membuat tool bernama `set_hp`, `set_gold`, `deal_damage`, atau apa pun
yang menerima nilai absolut hasil mekanik. Hanya niat aksi dan delta.

**I3. Event log append-only adalah sumber kebenaran.**
Semua mutasi state menghasilkan baris di tabel `event`. Tidak ada `UPDATE` diam-diam.

**I4. Setiap entitas punya ID kanonik.**
NPC, item, lokasi, quest. LLM boleh *mengusulkan* entitas baru lewat tool; engine
yang mendaftarkan dan memberi slug. Item yang disebut di prosa tapi tidak
di-`grant_item` memang tidak ada di tas — itu perilaku benar, bukan bug.

**I5. Seluruh `engine/` harus bisa diuji tanpa satu pun panggilan LLM.**
Kalau suatu logika tidak bisa diuji tanpa LLM, logika itu bocor keluar engine
dan harus ditarik kembali. Test engine harus selesai di bawah 2 detik.

**I6. Aksi ilegal ditolak sebelum biaya narasi keluar.**
Validasi terjadi di langkah 3 turn loop. Aksi yang gagal validasi tidak boleh
memicu panggilan LLM apa pun.

**I7. Maksimal 2 panggilan LLM per giliran.** (parse + narrate)
Ringkasan dan ekstraksi fakta jalan sesekali di luar jalur giliran, bukan tiap turn.

---

## 3. Stack & konvensi

- **Python 3.11+**, standard library sedapat mungkin
- **SQLite** satu file (`saves/campaign.db`). Backup = copy file.
- Dependency eksternal **hanya** `openai>=1.40.0` (dipakai sebagai klien
  OpenAI-compatible untuk DeepSeek). Jangan tambahkan ORM, framework web,
  vector DB, atau library dadu.
- Antarmuka: **CLI**. Jangan buat web UI kecuali diminta eksplisit.
- Nama tabel, kolom, fungsi, dan variabel: **bahasa Inggris**.
- String yang dilihat pemain, komentar, docstring, dan isi prompt: **bahasa Indonesia**.
- Tanpa type checker yang rewel, tapi pakai type hint di signature publik.
- Baris maksimal 100 karakter.
- Tidak ada `print()` di dalam `engine/`, `store/`, `memory/`, `llm/` —
  hanya di `main.py`.

---

## 4. Struktur file

```
solo-dm/
  main.py                CLI, panel state, perintah slash, entry point
  orchestrator.py        turn loop 8 langkah
  setup.py               pembuatan campaign & karakter, seeding SRD
  requirements.txt
  .env.example
  README.md

  engine/                DETERMINISTIK — dilarang ada LLM di sini
    dice.py              RNG bertanda benih, Roll dataclass, d20 + adv/disadv
    checks.py            ability_mod, proficiency_bonus, resolve_check, describe_margin
    combat.py            state machine combat, attack, npc_turn, check_end
    enemy_ai.py          pohon prioritas taktis
    inventory.py         ensure_template, grant_item, equip, recalc_ac, carry_capacity
    progression.py       XP threshold, level up, rest
    validator.py         legalitas aksi → Illegal exception

  llm/
    client.py            DeepSeekClient, model routing, tracking biaya, mode mock
    tools.py             INTENT_TOOLS + NARRATOR_TOOLS (JSON Schema)
    prompts/
      system_gm.md
      intent_parser.md
      summarizer.md
      fact_extractor.md

  memory/
    context.py           perakit context window (urutan ramah cache)
    retriever.py         SQLite FTS5
    summarizer.py        ringkasan adegan + ekstraksi fakta kanon

  store/
    schema.sql           DDL lengkap
    db.py                connect, init_schema, log_event, log_message
    repo.py              query + state_snapshot untuk prompt

  data/srd/
    classes.json  items.json  monsters.json

  tests/
    test_engine.py       unit test engine, tanpa LLM
    test_loop.py         turn loop end-to-end, mode mock
```

---

## 5. Turn loop

```
1. INPUT      teks bebas pemain, ATAU aksi tombol UI (tombol melewati langkah 2)
2. PARSE      LLM call #1 — intent parser, model flash, temperature 0.0
              input + state ringkas → satu tool call → ActionRequest
3. VALIDATE   engine.validator — item ada? giliran siapa? slot tersedia?
              gagal → lempar Illegal, kembalikan alasan, SELESAI (0 biaya narasi)
4. RESOLVE    engine menghitung → ResolutionResult (dadu, damage, delta state)
5. COMMIT     tulis event, terapkan mutasi
6. NARRATE    LLM call #2 — narator, model flash (atau pro untuk momen besar)
              ResolutionResult + context → prosa + tool call mutasi naratif
7. REMEMBER   kalau trigger terpenuhi: ringkas adegan, ekstrak fakta kanon, index FTS
8. RENDER     tampilkan prosa; panel UI dirender dari STATE, bukan dari prosa
```

**Trigger ringkasan (langkah 7):** pindah lokasi, combat berakhir, quest berubah
status, long rest, atau lewat 15 giliran sejak ringkasan terakhir.

**Model routing:** `pro` hanya dipakai bila resolusi mengandung critical,
combat berakhir menang/kalah, atau level up. Sekitar 5% giliran.

---

## 6. DeepSeek — detail yang tidak boleh salah

**Nama model.** `deepseek-chat` dan `deepseek-reasoner` **sudah pensiun pada
24 Juli 2026** dan panggilan ke nama itu tidak lagi dirutekan ke mana pun.
Gunakan `deepseek-v4-flash` dan `deepseek-v4-pro`. Kalau menemukan contoh kode
atau tutorial yang memakai nama lama, itu usang — jangan ikuti.

**Endpoint.** OpenAI-compatible di `https://api.deepseek.com`. Pakai SDK `openai`
dengan `base_url` diganti. Tool calling dan JSON mode didukung.

**Context caching.** DeepSeek memberi tarif cache-hit untuk prefix prompt yang sama,
selisihnya sangat besar. Karena itu urutan blok di `memory/context.py` **wajib**
statis-dulu:

```
[1] system prompt GM        statis   → cache
[2] world bible             statis   → cache
[3] canon facts             lambat berubah
[4] state snapshot (JSON)   tiap giliran
[5] retrieved memory        tiap giliran
[6] arc summary             lambat berubah
[7] recent turns            tiap giliran
[8] RESOLUTION              tiap giliran
[9] input pemain            tiap giliran
```

Jangan pernah menaruh sesuatu yang berubah tiap giliran sebelum blok statis.

**Tidak ada endpoint embedding.** Jangan pakai vector search. Retrieval memori
memakai SQLite FTS5 (`memory_fts`, bm25 ranking). Untuk satu pemain ini cukup akurat,
nol dependency, dan gratis. Jangan menambahkan sentence-transformers, chromadb,
faiss, atau sejenisnya.

**Mode mock.** `DM_MOCK=1` harus membuat seluruh sistem jalan penuh tanpa API key:
parser tiruan berbasis kata kunci, narasi placeholder. Ini wajib ada agar test
end-to-end bisa jalan gratis. Kata kunci parser mock harus menangani awalan
bahasa Indonesia (`menyerang` mengandung `nyerang`, bukan `serang`).

---

## 7. Data model

Skema penuh ada di `store/schema.sql`. Poin yang mudah dilakukan salah:

**Item — katalog terpisah dari kepemilikan.**
```
item_template   katalog kanonik, slug UNIQUE
inventory_item  instance kepemilikan, FK ke template
```
Stacking dijamin unique index parsial:
```sql
CREATE UNIQUE INDEX idx_stack ON inventory_item(owner_id, template_id, enchantment)
WHERE is_equipped = 0;
```
Ini yang mencegah "dua item identik dengan wording berbeda". Bukan logika di prompt.

**Batas bawaan berbasis berat, bukan jumlah baris.**
`carry_capacity = str_score * 15`. Jangan pernah membuat batas "maksimal N item".

**Fakta kanon** (`canon_fact`) selalu diinjeksikan penuh ke context, tidak pernah
diringkas. Isinya: janji, hutang, rahasia terungkap, kematian, perubahan hubungan
permanen, identitas.

**Combat** disimpan di `encounter` + `combatant`. Panel UI dirender dari tabel ini.
Prosa narator tidak pernah menjadi acuan status combat.

---

## 8. Kontrak tool

### INTENT_TOOLS (dipanggil parser)
`roll_check`, `attack`, `use_item`, `equip_item`, `move_to`, `talk_to`, `rest`,
`narrate_only`

Panduan penting untuk prompt parser: **sebagian besar giliran adalah `narrate_only`.**
Jangan memaksakan lemparan dadu. `roll_check` hanya bila hasilnya benar-benar tidak
pasti DAN kegagalan punya konsekuensi menarik.

### NARRATOR_TOOLS (dipanggil narator, mutasi naratif)
`grant_item`, `remove_item`, `adjust_gold`, `create_npc`, `update_relationship`,
`discover_location`, `update_quest`, `record_canon_fact`, `start_combat`

`adjust_gold` menerima **delta**, bukan nilai absolut. `update_relationship`
menerima `affinity_delta` yang di-clamp ke -20..20 oleh engine, lalu hasilnya
di-clamp ke -100..100.

---

## 9. Prompt

Empat file di `llm/prompts/`. Yang paling menentukan kualitas adalah
`system_gm.md`. Empat aturan berikut wajib ada di dalamnya:

1. Hasil sudah dihitung engine dan diberikan di blok RESOLUTION. Narasikan apa
   adanya. Jangan membalikkan, melunakkan, atau mengarang hasil lain.
2. **Kegagalan harus terasa seperti kegagalan. Kamu bukan yes-man.** NPC boleh
   menolak dan punya agenda. Dunia boleh melawan. Rencana boleh runtuh.
3. Jangan sebut angka mekanik mentah dalam prosa (DC, AC, "7 damage").
   Terjemahkan ke bahasa fiksi.
4. Kalau pemain menyebut sesuatu yang tidak ada di STATE, jangan berpura-pura ada.

Aturan nomor 2 adalah satu-satunya penangkal keluhan terbesar terhadap game sejenis.
Jangan pernah menghapusnya demi membuat AI terasa "lebih ramah".

Gaya narasi: bahasa Indonesia, present tense, sudut pandang kedua ("kamu"),
2-4 paragraf pendek, tidak pernah menutup dengan "apa yang kamu lakukan?".

---

## 10. Testing — definition of done

Setiap perubahan harus lulus dua perintah ini:

```bash
python tests/test_engine.py    # < 2 detik, tanpa LLM
python tests/test_loop.py      # mode mock, tanpa API key
```

Test engine minimal harus mencakup:

| Test | Kriteria lulus |
|---|---|
| Dadu deterministik | seed sama → hasil sama; 200 lemparan d20 semua 1..20 |
| Modifier | `ability_mod(18)==4`, `proficiency_bonus(5)==3` |
| Skill check | memakai proficiency bonus bila karakter mahir |
| Inventory stacking | grant 2 + grant 3 → **satu baris** qty 5 |
| Katalog kanonik | nama sama tidak membuat template kedua |
| AC | dihitung ulang dari equipment, bukan disimpan buta |
| Combat terminasi | selalu berakhir `won`/`lost` dalam < 300 langkah |
| Level up | xp 1000 → level 3, hp_max bertambah |
| Event log | berisi `campaign_start` dan `item_gain` |
| Rest | long rest memulihkan HP penuh |

Test loop harus membuktikan: parse → validate → resolve → commit → narrate berjalan,
combat auto-start dari serangan di luar combat, dan **aksi ilegal ditolak tanpa
memanggil narator**.

---

## 11. Urutan bangun

Kalau membangun dari nol, kerjakan berlapis. Setiap fase harus **bisa dimainkan**
sebelum lanjut ke fase berikutnya.

| Fase | Isi | Selesai bila |
|---|---|---|
| 0 | store + event log + character creation + chat loop narator saja | bisa main seperti CYOA |
| 1 | dice + checks + validator | lemparan dadu muncul dan berkonsekuensi |
| 2 | item_template + inventory + equip + gold | `/tas` menampilkan isi yang benar |
| 3 | combat state machine + enemy_ai | pertarungan selalu selesai, tidak menggantung |
| 4 | scene summary + canon facts + FTS retrieval | dunia mengingat kejadian lama |
| 5 | XP, level up, rest | karakter berkembang |
| 6 | npc_relationship, quest, faction | NPC bereaksi sesuai riwayat |
| 7 | poles: panel, peta, export campaign | — |

**Fase 0–3 adalah MVP.** Jangan menyentuh fase 4 sebelum combat benar-benar solid.

---

## 12. Perintah dalam permainan

```
/tas          inventory              /sheet      lembar karakter
/log          20 event terakhir      /debug      prompt & resolution terakhir
/hp <n>       GM override HP         /gold <n>   GM override gold
/biaya        pemakaian token        /keluar     simpan & keluar
```

Semua perintah slash dijalankan **lokal, tanpa LLM**. `/debug`, `/hp`, dan `/gold`
sengaja ada: karena ini dipakai sendiri, pemain selalu bisa membetulkan dunia saat
AI keliru. Jangan hapus dengan alasan "tidak profesional".

---

## 13. Anti-pattern — jangan lakukan ini

- ❌ Menyimpan HP, gold, atau isi tas di dalam string percakapan
- ❌ Membiarkan LLM menuliskan angka damage atau hasil dadu
- ❌ Membuat tool `set_hp` / `set_gold` / `deal_damage` bernilai absolut
- ❌ Memakai LLM untuk keputusan taktis musuh (pakai pohon prioritas di `enemy_ai.py`)
- ❌ Merender panel status atau inventory dengan mem-parse prosa narator
- ❌ Batas "maksimal N item" (pakai carry weight)
- ❌ Menambah vector DB atau embedding provider
- ❌ Memakai `deepseek-chat` / `deepseek-reasoner`
- ❌ Menaruh blok yang berubah tiap giliran sebelum blok statis di context
- ❌ Menambah kuota pesan, iklan, atau paywall — ini dipakai sendiri
- ❌ Melunakkan aturan "bukan yes-man" di system prompt
- ❌ Menambah dependency di luar `openai`

---

## 14. Lisensi konten

`data/srd/` diturunkan dari SRD 5.1 (Wizards of the Coast, lisensi Creative Commons
Attribution 4.0). Boleh dipakai, dimodifikasi, dan didistribusikan dengan atribusi.

Hindari IP eksklusif WotC bila suatu saat didistribusikan: Beholder, Mind Flayer,
Displacer Beast, Yuan-ti, setting Forgotten Realms / Eberron, dan merek dagang D&D.

Untuk pemakaian pribadi, homebrew bebas sepenuhnya.

---

## 15. Cara kerja yang diharapkan

- Sebelum mengubah `engine/`, jalankan `tests/test_engine.py` dulu untuk melihat
  baseline hijau.
- Setiap fitur mekanik baru: tambah resolver di `engine/`, tambah skema di
  `llm/tools.py`, tambah cabang di `orchestrator._resolve`. **Turn loop tidak berubah.**
- Setiap fitur naratif baru: tambah tool di `NARRATOR_TOOLS` dan handler di
  `orchestrator._apply_narrator_tool`. Turn loop tetap tidak berubah.
- Kalau sebuah perubahan menuntut turn loop diubah, berhenti dan jelaskan kenapa
  sebelum melanjutkan — kemungkinan besar ada invarian yang sedang dilanggar.
- Jangan menulis ulang file utuh untuk perubahan kecil; sunting bagian yang perlu saja.
