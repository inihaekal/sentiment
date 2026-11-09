// ── Dummy data realistis untuk Brantas Social Intelligence Dashboard ──

export type Platform = "ig" | "fb" | "x" | "yt" | "news";
export type Sentiment = "positif" | "negatif" | "netral";
export type Scale = "kecil" | "sedang" | "besar" | "krisis";
export type SpreadLabel = "lambat" | "sedang" | "cepat" | "viral";
export type AuthorType = "warga" | "media" | "influencer" | "pejabat" | "akun_resmi";
export type ReplyStatus = "pending" | "approved" | "sent" | "cancelled" | "escalated" | "needs_manual";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type SuggestionKind = "peluang" | "klarifikasi" | "evergreen";
export type TrendClassification = "peluang" | "risiko" | "netral";
export type UserRole = "viewer" | "humas" | "admin";

export interface Post {
  id: number;
  platform: Platform;
  kind: "post" | "comment";
  url: string;
  author_type: AuthorType;
  author_followers: number;
  is_own_account: boolean;
  text: string;
  lang: string;
  created_at: string;
  is_spam: boolean;
  topic: string;
  sentiment: Sentiment;
  sentiment_score: number;
  is_critical: boolean;
  critical_reason: string | null;
  scale: Scale;
  scale_score: number;
  is_sensitive: boolean;
  sensitive_tags: string[];
  spread_velocity: number;
  spread_label: SpreadLabel;
  likes: number;
  replies: number;
  shares: number;
  views: number;
}

export interface Issue {
  id: number;
  title: string;
  summary: string;
  topic: string;
  first_seen: string;
  last_seen: string;
  post_count: number;
  neg_ratio: number;
  status: IssueStatus;
  owner_unit: string | null;
  ticket_ref: string | null;
  is_critical: boolean;
  scale: Scale;
  is_sensitive: boolean;
}

export interface ReplyQueueItem {
  id: number;
  post_id: number;
  mode: string;
  draft: string;
  scheduled_at: string;
  status: ReplyStatus;
  approved_by: string | null;
  approved_at: string | null;
  sent_at: string | null;
  error: string | null;
  created_at: string;
  platform: Platform;
  url: string;
  author_type: AuthorType;
  comment_text: string;
  topic: string;
  sentiment: Sentiment;
  is_critical: boolean;
  is_sensitive: boolean;
}

export interface CollectorHealth {
  collector: string;
  platform: Platform;
  last_ok: string;
  new_24h: number;
  errors_24h: number;
  status: "healthy" | "warning" | "error";
}

export interface ContentSuggestion {
  id: number;
  created_at: string;
  kind: SuggestionKind;
  topic: string;
  format: string;
  suggested_time: string;
  caption_draft: string;
  rationale: string;
  status: "proposed" | "approved" | "posted" | "rejected";
}

export interface Trend {
  id: number;
  computed_at: string;
  term: string;
  velocity_z: number;
  relevance: number;
  avg_sentiment: number;
  classification: TrendClassification;
}

export interface SystemFlag {
  key: string;
  value: string;
  updated_at: string;
  updated_by: string;
  description: string;
}

