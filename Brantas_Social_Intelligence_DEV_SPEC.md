# DEV SPEC — Brantas Social Intelligence Platform

> Dokumen acuan implementasi. Letakkan di repo sebagai `docs/DEV_SPEC.md` (atau `CLAUDE.md` jika dikerjakan dengan Claude Code). Kerjakan task berurutan sesuai Bagian 16, satu task per sesi, dan jangan lompat fase.
>
> Skenario biaya: **Rp 0** (open-source, VM internal, tanpa API berbayar). Versi 1.1, 26 Oktober 2026.
>
> **Revisi 1.1:** lapisan web (dashboard, konsol persetujuan, admin) memakai **Next.js**. Worker data dan NLP tetap Python. Ringkasan perubahan ada di Bagian 20.

---

## 0. Aturan Keras (tidak boleh dilanggar oleh developer maupun agent coding)

1. **Tidak ada akun palsu atau akun yang menyamar.** Semua posting dan balasan hanya lewat akun resmi Brantas Abipraya.
2. **Tidak ada evasi.** Jangan menambahkan bypass login/captcha, rotasi proxy, stealth/fingerprint plugin, atau pembuatan banyak akun. Jika scraper diblokir, collector dinonaktifkan, bukan dilawan.
3. **Isu kritis atau sensitif tidak pernah dibalas bot.** Eskalasi ke manusia.
4. **Semua fitur otomatis posting default OFF** (`auto_reply_enabled=off`, `x_collector_enabled=off`, `kill_switch=off`) dan harus dinyalakan eksplisit lewat tabel `system_flags`.
5. **Komentar publik adalah input tidak tepercaya.** Teks komentar tidak pernah dimasukkan ke bagian instruksi prompt dan tidak pernah memicu pemanggilan tool.
6. **Tidak ada secret di repo.** Semua kredensial lewat environment atau secret store.
7. **Data pribadi minimal.** Handle/ID penulis di-hash sebelum disimpan, dan teks mentah dihapus sesuai retensi.
8. **Frontend tidak memegang secret dan tidak mengakses data langsung dari browser.** Semua akses data dan mutasi lewat server (Server Component, Server Action, atau Route Handler) dengan pengecekan sesi dan peran. Tidak ada variabel `NEXT_PUBLIC_*` yang berisi secret atau URL database.
9. **Next.js tidak pernah memanggil API posting platform** (Meta, YouTube, X). Web console hanya mengubah status di `reply_queue`. Pengiriman hanya dilakukan `publisher` Python dari baris berstatus `approved`.

---

## 1. Ringkasan Sistem

Sistem mengumpulkan percakapan publik tentang Brantas (IG, FB, X, berita, YouTube) tiap jam, menganalisisnya (sentimen, topik, kritis, skala, sensitif, kecepatan sebar), menampilkannya di web console (Next.js), mengirim alert, merekomendasikan konten, dan membantu membalas komentar di akun resmi.

```
cron :05  →  collectors → normalize/dedup → store → analyze → score → alert (Telegram)
                                                          ↘ reply_queue (pending)
Web console / Telegram ── persetujuan staf ──→ reply_queue (approved)
                                                          ↓
                                    publisher Python (akun resmi) → platform
Web console ── baca view ──→ dashboard
```

Pembagian tanggung jawab:

| Komponen | Bahasa | Tugas |
|---|---|---|
| Worker | Python | Collector, normalisasi, NLP, scoring, klaster, trend, publisher, jadwal (cron) |
| API internal | Python (FastAPI) | Layanan tipis, hanya di jaringan internal Docker: Guard check (satu sumber aturan) dan healthz |
| Bot Telegram | Python | Alert dan persetujuan cepat (long polling) |
| Web console | TypeScript (Next.js) | Dashboard, antrean balasan dan persetujuan, pengelolaan isu/KB/saran konten, admin (flag, kill switch, pengguna), audit log |

Alasan pembagian: model sentimen (IndoBERT), embedding, klaster (HDBSCAN), dan collector (Instaloader, Scweet/twscrape) adalah ekosistem Python. Next.js dipakai untuk apa yang memang tugas web: tampilan, autentikasi, dan alur persetujuan manusia.

## 2. Tech Stack

| Lapisan | Pilihan |
|---|---|
| Bahasa | Python 3.11+ (worker, NLP), TypeScript mode strict (web) |
| DB | PostgreSQL 16 + pgvector |
| Scheduler | cron / systemd timer (MVP). Prefect opsional kemudian. Next.js **tidak** menjalankan job terjadwal. |
| API internal | FastAPI tipis (Guard check, healthz), tanpa port ke host |
| ORM/migrasi | SQLAlchemy 2 + Alembic. **Alembic adalah satu-satunya jalur perubahan skema.** |
| NLP sentimen | Hugging Face Transformers, model IndoBERT-family (CPU) |
| Embedding | sentence-transformers multilingual, dimensi 384 |
| LLM lokal | Ollama, model kecil terkuantisasi (3–8B), nama model lewat env |
| Web framework | Next.js 16.x (App Router) + React. Server Components secara default. |
| UI | Tailwind CSS + shadcn/ui. Chart dan heatmap: Apache ECharts. Tabel: TanStack Table. |
| Akses DB (web) | Drizzle ORM + driver `postgres` sebagai query builder bertipe. Tipe di-generate dari skema nyata dengan `drizzle-kit pull`. |
| Validasi (web) | Zod (env, input Server Action, parsing hasil query) |
| Auth (web) | Better Auth, self-hosted, sesi di database sehingga bisa dicabut. Login SSO OIDC perusahaan atau email+password dengan 2FA (Bagian 18). |
| Alert/approval | Telegram bot (Python) untuk alert dan persetujuan cepat. Web console untuk antrean lengkap dan edit draf. |
| Test | pytest + VCR/recorded fixtures (Python). Vitest + Playwright (web). |
| Deploy | Docker Compose di VM internal. Image web memakai `output: "standalone"`. Package manager: pnpm. |

Verifikasi lisensi, label output, dan akurasi model sebelum dipakai. Pin versi semua dependency dan image Docker.

Catatan versi (dicek 26 Oktober 2026, verifikasi ulang saat T-01):

- Pakai Next.js 16.x (Active LTS). Next.js 15 mencapai end-of-life pada 21 Oktober 2026, jadi tidak dipakai.
- Pin ke patch yang sudah memuat perbaikan advisory keamanan 14 Oktober 2026 (16.4.1 atau lebih baru). Lihat Bagian 14.
- Auth.js (NextAuth) kini hanya menerima patch keamanan di bawah tim Better Auth, sehingga proyek baru memakai Better Auth. Cek versi dan API-nya di dokumentasi resmi saat T-03a.
- Semua komponen web berlisensi open-source, jadi skenario Rp 0 tetap berlaku. Metabase tidak lagi dipakai (Bagian 12).

## 3. Struktur Repo

```
brantas-social-intel/
├─ docs/DEV_SPEC.md
├─ pyproject.toml                  # Python: worker, NLP, API internal
├─ .env.example                    # env Python (worker, bot, API)
├─ docker-compose.yml
├─ migrations/                     # Alembic: satu-satunya sumber skema DB (0001 inti, 0002 web)
├─ config/
│  ├─ keywords.yaml                # kata kunci + pengecualian (disambiguasi "Brantas")
│  ├─ sensitive_lexicon.yaml       # tag sensitif + kata pemicu
│  ├─ scoring.yaml                 # bobot, ambang, fallback baseline
│  ├─ reply_policy.yaml            # template, batas, jam, platform capability
│  └─ sources.yaml                 # akun/Page/kanal yang dipantau
├─ src/brantas_si/
│  ├─ settings.py
│  ├─ db/ (models.py, session.py)
│  ├─ collectors/
│  │  ├─ base.py                   # RawItem, Collector, runner
│  │  ├─ graph_ig.py               # akun resmi IG (Graph API)
│  │  ├─ graph_fb.py               # Page resmi FB (Graph API)
│  │  ├─ instaloader_ig.py         # akun publik tertentu
│  │  ├─ apify_fb.py               # Page/Group publik (free tier)
│  │  ├─ rss_news.py               # Google News RSS + portal berita
│  │  ├─ youtube.py                # YouTube Data API
│  │  └─ x_scraper.py              # OPSIONAL, di balik flag
│  ├─ pipeline/ (normalize.py, dedup.py, spam_filter.py)
│  ├─ nlp/ (sentiment.py, embeddings.py, topics.py, llm.py)
│  ├─ scoring/ (spread.py, scale.py, sensitive.py, critical.py)
│  ├─ agents/ (reader.py, writer.py, guard.py)
│  ├─ replies/ (queue.py, worker.py, publishers.py)
│  ├─ trend/radar.py
│  ├─ content/recommender.py
│  ├─ alerts/ (telegram.py, bot.py)   # telegram.py: kirim alert; bot.py: long polling, tombol, perintah
│  ├─ flows/ (hourly.py, daily.py, retention.py)
│  └─ api/main.py                  # FastAPI internal: POST /internal/guard/check, GET /healthz
├─ web/                            # Next.js (TypeScript)
│  ├─ package.json, pnpm-lock.yaml, next.config.ts, drizzle.config.ts
│  ├─ .env.example                 # env web, terpisah dari .env Python
│  ├─ src/
│  │  ├─ proxy.ts                  # opsional: redirect ke /login dan header. BUKAN satu-satunya pagar auth
│  │  ├─ app/
│  │  │  ├─ login/
│  │  │  ├─ (console)/             # semua halaman terlindungi; layout memeriksa sesi
│  │  │  │  ├─ page.tsx            # ringkasan KPI
│  │  │  │  ├─ posts/  topics/  issues/  velocity/  replies/  content/  trends/  sources/
│  │  │  │  └─ admin/              # flags dan kill switch, KB, pengguna, audit log
│  │  │  └─ api/healthz/
│  │  ├─ server/
│  │  │  ├─ auth.ts, rbac.ts       # sesi dan matriks peran (requireRole)
│  │  │  ├─ db.ts                  # dua pool: baca (si_dashboard) dan tulis (si_web_write)
│  │  │  ├─ queries/               # baca dari view, satu fungsi per kebutuhan halaman
│  │  │  ├─ actions/               # Server Action mutasi (tiap fungsi: cek peran, Zod, audit)
│  │  │  ├─ audit.ts, guard-client.ts, mask.ts
│  │  │  └─ env.ts                 # validasi env dengan Zod saat start
│  │  └─ components/
│  └─ tests/ (unit, e2e)
├─ scripts/                        # termasuk create_admin
└─ tests/ (unit, integration, fixtures, golden)
```

