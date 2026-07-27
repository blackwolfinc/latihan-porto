-- Skema penuh Solo AI Dungeon Master.
-- Semua state mekanik hidup di sini. LLM tidak pernah menulis ke tabel ini
-- secara langsung; hanya engine dan orchestrator.

PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Satu save = satu campaign. Untuk pemakaian pribadi biasanya cuma satu baris.
CREATE TABLE IF NOT EXISTS campaign (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    seed        INTEGER NOT NULL,          -- benih RNG dadu (determinisme)
    dice_cursor INTEGER NOT NULL DEFAULT 0, -- penghitung lemparan untuk resume
    turn_count  INTEGER NOT NULL DEFAULT 0,
    model_flash TEXT NOT NULL DEFAULT 'deepseek-v4-flash',
    model_pro   TEXT NOT NULL DEFAULT 'deepseek-v4-pro',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Satu karakter pemain per campaign.
CREATE TABLE IF NOT EXISTS character (
    id           INTEGER PRIMARY KEY,
    campaign_id  INTEGER NOT NULL REFERENCES campaign(id),
    name         TEXT NOT NULL,
    class_slug   TEXT NOT NULL,
    level        INTEGER NOT NULL DEFAULT 1,
    xp           INTEGER NOT NULL DEFAULT 0,
    str_score    INTEGER NOT NULL DEFAULT 10,
    dex_score    INTEGER NOT NULL DEFAULT 10,
    con_score    INTEGER NOT NULL DEFAULT 10,
    int_score    INTEGER NOT NULL DEFAULT 10,
    wis_score    INTEGER NOT NULL DEFAULT 10,
    cha_score    INTEGER NOT NULL DEFAULT 10,
    hp_cur       INTEGER NOT NULL DEFAULT 10,
    hp_max       INTEGER NOT NULL DEFAULT 10,
    ac           INTEGER NOT NULL DEFAULT 10,
    gold         INTEGER NOT NULL DEFAULT 0,
    location_id  INTEGER REFERENCES location(id),
    proficiencies TEXT NOT NULL DEFAULT '[]' -- JSON list of skill slugs
);

-- Event log append-only. Sumber kebenaran (Invarian I3).
CREATE TABLE IF NOT EXISTS event (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    turn        INTEGER NOT NULL DEFAULT 0,
    type        TEXT NOT NULL,             -- campaign_start, item_gain, damage, ...
    payload     TEXT NOT NULL DEFAULT '{}',-- JSON
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Riwayat percakapan (prosa). Bukan state — hanya untuk context recent turns.
CREATE TABLE IF NOT EXISTS message (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    turn        INTEGER NOT NULL DEFAULT 0,
    role        TEXT NOT NULL,             -- player / gm
    content     TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Katalog item kanonik. slug UNIQUE mencegah duplikasi penamaan (Invarian I4).
CREATE TABLE IF NOT EXISTS item_template (
    id          INTEGER PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    kind        TEXT NOT NULL DEFAULT 'misc', -- weapon / armor / shield / consumable / misc
    weight      REAL NOT NULL DEFAULT 0,
    damage      TEXT,                      -- ekspresi dadu, mis. '1d8'
    ac_base     INTEGER,                   -- untuk armor: AC dasar
    ac_bonus    INTEGER NOT NULL DEFAULT 0,-- untuk shield / aksesori
    description TEXT NOT NULL DEFAULT ''
);

-- Kepemilikan item (instance). FK ke template.
CREATE TABLE IF NOT EXISTS inventory_item (
    id          INTEGER PRIMARY KEY,
    owner_id    INTEGER NOT NULL REFERENCES character(id),
    template_id INTEGER NOT NULL REFERENCES item_template(id),
    quantity    INTEGER NOT NULL DEFAULT 1,
    enchantment TEXT NOT NULL DEFAULT '',  -- '' = biasa; string berbeda = tidak menumpuk
    is_equipped INTEGER NOT NULL DEFAULT 0
);

-- Stacking: item identik & tidak dikenakan menumpuk jadi satu baris.
CREATE UNIQUE INDEX IF NOT EXISTS idx_stack
    ON inventory_item(owner_id, template_id, enchantment)
    WHERE is_equipped = 0;

CREATE TABLE IF NOT EXISTS location (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    slug        TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    discovered  INTEGER NOT NULL DEFAULT 1,
    UNIQUE(campaign_id, slug)
);

CREATE TABLE IF NOT EXISTS npc (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    slug        TEXT NOT NULL,
    name        TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    disposition TEXT NOT NULL DEFAULT 'neutral',
    affinity    INTEGER NOT NULL DEFAULT 0, -- -100..100
    UNIQUE(campaign_id, slug)
);

CREATE TABLE IF NOT EXISTS quest (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    slug        TEXT NOT NULL,
    title       TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    status      TEXT NOT NULL DEFAULT 'active', -- active / done / failed
    UNIQUE(campaign_id, slug)
);

-- Fakta kanon: selalu diinjeksi penuh ke context, tidak pernah diringkas.
CREATE TABLE IF NOT EXISTS canon_fact (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    turn        INTEGER NOT NULL DEFAULT 0,
    category    TEXT NOT NULL DEFAULT 'misc',
    text        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Ringkasan adegan (arc summary) untuk context.
CREATE TABLE IF NOT EXISTS scene_summary (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    turn        INTEGER NOT NULL DEFAULT 0,
    text        TEXT NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Combat. Panel dirender dari sini, bukan dari prosa.
CREATE TABLE IF NOT EXISTS encounter (
    id          INTEGER PRIMARY KEY,
    campaign_id INTEGER NOT NULL REFERENCES campaign(id),
    status      TEXT NOT NULL DEFAULT 'active', -- active / won / lost / fled
    round       INTEGER NOT NULL DEFAULT 1,
    turn_index  INTEGER NOT NULL DEFAULT 0,     -- indeks giliran dalam initiative order
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS combatant (
    id           INTEGER PRIMARY KEY,
    encounter_id INTEGER NOT NULL REFERENCES encounter(id),
    ref_type     TEXT NOT NULL,            -- player / monster
    ref_slug     TEXT,                     -- slug monster SRD, NULL untuk player
    name         TEXT NOT NULL,
    hp_cur       INTEGER NOT NULL,
    hp_max       INTEGER NOT NULL,
    ac           INTEGER NOT NULL,
    attack_bonus INTEGER NOT NULL DEFAULT 0,
    damage       TEXT NOT NULL DEFAULT '1d4',
    initiative   INTEGER NOT NULL DEFAULT 0,
    is_player    INTEGER NOT NULL DEFAULT 0,
    is_alive     INTEGER NOT NULL DEFAULT 1
);

-- Memori teks untuk retrieval (FTS5 + bm25). Nol dependency embedding.
CREATE VIRTUAL TABLE IF NOT EXISTS memory_fts USING fts5(
    content,
    kind UNINDEXED,     -- summary / canon / event
    turn UNINDEXED
);