export interface KBDoc {
  id: number;
  title: string;
  source_url: string;
  content: string;
  is_active: boolean;
  approved_by: string | null;
  approved_at: string | null;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

export interface AuditEntry {
  id: number;
  ts: string;
  actor: string;
  action: string;
  target: string;
  payload: Record<string, unknown>;
}

// ── KPI Data ──
export const kpiData = {
  volume: 1847,
  volume_prev: 1623,
  positif: 892,
  positif_prev: 745,
  negatif: 312,
  negatif_prev: 387,
  netral: 643,
  netral_prev: 491,
  net_sentiment_score: 31.4,
  net_sentiment_prev: 22.1,
  isu_kritis: 5,
  isu_kritis_prev: 3,
  reply_pending: 23,
  reply_sent_24h: 67,
  avg_response_hours: 2.4,
};

// ── Posts ──
const topics = [
  "kualitas_proyek", "k3_keselamatan", "tender_integritas", "dampak_warga_lahan",
  "lingkungan", "karier_rekrutmen", "csr", "kinerja_korporasi", "layanan_komunikasi", "lainnya"
];

const postTexts: Record<string, string[]> = {
  positif: [
    "Proyek Bendungan Kuwil Kawangkoan sudah rampung, hasilnya bagus. Kapasitas tampung air meningkat signifikan untuk masyarakat Minahasa Utara.",
    "Salut buat Brantas Abipraya! Program CSR pembangunan sekolah di daerah terdampak proyek benar-benar dirasakan manfaatnya oleh warga.",
    "Kualitas jalan tol yang dikerjakan Brantas Abipraya memang beda kelas. Smooth banget dan drainasenya oke.",
    "Baru lihat progress Bendungan Semantok, mantap sekali. Brantas Abipraya emang BUMN karya terbaik.",
    "Rekrutmen terbuka Brantas Abipraya sangat transparan. Prosesnya jelas dan profesional. Terima kasih sudah diberi kesempatan.",
    "Penanganan banjir di kawasan hilir sungai oleh tim Brantas cepat dan tanggap. Warga merasa aman.",
    "Program magang Brantas sangat bermanfaat. Banyak ilmu praktis yang didapat di lapangan proyek.",
    "Irigasi teknis yang dibangun Brantas benar-benar mengubah hidup petani di sini. Panen jadi 3x setahun.",
  ],
  negatif: [
    "Proyek irigasi di desa kami mangkrak sudah 6 bulan. Material berserakan, pekerja hilang. Warga kecewa berat!",
    "Ada kecelakaan kerja lagi di proyek Brantas. Sudah berapa kali ini? Standar K3 harus dievaluasi serius!",
    "Ganti rugi lahan pembangunan bendungan sangat tidak adil. Harga jauh di bawah NJOP. Warga menolak!",
    "Limbah proyek pembangunan jalan tol mencemari sungai desa. Ikan mati semua. Brantas harus tanggung jawab!",
    "Upah pekerja proyek Brantas di bawah UMR. Outsourcing tanpa jaminan kesehatan. Ini eksploitasi!",
    "Dugaan mark up dalam proyek tender infrastruktur oleh oknum pejabat. Sudah dilaporkan ke KPK.",
    "Proyek bendungan menyebabkan longsor di area pemukiman warga. Sudah ada korban terluka tapi tidak ada respons.",
    "Kualitas beton jembatan baru sudah retak padahal baru 2 bulan. Asal-asalan!",
  ],
  netral: [
    "Brantas Abipraya mendapat kontrak baru untuk proyek infrastruktur air di Kalimantan Timur senilai Rp 2,3 triliun.",
    "PT Brantas Abipraya melaksanakan RUPS tahunan, membahas rencana ekspansi ke sektor energi terbarukan.",
    "Brantas Abipraya membuka lowongan kerja untuk posisi engineer sipil dan teknik lingkungan. Deadline 30 November.",
    "Menteri BUMN meninjau progress pembangunan Bendungan Bendo oleh Brantas Abipraya di Ponorogo.",
    "Workshop K3 Brantas Abipraya diikuti 200 pekerja lapangan dari berbagai proyek di Indonesia Timur.",
    "Brantas Abipraya menandatangani MOU kerjasama dengan universitas untuk riset teknologi bendungan.",
  ],
};

const REF_TIMESTAMP = 1793020800000; // 2026-10-26T13:00:00Z (20:00 WIB)

function createSeededRandom(seed: number) {
  let s = seed;
  return function () {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t >>> 0) / 4294967296);
  };
}

function generatePosts(count: number): Post[] {
  const rand = createSeededRandom(20261026);
  const platforms: Platform[] = ["ig", "fb", "x", "yt", "news"];
  const authorTypes: AuthorType[] = ["warga", "warga", "warga", "media", "influencer", "pejabat"];
  const sentiments: Sentiment[] = ["positif", "positif", "positif", "negatif", "negatif", "netral", "netral"];
  const scales: Scale[] = ["kecil", "kecil", "kecil", "sedang", "sedang", "besar", "krisis"];
  const spreadLabels: SpreadLabel[] = ["lambat", "lambat", "sedang", "sedang", "cepat", "viral"];

  return Array.from({ length: count }, (_, i) => {
    const sentiment = sentiments[Math.floor(rand() * sentiments.length)];
    const platform = platforms[Math.floor(rand() * platforms.length)];
    const authorType = authorTypes[Math.floor(rand() * authorTypes.length)];
    const isCritical = sentiment === "negatif" && rand() > 0.6;
    const isSensitive = rand() > 0.85;
    const scale = isCritical ? (rand() > 0.5 ? "krisis" : "besar") : scales[Math.floor(rand() * scales.length)];
    const spreadLabel = isCritical ? (rand() > 0.5 ? "viral" : "cepat") : spreadLabels[Math.floor(rand() * spreadLabels.length)];
    const followers = authorType === "media" ? 50000 + Math.floor(rand() * 500000)
      : authorType === "influencer" ? 10000 + Math.floor(rand() * 200000)
      : authorType === "pejabat" ? 20000 + Math.floor(rand() * 300000)
      : Math.floor(rand() * 5000);

    const texts = postTexts[sentiment];
    const text = texts[i % texts.length];
    const hoursAgo = Math.floor(rand() * 168);

    return {
      id: i + 1,
      platform,
      kind: rand() > 0.4 ? "comment" : "post",
      url: `https://${platform === "ig" ? "instagram.com/p" : platform === "fb" ? "facebook.com/post" : platform === "x" ? "x.com/status" : platform === "yt" ? "youtube.com/watch" : "detik.com/news"}/abc${i}`,
      author_type: authorType,
      author_followers: followers,
      is_own_account: rand() > 0.95,
      text,
      lang: "id",
      created_at: new Date(REF_TIMESTAMP - hoursAgo * 3600 * 1000).toISOString(),
      is_spam: false,
      topic: topics[Math.floor(rand() * topics.length)],
      sentiment,
      sentiment_score: Number((sentiment === "positif" ? 0.3 + rand() * 0.7 : sentiment === "negatif" ? -(0.3 + rand() * 0.7) : -0.2 + rand() * 0.4).toFixed(2)),
      is_critical: isCritical,
      critical_reason: isCritical ? (["sensitif+negatif", "negatif+sebar_cepat", "negatif+media_pejabat", "skala_besar"])[Math.floor(rand() * 4)] : null,
      scale,
      scale_score: scale === "kecil" ? Math.floor(rand() * 30) : scale === "sedang" ? 30 + Math.floor(rand() * 30) : scale === "besar" ? 60 + Math.floor(rand() * 20) : 80 + Math.floor(rand() * 20),
      is_sensitive: isSensitive,
      sensitive_tags: isSensitive ? [(["K3_KECELAKAAN", "HUKUM_KORUPSI", "LAHAN_WARGA", "LINGKUNGAN", "KETENAGAKERJAAN"])[Math.floor(rand() * 5)]] : [],
      spread_velocity: Number((spreadLabel === "viral" ? 40 + rand() * 60 : spreadLabel === "cepat" ? 10 + rand() * 30 : spreadLabel === "sedang" ? 2 + rand() * 8 : rand() * 2).toFixed(1)),
      spread_label: spreadLabel,
      likes: Math.floor(rand() * 5000),
      replies: Math.floor(rand() * 200),
      shares: Math.floor(rand() * 500),
      views: Math.floor(rand() * 100000),
    };
  });
}