## 4. Konfigurasi

### 4.1 `.env.example` (Python: worker, bot, API internal)

```
DATABASE_URL=postgresql+psycopg://si_app:CHANGE_ME@localhost:5432/brantas_si
AUTHOR_HASH_KEY=CHANGE_ME_LONG_RANDOM
TIMEZONE=Asia/Jakarta

META_APP_ID=
META_APP_SECRET=
META_PAGE_TOKEN=
META_IG_USER_ID=
META_GRAPH_VERSION=             # isi versi yang berlaku saat deploy
META_WEBHOOK_VERIFY_TOKEN=

YOUTUBE_API_KEY=
APIFY_TOKEN=                    # opsional, free tier

TELEGRAM_BOT_TOKEN=
TELEGRAM_ALLOWED_USER_IDS=      # daftar ID dipisah koma (allowlist)
TELEGRAM_ALERT_CHAT_ID=

OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=                   # model kecil terkuantisasi
SENTIMENT_MODEL=                # id model Hugging Face (verifikasi lisensi dan label)
EMBEDDING_MODEL=                # model 384 dimensi
# --- web console dan bot ---
WEB_BASE_URL=                   # URL web console (untuk tautan di alert Telegram)
TELEGRAM_ADMIN_USER_IDS=        # subset allowlist yang boleh /resume (sama dengan peran admin)
INTERNAL_API_TOKEN=CHANGE_ME_LONG_RANDOM   # token API internal; nilai sama dengan di web
```

### 4.1b `web/.env.example` (Next.js)

```
WEB_DB_READ_URL=postgresql://si_dashboard:CHANGE_ME@db:5432/brantas_si
WEB_DB_WRITE_URL=postgresql://si_web_write:CHANGE_ME@db:5432/brantas_si
BETTER_AUTH_SECRET=CHANGE_ME_LONG_RANDOM
BETTER_AUTH_URL=                # URL web console
OIDC_ISSUER=                    # isi jika memakai SSO perusahaan
OIDC_CLIENT_ID=
OIDC_CLIENT_SECRET=
INTERNAL_API_URL=http://api:8000
INTERNAL_API_TOKEN=CHANGE_ME_LONG_RANDOM
TIMEZONE=Asia/Jakarta
```

Aturan:

- Nama variabel auth mengikuti dokumentasi Better Auth pada versi yang dipin.
- Container web **tidak** menerima `.env` Python: tidak ada `META_*`, `TELEGRAM_*`, `AUTHOR_HASH_KEY`, `APIFY_TOKEN`, atau `YOUTUBE_API_KEY` di sana.
- Tidak ada variabel `NEXT_PUBLIC_*` yang berisi secret. Env web divalidasi dengan Zod saat start dan gagal cepat bila ada yang kurang.

### 4.2 `config/keywords.yaml`

```yaml
include:
  - "brantas abipraya"
  - "abipraya"
  - "pt ba"             # verifikasi: banyak false positive
  - "@<handle_resmi>"
  - "<nama proyek 1>"
exclude_context:        # disambiguasi
  - "sungai brantas"
  - "kali brantas"
  - "<nama perusahaan lain bernama Brantas>"
```

### 4.3 `config/sensitive_lexicon.yaml` (isi awal, lengkapi bersama Humas/Legal)

```yaml
K3_KECELAKAAN: [kecelakaan, korban, tewas, meninggal, roboh, ambruk, terluka]
HUKUM_KORUPSI: [korupsi, kpk, kejaksaan, suap, tersangka, gratifikasi, mark up]
SARA: []                # diisi tim Humas, tidak ditebak oleh developer
POLITIK_PEJABAT: []     # diisi tim Humas
LAHAN_WARGA: [ganti rugi, pembebasan lahan, gusur, warga terdampak]
KETENAGAKERJAAN: [phk, upah, gaji belum dibayar, mogok, outsourcing]
LINGKUNGAN: [limbah, pencemaran, longsor, banjir, merusak lingkungan]
DATA_PRIBADI: [ktp, nik, nomor hp, alamat rumah]
```

Deteksi sensitif = leksikon (cepat) **ditambah** klasifikasi LLM lokal sebagai pemeriksa kedua. Jika salah satunya positif, `is_sensitive=true` (bias ke aman).

### 4.4 `config/scoring.yaml`

```yaml
engagement_weights: {likes: 1, replies: 2, shares: 3, views_divisor: 100}
baseline_days: 14
min_baseline_samples: 200
fallback_velocity_thresholds:      # dipakai sebelum baseline cukup
  p50: 2.0
  p80: 10.0
  p95: 40.0
scale_weights: {reach: 0.30, velocity: 0.30, negativity: 0.20, amplifier: 0.20}
scale_bins: {kecil: 30, sedang: 60, besar: 80}   # batas atas; di atas 80 = krisis
amplifier_by_author_type: {media: 1.0, pejabat: 1.0, influencer: 0.7, warga: 0.0, akun_resmi: 0.0}
watchlist_hours: 48
```

### 4.5 `config/reply_policy.yaml`

```yaml
jitter_hours: [1, 3]              # balasan dijadwalkan komentar + acak(1,3 jam)
daily_cap: {ig: 40, fb: 40}
one_reply_per_thread: true
quiet_hours: ["22:00", "06:00"]   # tidak mengirim di jam ini (WIB), geser ke pagi
platform_capability:
  ig: {auto_reply: true,  via: graph_api}
  fb: {auto_reply: true,  via: graph_api}
  x:  {auto_reply: false, via: manual}     # skenario Rp 0: draf saja
  yt: {auto_reply: false, via: manual}
modes:
  positif: auto_template
  netral_in_kb: auto_kb
  negatif_biasa: draft_approval
  kritis_atau_sensitif: escalate
url_allowlist: ["brantasabipraya.co.id"]   # verifikasi domain resmi
banned_phrases: ["kami bersalah", "kami akan ganti rugi", "itu salah", "bukan tanggung jawab kami"]
```

---

## 5. Skema Database (migrasi 0001)

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  platform TEXT NOT NULL,                 -- ig | fb | x | news | yt
  kind TEXT NOT NULL DEFAULT 'post',      -- post | comment
  ext_id TEXT NOT NULL,
  parent_ext_id TEXT,
  url TEXT,
  author_hash TEXT,                       -- HMAC, bukan handle mentah
  author_followers INT,
  author_type TEXT,                       -- warga | media | influencer | pejabat | akun_resmi
  is_own_account BOOLEAN DEFAULT FALSE,
  text TEXT,
  lang TEXT,
  created_at TIMESTAMPTZ,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  watch_until TIMESTAMPTZ,                -- crawl ulang sampai waktu ini
  is_spam BOOLEAN DEFAULT FALSE,
  raw JSONB,
  embedding vector(384),
  UNIQUE (platform, ext_id)
);
CREATE INDEX ON posts (created_at DESC);
CREATE INDEX ON posts (watch_until) WHERE watch_until IS NOT NULL;

CREATE TABLE metrics_snapshot (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL,
  likes INT, replies INT, shares INT, views INT,
  PRIMARY KEY (post_id, captured_at)
);

CREATE TABLE analysis (
  post_id BIGINT REFERENCES posts(id) ON DELETE CASCADE,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  topic TEXT,
  sentiment TEXT,                         -- positif | negatif | netral
  sentiment_score REAL,                   -- -1..+1
  is_critical BOOLEAN, critical_reason TEXT,
  scale TEXT, scale_score SMALLINT,       -- kecil | sedang | besar | krisis ; 0-100
  is_sensitive BOOLEAN, sensitive_tags TEXT[],
  spread_velocity REAL, spread_label TEXT, -- lambat | sedang | cepat | viral
  PRIMARY KEY (post_id, analyzed_at)
);
CREATE VIEW v_latest_analysis AS
  SELECT DISTINCT ON (post_id) * FROM analysis ORDER BY post_id, analyzed_at DESC;

