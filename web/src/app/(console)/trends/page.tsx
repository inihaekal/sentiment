"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Zap,
  Target,
  ArrowUpRight,
  ShieldAlert,
  HelpCircle,
} from "lucide-react";
import EChart from "@/components/EChart";
import { trends as initialTrends, type Trend, type TrendClassification } from "@/lib/dummy-data";
import type { EChartsOption } from "echarts";

export default function TrendsPage() {
  const [trends] = useState<Trend[]>(initialTrends);
  const [classFilter, setClassFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return trends.filter((t) => {
      if (classFilter !== "all" && t.classification !== classFilter) return false;
      return true;
    });
  }, [trends, classFilter]);

  const topRisiko = useMemo(() => {
    return trends
      .filter((t) => t.classification === "risiko")
      .sort((a, b) => b.velocity_z - a.velocity_z)
      .slice(0, 3);
  }, [trends]);

  const topPeluang = useMemo(() => {
    return trends
      .filter((t) => t.classification === "peluang")
      .sort((a, b) => b.velocity_z - a.velocity_z)
      .slice(0, 3);
  }, [trends]);

  // ECharts Scatter Plot: Velocity Z vs Relevance
  const scatterOption: EChartsOption = {
    tooltip: {
      trigger: "item",
      formatter: (params: unknown) => {
        const p = params as { data: (number | string)[]; seriesName: string };
        return `
          <div style="font-weight:700; margin-bottom:4px">${p.data[3]}</div>
          <div>Velocity Z-Score: <strong>${p.data[0]}σ</strong></div>
          <div>Relevansi Brantas: <strong>${((p.data[1] as number) * 100).toFixed(0)}%</strong></div>
          <div>Sentimen: <strong>${p.data[2]}</strong></div>
        `;
      },
    },
    grid: { left: 45, right: 30, top: 30, bottom: 45 },
    xAxis: {
      type: "value",
      name: "Velocity Z-Score (σ)",
      nameLocation: "center",
      nameGap: 30,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    },
    yAxis: {
      type: "value",
      name: "Relevansi Brantas",
      min: 0.5,
      max: 1.0,
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.06)" } },
    },
    series: [
      {
        name: "Risiko",
        type: "scatter",
        symbolSize: (data: number[]) => Math.abs(data[0]) * 7 + 12,
        data: trends
          .filter((t) => t.classification === "risiko")
          .map((t) => [t.velocity_z, t.relevance, t.avg_sentiment, t.term]),
        itemStyle: { color: "#ef4444", shadowBlur: 10, shadowColor: "rgba(239, 68, 68, 0.4)" },
        label: {
          show: true,
          formatter: (p: unknown) => (p as { data: (number | string)[] }).data[3] as string,
          position: "top",
          fontSize: 11,
          color: "var(--text-secondary)",
        },
      },
      {
        name: "Peluang",
        type: "scatter",
        symbolSize: (data: number[]) => Math.abs(data[0]) * 7 + 12,
        data: trends
          .filter((t) => t.classification === "peluang")
          .map((t) => [t.velocity_z, t.relevance, t.avg_sentiment, t.term]),
        itemStyle: { color: "#22c55e", shadowBlur: 10, shadowColor: "rgba(34, 197, 94, 0.4)" },
        label: {
          show: true,
          formatter: (p: unknown) => (p as { data: (number | string)[] }).data[3] as string,
          position: "top",
          fontSize: 11,
          color: "var(--text-secondary)",
        },
      },
      {
        name: "Netral",
        type: "scatter",
        symbolSize: (data: number[]) => Math.abs(data[0]) * 7 + 12,
        data: trends
          .filter((t) => t.classification === "netral")
          .map((t) => [t.velocity_z, t.relevance, t.avg_sentiment, t.term]),
        itemStyle: { color: "#64748b" },
        label: {
          show: true,
          formatter: (p: unknown) => (p as { data: (number | string)[] }).data[3] as string,
          position: "top",
          fontSize: 11,
          color: "var(--text-secondary)",
        },
      },
    ],
    legend: { bottom: 0, textStyle: { fontSize: 12 } },
  };

  const getActionRecommendation = (t: Trend) => {
    if (t.classification === "risiko") {
      if (t.velocity_z > 4.0) {
        return "Eskalasi darurat ke Tim Krisis Humas & siapkan rilis klarifikasi fakta dalam 2 jam.";
      }
      return "Pantau ketat perkembangan percakapan & siapkan dokumen rujukan KB terkait.";
    }
    if (t.classification === "peluang") {
      if (t.velocity_z > 3.0) {
        return "Amplifikasi konten positif melalui format carousel IG dan video reels dokumentasi.";
      }
      return "Dorong interaksi organik dengan membalas apresiasi publik di kolom komentar.";
    }
    return "Pertahankan monitoring standar tanpa intervensi aktif.";
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trend Radar & Deteksi Percakapan</h1>
          <p className="page-subtitle">
            Deteksi dini lonjakan topik (Velocity Z-Score) dan klasifikasi peluang vs risiko reputasi Brantas Abipraya
          </p>
        </div>
      </div>

      {/* KPI Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Istilah Terpantau
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {trends.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Cluster topik 24 jam terakhir
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Tren Risiko Reputasi
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-negatif)" }}>
            {trends.filter((t) => t.classification === "risiko").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Perlu atensi proaktif Humas
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Peluang Amplifikasi
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-positif)" }}>
            {trends.filter((t) => t.classification === "peluang").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Sentimen positif & relevan
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Kecepatan Sebar Puncak
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-sedang)" }}>
            +5.1σ
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Topik: &ldquo;dugaan korupsi&rdquo;
          </div>
        </div>
      </div>

      {/* Top 3 Risiko vs Top 3 Peluang (Section 11.1 Requirement) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: 20,
          marginBottom: 24,
        }}
      >
        {/* 3 Tren Risiko */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--color-negatif)",
              marginBottom: 16,
            }}
          >
            <ShieldAlert size={20} /> Top 3 Tren Risiko Hari Ini
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topRisiko.map((t, idx) => (
              <div
                key={t.id}
                style={{
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {idx + 1}. {t.term}
                  </div>
                  <span className="badge badge-kritis">+{t.velocity_z}σ Velocity</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Relevansi: <strong>{((t.relevance) * 100).toFixed(0)}%</strong> • Sentimen Rata-rata:{" "}
                  <strong style={{ color: "var(--color-negatif)" }}>{t.avg_sentiment}</strong>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-negatif)",
                    background: "rgba(239,68,68,0.1)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <strong>Saran Humas:</strong> {getActionRecommendation(t)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Tren Peluang */}
        <div className="card" style={{ padding: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--color-positif)",
              marginBottom: 16,
            }}
          >
            <Sparkles size={20} /> Top 3 Tren Peluang Hari Ini
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {topPeluang.map((t, idx) => (
              <div
                key={t.id}
                style={{
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text-primary)" }}>
                    {idx + 1}. {t.term}
                  </div>
                  <span className="badge badge-positif">+{t.velocity_z}σ Velocity</span>
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: 6 }}>
                  Relevansi: <strong>{((t.relevance) * 100).toFixed(0)}%</strong> • Sentimen Rata-rata:{" "}
                  <strong style={{ color: "var(--color-positif)" }}>+{t.avg_sentiment}</strong>
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "var(--color-positif)",
                    background: "rgba(34,197,94,0.1)",
                    padding: "6px 10px",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <strong>Saran Humas:</strong> {getActionRecommendation(t)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Radar Scatter Plot */}
      <div className="card" style={{ padding: 20, marginBottom: 24 }}>
        <div className="card-header" style={{ marginBottom: 12 }}>
          <div>
            <h2 className="card-title">Matriks Radar: Kecepatan Lonjakan vs Relevansi Kata Kunci</h2>
            <p className="card-subtitle">
              Sumbu X merepresentasikan z-score lonjakan percakapan terhadap baseline 14 hari. Sumbu Y adalah kemiripan embedding lingkup Brantas.
            </p>
          </div>
        </div>
        <EChart option={scatterOption} height={360} />
      </div>

      {/* Detailed Table */}
      <div className="card" style={{ padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <h2 className="card-title">Daftar Istilah & Entitas Terdeteksi</h2>
            <p className="card-subtitle">Total {filtered.length} istilah terklasifikasi</p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {[
              { id: "all", label: "Semua" },
              { id: "risiko", label: "Risiko" },
              { id: "peluang", label: "Peluang" },
              { id: "netral", label: "Netral" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setClassFilter(tab.id)}
                className={`btn btn-sm ${classFilter === tab.id ? "btn-primary" : "btn-ghost"}`}
                style={{ borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th>Istilah / Topik</th>
                <th>Klasifikasi</th>
                <th>Velocity Z-Score</th>
                <th>Relevansi Brantas</th>
                <th>Rata-rata Sentimen</th>
                <th>Saran Tindakan Humas</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.term}</td>
                  <td>
                    {t.classification === "risiko" && (
                      <span className="badge badge-kritis">Risiko</span>
                    )}
                    {t.classification === "peluang" && (
                      <span className="badge badge-positif">Peluang</span>
                    )}
                    {t.classification === "netral" && (
                      <span className="badge badge-secondary">Netral</span>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>+{t.velocity_z}σ</span>
                      <div
                        style={{
                          width: 40,
                          height: 6,
                          background: "var(--bg-tertiary)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, (t.velocity_z / 5.5) * 100)}%`,
                            height: "100%",
                            background:
                              t.classification === "risiko"
                                ? "var(--color-negatif)"
                                : t.classification === "peluang"
                                ? "var(--color-positif)"
                                : "var(--brand-500)",
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td>{((t.relevance) * 100).toFixed(0)}%</td>
                  <td>
                    <span
                      style={{
                        fontWeight: 600,
                        color:
                          t.avg_sentiment < 0
                            ? "var(--color-negatif)"
                            : t.avg_sentiment > 0
                            ? "var(--color-positif)"
                            : "var(--text-secondary)",
                      }}
                    >
                      {t.avg_sentiment > 0 ? `+${t.avg_sentiment}` : t.avg_sentiment}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem", maxWidth: 280 }}>
                    {getActionRecommendation(t)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