export const posts: Post[] = generatePosts(120);

export const topicSentimentData = topics.map((topic, idx) => {
  const topicPosts = posts.filter(p => p.topic === topic);
  const extraPos = (idx * 7 + 3) % 15;
  const extraNeg = (idx * 3 + 2) % 8;
  const extraNet = (idx * 5 + 4) % 12;
  return {
    topic,
    positif: topicPosts.filter(p => p.sentiment === "positif").length + extraPos,
    negatif: topicPosts.filter(p => p.sentiment === "negatif").length + extraNeg,
    netral: topicPosts.filter(p => p.sentiment === "netral").length + extraNet,
    get net() { return this.positif - this.negatif; },
  };
});

// ── Issue matrix ──
export const issueMatrixData = [
  { is_critical: true, scale: "krisis" as Scale, is_sensitive: true, n: 2 },
  { is_critical: true, scale: "besar" as Scale, is_sensitive: true, n: 3 },
  { is_critical: true, scale: "besar" as Scale, is_sensitive: false, n: 5 },
  { is_critical: true, scale: "sedang" as Scale, is_sensitive: false, n: 8 },
  { is_critical: false, scale: "sedang" as Scale, is_sensitive: true, n: 4 },
  { is_critical: false, scale: "sedang" as Scale, is_sensitive: false, n: 35 },
  { is_critical: false, scale: "kecil" as Scale, is_sensitive: false, n: 142 },
  { is_critical: false, scale: "kecil" as Scale, is_sensitive: true, n: 7 },
];

