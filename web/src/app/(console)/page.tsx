"use client";

import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  MessageSquareReply,
  Clock,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Radio,
  FileCheck2,
  Sparkles,
} from "lucide-react";
import EChart from "@/components/EChart";
import {
  kpiData,
  issues,
  replyQueue,
  collectorHealth,
  formatRelative,
  topicLabel,
  platformLabel,
} from "@/lib/dummy-data";
import type { EChartsOption } from "echarts";

function KPICard({
  title,
  subtitle,
  value,
  prev,
  suffix,
  type,
  icon: Icon,
  delay,
}: {
  title: string;
  subtitle: string;
  value: number;
  prev?: number;
  suffix?: string;
  type: "volume" | "positif" | "negatif" | "netral" | "kritis";
  icon: React.ElementType;
  delay: number;
}) {
  const change = prev ? ((value - prev) / prev) * 100 : 0;
  const trend = change > 1 ? "up" : change < -1 ? "down" : "flat";

  // Visual halo styling based on type
  const typeStyles = {
    volume: {
      bg: "rgba(59, 130, 246, 0.12)",
      color: "var(--brand-500)",
      border: "rgba(59, 130, 246, 0.25)",
    },
    positif: {
      bg: "rgba(16, 185, 129, 0.12)",
      color: "var(--color-positif)",
      border: "rgba(16, 185, 129, 0.25)",
    },
    negatif: {
      bg: "rgba(244, 63, 94, 0.12)",
      color: "var(--color-negatif)",
      border: "rgba(244, 63, 94, 0.25)",
    },
    netral: {
      bg: "rgba(6, 182, 212, 0.12)",
      color: "#06b6d4",
      border: "rgba(6, 182, 212, 0.25)",
    },
    kritis: {
      bg: "rgba(239, 68, 68, 0.16)",
      color: "var(--color-kritis)",
      border: "rgba(239, 68, 68, 0.35)",
    },
  }[type];

  return (
    <div className={`card kpi-card animate-fade-in delay-${delay}`}>
      <div className="card-header">
        <div>
          <span className="card-title">{title}</span>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            {subtitle}
          </div>
        </div>
        <div
          className="kpi-icon-wrap"
          style={{
            background: typeStyles.bg,
            border: `1px solid ${typeStyles.border}`,
            color: typeStyles.color,
          }}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="card-body">
        <div className="card-value">
          {typeof value === "number" && !suffix ? value.toLocaleString("id-ID") : value}
          {suffix && <span style={{ fontSize: "1.1rem", marginLeft: 3, fontWeight: 600 }}>{suffix}</span>}
        </div>

        {prev !== undefined && (
          <div className={`kpi-trend ${trend}`}>
            {trend === "up" ? (
              <TrendingUp size={14} />
            ) : trend === "down" ? (
              <TrendingDown size={14} />
            ) : (
              <Minus size={14} />
            )}
            <span>
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}% dari kemarin
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const recentCritical = issues.filter((i) => i.is_critical).slice(0, 4);
  const pendingReplies = replyQueue.filter((r) => r.status === "pending").slice(0, 4);

  // Sentiment donut chart (high visual appeal for executives)
  const sentimentOption: EChartsOption = {
    tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
    legend: {
      bottom: 0,
      itemWidth: 12,
      itemHeight: 12,
      textStyle: { color: "var(--text-secondary)", fontSize: 11 },
    },
    color: ["#10b981", "#64748b", "#f43f5e"],
    series: [
      {
        type: "pie",
        radius: ["55%", "80%"],
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 8, borderColor: "var(--bg-card)", borderWidth: 3 },
        label: {
          show: true,
          position: "center",
          formatter: () => "85%\nPositif & Netral",
          fontSize: 13,
          fontWeight: "bold",
          color: "var(--text-primary)",
          lineHeight: 18,
        },
        data: [
          { value: kpiData.positif, name: "Positif" },
          { value: kpiData.netral, name: "Netral" },
          { value: kpiData.negatif, name: "Negatif" },
        ],
      },
    ],
  };

  // Platform distribution bar chart
  const platformOption: EChartsOption = {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 10, right: 10, top: 10, bottom: 25, containLabel: true },
    xAxis: {
      type: "category",
      data: ["Instagram", "Facebook", "X / Twitter", "YouTube", "Berita Online"],
      axisLabel: { fontSize: 11, color: "var(--text-secondary)" },
      axisLine: { lineStyle: { color: "var(--border-color)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "var(--text-tertiary)" },
      splitLine: { lineStyle: { color: "var(--border-color)" } },
    },
    series: [
      {
        type: "bar",
        barWidth: "45%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: (params: { dataIndex: number }) => {
            const colors = ["#ec4899", "#3b82f6", "#38bdf8", "#ef4444", "#64748b"];
            return colors[params.dataIndex % colors.length];
          },
        },
        data: [612, 428, 385, 234, 188],
      },
    ],
  };

  // 24h volume timeline
  const hourLabels = [
    "21:00", "23:00", "01:00", "03:00", "05:00", "07:00",
    "09:00", "11:00", "13:00", "15:00", "17:00", "19:00",
  ];

  const volumeOption: EChartsOption = {
    tooltip: { trigger: "axis" },
    grid: { left: 10, right: 10, top: 15, bottom: 25, containLabel: true },
    xAxis: {
      type: "category",
      data: hourLabels,
      axisLabel: { fontSize: 10, color: "var(--text-secondary)" },
      axisLine: { lineStyle: { color: "var(--border-color)" } },
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: "var(--text-tertiary)" },
      splitLine: { lineStyle: { color: "var(--border-color)" } },
    },
    series: [
      {
        type: "line",
        smooth: true,
        symbol: "none",
        lineStyle: { width: 3, color: "#3b82f6" },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(59, 130, 246, 0.35)" },
              { offset: 1, color: "rgba(59, 130, 246, 0.02)" },
            ],
          },
        },
        data: [42, 25, 18, 35, 68, 94, 120, 98, 128, 130, 95, 55],
      },
    ],
  };

  return (
    <>
      {/* Header Halaman */}
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-positif" style={{ fontSize: "0.72rem" }}>
                <CheckCircle2 size={12} /> Monitoring Realtime Aktif
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                PT Brantas Abipraya (Persero)
              </span>
            </div>
            <h1 className="page-title">Ringkasan Eksekutif Reputasi Digital</h1>
            <p className="page-subtitle">
              Analisis percakapan publik, sentimen masyarakat, dan kesiapan respon Humas dalam 24 jam terakhir
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--bg-card)",
              border: "1px solid var(--border-color)",
              padding: "8px 16px",
              borderRadius: "var(--radius-full)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <div
              className="animate-pulse-soft"
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "var(--color-positif)",
                boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)",
              }}
            />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text-secondary)" }}>
              Data Terkini: Pukul 21:00 WIB
            </span>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Executive Summary Banner (Khusus Direksi & Humas) */}
        <div className="executive-banner">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "var(--radius-md)",
                  background: "linear-gradient(135deg, var(--brand-500) 0%, var(--color-positif) 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-positif)" }}>
                    Kondisi Reputasi Hari Ini
                  </span>
                  <span className="badge badge-positif">STABIL & AMAN</span>
                </div>
                <div style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  85.2% Percakapan Masyarakat Bernada Positif & Netral
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Link href="/replies" className="btn btn-primary btn-sm">
                <FileCheck2 size={15} /> Review Draf Balasan (23)
              </Link>
              <Link href="/issues" className="btn btn-secondary btn-sm">
                Lihat 5 Isu Aktif <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-positif)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Sparkles size={14} /> Sorotan Positif Teratas
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                Apresiasi tinggi publik terhadap penyelesaian Bendungan Semantok & program CSR sarana sekolah di daerah proyek.
              </p>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--color-kritis)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={14} /> Perhatian Segera Humas
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                1 isu K3 (insiden kerja Margatiga) butuh persetujuan penerbitan draf klarifikasi resmi untuk meredam spekulasi.
              </p>
            </div>

            <div
              style={{
                background: "rgba(0, 0, 0, 0.2)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--brand-400)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <Clock size={14} /> Kecepatan Respons Tim
              </div>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", margin: 0, lineHeight: 1.4 }}>
                Rerata respon 2.4 jam (jauh di bawah batas SLA 4 jam). Sebanyak 67 tanggapan publik berhasil diselesaikan.
              </p>
            </div>
          </div>
        </div>

        {/* Baris Kartu Indikator Utama (KPI Cards) */}
        <div className="grid-kpi" style={{ marginBottom: 24 }}>
          <KPICard
            title="Total Pantauan"
            subtitle="Volume postingan & berita"
            value={kpiData.volume}
            prev={kpiData.volume_prev}
            type="volume"
            icon={Activity}
            delay={1}
          />
          <KPICard
            title="Sentimen Positif"
            subtitle="Apresiasi proyek & CSR"
            value={kpiData.positif}
            prev={kpiData.positif_prev}
            type="positif"
            icon={TrendingUp}
            delay={2}
          />
          <KPICard
            title="Sentimen Negatif"
            subtitle="Keluhan & isu lapangan"
            value={kpiData.negatif}
            prev={kpiData.negatif_prev}
            type="negatif"
            icon={TrendingDown}
            delay={3}
          />
          <KPICard
            title="Skor Citra Publik"
            subtitle="Net Sentiment menguat"
            value={kpiData.net_sentiment_score}
            prev={kpiData.net_sentiment_prev}
            suffix="%"
            type="positif"
            icon={ShieldCheck}
            delay={4}
          />
          <KPICard
            title="Isu Butuh Perhatian"
            subtitle="1 kritis, 2 besar, 2 sedang"
            value={kpiData.isu_kritis}
            prev={kpiData.isu_kritis_prev}
            type="kritis"
            icon={AlertTriangle}
            delay={5}
          />
          <KPICard
            title="Draf Siap Kirim"
            subtitle="Menunggu approval Humas"
            value={kpiData.reply_pending}
            type="netral"
            icon={MessageSquareReply}
            delay={6}
          />
          <KPICard
            title="Balasan Terbit"
            subtitle="Tanggapan selesai 24 jam"
            value={kpiData.reply_sent_24h}
            type="positif"
            icon={FileCheck2}
            delay={1}
          />
          <KPICard
            title="Kecepatan Respon"
            subtitle="Standar SLA < 4.0 jam"
            value={kpiData.avg_response_hours}
            suffix=" jam"
            type="netral"
            icon={Clock}
            delay={2}
          />
        </div>

        {/* Baris Grafik Analitik Visual */}
        <div className="grid-3col" style={{ marginBottom: 24 }}>
          <div className="card animate-fade-in delay-3">
            <div className="card-header">
              <div>
                <span className="card-title">Perbandingan Sentimen Publik</span>
                <span className="card-subtitle">Proporsi respon positif, netral, dan negatif</span>
              </div>
            </div>
            <div className="card-body">
              <EChart option={sentimentOption} height={230} />
            </div>
          </div>

          <div className="card animate-fade-in delay-4">
            <div className="card-header">
              <div>
                <span className="card-title">Saluran Media Paling Aktif</span>
                <span className="card-subtitle">Volume percakapan per kanal publikasi</span>
              </div>
            </div>
            <div className="card-body">
              <EChart option={platformOption} height={230} />
            </div>
          </div>

          <div className="card animate-fade-in delay-5">
            <div className="card-header">
              <div>
                <span className="card-title">Aktivitas Percakapan (24 Jam)</span>
                <span className="card-subtitle">Pola lonjakan interaksi warga per jam</span>
              </div>
            </div>
            <div className="card-body">
              <EChart option={volumeOption} height={230} />
            </div>
          </div>
        </div>

        {/* Baris Bawah: Isu Butuh Tindakan & Antrean Draf Balasan */}
        <div className="grid-2col" style={{ marginBottom: 24 }}>
          {/* Kolom Kiri: Isu Mendesak */}
          <div className="card animate-fade-in delay-3">
            <div className="card-header">
              <div>
                <span className="card-title">
                  <AlertTriangle size={18} style={{ color: "var(--color-kritis)" }} />
                  Isu Mendesak yang Perlu Perhatian
                </span>
                <span className="card-subtitle">Keluhan warga yang berpotensi eskalasi ke media</span>
              </div>
              <Link href="/issues" style={{ fontSize: "0.8rem", color: "var(--text-link)", fontWeight: 600, textDecoration: "none" }}>
                Semua Isu →
              </Link>
            </div>
            <div className="card-body" style={{ padding: "8px 0" }}>
              {recentCritical.map((issue) => (
                <div
                  key={issue.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 14,
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {issue.title}
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span className={`badge badge-${issue.scale === "krisis" ? "negatif" : "warning"}`}>
                        Skala: {issue.scale.toUpperCase()}
                      </span>
                      <span className="badge badge-secondary">{topicLabel(issue.topic)}</span>
                      {issue.is_sensitive && <span className="badge badge-viral">Isu Sensitif</span>}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)" }}>
                      {issue.post_count} Postingan
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      {formatRelative(issue.last_seen)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Kolom Kanan: Draf Balasan Siap Kirim */}
          <div className="card animate-fade-in delay-4">
            <div className="card-header">
              <div>
                <span className="card-title">
                  <MessageSquareReply size={18} style={{ color: "var(--brand-500)" }} />
                  Draf Balasan Humas Siap Kirim
                </span>
                <span className="card-subtitle">Komentar publik yang telah disiapkan respons resminya</span>
              </div>
              <Link href="/replies" style={{ fontSize: "0.8rem", color: "var(--text-link)", fontWeight: 600, textDecoration: "none" }}>
                Semua Draf →
              </Link>
            </div>
            <div className="card-body" style={{ padding: "8px 0" }}>
              {pendingReplies.map((reply) => (
                <div
                  key={reply.id}
                  style={{
                    padding: "14px 20px",
                    borderBottom: "1px solid var(--border-color)",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-card-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span className={`badge badge-${reply.platform}`}>
                        {platformLabel(reply.platform)}
                      </span>
                      <span className={`badge badge-${reply.sentiment === "negatif" ? "negatif" : reply.sentiment === "positif" ? "positif" : "netral"}`}>
                        {reply.sentiment}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                      {formatRelative(reply.created_at)}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--text-secondary)",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      marginBottom: 4,
                      fontStyle: "italic",
                    }}
                  >
                    Warga: &ldquo;{reply.comment_text}&rdquo;
                  </div>

                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--brand-400)",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    Draf Respon: {reply.draft}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Saluran Monitoring Terhubung */}
        <div className="card animate-fade-in delay-5">
          <div className="card-header">
            <div>
              <span className="card-title">
                <Radio size={18} style={{ color: "var(--color-positif)" }} />
                Status Saluran Media yang Dimonitor
              </span>
              <span className="card-subtitle">Koneksi pengumpulan data dari seluruh platform digital</span>
            </div>
            <Link href="/sources" style={{ fontSize: "0.8rem", color: "var(--text-link)", fontWeight: 600, textDecoration: "none" }}>
              Kelola Saluran →
            </Link>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 12 }}>
              {collectorHealth.map((c) => (
                <div
                  key={c.collector}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--bg-tertiary)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background:
                          c.status === "healthy"
                            ? "var(--color-positif)"
                            : c.status === "warning"
                            ? "var(--color-sedang)"
                            : "var(--color-negatif)",
                        boxShadow: `0 0 8px ${
                          c.status === "healthy"
                            ? "var(--color-positif)"
                            : c.status === "warning"
                            ? "var(--color-sedang)"
                            : "var(--color-negatif)"
                        }`,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>
                        {platformLabel(c.platform)}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>
                        {c.status === "healthy" ? "Aktif Normal" : "Perlu Sinkronisasi"}
                      </div>
                    </div>
                  </div>

                  <span className="badge badge-secondary" style={{ fontSize: "0.72rem" }}>
                    +{c.new_24h} data
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
