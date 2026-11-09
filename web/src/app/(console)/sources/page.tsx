"use client";

import { CheckCircle, AlertTriangle, Radio, Database, RefreshCw, ExternalLink } from "lucide-react";
import { collectorHealth, formatRelative, platformLabel, type Platform } from "@/lib/dummy-data";

export default function SourcesPage() {
  const totalNew = collectorHealth.reduce((s, c) => s + c.new_24h, 0);
  const totalErrors = collectorHealth.reduce((s, c) => s + c.errors_24h, 0);
  const healthyCount = collectorHealth.filter((c) => c.status === "healthy").length;

  const friendlyNames: Record<string, { title: string; desc: string }> = {
    instaloader_ig: {
      title: "Instagram Resmi & Komentar Publik",
      desc: "Memantau akun @brantasabipraya & mention proyek strategis nasional",
    },
    apify_fb: {
      title: "Facebook Fanspage & Grup Komunitas",
      desc: "Menyerap diskusi warga, testimoni lapangan, dan tanggapan publik",
    },
    rss_news: {
      title: "Media Massa & Portal Berita Nasional",
      desc: "Memantau Detik, Kompas, Bisnis, Antara, dan media lokal daerah proyek",
    },
    youtube: {
      title: "YouTube Video Liputan & Dokumentasi",
      desc: "Komentar pada video progres bendungan, jembatan, dan jalan tol",
    },
    x_scraper: {
      title: "Platform X (Twitter)",
      desc: "Deteksi keluhan cepat, trending topic, dan sentimen percakapan warganet",
    },
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Saluran Media yang Dimonitor</h1>
        <p className="page-subtitle">
          Status konektivitas pengumpulan data percakapan dari media sosial resmi dan portal berita publik
        </p>
      </div>

      <div className="page-content">
        {/* Summary KPIs */}
        <div className="grid-kpi" style={{ marginBottom: 24 }}>
          <div className="card kpi-card">
            <div className="card-header">
              <div>
                <span className="card-title">Saluran Terhubung Normal</span>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                  Koneksi aktif tanpa kendala
                </div>
              </div>
              <div className="kpi-icon-wrap" style={{ background: "rgba(16, 185, 129, 0.15)", color: "var(--color-positif)" }}>
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="card-body">
              <div className="card-value" style={{ color: "var(--color-positif)" }}>
                {healthyCount} <span style={{ fontSize: "1.1rem", color: "var(--text-tertiary)", fontWeight: 500 }}>/ {collectorHealth.length} Kanal</span>
              </div>
              <div className="kpi-trend up">
                <span>99.2% Uptime Sistem Monitoring</span>
              </div>
            </div>
          </div>

          <div className="card kpi-card">
            <div className="card-header">
              <div>
                <span className="card-title">Data Baru Masuk (24 Jam)</span>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                  Total komentar & berita diserap
                </div>
              </div>
              <div className="kpi-icon-wrap" style={{ background: "rgba(59, 130, 246, 0.15)", color: "var(--brand-500)" }}>
                <Database size={20} />
              </div>
            </div>
            <div className="card-body">
              <div className="card-value">
                +{totalNew.toLocaleString("id-ID")}
              </div>
              <div className="kpi-trend up">
                <span>Diperbarui otomatis tiap 5 menit</span>
              </div>
            </div>
          </div>

          <div className="card kpi-card">
            <div className="card-header">
              <div>
                <span className="card-title">Kanal Perlu Perhatian</span>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                  Saluran dijeda / butuh verifikasi
                </div>
              </div>
              <div className="kpi-icon-wrap" style={{ background: "rgba(245, 158, 11, 0.15)", color: "var(--color-sedang)" }}>
                <AlertTriangle size={20} />
              </div>
            </div>
            <div className="card-body">
              <div className="card-value" style={{ color: "var(--color-sedang)" }}>
                1 Saluran
              </div>
              <div className="kpi-trend flat">
                <span>Kanal X (Twitter) dijeda demi kepatuhan akun</span>
              </div>
            </div>
          </div>

          <div className="card kpi-card">
            <div className="card-header">
              <div>
                <span className="card-title">Frekuensi Sinkronisasi</span>
                <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                  Siklus penarikan data
                </div>
              </div>
              <div className="kpi-icon-wrap" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--color-viral)" }}>
                <RefreshCw size={20} />
              </div>
            </div>
            <div className="card-body">
              <div className="card-value">
                Tiap 5 Menit
              </div>
              <div className="kpi-trend up">
                <span>Otomatis berjalan 24/7</span>
              </div>
            </div>
          </div>
        </div>

        {/* Collector Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 16 }}>
          {collectorHealth.map((c) => {
            const meta = friendlyNames[c.collector] || {
              title: c.collector,
              desc: "Pengumpulan percakapan publik",
            };
            const isHealthy = c.status === "healthy";
            const isWarning = c.status === "warning";

            return (
              <div key={c.collector} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className={`badge badge-${c.platform}`}>{platformLabel(c.platform)}</span>
                      <span
                        className="badge"
                        style={{
                          background: isHealthy ? "rgba(16, 185, 129, 0.15)" : isWarning ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          color: isHealthy ? "var(--color-positif)" : isWarning ? "var(--color-sedang)" : "var(--color-negatif)",
                        }}
                      >
                        {isHealthy ? "Aktif Normal" : isWarning ? "Perlu Sinkronisasi" : "Terputus"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "var(--text-primary)" }}>
                      {meta.title}
                    </h3>
                  </div>

                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: isHealthy ? "var(--color-positif)" : isWarning ? "var(--color-sedang)" : "var(--color-negatif)",
                      boxShadow: `0 0 10px ${isHealthy ? "var(--color-positif)" : isWarning ? "var(--color-sedang)" : "var(--color-negatif)"}`,
                    }}
                  />
                </div>

                <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.45, marginBottom: 16 }}>
                  {meta.desc}
                </p>

                <div
                  style={{
                    background: "var(--bg-tertiary)",
                    padding: "12px 16px",
                    borderRadius: "var(--radius-md)",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginBottom: 2 }}>Data 24 Jam</div>
                    <div style={{ fontWeight: 800, fontSize: "1.15rem", color: "var(--text-primary)" }}>
                      +{c.new_24h}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginBottom: 2 }}>Kendala</div>
                    <div style={{ fontWeight: 800, fontSize: "1.15rem", color: c.errors_24h > 0 ? "var(--color-negatif)" : "var(--color-positif)" }}>
                      {c.errors_24h === 0 ? "Nihil" : `${c.errors_24h} kali`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginBottom: 2 }}>Terakhir Diambil</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)", marginTop: 4 }}>
                      {formatRelative(c.last_ok)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