// ── Issues (clusters) ──
export const issues: Issue[] = [
  { id: 1, title: "Kecelakaan Kerja Proyek Bendungan Margatiga", summary: "Terjadi insiden kecelakaan kerja yang menyebabkan 2 pekerja terluka di lokasi proyek. Warga sekitar dan media lokal menyoroti standar K3.", topic: "k3_keselamatan", first_seen: "2026-10-24T08:00:00Z", last_seen: "2026-10-26T12:00:00Z", post_count: 47, neg_ratio: 0.89, status: "open", owner_unit: null, ticket_ref: null, is_critical: true, scale: "krisis", is_sensitive: true },
  { id: 2, title: "Pencemaran Sungai Akibat Limbah Proyek Tol", summary: "Warga melaporkan limbah konstruksi mencemari sungai di dekat proyek jalan tol. Ikan mati dan air berubah warna. Isu viral di media sosial.", topic: "lingkungan", first_seen: "2026-10-23T10:00:00Z", last_seen: "2026-10-26T11:30:00Z", post_count: 38, neg_ratio: 0.92, status: "open", owner_unit: "Divisi Lingkungan", ticket_ref: null, is_critical: true, scale: "besar", is_sensitive: true },
  { id: 3, title: "Sengketa Ganti Rugi Lahan Bendungan Semantok", summary: "Sekelompok warga menolak nilai ganti rugi lahan yang ditetapkan untuk pembangunan bendungan. Aksi protes dan liputan media nasional.", topic: "dampak_warga_lahan", first_seen: "2026-10-20T06:00:00Z", last_seen: "2026-10-26T10:00:00Z", post_count: 65, neg_ratio: 0.78, status: "in_progress", owner_unit: "Divisi Pertanahan", ticket_ref: "TKT-2026-089", is_critical: true, scale: "besar", is_sensitive: true },
  { id: 4, title: "Keluhan Upah Pekerja Outsourcing", summary: "Pekerja outsourcing di beberapa proyek mengeluhkan upah di bawah UMR dan tidak adanya jaminan kesehatan.", topic: "ketenagakerjaan", first_seen: "2026-10-22T14:00:00Z", last_seen: "2026-10-25T16:00:00Z", post_count: 22, neg_ratio: 0.82, status: "open", owner_unit: null, ticket_ref: null, is_critical: false, scale: "sedang", is_sensitive: true },
  { id: 5, title: "Proyek Irigasi Mangkrak di Kabupaten Blitar", summary: "Warga melaporkan proyek irigasi yang terhenti selama 6 bulan tanpa kejelasan. Material berserakan di lokasi.", topic: "kualitas_proyek", first_seen: "2026-10-18T09:00:00Z", last_seen: "2026-10-26T08:00:00Z", post_count: 31, neg_ratio: 0.71, status: "in_progress", owner_unit: "Divisi Operasi I", ticket_ref: "TKT-2026-085", is_critical: false, scale: "sedang", is_sensitive: false },
  { id: 6, title: "Apresiasi Program CSR Sekolah", summary: "Banyak warga mengapresiasi program pembangunan sekolah di daerah terdampak proyek. Sentimen sangat positif.", topic: "csr", first_seen: "2026-10-21T07:00:00Z", last_seen: "2026-10-26T13:00:00Z", post_count: 54, neg_ratio: 0.08, status: "resolved", owner_unit: "Divisi CSR", ticket_ref: null, is_critical: false, scale: "sedang", is_sensitive: false },
  { id: 7, title: "Dugaan Mark-up Tender Infrastruktur", summary: "Akun media dan pejabat menyebarkan dugaan mark-up dalam proses tender proyek infrastruktur. Menjadi perhatian KPK.", topic: "tender_integritas", first_seen: "2026-10-25T11:00:00Z", last_seen: "2026-10-26T14:00:00Z", post_count: 18, neg_ratio: 0.94, status: "open", owner_unit: null, ticket_ref: null, is_critical: true, scale: "krisis", is_sensitive: true },
  { id: 8, title: "Kualitas Jalan Tol Baru Diakui Baik", summary: "Pengguna jalan tol baru memberikan review positif tentang kualitas konstruksi dan drainase.", topic: "kualitas_proyek", first_seen: "2026-10-19T12:00:00Z", last_seen: "2026-10-26T09:00:00Z", post_count: 42, neg_ratio: 0.12, status: "resolved", owner_unit: null, ticket_ref: null, is_critical: false, scale: "kecil", is_sensitive: false },
];

