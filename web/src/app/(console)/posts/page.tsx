"use client";

import { useState, useMemo } from "react";
import { Search, Filter, ExternalLink, MessageSquarePlus, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";
import {
  posts,
  formatWIB,
  platformLabel,
  topicLabel,
} from "@/lib/dummy-data";
import type { Platform, Sentiment } from "@/lib/dummy-data";

export default function PostsPage() {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [criticalOnly, setCriticalOnly] = useState(false);

  const filtered = useMemo(() => {
    return posts
      .filter((p) => {
        if (search && !p.text.toLowerCase().includes(search.toLowerCase())) return false;
        if (platformFilter !== "all" && p.platform !== platformFilter) return false;
        if (sentimentFilter !== "all" && p.sentiment !== sentimentFilter) return false;
        if (topicFilter !== "all" && p.topic !== topicFilter) return false;
        if (criticalOnly && !p.is_critical) return false;
        return true;
      })
      .sort((a, b) => {
        const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        if (diff !== 0) return diff;
        return a.id - b.id;
      });
  }, [search, platformFilter, sentimentFilter, topicFilter, criticalOnly]);

  const stats = useMemo(() => {
    const total = posts.length;
    const pos = posts.filter((p) => p.sentiment === "positif").length;
    const net = posts.filter((p) => p.sentiment === "netral").length;
    const neg = posts.filter((p) => p.sentiment === "negatif").length;
    const crit = posts.filter((p) => p.is_critical).length;
    return { total, pos, net, neg, crit };
  }, []);

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Pantauan Percakapan Media & Warga</h1>
        <p className="page-subtitle">
          Kumpulan postingan media sosial, komentar publik, dan artikel berita seputar aktivitas PT Brantas Abipraya
        </p>
      </div>

      <div className="page-content">
        {/* Quick Stat Ribbon */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 20,
          }}
        >
          <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(59, 130, 246, 0.15)", color: "var(--brand-500)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>{stats.total}</div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>Total Postingan</div>
            </div>
          </div>

          <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(16, 185, 129, 0.15)", color: "var(--color-positif)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-positif)" }}>
                {stats.pos} <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>({((stats.pos / stats.total) * 100).toFixed(0)}%)</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>Sentimen Positif</div>
            </div>
          </div>

          <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(148, 163, 184, 0.15)", color: "var(--text-tertiary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Filter size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-primary)" }}>
                {stats.net} <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>({((stats.net / stats.total) * 100).toFixed(0)}%)</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>Sentimen Netral</div>
            </div>
          </div>

          <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: "rgba(244, 63, 94, 0.15)", color: "var(--color-negatif)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle size={18} />
            </div>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-negatif)" }}>
                {stats.neg} <span style={{ fontSize: "0.75rem", fontWeight: 600 }}>({((stats.neg / stats.total) * 100).toFixed(0)}%)</span>
              </div>
              <div style={{ fontSize: "0.74rem", color: "var(--text-tertiary)" }}>Sentimen Negatif</div>
            </div>
          </div>
        </div>

        {/* Visual Filter Bar */}
        <div className="card" style={{ marginBottom: 20, padding: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Search row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: "1 1 260px" }}>
                <Search size={17} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
                <input
                  className="input"
                  style={{ paddingLeft: 38, width: "100%" }}
                  placeholder="Ketik kata kunci pencarian (misal: bendungan, tol, K3, CSR)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <select
                className="input select"
                style={{ width: 220 }}
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value)}
              >
                <option value="all">Semua Kategori Topik</option>
                {["kualitas_proyek", "k3_keselamatan", "tender_integritas", "dampak_warga_lahan", "lingkungan", "karier_rekrutmen", "csr", "kinerja_korporasi", "layanan_komunikasi", "lainnya"].map((t) => (
                  <option key={t} value={t}>{topicLabel(t)}</option>
                ))}
              </select>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "8px 14px",
                  background: criticalOnly ? "rgba(239, 68, 68, 0.15)" : "var(--bg-tertiary)",
                  color: criticalOnly ? "var(--color-kritis)" : "var(--text-secondary)",
                  borderRadius: "var(--radius-md)",
                  border: `1px solid ${criticalOnly ? "var(--color-kritis)" : "var(--border-color)"}`,
                  userSelect: "none",
                }}
              >
                <input
                  type="checkbox"
                  checked={criticalOnly}
                  onChange={(e) => setCriticalOnly(e.target.checked)}
                  style={{ accentColor: "var(--color-kritis)" }}
                />
                Hanya Isu Kritis
              </label>
            </div>

            {/* Platform pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-tertiary)", marginRight: 4 }}>
                Platform:
              </span>
              {[
                { id: "all", label: "Semua Kanal" },
                { id: "ig", label: "Instagram" },
                { id: "fb", label: "Facebook" },
                { id: "x", label: "X / Twitter" },
                { id: "yt", label: "YouTube" },
                { id: "news", label: "Portal Berita" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPlatformFilter(p.id)}
                  className={`btn btn-sm ${platformFilter === p.id ? "btn-primary" : "btn-secondary"}`}
                  style={{ borderRadius: "var(--radius-full)", fontSize: "0.8rem" }}
                >
                  {p.label}
                </button>
              ))}

              <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-tertiary)", marginRight: 4 }}>
                  Sentimen:
                </span>
                {[
                  { id: "all", label: "Semua" },
                  { id: "positif", label: "Positif", color: "var(--color-positif)" },
                  { id: "netral", label: "Netral", color: "var(--text-secondary)" },
                  { id: "negatif", label: "Negatif", color: "var(--color-negatif)" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSentimentFilter(s.id)}
                    className={`btn btn-sm ${sentimentFilter === s.id ? "btn-primary" : "btn-ghost"}`}
                    style={{ borderRadius: "var(--radius-full)", fontSize: "0.8rem" }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Data Percakapan */}
        <div className="card animate-fade-in">
          <div className="card-header">
            <div>
              <span className="card-title">Daftar Percakapan & Berita Terpantau</span>
              <span className="card-subtitle">Menampilkan {filtered.length} postingan yang sesuai kriteria</span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>No</th>
                  <th style={{ width: 130 }}>Saluran</th>
                  <th style={{ minWidth: 320 }}>Isi Percakapan Warga / Media</th>
                  <th>Kategori Topik</th>
                  <th>Sentimen Publik</th>
                  <th>Kecepatan Sebar</th>
                  <th>Engagement</th>
                  <th>Waktu</th>
                  <th style={{ textAlign: "right" }}>Tindakan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-tertiary)" }}>
                      Tidak ditemukan percakapan yang sesuai dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  filtered.slice(0, 50).map((post, i) => (
                    <tr key={post.id}>
                      <td style={{ color: "var(--text-tertiary)", fontSize: "0.8rem", fontWeight: 600 }}>
                        {i + 1}
                      </td>

                      <td>
                        <span className={`badge badge-${post.platform}`}>
                          {platformLabel(post.platform)}
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: 4, textTransform: "capitalize" }}>
                          Penulis: {post.author_type}
                        </div>
                      </td>

                      <td>
                        <div
                          style={{
                            maxWidth: 380,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            fontSize: "0.85rem",
                            lineHeight: 1.45,
                            color: "var(--text-primary)",
                            fontWeight: 500,
                          }}
                        >
                          &ldquo;{post.text}&rdquo;
                        </div>
                        {post.is_critical && (
                          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
                            <span className="badge badge-kritis">⚠️ Isu Kritis: {post.critical_reason || "Perlu Perhatian"}</span>
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="badge badge-secondary" style={{ fontSize: "0.74rem" }}>
                          {topicLabel(post.topic)}
                        </span>
                      </td>

                      <td>
                        <span className={`badge badge-${post.sentiment}`}>
                          {post.sentiment.toUpperCase()}
                        </span>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: 3 }}>
                          Skor: {post.sentiment_score > 0 ? `+${post.sentiment_score.toFixed(2)}` : post.sentiment_score.toFixed(2)}
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${post.spread_label === "viral" ? "badge-viral" : post.spread_label === "cepat" ? "badge-warning" : "badge-secondary"}`}>
                          {post.spread_label.toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                          <div>❤️ {post.likes.toLocaleString("id-ID")} Suka</div>
                          <div style={{ color: "var(--text-tertiary)", fontSize: "0.72rem" }}>
                            💬 {post.replies} balasan · 🔄 {post.shares} sebar
                          </div>
                        </div>
                      </td>

                      <td>
                        <div style={{ fontSize: "0.8rem", whiteSpace: "nowrap", color: "var(--text-secondary)" }}>
                          {formatWIB(post.created_at)}
                        </div>
                      </td>

                      <td style={{ textAlign: "right" }}>
                        <div style={{ display: "inline-flex", gap: 6 }}>
                          <Link
                            href="/replies"
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                            title="Tanggapi komentar ini melalui antrean Humas"
                          >
                            <MessageSquarePlus size={13} /> Tanggapi
                          </Link>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm"
                            style={{ padding: "4px 8px" }}
                            title="Buka postingan asli di tab baru"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