CREATE TABLE reply_queue (
  id BIGSERIAL PRIMARY KEY,
  post_id BIGINT REFERENCES posts(id),
  mode TEXT NOT NULL,                     -- auto | draft_approval | manual_post | escalate
  draft TEXT,
  kb_refs BIGINT[],
  scheduled_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | sent | cancelled | escalated | needs_manual
  approved_by TEXT, approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ, error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX ON reply_queue (status, scheduled_at);

CREATE TABLE issues (                     -- klaster isu (akar masalah)
  id BIGSERIAL PRIMARY KEY,
  title TEXT, summary TEXT, topic TEXT,
  first_seen TIMESTAMPTZ, last_seen TIMESTAMPTZ,
  post_count INT, neg_ratio REAL,
  status TEXT DEFAULT 'open',             -- open | in_progress | resolved
  owner_unit TEXT, ticket_ref TEXT
);
CREATE TABLE issue_posts (issue_id BIGINT REFERENCES issues(id), post_id BIGINT REFERENCES posts(id), PRIMARY KEY (issue_id, post_id));

CREATE TABLE kb_docs (                    -- knowledge base resmi untuk balasan
  id BIGSERIAL PRIMARY KEY,
  title TEXT, source_url TEXT, content TEXT,
  embedding vector(384),
  is_active BOOLEAN DEFAULT TRUE,
  approved_by TEXT, approved_at TIMESTAMPTZ
);

CREATE TABLE content_suggestions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  kind TEXT,                              -- peluang | klarifikasi | evergreen
  topic TEXT, format TEXT, suggested_time TIMESTAMPTZ,
  caption_draft TEXT, rationale TEXT, kb_refs BIGINT[],
  status TEXT DEFAULT 'proposed'          -- proposed | approved | posted | rejected
);

CREATE TABLE trends (
  id BIGSERIAL PRIMARY KEY,
  computed_at TIMESTAMPTZ, term TEXT,
  velocity_z REAL, relevance REAL, avg_sentiment REAL,
  classification TEXT                     -- peluang | risiko | netral
);

CREATE TABLE collector_runs (
  id BIGSERIAL PRIMARY KEY,
  collector TEXT, started_at TIMESTAMPTZ, finished_at TIMESTAMPTZ,
  status TEXT,                            -- ok | error | skipped
  rows_fetched INT, rows_new INT, error TEXT
);

CREATE TABLE system_flags (
  key TEXT PRIMARY KEY, value TEXT, updated_at TIMESTAMPTZ DEFAULT now(), updated_by TEXT
);
INSERT INTO system_flags (key, value) VALUES
  ('kill_switch', 'off'), ('auto_reply_enabled', 'off'), ('x_collector_enabled', 'off');

CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ DEFAULT now(),
  actor TEXT, action TEXT, target TEXT, payload JSONB
);
```

**Role DB (least privilege):**
- `si_collector`: INSERT/UPDATE `posts`, `metrics_snapshot`, `collector_runs`.
- `si_analyst`: SELECT `posts`, INSERT `analysis`, `issues`, `trends`.
- `si_publisher`: SELECT/UPDATE `reply_queue` saja, plus INSERT `audit_log`.
- `si_dashboard` (koneksi baca Next.js): SELECT pada view Bagian 12.3 dan tabel non-sensitif (`issues`, `issue_posts`, `trends`, `content_suggestions`, `kb_docs`, `system_flags`, `collector_runs`, `audit_log`). **Tanpa akses** ke `posts`, `metrics_snapshot`, dan `analysis` mentah, sehingga `author_hash`, `raw`, dan `embedding` tidak terjangkau dari web.
- `si_web_write` (koneksi tulis Next.js, hanya dipakai Server Action): UPDATE per kolom (column-level grant) pada `reply_queue(draft, status, approved_by, approved_at)`, `system_flags(value, updated_at, updated_by)`, `issues(status, owner_unit, ticket_ref)`, `content_suggestions(status)`; INSERT/UPDATE `kb_docs` kecuali kolom `embedding`; INSERT `audit_log`; semua hak pada schema `auth`. Tanpa hak DELETE dan tanpa hak apa pun pada `posts`.
- Agent pembaca (reader) hanya memakai koneksi read-only.

### 5.1 Migrasi 0002 (web console)

1. `CREATE SCHEMA auth;` beserta tabel Better Auth (user, session, account, verification, ditambah tabel plugin 2FA/OIDC bila dipakai). DDL dihasilkan dari CLI Better Auth pada versi yang dipin, lalu disalin ke migrasi Alembic. **Jangan menjalankan migrasi bawaan Better Auth langsung ke DB.** Kolom tambahan pada `user`: `role` (`viewer`, `humas`, atau `admin`; default `viewer`) dan `is_active`.
2. View untuk web (Bagian 12.3).
3. Pembuatan role `si_web_write`, penyempitan hak `si_dashboard`, dan seluruh GRANT di atas.

`audit_log.actor` berisi email pengguna web, `telegram:<user_id>`, atau `system`.

---

## 6. Collectors

### 6.1 Kontrak

```python
# collectors/base.py
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class RawItem:
    platform: str                    # ig | fb | x | news | yt
    ext_id: str
    kind: str                        # post | comment
    url: str | None
    author_id: str                   # mentah; langsung di-hash di normalize, tidak disimpan
    author_followers: int | None
    author_type: str | None
    text: str
    created_at: datetime
    parent_ext_id: str | None = None
    is_own_account: bool = False
    metrics: dict = field(default_factory=dict)   # likes, replies, shares, views
    raw: dict = field(default_factory=dict)

class Collector(ABC):
    name: str
    platform: str
    enabled_flag: str | None = None  # mis. "x_collector_enabled"

    @abstractmethod
    def fetch(self, since: datetime) -> list[RawItem]: ...
```

### 6.2 Runner

- Untuk tiap collector: cek `kill_switch` dan `enabled_flag`, jalankan `fetch`, catat ke `collector_runs` (`ok`/`error`/`skipped`, jumlah baris, pesan error).
- Satu collector gagal tidak boleh menghentikan yang lain (try/except per collector, timeout per collector).
- Timeout total siklus: 15 menit.
- Alert Telegram jika sebuah collector `rows_fetched = 0` dua siklus berturut-turut atau `error` tiga kali berturut-turut.
- Upsert idempoten: `INSERT ... ON CONFLICT (platform, ext_id) DO UPDATE` untuk `posts`, dan snapshot metrik selalu ditambahkan baris baru.

### 6.3 Detail per collector

| Collector | Sumber | Catatan implementasi |
|---|---|---|
| `graph_ig` | Instagram Graph API (akun bisnis resmi) | Ambil media terbaru dan komentarnya (`/{ig-media-id}/comments`), mention/tag. Webhook `comments` untuk real-time (opsional). Butuh akun bisnis dan app review. |
| `graph_fb` | Facebook Graph API (Page resmi) | Ambil post Page dan komentarnya. Webhook feed untuk komentar baru. Izin yang dibutuhkan dicek di dokumentasi Meta saat ini. |
| `instaloader_ig` | Instaloader | Hanya akun yang ada di `sources.yaml`. Tanpa login jika memungkinkan. Jeda antar request, batas request per jam. Jika error 401/429 berulang, nonaktifkan otomatis selama N jam dan alert. |
| `apify_fb` | Apify actor Facebook Page/Group publik | Free tier terbatas: batasi jumlah Page, simpan sisa kredit di log. Berhenti jika kredit habis. |
| `rss_news` | Google News RSS per kata kunci + RSS portal berita | `feedparser`. Ambil judul, ringkasan, URL. Untuk isi lengkap gunakan Trafilatura dengan patuh robots.txt. |
| `youtube` | YouTube Data API v3 | `search.list` memakan kuota besar, jadi gunakan hemat (cache hasil, frekuensi rendah). `commentThreads.list` untuk video terkait. |
| `x_scraper` | Scweet atau twscrape (akun khusus monitoring) | **OPSIONAL.** Hanya jalan jika `x_collector_enabled=on`. Satu akun khusus, volume rendah, tanpa evasi. Implementasi mengikuti dokumentasi tool. Jika diblokir, matikan flag. |

Semua collector menulis `author_type`: `akun_resmi` bila `is_own_account`, `media` untuk portal berita, selebihnya dikategorikan dari metadata (jumlah pengikut, label verifikasi) atau default `warga`. Daftar `pejabat`/`influencer` dikelola manual di `sources.yaml`.

Webhook Meta (opsional, bukan MVP): endpoint-nya harus memverifikasi `X-Hub-Signature-256` dan hanya menaruh payload ke antrean untuk diproses worker Python (tabel antrean ditambahkan lewat migrasi Alembic saat fitur dikerjakan). Karena Meta perlu menjangkau endpoint dari internet, pisahkan dari web console (layanan kecil sendiri) agar console tetap hanya di intranet. Keputusan jaringan ada di Bagian 18.

---

## 7. Pipeline Normalisasi

```python
# pipeline/normalize.py
import hmac, hashlib, os, re

def author_hash(platform: str, author_id: str) -> str:
    key = os.environ["AUTHOR_HASH_KEY"].encode()
    return hmac.new(key, f"{platform}:{author_id}".encode(), hashlib.sha256).hexdigest()