// Antrean balasan komunikasi publik
export const replyQueue: ReplyQueueItem[] = [
  { id: 1, post_id: 3, mode: "draft_approval", draft: "Terima kasih atas masukannya. Tim kami sedang menindaklanjuti hal ini dan akan memberikan update melalui kanal resmi kami. Untuk informasi lebih lanjut, silakan hubungi Humas Brantas Abipraya.", scheduled_at: "2026-10-26T15:30:00Z", status: "pending", approved_by: null, approved_at: null, sent_at: null, error: null, created_at: "2026-10-26T13:00:00Z", platform: "ig", url: "https://instagram.com/p/abc3", author_type: "warga", comment_text: "Proyek irigasi di desa kami mangkrak sudah 6 bulan. Material berserakan, pekerja hilang. Warga kecewa berat!", topic: "kualitas_proyek", sentiment: "negatif", is_critical: false, is_sensitive: false },
  { id: 2, post_id: 5, mode: "auto", draft: "Terima kasih atas apresiasinya. Kami berkomitmen untuk terus menjaga standar mutu terbaik dalam setiap proyek infrastruktur nasional.", scheduled_at: "2026-10-26T14:00:00Z", status: "approved", approved_by: "system", approved_at: "2026-10-26T13:05:00Z", sent_at: null, error: null, created_at: "2026-10-26T13:00:00Z", platform: "ig", url: "https://instagram.com/p/abc5", author_type: "warga", comment_text: "Salut buat Brantas Abipraya! Program CSR pembangunan sekolah di daerah terdampak proyek benar-benar dirasakan manfaatnya oleh warga.", topic: "csr", sentiment: "positif", is_critical: false, is_sensitive: false },
  { id: 3, post_id: 8, mode: "draft_approval", draft: "Kami memahami kekhawatiran Bapak/Ibu. Tim Divisi Lingkungan kami sudah diterjunkan ke lokasi untuk melakukan investigasi dan penanganan teknis. Kami akan terus mengupdate perkembangan melalui akun resmi ini.", scheduled_at: "2026-10-26T16:00:00Z", status: "pending", approved_by: null, approved_at: null, sent_at: null, error: null, created_at: "2026-10-26T12:30:00Z", platform: "fb", url: "https://facebook.com/post/abc8", author_type: "warga", comment_text: "Limbah proyek pembangunan jalan tol mencemari sungai desa. Ikan mati semua. Brantas harus tanggung jawab!", topic: "lingkungan", sentiment: "negatif", is_critical: true, is_sensitive: true },
  { id: 4, post_id: 12, mode: "escalate", draft: "", scheduled_at: "2026-10-26T13:00:00Z", status: "escalated", approved_by: null, approved_at: null, sent_at: null, error: null, created_at: "2026-10-26T12:00:00Z", platform: "x", url: "https://x.com/status/abc12", author_type: "media", comment_text: "Dugaan mark up dalam proyek tender infrastruktur oleh oknum pejabat. Sudah dilaporkan ke KPK.", topic: "tender_integritas", sentiment: "negatif", is_critical: true, is_sensitive: true },
  { id: 5, post_id: 15, mode: "auto", draft: "Terima kasih telah berbagi pengalaman. Semoga kompetensi dan wawasan lapangan yang diperoleh dapat mendukung pengembangan karier ke depan.", scheduled_at: "2026-10-26T11:00:00Z", status: "sent", approved_by: "system", approved_at: "2026-10-26T10:30:00Z", sent_at: "2026-10-26T11:02:00Z", error: null, created_at: "2026-10-26T10:00:00Z", platform: "ig", url: "https://instagram.com/p/abc15", author_type: "warga", comment_text: "Program magang Brantas sangat bermanfaat. Banyak ilmu praktis yang didapat di lapangan proyek.", topic: "karier_rekrutmen", sentiment: "positif", is_critical: false, is_sensitive: false },
  { id: 6, post_id: 20, mode: "manual_post", draft: "Kami menyimak masukan warga mengenai aspek lingkungan. Tim teknis telah berkoordinasi dengan dinas terkait guna memastikan parameter pengelolaan lingkungan terpenuhi sesuai AMDAL. Informasi resmi: brantasabipraya.co.id/lingkungan", scheduled_at: "2026-10-26T17:00:00Z", status: "needs_manual", approved_by: "humas@brantas.co.id", approved_at: "2026-10-26T14:00:00Z", sent_at: null, error: null, created_at: "2026-10-26T11:00:00Z", platform: "yt", url: "https://youtube.com/watch/abc20", author_type: "warga", comment_text: "Proyek bendungan menyebabkan longsor di area pemukiman warga. Sudah ada korban terluka tapi tidak ada respons.", topic: "lingkungan", sentiment: "negatif", is_critical: true, is_sensitive: true },
  { id: 7, post_id: 25, mode: "draft_approval", draft: "Terima kasih atas perhatiannya terhadap aspek K3 di area kerja kami. Keselamatan seluruh tenaga kerja merupakan prioritas mutlak. Evaluasi berkala dan pengawasan protokol keselamatan di lapangan terus diperketat.", scheduled_at: "2026-10-26T18:00:00Z", status: "pending", approved_by: null, approved_at: null, sent_at: null, error: null, created_at: "2026-10-26T14:30:00Z", platform: "ig", url: "https://instagram.com/p/abc25", author_type: "influencer", comment_text: "Ada kecelakaan kerja lagi di proyek Brantas. Sudah berapa kali ini? Standar K3 harus dievaluasi serius!", topic: "k3_keselamatan", sentiment: "negatif", is_critical: true, is_sensitive: true },
  { id: 8, post_id: 30, mode: "auto", draft: "Informasi rekrutmen resmi dipublikasikan secara terpusat melalui portal karier resmi perusahaan: brantasabipraya.co.id/karir. Waspadai segala bentuk penipuan yang mengatasnamakan rekrutmen Brantas Abipraya.", scheduled_at: "2026-10-26T19:00:00Z", status: "pending", approved_by: null, approved_at: null, sent_at: null, error: null, created_at: "2026-10-26T15:00:00Z", platform: "fb", url: "https://facebook.com/post/abc30", author_type: "warga", comment_text: "Brantas Abipraya membuka lowongan kerja untuk posisi engineer sipil dan teknik lingkungan.", topic: "karier_rekrutmen", sentiment: "netral", is_critical: false, is_sensitive: false },
];

export const collectorHealth: CollectorHealth[] = [
  { collector: "graph_ig", platform: "ig", last_ok: "2026-10-26T13:05:00Z", new_24h: 234, errors_24h: 0, status: "healthy" },
  { collector: "graph_fb", platform: "fb", last_ok: "2026-10-26T13:05:00Z", new_24h: 189, errors_24h: 1, status: "healthy" },
  { collector: "instaloader_ig", platform: "ig", last_ok: "2026-10-26T12:05:00Z", new_24h: 87, errors_24h: 3, status: "warning" },
  { collector: "apify_fb", platform: "fb", last_ok: "2026-10-26T13:05:00Z", new_24h: 56, errors_24h: 0, status: "healthy" },
  { collector: "rss_news", platform: "news", last_ok: "2026-10-26T13:05:00Z", new_24h: 42, errors_24h: 0, status: "healthy" },
  { collector: "youtube", platform: "yt", last_ok: "2026-10-26T13:05:00Z", new_24h: 128, errors_24h: 0, status: "healthy" },
  { collector: "x_scraper", platform: "x", last_ok: "2026-10-25T10:00:00Z", new_24h: 0, errors_24h: 0, status: "warning" },
];

export const velocityHourly = Array.from({ length: 168 }, (_, i) => {
  const rand = createSeededRandom(987654321 + i);
  const d = new Date(REF_TIMESTAMP - (167 - i) * 3600 * 1000);
  return {
    hour: d.toISOString(),
    lambat: Math.floor(rand() * 20) + 5,
    sedang: Math.floor(rand() * 10) + 2,
    cepat: Math.floor(rand() * 5),
    viral: rand() > 0.9 ? Math.floor(rand() * 3) + 1 : 0,
    max_velocity: Number((rand() * 80).toFixed(1)),
  };
});

export const contentSuggestions: ContentSuggestion[] = [
  {
    id: 1,
    created_at: "2026-10-26T06:30:00Z",
    kind: "klarifikasi",
    topic: "k3_keselamatan",
    format: "carousel IG dan thread X",
    suggested_time: "2026-10-27T09:00:00Z",
    caption_draft: "Keselamatan kerja merupakan komitmen fundamental di seluruh proyek Brantas Abipraya. Berikut implementasi standar K3 yang diterapkan secara konsisten di lapangan:\n\n- Briefing keselamatan harian sebelum pekerjaan dimulai\n- Standar alat pelindung diri bersertifikasi internasional\n- Audit keselamatan berkala dan inspeksi mandiri mingguan\n- Pelatihan tanggap darurat untuk seluruh tenaga kerja\n- Kanal pengaduan keselamatan kerja yang dapat diakses publik\n\nInformasi lengkap pedoman K3 dapat diakses melalui portal resmi perusahaan.",
    rationale: "Volume komentar tentang aspek keselamatan kerja meningkat 40% dalam 7 hari. Penjelasan faktual proaktif diperlukan guna memberikan konteks yang utuh.",
    status: "proposed",
  },
  {
    id: 2,
    created_at: "2026-10-26T06:30:00Z",
    kind: "peluang",
    topic: "csr",
    format: "dokumentasi foto dan video ringkas",
    suggested_time: "2026-10-27T12:00:00Z",
    caption_draft: "Gedung sekolah dasar baru di Desa Margajaya telah resmi diserahterimakan kepada pemerintah daerah setempat. Fasilitas ini dibangun sebagai wujud tanggung jawab sosial dan lingkungan perusahaan untuk mendukung sarana pendidikan anak-anak di sekitar area proyek bendungan.",
    rationale: "Sentimen publik terhadap program CSR mencapai 92% positif. Momen yang tepat untuk mendokumentasikan dampak nyata proyek terhadap warga.",
    status: "approved",
  },
  {
    id: 3,
    created_at: "2026-10-26T06:30:00Z",
    kind: "evergreen",
    topic: "kualitas_proyek",
    format: "infografis teknis",
    suggested_time: "2026-10-28T10:00:00Z",
    caption_draft: "Dalam kurun lebih dari empat dekade, Brantas Abipraya telah menyelesaikan lebih dari 50 pembangunan bendungan strategis di berbagai penjuru tanah air. Setiap tahapan konstruksi menerapkan sistem manajemen mutu bertingkat guna memastikan keandalan struktur jangka panjang.",
    rationale: "Materi edukasi mengenai rekam jejak pembangunan infrastruktur air berfungsi sebagai referensi data terpercaya bagi masyarakat.",
    status: "proposed",
  },
  {
    id: 4,
    created_at: "2026-10-25T06:30:00Z",
    kind: "klarifikasi",
    topic: "lingkungan",
    format: "lembar fakta dan dokumentasi",
    suggested_time: "2026-10-26T15:00:00Z",
    caption_draft: "Menanggapi perhatian masyarakat terhadap kondisi perairan di sekitar area proyek jalan tol, tim lingkungan telah melakukan pengambilan sampel berkala bersama instansi berwenang. Hasil pengujian laboratorium menunjukkan seluruh parameter air memenuhi ambang batas baku mutu lingkungan yang dipersyaratkan.",
    rationale: "Perbincangan terkait isu lingkungan perlu ditanggapi dengan data uji laboratorium faktual dan transparan.",
    status: "posted",
  },
];