def clean_text(t: str) -> str:
    t = re.sub(r"https?://\S+", " <url> ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t
```

Langkah, berurutan:

1. **Relevansi:** cocokkan `keywords.yaml`; buang yang kena `exclude_context` kecuali ada kata kunci kuat lain.
2. **Normalisasi:** huruf kecil untuk fitur analisis, ekspansi singkatan/bahasa gaul umum (kamus di `config/slang.yaml`), simpan teks asli.
3. **Deteksi bahasa** (fallback: anggap Indonesia).
4. **Dedup:** `UNIQUE(platform, ext_id)` plus near-duplicate via embedding (cosine > 0.95 dalam 24 jam, tandai sebagai duplikat, jangan hapus).
5. **Spam/bot:** aturan sederhana (tautan berlebihan, teks identik dari banyak akun, akun baru dengan pola promosi). Tandai `is_spam`, jangan dibuang agar bisa diaudit.
6. **Set `watch_until`** = `created_at` + 48 jam untuk post yang dipantau metriknya.
7. **Embedding** disimpan di `posts.embedding`.

---

## 8. Analisis

### 8.1 Sentimen

```python
# nlp/sentiment.py
from transformers import pipeline

_clf = None
def _get():
    global _clf
    if _clf is None:
        _clf = pipeline("text-classification", model=SETTINGS.sentiment_model,
                        top_k=None, device=-1)
    return _clf

def sentiment(text: str) -> tuple[str, float]:
    out = _get()(text, truncation=True, max_length=256)
    if out and isinstance(out[0], list):
        out = out[0]
    scores = {LABEL_MAP[d["label"].lower()]: d["score"] for d in out}   # LABEL_MAP di config
    pos, neg = scores.get("positif", 0.0), scores.get("negatif", 0.0)
    label = max(scores, key=scores.get)
    return label, round(pos - neg, 4)
```

- Petakan label model ke `positif|negatif|netral` lewat `LABEL_MAP` di config (label tiap model berbeda).
- **Golden set:** 300–500 komentar berlabel manual (campur sarkasme, bahasa gaul, topik proyek). Laporkan akurasi dan F1 per kelas. Jangan produksi sebelum hasilnya disepakati.

### 8.2 Topik

Taksonomi awal: `kualitas_proyek`, `k3_keselamatan`, `tender_integritas`, `dampak_warga_lahan`, `lingkungan`, `karier_rekrutmen`, `csr`, `kinerja_korporasi`, `layanan_komunikasi`, `lainnya`.
Implementasi: klasifikasi LLM lokal dengan output JSON ber-schema (enum tertutup), dengan fallback leksikon bila LLM gagal/timeout.

### 8.3 Kecepatan penyebaran

```python
# scoring/spread.py
import math

def weighted_engagement(m: dict, w: dict) -> float:
    base = sum(w[k] * (m.get(k) or 0) for k in ("likes", "replies", "shares"))
    return base + (m.get("views") or 0) / w["views_divisor"]

def velocity(curr: dict, prev: dict | None, created_at, curr_at, prev_at, w: dict,
             followers: int | None = None) -> float:
    e_now = weighted_engagement(curr, w)
    if prev is None:                       # snapshot pertama: pakai umur post
        hours = max((curr_at - created_at).total_seconds() / 3600, 1 / 6)
        v = e_now / hours
    else:
        hours = max((curr_at - prev_at).total_seconds() / 3600, 1 / 60)
        v = (e_now - weighted_engagement(prev, w)) / hours
    reach = 1 + math.log10(1 + (followers or 0))
    return max(v, 0.0) * reach

def spread_label(v: float, base: dict) -> str:
    if v >= base["p95"]: return "viral"
    if v >= base["p80"]: return "cepat"
    if v >= base["p50"]: return "sedang"
    return "lambat"
```

Baseline persentil per platform (hitung ulang harian; pakai `fallback_velocity_thresholds` bila sampel < `min_baseline_samples`):

```sql
SELECT p.platform,
  percentile_cont(0.5)  WITHIN GROUP (ORDER BY a.spread_velocity) AS p50,
  percentile_cont(0.8)  WITHIN GROUP (ORDER BY a.spread_velocity) AS p80,
  percentile_cont(0.95) WITHIN GROUP (ORDER BY a.spread_velocity) AS p95,
  count(*) AS n
FROM analysis a JOIN posts p ON p.id = a.post_id
WHERE a.analyzed_at > now() - interval '14 days' AND a.spread_velocity IS NOT NULL
GROUP BY p.platform;
```

**Topic velocity:** per jam, hitung jumlah akun unik (`author_hash`) per `topic`, bandingkan dengan rata-rata dan simpangan baku 14 hari (z-score). z ≥ 3 menandai lonjakan topik dan memicu alert walau belum ada satu post pun yang viral.

### 8.4 Skala, kritis, sensitif

```python
# scoring/scale.py
def scale_score(reach_pct, velocity_pct, neg_intensity, amplifier, w) -> int:
    # semua input 0..1 (reach_pct dan velocity_pct = persentil dalam baseline)
    s = (w["reach"] * reach_pct + w["velocity"] * velocity_pct
         + w["negativity"] * neg_intensity + w["amplifier"] * amplifier)
    return round(100 * s)

def scale_label(score: int, bins: dict) -> str:
    if score <= bins["kecil"]: return "kecil"
    if score <= bins["sedang"]: return "sedang"
    if score <= bins["besar"]: return "besar"
    return "krisis"

# scoring/critical.py
def is_critical(sentiment, sensitive, spread, author_type, scale):
    neg = sentiment == "negatif"
    reasons = []
    if sensitive and neg:                              reasons.append("sensitif+negatif")
    if neg and spread in {"cepat", "viral"}:           reasons.append("negatif+sebar_cepat")
    if neg and author_type in {"media", "pejabat"}:    reasons.append("negatif+media_pejabat")
    if scale in {"besar", "krisis"}:                   reasons.append("skala_besar")
    return bool(reasons), ";".join(reasons) or None
```

`neg_intensity = max(0, -sentiment_score)`. `amplifier` dari `amplifier_by_author_type`.

### 8.5 Klaster isu (akar masalah)

Tiap hari (dan saat ada lonjakan): klasterkan `posts.embedding` negatif 7 hari terakhir (HDBSCAN atau agglomerative cosine). Untuk tiap klaster, LLM lokal membuat judul dan ringkasan, lalu simpan di `issues`. Tiap isu bisa diberi `owner_unit` dan `ticket_ref` manual (atau lewat bot) untuk menutup lingkaran isu ke tindakan.

---

## 9. Engagement Agent

### 9.1 Pemisahan agent (pertahanan prompt injection)

| Agent | Input | Output | Akses |
|---|---|---|---|
| Reader | Teks komentar (tidak tepercaya) | Label terstruktur (enum): topik, niat (`pertanyaan`/`keluhan`/`pujian`/`spam`/`lainnya`), perlu_manusia | DB read-only, **tanpa tool tindakan** |
| Writer | Label dari Reader + potongan KB terpilih + komentar sebagai kutipan data | Objek JSON `{reply_text, kb_refs, needs_human}` | Tanpa tool; hanya mengembalikan teks |
| Guard | Output Writer | `pass` / `needs_human` + alasan | Aturan deterministik, bukan LLM |
| Publisher | Baris `reply_queue` berstatus `approved` | Panggilan API ke platform | Hanya baca `reply_queue` |

Aturan: teks komentar **tidak pernah** digabung ke instruksi sistem. Di prompt Writer, komentar ditaruh dalam blok data berpembatas dengan instruksi tetap bahwa isinya bukan perintah. Output divalidasi dengan schema (pydantic); gagal validasi berarti `needs_human`.

### 9.2 Aturan Guard (deterministik)

- Panjang di bawah batas platform dan di bawah batas kebijakan.
- URL hanya dari `url_allowlist`.
- Semua angka, tanggal, dan nama proyek di balasan harus muncul di potongan KB yang dikutip.
- Tidak mengandung `banned_phrases` dan tidak menyebut data pribadi.
- `kb_refs` tidak kosong untuk balasan faktual. Balasan template (ucapan terima kasih) memakai template berversi.
- Intent `keluhan` + sensitif/kritis berarti tidak boleh diproses bot sama sekali.
- Guard dijalankan dua kali: (1) saat staf menyetujui atau mengedit draf lewat web/Telegram, melalui `POST /internal/guard/check` di API internal supaya aturannya hanya ada di satu tempat (Python), dan (2) oleh worker sebelum kirim sebagai gerbang terakhir. Web console tidak mengimplementasikan ulang aturan Guard.

### 9.3 Pembuatan antrean

```python
# replies/queue.py
import random
from datetime import timedelta

def schedule_reply(comment, analysis, policy, now):
    if analysis.is_critical or analysis.is_sensitive:
        return enqueue(comment, mode="escalate", status="escalated", scheduled_at=now)
    cap = policy["platform_capability"][comment.platform]
    lo, hi = policy["jitter_hours"]
    base = max(comment.created_at, now - timedelta(hours=lo))   # komentar lama: jangan balas serentak
    when = base + timedelta(hours=random.uniform(lo, hi))
    when = shift_out_of_quiet_hours(when, policy["quiet_hours"])
    mode = decide_mode(comment, analysis, policy)               # auto | draft_approval
    if not cap["auto_reply"]:
        return enqueue(comment, mode="manual_post", status="needs_manual", scheduled_at=when)
    status = "approved" if mode == "auto" else "pending"        # pending menunggu klik manusia
    return enqueue(comment, mode=mode, status=status, scheduled_at=when)
```

### 9.4 Worker (jalan tiap 10 menit)

```python
# replies/worker.py
def process_due(session):
    flags = get_flags(session)
    if flags["kill_switch"] == "on" or flags["auto_reply_enabled"] != "on":
        return
    rows = session.execute(text("""
        SELECT rq.id, rq.post_id, rq.draft, p.platform, p.ext_id,
               a.is_critical, a.is_sensitive
        FROM reply_queue rq
        JOIN posts p ON p.id = rq.post_id
        JOIN v_latest_analysis a ON a.post_id = p.id
        WHERE rq.status = 'approved' AND rq.scheduled_at <= now()
        ORDER BY rq.scheduled_at
        FOR UPDATE OF rq SKIP LOCKED
        LIMIT 20""")).all()
    for r in rows:
        if r.is_critical or r.is_sensitive:
            mark(r.id, "escalated", "status berubah jadi kritis/sensitif"); notify_humas(r); continue
        if comment_deleted(r) or already_replied(r) or daily_cap_reached(r.platform):
            mark(r.id, "cancelled", "pra-syarat tidak terpenuhi"); continue
        if not guard_ok(r.draft):
            mark(r.id, "escalated", "guard gagal"); continue
        try:
            publishers[r.platform].reply(r.ext_id, r.draft)      # hanya akun resmi
            mark(r.id, "sent"); audit("reply_sent", r.id)
        except Exception as e:
            mark(r.id, "pending", str(e))                        # coba lagi maksimal N kali
```

Jalankan di dalam satu transaksi (diperlukan oleh `FOR UPDATE SKIP LOCKED`). Semua perubahan status menulis `audit_log`.

### 9.5 Publisher

- **IG:** balas komentar lewat endpoint replies pada komentar (akun bisnis resmi).
- **FB:** balas komentar lewat endpoint comments pada komentar (Page resmi).
- **X dan YouTube (skenario Rp 0):** `needs_manual`. Bot Telegram mengirim draf ke staf, dan staf memposting manual lalu menekan tombol "Sudah diposting" untuk mengubah status menjadi `sent`.
- Nama endpoint dan izin yang tepat mengikuti dokumentasi Meta pada saat implementasi karena sering berubah. Tulis adapter tipis sehingga mudah diganti.

---

## 10. Telegram Bot

Bot berjalan sebagai proses long polling terpisah (`python -m brantas_si.alerts.bot`), sehingga tidak butuh endpoint publik.

- Hanya menerima perintah dari `TELEGRAM_ALLOWED_USER_IDS` (allowlist), abaikan yang lain.
- **Alert kritis:** ringkasan isu, alasan kritis (`critical_reason`), skala, label sebar, tautan ke post, dan tombol `[Buka web console]` (deep link ke `WEB_BASE_URL/issues/<id>`).
- **Persetujuan draf cepat:** pesan berisi komentar (dikutip), draf balasan, referensi KB, dan tombol `[Setujui] [Edit] [Tolak] [Eskalasi]`. `[Edit]` membuka `/replies/<id>` di web console, karena mengedit di chat tidak nyaman dan tidak mendapat pratinjau Guard. Aksi lain menulis `reply_queue.approved_by` dan `audit_log` (`actor = telegram:<user_id>`). Guard dijalankan sebelum status menjadi `approved`.
- **Perintah operasional:** `/status` (kesehatan collector), `/pause` (set `kill_switch=on`), `/resume` (hanya ID di `TELEGRAM_ADMIN_USER_IDS`, selaras aturan flag di Bagian 12.4), `/digest`.
- Rate limit dan deduplikasi alert agar tidak spam (satu alert per isu per jam, kecuali eskalasi level).

---

## 11. Trend Radar dan Content Recommender

### 11.1 Trend Radar (harian dan per jam)

1. Ekstrak istilah (hashtag, noun phrase, entitas) dari `posts` jam terakhir.
2. Hitung `velocity_z` per istilah terhadap baseline 14 hari.
3. `relevance` = kemiripan embedding istilah terhadap kumpulan kata kunci lingkup Brantas (infrastruktur air, bendungan, irigasi, banjir, BUMN karya, proyek nasional, K3).
4. Klasifikasi: `peluang` (relevan, sentimen netral/positif, tidak sensitif), `risiko` (relevan, negatif atau sensitif), selain itu `netral`.
5. Simpan di `trends`. Output harian: 3 peluang dan 3 risiko beserta saran tindakan (LLM lokal, review manusia).

### 11.2 Content Recommender

- **Input:** performa postingan akun resmi (engagement rate, rasio komentar positif dan negatif per topik, format, jam posting), Trend Radar, dan isu terbuka.
- **Skor kandidat:** `engagement_rate × (1 + uplift_sentimen)` dengan batasan (tidak merekomendasikan topik sensitif tanpa persetujuan manusia).
- **Jenis keluaran** di `content_suggestions`: `peluang`, `klarifikasi` (berbasis fakta KB, nada tidak defensif), `evergreen`.
- Caption dibuat LLM lokal dengan rujukan KB, dan **selalu** melewati persetujuan manusia sebelum diposting.
- Dengan skenario Rp 0, posting dilakukan manual atau lewat Graph API pada akun resmi bila disetujui.
- Saran dan hasil radar tampil di `/content` dan `/trends` pada web console. Approve/reject dari web mengubah `content_suggestions.status` (peran `humas` ke atas) dan tercatat di `audit_log`.

---

## 12. Web Console (Next.js)

Menggantikan Metabase. Web console adalah satu-satunya antarmuka manusia untuk dashboard, persetujuan balasan, pengelolaan isu/KB/saran konten, dan admin.

### 12.1 Prinsip arsitektur

- Server Components secara default. `"use client"` hanya untuk interaksi (filter, chart, form). Data diambil di server. Browser tidak punya koneksi DB, token, atau URL internal.
- Halaman data dirender dinamis atau memakai cache pendek (maksimal 60 detik). Antrean balasan, `system_flags`, dan audit log tidak boleh di-cache. Cache Components dan `use cache` tidak dipakai di MVP (data berubah per jam, dan permukaan serangan lebih kecil; lihat Bagian 14).
- Pagar auth ada di **data-access layer dan setiap Server Action**, bukan hanya di `proxy.ts`. Autentikasi yang hanya bertumpu pada middleware/proxy pernah terbukti bisa dilewati. Setiap fungsi di `server/queries` dan `server/actions` memanggil `requireRole(...)` sebagai langkah pertama.
- Dua pool DB: baca lewat `si_dashboard`, mutasi lewat `si_web_write`. Tidak boleh tertukar. Query bertipe dengan Drizzle, dan skema tidak pernah didefinisikan dari sisi TypeScript.
- Waktu disimpan UTC. Tampilan memakai zona `Asia/Jakarta` dan format `id-ID` (`Intl`).
- Tampilan bersih dan minimal, light/dark mengikuti sistem, bahasa Indonesia. Sentimen dan status kritis selalu punya label teks, tidak hanya warna.

### 12.2 Halaman dan peran

| Route | Isi | Baca | Aksi |
|---|---|---|---|
| `/` | KPI 24 jam, alert terbaru | viewer ke atas | — |
| `/posts` | Tabel hasil crawling; filter platform, topik, sentimen, kritis, skala, sensitif, label sebar, waktu | viewer ke atas (teks warga disamarkan untuk viewer) | — |
| `/topics` | Heatmap topik × sentimen dan net score | viewer ke atas | — |
| `/velocity` | Timeline velocity, daftar post cepat/viral | viewer ke atas | — |
| `/issues` | Matriks kritis × skala × sensitif, tabel isu (klaster), detail isu | viewer ke atas | humas ke atas: ubah `status`, `owner_unit`, `ticket_ref` |
| `/replies`, `/replies/[id]` | Antrean balasan dan detail | humas ke atas | humas ke atas: setujui, edit draf, tolak, eskalasi, "Sudah diposting" |
| `/content`, `/trends` | Saran konten dan Trend Radar | viewer ke atas | humas ke atas: approve/reject saran |
| `/sources` | Kesehatan collector | viewer ke atas | — |
| `/admin/flags` | `system_flags` dan kill switch | humas ke atas | Aturan di 12.4 |
| `/admin/kb` | Knowledge base | humas ke atas | humas ke atas: tambah, edit, setujui dokumen |
| `/admin/users`, `/admin/audit` | Pengguna dan audit log | admin | admin: ubah peran, aktif/nonaktif |

Peran: `viewer` (baca data agregat dan tabel), `humas` (viewer + teks komentar penuh + tindakan operasional), `admin` (humas + kelola pengguna + menyalakan fitur otomatis). Teks komentar dari `author_type = warga` disamarkan untuk `viewer`, mengikuti aturan privasi Bagian 14.

Panel wajib (tidak berubah): KPI, matriks isu, heatmap topik × sentimen, timeline velocity dan daftar post cepat/viral, tabel isu (filter platform/topik/label/waktu), antrean balasan, kesehatan sumber. Dashboard tidak boleh menampilkan `author_hash` (dan memang tidak terjangkau, lihat 12.3).

### 12.3 View untuk web (dibuat di migrasi 0002)

Web hanya membaca lewat view berikut. View tidak memuat `author_hash`, `raw`, maupun `embedding`.

```sql
-- KPI 24 jam
CREATE VIEW v_kpi_24h AS
SELECT count(*) AS volume,
  count(*) FILTER (WHERE a.sentiment='positif') AS positif,
  count(*) FILTER (WHERE a.sentiment='negatif') AS negatif,
  count(*) FILTER (WHERE a.sentiment='netral')  AS netral,
  round(100.0 * (count(*) FILTER (WHERE a.sentiment='positif')
               - count(*) FILTER (WHERE a.sentiment='negatif')) / NULLIF(count(*),0), 1) AS net_sentiment_score,
  count(*) FILTER (WHERE a.is_critical) AS isu_kritis
FROM posts p JOIN v_latest_analysis a ON a.post_id = p.id
WHERE p.created_at > now() - interval '24 hours' AND NOT p.is_spam;

-- Matriks isu: kritis x skala x sensitif
CREATE VIEW v_issue_matrix_7d AS
SELECT a.is_critical, a.scale, a.is_sensitive, count(*) AS n
FROM posts p JOIN v_latest_analysis a ON a.post_id = p.id
WHERE p.created_at > now() - interval '7 days' AND NOT p.is_spam
GROUP BY 1,2,3;

-- Topik x sentimen (net = positif - negatif)
CREATE VIEW v_topic_sentiment_7d AS
SELECT a.topic,
  count(*) FILTER (WHERE a.sentiment='positif') AS positif,
  count(*) FILTER (WHERE a.sentiment='negatif') AS negatif,
  count(*) FILTER (WHERE a.sentiment='netral')  AS netral,
  count(*) FILTER (WHERE a.sentiment='positif') - count(*) FILTER (WHERE a.sentiment='negatif') AS net
FROM posts p JOIN v_latest_analysis a ON a.post_id = p.id
WHERE p.created_at > now() - interval '7 days' AND NOT p.is_spam
GROUP BY 1;

-- Kesehatan sumber
CREATE VIEW v_collector_health AS
SELECT collector, max(finished_at) FILTER (WHERE status='ok') AS last_ok,
       sum(rows_new) FILTER (WHERE started_at > now() - interval '24 hours') AS new_24h,
       count(*) FILTER (WHERE status='error' AND started_at > now() - interval '24 hours') AS errors_24h
FROM collector_runs GROUP BY collector;

-- Timeline velocity per jam
CREATE VIEW v_velocity_hourly AS
SELECT date_trunc('hour', a.analyzed_at) AS hour, p.platform, a.spread_label,
       count(*) AS n, max(a.spread_velocity) AS max_velocity
FROM analysis a JOIN posts p ON p.id = a.post_id
WHERE a.analyzed_at > now() - interval '7 days' AND NOT p.is_spam AND a.spread_velocity IS NOT NULL
GROUP BY 1,2,3;

-- Tabel hasil crawling (tanpa author_hash, raw, embedding)
CREATE VIEW v_posts_feed AS
SELECT p.id, p.platform, p.kind, p.url, p.author_type, p.author_followers,
       p.is_own_account, p.text, p.lang, p.created_at, p.is_spam,
       a.topic, a.sentiment, a.sentiment_score, a.is_critical, a.critical_reason,
       a.scale, a.scale_score, a.is_sensitive, a.sensitive_tags,
       a.spread_velocity, a.spread_label,
       m.likes, m.replies, m.shares, m.views
FROM posts p
LEFT JOIN v_latest_analysis a ON a.post_id = p.id
LEFT JOIN LATERAL (
  SELECT likes, replies, shares, views FROM metrics_snapshot
  WHERE post_id = p.id ORDER BY captured_at DESC LIMIT 1
) m ON TRUE;

-- Antrean balasan beserta konteks komentar
CREATE VIEW v_reply_queue AS
SELECT rq.id, rq.post_id, rq.mode, rq.draft, rq.kb_refs, rq.scheduled_at, rq.status,
       rq.approved_by, rq.approved_at, rq.sent_at, rq.error, rq.created_at,
       p.platform, p.url, p.author_type, p.text AS comment_text,
       a.topic, a.sentiment, a.is_critical, a.is_sensitive
FROM reply_queue rq
JOIN posts p ON p.id = rq.post_id
LEFT JOIN v_latest_analysis a ON a.post_id = p.id;
```

Penyamaran teks untuk `viewer` dilakukan di server (`server/mask.ts`) dan diuji (Bagian 15). `author_hash` tidak ada di view mana pun, jadi tidak ada jalur dari web ke kolom itu.

### 12.4 Mutasi (Server Action)

| Action | Peran | Efek | Syarat |
|---|---|---|---|
| `approveReply(id)` | humas ke atas | `pending` menjadi `approved`, isi `approved_by` dan `approved_at` | Guard check lolos; UPDATE bersyarat `status='pending'` |
| `editDraft(id, text)` | humas ke atas | ubah `draft`, status tetap `pending` | Guard check untuk umpan balik; draf lama disimpan di `audit_log.payload` |
| `rejectReply(id)`, `escalateReply(id)` | humas ke atas | `pending` menjadi `cancelled` atau `escalated` | UPDATE bersyarat |
| `markPosted(id)` | humas ke atas | `needs_manual` menjadi `sent` | hanya `mode='manual_post'` |
| `updateIssue(...)`, `setSuggestionStatus(...)` | humas ke atas | ubah kolom terbatas | kolom sesuai column-level grant |
| `upsertKbDoc(...)`, `approveKbDoc(id)` | humas ke atas | edit konten menetapkan `is_active=false`, `approved_by=NULL`, `embedding=NULL`; setujui menetapkan `is_active=true` dan `approved_by` | job Python `embed_kb_docs` mengisi embedding; dokumen tanpa embedding tidak dipakai Writer |
| `setFlag(key, value)` | lihat aturan di bawah | ubah `system_flags` | aturan flag |
| `setUserRole(...)`, `setUserActive(...)` | admin | kelola pengguna | tidak boleh menonaktifkan atau menurunkan admin terakhir |

Aturan flag:

- **Menurunkan risiko** (boleh `humas` ke atas): `kill_switch` menjadi `on`, `auto_reply_enabled` menjadi `off`, `x_collector_enabled` menjadi `off`.
- **Menaikkan risiko** (hanya `admin`, dengan konfirmasi mengetik nama flag): `kill_switch` menjadi `off`, `auto_reply_enabled` menjadi `on`, `x_collector_enabled` menjadi `on`. Menyalakan `auto_reply_enabled` ditolak bila `kill_switch=on`.
- Setiap perubahan mengisi `system_flags.updated_by` dan menulis `audit_log`.

Aturan untuk semua mutasi:

1. `requireRole` paling awal; sesi harus valid dan pengguna `is_active`.
2. Input divalidasi Zod. Semua query berparameter, tanpa penyambungan string SQL.
3. UPDATE bersyarat (`WHERE id = $1 AND status = $2`) dan cek jumlah baris terdampak. Jika 0 baris (status sudah diubah worker atau Telegram), tampilkan pesan "status sudah berubah" dan jangan menimpa.
4. Baris `audit_log` ditulis dalam transaksi yang sama (`actor`, `action`, `target`, `payload` berisi nilai sebelum dan sesudah).
5. Mutasi hanya lewat Server Action, tidak ada Route Handler mutasi. Atur `allowedOrigins` Server Action sesuai dokumentasi versi yang dipin bila berada di belakang reverse proxy.
6. Rate limit per pengguna pada tindakan mutasi.

### 12.5 Keamanan khusus web

- Teks komentar adalah input tidak tepercaya (Aturan 5). Render sebagai teks biasa. Dilarang `dangerouslySetInnerHTML` dan renderer markdown/HTML untuk teks komentar. Tautan di dalam teks komentar tidak dijadikan hyperlink aktif.
- Header: CSP ketat (tanpa `unsafe-eval`, skrip memakai nonce), `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`. HSTS di reverse proxy. `poweredByHeader: false`.
- Cookie sesi `HttpOnly`, `Secure`, `SameSite=Lax`, masa berlaku pendek, dan bisa dicabut dari `/admin/users`. Rate limit dan lockout pada login. 2FA wajib untuk `humas` dan `admin` bila memakai login lokal.
- Image Optimization dimatikan (`images.unoptimized: true`). Console tidak butuh gambar remote, dan fitur ini pernah terkena advisory RCE (Bagian 14).
- Server tidak melakukan `fetch` ke URL yang berasal dari data crawling.
- Error ke browser bersifat generik. Detail masuk log tanpa teks komentar utuh.

---

## 13. Orkestrasi dan Deploy

### 13.1 Jadwal (WIB)

```
CRON_TZ=Asia/Jakarta
5 * * * *     python -m brantas_si.flows.hourly       # crawl → analisis → scoring → alert
*/10 * * * *  python -m brantas_si.replies.worker     # proses antrean balasan
30 6 * * *    python -m brantas_si.flows.daily        # baseline, klaster isu, trend, digest
0 3 * * 0     python -m brantas_si.flows.retention    # hapus teks mentah > retensi
```

`hourly()` urutan: `run_collectors` → `normalize_and_store` → `snapshot_watchlist` → `analyze_new` → `score_and_alert` → `embed_kb_docs` → `schedule_replies`. Semua langkah idempoten dan bisa dijalankan ulang. Semua jadwal tetap di cron/systemd Python, bukan di Next.js.

Database menyimpan waktu dalam UTC (`timestamptz`); konversi ke WIB hanya di tampilan.

### 13.2 `docker-compose.yml` (kerangka)

```yaml
services:
  db:
    image: pgvector/pgvector:pg16        # pin tag spesifik saat deploy
    environment: [POSTGRES_DB=brantas_si, POSTGRES_USER=postgres, POSTGRES_PASSWORD=${PG_ADMIN_PASSWORD}]
    volumes: [pgdata:/var/lib/postgresql/data]
  ollama:
    image: ollama/ollama                 # pin versi
    volumes: [ollama:/root/.ollama]
    ports: ["127.0.0.1:11434:11434"]
  app:                                   # cron Python (Bagian 13.1)
    build: .
    env_file: .env
    depends_on: [db, ollama]
  api:                                   # FastAPI internal, tanpa port ke host
    build: .
    command: uvicorn brantas_si.api.main:app --host 0.0.0.0 --port 8000
    env_file: .env
    depends_on: [db]
  bot:                                   # Telegram long polling
    build: .
    command: python -m brantas_si.alerts.bot
    env_file: .env
    depends_on: [db]
  web:                                   # Next.js standalone
    build: ./web
    env_file: web/.env                   # BUKAN .env Python
    ports: ["127.0.0.1:3000:3000"]
    depends_on: [db, api]
    user: "1001:1001"                    # non-root
    read_only: true
    cap_drop: [ALL]
    tmpfs: [/tmp]                        # tambahkan path cache Next.js bila hasil uji menuntut
volumes: {pgdata: {}, ollama: {}}
```

Bind port ke `127.0.0.1` dan taruh di belakang reverse proxy internal (TLS, rate limit, batas ukuran body). Web console tidak dipublikasikan ke internet, hanya intranet/VPN (keputusan final di Bagian 18). `api` tidak punya port ke host dan hanya menerima request dengan `Authorization: Bearer ${INTERNAL_API_TOKEN}`. Metabase dihapus dari Compose; bila analis butuh eksplorasi ad-hoc, jalankan terpisah dengan role read-only. Backup `pg_dump` malam hari ke penyimpanan internal, termasuk schema `auth`.

---

## 14. Keamanan dan Privasi

- Secret hanya di environment/secret store, rotasi berkala, dan token Meta/YouTube dengan scope minimum. Container web hanya menerima secret yang ia butuhkan (Bagian 4.1b), sehingga kebocoran web tidak membuka token Meta, token Telegram, atau `AUTHOR_HASH_KEY`.
- VM terisolasi, firewall hanya port yang perlu, update OS rutin, log tidak memuat teks komentar utuh.
- Role DB least privilege (Bagian 5). Reader agent tanpa hak tulis. Web memakai dua role terpisah (baca, dan tulis terbatas).
- Validasi input di semua endpoint FastAPI internal dan semua Server Action (Zod). API internal hanya terjangkau dari jaringan Docker dan memakai token. Rate limit di reverse proxy.
- Retensi: teks mentah dan `raw` dihapus setelah 12 bulan (bisa diubah), sementara metrik teragregasi tetap.
- UU PDP: `author_hash` saja, tanpa menyimpan handle, hak akses berbasis peran (teks warga disamarkan untuk `viewer`), dan laporan teragregasi.
- Audit log untuk semua tindakan agent dan manusia. Perubahan `system_flags`, login/logout, dan perubahan peran tercatat dengan pelaku.
- Akun scraping (jika X diaktifkan) bukan akun resmi dan bukan akun pribadi. Kredensialnya terpisah dan bisa dicabut kapan saja.

**Supply chain dan patching Next.js.** Framework ini punya riwayat advisory kritis, termasuk RCE tanpa autentikasi pada React Server Components (Desember 2025) dan rilis keamanan 14 Oktober 2026 yang memperbaiki dua RCE kritis (salah satunya di image optimization) serta satu DoS pada Server Actions.

- Pin versi persis (Next.js, React, `sharp`, Better Auth), commit `pnpm-lock.yaml`, dan install dengan `pnpm install --frozen-lockfile`. Jangan jalankan lifecycle script dependency kecuali ada di allowlist.
- Per 26 Oktober 2026, advisory Next.js terbaru menyebut 16.4.1 sebagai versi patched. Pakai versi itu atau yang lebih baru, dan verifikasi di advisory resmi Next.js saat T-01 serta setiap rilis.
- CI menjalankan `pnpm audit` dan gagal pada temuan high/critical. Pantau advisory Next.js dan React. Patch keamanan dideploy dengan target maksimal 3 hari kerja (sesuaikan dengan kebijakan CSIRT).
- Web console hanya di intranet/VPN. Ini menurunkan risiko RCE tanpa autentikasi dari internet, tetapi bukan pengganti patching.
- Container web berjalan non-root dengan filesystem read-only dan `cap_drop: ALL`, tanpa akses ke Docker socket, dan egress jaringan dibatasi (hanya DB dan API internal).

## 15. Pengujian

| Jenis | Cakupan |
|---|---|
| Unit | `spread`, `scale`, `critical`, `sensitive`, normalisasi, hash penulis, jitter dan quiet hours |
| Golden set | Sentimen dan topik pada 300–500 komentar berlabel. Gate: metrik disepakati sebelum produksi. |
| Contract | Tiap collector diuji dengan respons terekam (fixture) agar perubahan format terdeteksi |
| Integrasi | Satu siklus `hourly` end-to-end dengan data sintetis ke DB uji |
| Reply worker | Isu berubah jadi kritis → balasan dibatalkan dan dieskalasi; kill switch on → tidak ada pengiriman; batas harian; satu balasan per thread |
| Keamanan | Kasus prompt injection di komentar ("abaikan instruksi sebelumnya...") tidak boleh mengubah output Reader/Writer maupun memicu tindakan; output tidak valid schema → `needs_human` |
| Idempotensi | Menjalankan `hourly` dua kali berturut-turut tidak menggandakan data |
| Beban | 20 ribu item per siklus selesai dalam batas waktu pada VM target |
| Web: unit (Vitest) | Matriks peran `requireRole`, penyamaran teks warga untuk `viewer`, transisi status `reply_queue`, aturan flag (menaikkan vs menurunkan risiko), format WIB dan `id-ID` |
| Web: e2e (Playwright) | Login, setujui draf, status menjadi `approved`. `viewer` tidak bisa menyetujui (ditolak di server, bukan hanya tombol disembunyikan). Race dengan worker menampilkan pesan, tidak menimpa status. Flag yang menaikkan risiko hanya bisa oleh admin. |
| Web: keamanan | Payload XSS di teks komentar tampil sebagai teks. Respons HTML dan RSC payload tidak memuat `author_hash` atau `raw`. Semua Server Action menolak tanpa sesi. Header CSP ada. Pemeriksaan CI memastikan tidak ada secret di `NEXT_PUBLIC_*`. |
| Kontrak skema dan hak DB | CI menjalankan `drizzle-kit pull` dan gagal bila tipe TS berbeda dari yang di-commit. Test memastikan `si_dashboard` tidak bisa `SELECT` dari `posts` dan `si_web_write` tidak bisa `UPDATE reply_queue.mode`. |

---

## 16. Rencana Kerja (task dan acceptance criteria)

Task bertanda *(baru)* ditambahkan pada revisi 1.1. ID task lama tidak diubah.

### Fase 0 — Setup (minggu 1)
- [ ] **T-01** Repo (Python `pyproject.toml` + `web/` Next.js TypeScript dengan pnpm), lint/format dan type-check keduanya, CI lokal, `.env.example` dan `web/.env.example`. *AC:* `pytest` dan `pnpm test` jalan (kosong), lint dan `tsc --noEmit` lulus, versi Next.js yang dipin sudah memuat patch advisory terbaru.
- [ ] **T-02** Docker Compose (db, ollama, api, web kerangka), migrasi 0001, role DB. *AC:* `alembic upgrade head` sukses, flag default semua `off`, container web berjalan non-root dan `/api/healthz` menjawab.
- [ ] **T-03** `settings.py`, loader YAML config, logging JSON, dan `web/src/server/env.ts` (Zod). *AC:* config atau env invalid menghentikan start dengan pesan jelas (Python dan web).
- [ ] **T-03a** *(baru)* Auth dan RBAC web: migrasi 0002 (schema `auth`, role `si_dashboard` dan `si_web_write`, GRANT), Better Auth, peran `viewer`/`humas`/`admin`, `requireRole`, layout `(console)`, helper audit, script `create_admin`. *AC:* semua halaman console menolak tanpa sesi. Test e2e: `viewer` tidak bisa menjalankan Server Action mutasi. `si_dashboard` tidak bisa `SELECT` dari `posts`.

### Fase 1 — Data foundation (minggu 2–3)
- [ ] **T-04** `Collector` base, runner, `collector_runs`, alert kegagalan. *AC:* satu collector gagal tidak menghentikan lainnya.
- [ ] **T-05** `rss_news` dan `youtube`. *AC:* data masuk `posts` tanpa duplikat setelah dua kali run.
- [ ] **T-06** `graph_ig` dan `graph_fb` (akun resmi, komentar). *AC:* komentar baru masuk dalam satu siklus.
- [ ] **T-07** `instaloader_ig` dan `apify_fb` dengan pembatas laju dan auto-disable. *AC:* error 429 beruntun menonaktifkan collector dan mengirim alert.
- [ ] **T-08** Pipeline normalisasi, dedup, spam, hash penulis, `watch_until`. *AC:* tidak ada handle mentah di DB (diverifikasi query).

### Fase 2 — Analisis dan web console (minggu 4–6)
- [ ] **T-09** Sentimen + golden set + laporan akurasi. *AC:* metrik terdokumentasi dan disetujui.
- [ ] **T-10** Topik, leksikon sensitif, deteksi sensitif ganda (leksikon + LLM). *AC:* seluruh kasus di golden set sensitif terdeteksi (bias aman).
- [ ] **T-11** Snapshot metrik, velocity, baseline persentil, label sebar. *AC:* unit test monotonik (engagement naik ⇒ velocity tidak turun).
- [ ] **T-12** Skala, kritis, `critical_reason`. *AC:* tabel keputusan di Bagian 8.4 lolos unit test.
- [ ] **T-13** View web (Bagian 12.3) dan halaman `/` (KPI) serta `/posts` (tabel hasil crawling dengan filter dan penyamaran teks untuk `viewer`). *AC:* menampilkan data nyata dari satu hari crawl. Respons HTML dan RSC tidak memuat `author_hash` atau `raw` (test otomatis).
- [ ] **T-13a** *(baru)* Halaman `/topics`, `/issues` (baca), `/velocity`, `/sources`. *AC:* semua panel wajib Bagian 12.2 tampil dengan data nyata, dan semua waktu tampil WIB.
- [ ] **T-14** Alert Telegram (kritis, lonjakan topik, kesehatan collector), bot long polling, dan digest harian. *AC:* alert tidak duplikat dalam satu jam, dan tombol `[Buka web console]` membuka halaman yang benar.
- [ ] **T-15** **Pilot X** (2 minggu, di balik flag) dan keputusan go/no-go bersama legal. *AC:* dokumen keputusan tertulis.

**Milestone MVP:** T-01 sampai T-14 selesai (termasuk T-03a dan T-13a) dan baseline 4 minggu mulai berjalan.

### Fase 3 — Intelijen dan konten (minggu 7–12)
- [ ] **T-16** Embedding, klaster isu, tabel `issues`, alur tiket manual, dan halaman `/issues/[id]` untuk mengubah `status`, `owner_unit`, `ticket_ref`. *AC:* isu negatif 7 hari terkelompok dengan ringkasan, dan perubahan dari web tercatat di `audit_log`.
- [ ] **T-17** Topic velocity (z-score) dan alert lonjakan. *AC:* uji dengan data sintetis lonjakan.
- [ ] **T-18** Trend Radar harian. *AC:* output 3 peluang dan 3 risiko tersimpan di `trends` dan tampil di `/trends`.
- [ ] **T-19** Content Recommender dan `content_suggestions`. *AC:* tiap saran punya alasan dan rujukan data, dan bisa di-approve/reject dari `/content`.
- [ ] **T-20** Knowledge base (`kb_docs`) dengan alur persetujuan konten: `/admin/kb` dan job `embed_kb_docs`. *AC:* hanya dokumen `is_active`, `approved`, dan ber-embedding yang dipakai. Edit konten menonaktifkan dokumen sampai disetujui ulang.

### Fase 4 — Engagement Agent (bulan 4–6)
- [ ] **T-21** Reader, Writer, Guard, schema validation, dan endpoint `POST /internal/guard/check`. *AC:* seluruh uji prompt injection lolos.
- [ ] **T-22** `reply_queue`, penjadwalan jitter 1–3 jam, quiet hours. *AC:* tidak ada balasan terjadwal di luar jendela.
- [ ] **T-23** Persetujuan lewat Telegram dan mode `manual_post` untuk X/YT. *AC:* seluruh transisi status tercatat di `audit_log`.
- [ ] **T-23a** *(baru)* Konsol persetujuan web: `/replies` dan `/replies/[id]` (setujui, edit, tolak, eskalasi, "Sudah diposting"), pratinjau Guard lewat API internal, dan `/admin/flags` dengan aturan menaikkan/menurunkan risiko. *AC:* Server Action menolak draf yang gagal Guard. Race dengan worker tidak menimpa status. Flag yang menaikkan risiko hanya bisa oleh admin. Seluruh transisi status tercatat di `audit_log`.
- [ ] **T-24** Publisher IG/FB (akun resmi) dan worker 10 menit. *AC:* kill switch menghentikan pengiriman dalam satu siklus; pilot dengan `auto_reply_enabled=on` hanya pada akun uji.
- [ ] **T-25** Rollout bertahap: draf saja → template aman otomatis → KB otomatis. *AC:* tiap tahap disetujui Humas secara tertulis.

### Fase 5 — Optimasi (bulan 6+)
- [ ] **T-26** Uji A/B konten dan halaman KPI (Net Sentiment Score, waktu respons, penyelesaian isu).
- [ ] **T-27** Retensi otomatis, backup terjadwal (termasuk schema `auth`), runbook operasional (termasuk rotasi `BETTER_AUTH_SECRET`, pencabutan sesi, dan prosedur patching Next.js).
- [ ] **T-28** Evaluasi jalur peningkatan jika ada anggaran (API resmi X, data provider IG/FB, LLM API).

## 17. Definition of Done (MVP)

- Siklus per jam berjalan stabil minimal 7 hari tanpa intervensi, dengan `collector_runs` menunjukkan kesehatan sumber.
- Web console menampilkan: tabel hasil crawling, topik × sentimen (positif, negatif, netral, net), status kritis, skala, sensitif, dan kecepatan sebar. Semua waktu tampil WIB.
- Login dan peran berfungsi. Semua mutasi (persetujuan, flag, isu, KB, pengguna) tercatat di `audit_log`.
- Alert isu kritis sampai ke Telegram dalam ≤ 30 menit setelah post terdeteksi.
- Tidak ada handle penulis mentah di database, dan tidak ada secret di repo. Respons web tidak memuat `author_hash` atau `raw` (diuji otomatis).
- Semua flag posting otomatis default `off`, dan kill switch teruji.
- Laporan akurasi sentimen dari golden set terdokumentasi.
- Versi Next.js dan React yang dipin memuat patch advisory terbaru, dan `pnpm audit` tanpa temuan high/critical.
- Runbook operasional: cara mematikan collector, menangani blokir platform, rotasi token dan secret web, mencabut sesi pengguna, dan restore backup.

## 18. Hal yang Belum Diputuskan (perlu jawaban sebelum Fase terkait)

1. Jadwal crawl: diasumsikan tiap jam pada menit ke-5.
2. Lanjut atau tidak scraping X setelah pilot (Fase 2, T-15).
3. Isi leksikon `SARA` dan `POLITIK_PEJABAT` (dimiliki Humas/Legal).
4. Daftar akun resmi, akun media, pejabat, dan influencer yang dipantau (`sources.yaml`).
5. Batas retensi data dan siapa yang berhak mengakses dashboard.
6. Penyetuju balasan dan SLA respons.
7. Model LLM lokal dan spesifikasi VM final setelah uji kecepatan.
8. Metode login web console: SSO OIDC perusahaan (disarankan bila tersedia) atau akun lokal + 2FA, dan siapa yang mengelola akun. Diperlukan sebelum T-03a.
9. Daftar pengguna awal per peran (`viewer`, `humas`, `admin`), dan apakah persetujuan balasan/KB perlu dua orang (four-eyes).
10. Akses jaringan web console (intranet/VPN saja atau perlu akses dari luar), dan bila webhook Meta dipakai, di mana endpoint publiknya ditempatkan.
11. Versi Next.js dan Node.js yang dipin. Diputuskan saat T-01 setelah mengecek advisory terbaru.

## 19. Catatan untuk Agent Coding

- Baca Bagian 0 sebelum menulis kode apa pun, dan hentikan pekerjaan jika sebuah task menuntut pelanggarannya.
- Kerjakan satu task (T-xx) per sesi, tulis test lebih dulu, dan tutup dengan memenuhi AC.
- Jangan mengarang nama endpoint, izin, atau parameter library. Baca dokumentasi resmi versi terbaru, dan jika ragu, tulis adapter tipis dengan `TODO(verify)` serta catat di PR.
- Jangan menambah dependency berbayar atau layanan cloud berbayar. Deploy ke Vercel atau hosting cloud lain tidak diperbolehkan; web console self-host di VM internal.
- Setiap perubahan skema lewat migrasi Alembic. Jangan mengubah tabel langsung. Dilarang `drizzle-kit push`, `generate`, atau `migrate`, dan dilarang menjalankan migrasi bawaan Better Auth.
- Untuk `web/`: baca dokumentasi Next.js versi yang dipin sebelum menulis kode. API berubah antar mayor (misalnya `middleware` menjadi `proxy`, perilaku cache, API request asinkron), jadi jangan menulis dari ingatan.
- Server Components secara default, `"use client"` seperlunya. Jangan memakai Cache Components atau `use cache`, dan jangan menyalakan Image Optimization.
- Setiap fungsi di `server/queries` dan `server/actions` memanggil `requireRole` lebih dulu. Jangan mengandalkan `proxy.ts`. Setiap mutasi: validasi Zod, UPDATE bersyarat, dan `audit_log` dalam transaksi yang sama.
- Teks komentar tidak pernah dirender sebagai HTML atau markdown. Dilarang `dangerouslySetInnerHTML` untuk data crawling.
- Web tidak boleh memanggil API platform untuk posting, dan aturan Guard tidak boleh diduplikasi di TypeScript (selalu lewat API internal).

---

## 20. Catatan Revisi 1.1 (26 Oktober 2026)

Perubahan akibat keputusan memakai Next.js:

| Bagian | Perubahan |
|---|---|
| Header, 1 | Versi 1.1; pembagian tanggung jawab Python dan Next.js |
| 0 | Aturan 8–9 (frontend tanpa secret, web tidak memposting) |
| 2 | Stack web (Next.js 16.x, Tailwind + shadcn/ui, ECharts, Drizzle, Zod, Better Auth, Vitest + Playwright); Metabase dihapus; FastAPI diperkecil |
| 3 | Struktur repo: tambah `web/` dan `alerts/bot.py`; hapus `dashboards/sql/` |
| 4.1 | Env Python dan env web dipisah; tambah `WEB_BASE_URL`, `INTERNAL_API_TOKEN`, `TELEGRAM_ADMIN_USER_IDS` |
| 5 | Role `si_dashboard` dipersempit, role baru `si_web_write`, migrasi 0002 |
| 6.3, 9.2, 10, 11.2 | Catatan webhook, Guard check bersama, bot long polling, tampilan saran dan radar |
| 12 | Ditulis ulang: Metabase menjadi Web Console (Next.js) |
| 13 | Compose: tambah `api`, `bot`, `web`, hapus `metabase`; langkah `embed_kb_docs` |
| 14, 15 | Supply chain dan patching Next.js; uji web |
| 16 | Task baru T-03a, T-13a, T-23a; T-01 sampai T-03, T-13, T-14, T-16, T-18 sampai T-21, T-26, T-27 disesuaikan |
| 17–19 | Definition of Done, keputusan terbuka, catatan agent coding |

Tidak berubah: Aturan 1–7, Bagian 4.2–4.5, 6 (selain catatan webhook), 7, 8, 9.1, 9.3–9.5.