export const trends: Trend[] = [
  { id: 1, computed_at: "2026-10-26T06:30:00Z", term: "kecelakaan kerja", velocity_z: 4.2, relevance: 0.92, avg_sentiment: -0.78, classification: "risiko" },
  { id: 2, computed_at: "2026-10-26T06:30:00Z", term: "pencemaran sungai", velocity_z: 3.8, relevance: 0.88, avg_sentiment: -0.85, classification: "risiko" },
  { id: 3, computed_at: "2026-10-26T06:30:00Z", term: "CSR sekolah", velocity_z: 3.5, relevance: 0.95, avg_sentiment: 0.82, classification: "peluang" },
  { id: 4, computed_at: "2026-10-26T06:30:00Z", term: "bendungan semantok", velocity_z: 3.1, relevance: 0.97, avg_sentiment: 0.45, classification: "peluang" },
  { id: 5, computed_at: "2026-10-26T06:30:00Z", term: "ganti rugi lahan", velocity_z: 2.9, relevance: 0.90, avg_sentiment: -0.72, classification: "risiko" },
  { id: 6, computed_at: "2026-10-26T06:30:00Z", term: "lowongan kerja", velocity_z: 2.7, relevance: 0.80, avg_sentiment: 0.35, classification: "peluang" },
  { id: 7, computed_at: "2026-10-26T06:30:00Z", term: "infrastruktur air", velocity_z: 2.2, relevance: 0.98, avg_sentiment: 0.20, classification: "netral" },
  { id: 8, computed_at: "2026-10-26T06:30:00Z", term: "dugaan korupsi", velocity_z: 5.1, relevance: 0.85, avg_sentiment: -0.91, classification: "risiko" },
  { id: 9, computed_at: "2026-10-26T06:30:00Z", term: "proyek tol baru", velocity_z: 1.8, relevance: 0.93, avg_sentiment: 0.55, classification: "peluang" },
  { id: 10, computed_at: "2026-10-26T06:30:00Z", term: "kualitas beton", velocity_z: 2.5, relevance: 0.91, avg_sentiment: -0.45, classification: "risiko" },
];

export const systemFlags: SystemFlag[] = [
  { key: "kill_switch", value: "off", updated_at: "2026-10-25T10:00:00Z", updated_by: "admin@brantas.co.id", description: "Menghentikan semua operasi otomatis (collector, reply, publisher)" },
  { key: "auto_reply_enabled", value: "off", updated_at: "2026-10-25T10:00:00Z", updated_by: "admin@brantas.co.id", description: "Mengaktifkan auto-reply untuk komentar positif dan netral yang ada di KB" },
  { key: "x_collector_enabled", value: "off", updated_at: "2026-10-25T10:00:00Z", updated_by: "admin@brantas.co.id", description: "Mengaktifkan collector X (Twitter). Hanya jalan jika kill_switch juga off." },
];

export const kbDocs: KBDoc[] = [
  { id: 1, title: "Profil Perusahaan Brantas Abipraya", source_url: "https://brantasabipraya.co.id/tentang", content: "PT Brantas Abipraya adalah Badan Usaha Milik Negara (BUMN) yang bergerak di bidang konstruksi khususnya pembangunan infrastruktur sumber daya air...", is_active: true, approved_by: "admin@brantas.co.id", approved_at: "2026-10-20T10:00:00Z" },
  { id: 2, title: "Kebijakan K3 Perusahaan", source_url: "https://brantasabipraya.co.id/k3", content: "Brantas Abipraya menerapkan Sistem Manajemen K3 sesuai standar ISO 45001:2018. Setiap proyek wajib melaksanakan safety briefing harian...", is_active: true, approved_by: "admin@brantas.co.id", approved_at: "2026-10-21T09:00:00Z" },
  { id: 3, title: "Program CSR Bidang Pendidikan", source_url: "https://brantasabipraya.co.id/csr/pendidikan", content: "Program CSR Brantas Abipraya di bidang pendidikan meliputi pembangunan sekolah, beasiswa, dan pelatihan guru di daerah terdampak proyek...", is_active: true, approved_by: "humas@brantas.co.id", approved_at: "2026-10-22T14:00:00Z" },
  { id: 4, title: "Kebijakan Lingkungan Hidup", source_url: "https://brantasabipraya.co.id/lingkungan", content: "Brantas Abipraya berkomitmen pada pembangunan berkelanjutan dengan menerapkan AMDAL di setiap proyek...", is_active: true, approved_by: "admin@brantas.co.id", approved_at: "2026-10-23T11:00:00Z" },
  { id: 5, title: "FAQ Ganti Rugi Lahan (DRAFT)", source_url: "", content: "Proses ganti rugi lahan mengacu pada UU No. 2 Tahun 2012 tentang Pengadaan Tanah...", is_active: false, approved_by: null, approved_at: null },
  { id: 6, title: "Informasi Karir dan Rekrutmen", source_url: "https://brantasabipraya.co.id/karir", content: "Brantas Abipraya membuka kesempatan berkarir bagi profesional di bidang teknik sipil, teknik lingkungan, manajemen proyek...", is_active: true, approved_by: "humas@brantas.co.id", approved_at: "2026-10-24T08:00:00Z" },
];

export const users: User[] = [
  { id: 1, email: "admin@brantas.co.id", name: "Budi Santoso", role: "admin", is_active: true, created_at: "2026-10-01T00:00:00Z", last_login: "2026-10-26T08:00:00Z" },
  { id: 2, email: "humas@brantas.co.id", name: "Siti Rahmawati", role: "humas", is_active: true, created_at: "2026-10-01T00:00:00Z", last_login: "2026-10-26T09:30:00Z" },
  { id: 3, email: "humas2@brantas.co.id", name: "Ahmad Fauzi", role: "humas", is_active: true, created_at: "2026-10-05T00:00:00Z", last_login: "2026-10-26T07:45:00Z" },
  { id: 4, email: "direksi@brantas.co.id", name: "Ir. Hendro Wibowo", role: "viewer", is_active: true, created_at: "2026-10-10T00:00:00Z", last_login: "2026-10-25T14:00:00Z" },
  { id: 5, email: "legal@brantas.co.id", name: "Dewi Anggraeni", role: "viewer", is_active: true, created_at: "2026-10-10T00:00:00Z", last_login: "2026-10-24T11:00:00Z" },
  { id: 6, email: "csr@brantas.co.id", name: "Rini Susanti", role: "viewer", is_active: false, created_at: "2026-10-15T00:00:00Z", last_login: null },
];

export const auditLog: AuditEntry[] = [
  { id: 1, ts: "2026-10-26T14:30:00Z", actor: "humas@brantas.co.id", action: "reply_approved", target: "reply_queue:2", payload: { draft: "Terima kasih atas apresiasinya...", status_from: "pending", status_to: "approved" } },
  { id: 2, ts: "2026-10-26T14:00:00Z", actor: "admin@brantas.co.id", action: "flag_changed", target: "system_flags:auto_reply_enabled", payload: { from: "on", to: "off", reason: "evaluasi berkala" } },
  { id: 3, ts: "2026-10-26T13:00:00Z", actor: "humas@brantas.co.id", action: "reply_edited", target: "reply_queue:3", payload: { draft_before: "...", draft_after: "Kami memahami kekhawatiran..." } },
  { id: 4, ts: "2026-10-26T12:00:00Z", actor: "telegram:123456", action: "reply_escalated", target: "reply_queue:4", payload: { reason: "isu sensitif, perlu arahan legal" } },
  { id: 5, ts: "2026-10-26T11:02:00Z", actor: "system", action: "reply_sent", target: "reply_queue:5", payload: { platform: "ig" } },
  { id: 6, ts: "2026-10-26T10:00:00Z", actor: "admin@brantas.co.id", action: "user_role_changed", target: "user:3", payload: { email: "humas2@brantas.co.id", from: "viewer", to: "humas" } },
  { id: 7, ts: "2026-10-26T09:00:00Z", actor: "humas@brantas.co.id", action: "kb_doc_approved", target: "kb_docs:4", payload: { title: "Kebijakan Lingkungan Hidup" } },
  { id: 8, ts: "2026-10-26T08:00:00Z", actor: "admin@brantas.co.id", action: "login", target: "session", payload: {} },
  { id: 9, ts: "2026-10-25T16:00:00Z", actor: "humas@brantas.co.id", action: "issue_updated", target: "issues:3", payload: { status_from: "open", status_to: "in_progress", owner_unit: "Divisi Pertanahan" } },
  { id: 10, ts: "2026-10-25T14:00:00Z", actor: "humas2@brantas.co.id", action: "content_approved", target: "content_suggestions:2", payload: { topic: "csr" } },
];

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function formatWIB(isoDate: string): string {
  const d = new Date(isoDate);
  const wibMs = d.getTime() + 7 * 3600 * 1000;
  const wib = new Date(wibMs);
  const day = String(wib.getUTCDate()).padStart(2, "0");
  const month = MONTHS_ID[wib.getUTCMonth()];
  const year = wib.getUTCFullYear();
  const hours = String(wib.getUTCHours()).padStart(2, "0");
  const minutes = String(wib.getUTCMinutes()).padStart(2, "0");
  return `${day} ${month} ${year}, ${hours}.${minutes}`;
}

export function formatRelative(isoDate: string): string {
  const diff = Math.max(0, REF_TIMESTAMP - new Date(isoDate).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)}m lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}j lalu`;
  const days = Math.floor(hours / 24);
  return `${days}h lalu`;
}

export function platformLabel(p: Platform): string {
  const map: Record<Platform, string> = { ig: "Instagram", fb: "Facebook", x: "X", yt: "YouTube", news: "Berita" };
  return map[p];
}

export function topicLabel(t: string): string {
  const map: Record<string, string> = {
    kualitas_proyek: "Kualitas Proyek",
    k3_keselamatan: "K3 & Keselamatan",
    tender_integritas: "Tender & Integritas",
    dampak_warga_lahan: "Dampak Warga & Lahan",
    lingkungan: "Lingkungan",
    karier_rekrutmen: "Karier & Rekrutmen",
    csr: "CSR",
    kinerja_korporasi: "Kinerja Korporasi",
    layanan_komunikasi: "Layanan & Komunikasi",
    lainnya: "Lainnya",
  };
  return map[t] || t;
}
