"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck, CheckCircle2, Clock, MessageSquarePlus, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  issues,
  issueMatrixData,
  formatWIB,
  formatRelative,
  topicLabel,
} from "@/lib/dummy-data";
import EChart from "@/components/EChart";
import type { EChartsOption } from "echarts";

export default function IssuesPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = issues.filter((i) => statusFilter === "all" || i.status === statusFilter);

  // Issue matrix scatter/bubble
  const matrixOption: EChartsOption = {
    tooltip: {
      formatter: (params: unknown) => {
        const p = params as { data: [string, string, number, boolean] };
        return `
          <div style="font-weight:700; margin-bottom:4px">Klaster Isu</div>
          <div>Tingkat Dampak: <strong>${["Kecil", "Sedang", "Besar", "Krisis"][Number(p.data[0])]}</strong></div>
          <div>Sensitivitas Isu: <strong>${p.data[1] ? "Tinggi (Sensitif)" : "Standar"}</strong></div>
          <div>Jumlah Isu Aktif: <strong>${p.data[2]} Isu</strong></div>
        `;
      },
    },
    grid: { left: 80, right: 30, top: 30, bottom: 40 },
    xAxis: {
      type: "category",
      data: ["Kecil", "Sedang", "Besar", "Krisis"],
      name: "Tingkat Dampak",
      nameLocation: "center",
      nameGap: 26,
      axisLabel: { fontSize: 11, color: "var(--text-secondary)" },
      axisLine: { lineStyle: { color: "var(--border-color)" } },
    },
    yAxis: {
      type: "category",
      data: ["Standar", "Sensitif Tinggi"],
      name: "Sensitivitas",
      axisLabel: { fontSize: 11, color: "var(--text-secondary)" },
      splitLine: { lineStyle: { color: "var(--border-color)" } },
    },
    series: [
      {
        name: "Isu Kritis (Perlu Aksi Segera)",
        type: "scatter",
        symbolSize: (val: number[]) => Math.sqrt(val[2]) * 8 + 14,
        data: issueMatrixData
          .filter((d) => d.is_critical)
          .map((d) => {
            const x = ["kecil", "sedang", "besar", "krisis"].indexOf(d.scale);
            const y = d.is_sensitive ? 1 : 0;
            return [x, y, d.n, 1];
          }),
        itemStyle: { color: "#ef4444", shadowBlur: 10, shadowColor: "rgba(239,68,68,0.4)" },
        label: { show: true, formatter: (p: unknown) => `${(p as { data: number[] }).data[2]}`, fontSize: 11, fontWeight: 700, color: "#fff" },
      },
      {
        name: "Isu Standar (Monitoring Rutin)",
        type: "scatter",
        symbolSize: (val: number[]) => Math.sqrt(val[2]) * 6 + 12,
        data: issueMatrixData
          .filter((d) => !d.is_critical)
          .map((d) => {
            const x = ["kecil", "sedang", "besar", "krisis"].indexOf(d.scale);
            const y = d.is_sensitive ? 1 : 0;
            return [x, y, d.n, 0];
          }),
        itemStyle: { color: "#3b82f6", shadowBlur: 8, shadowColor: "rgba(59,130,246,0.3)" },
        label: { show: true, formatter: (p: unknown) => `${(p as { data: number[] }).data[2]}`, fontSize: 11, fontWeight: 600, color: "#fff" },
      },
    ],
    legend: { bottom: 0, textStyle: { color: "var(--text-secondary)", fontSize: 11 } },
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Radar Isu & Keluhan Publik</h1>
        <p className="page-subtitle">
          Sistem deteksi dini percakapan berisiko, penanganan insiden lapangan, dan status koordinasi Humas dengan unit kerja
        </p>
      </div>

      <div className="page-content">
        {/* Peta Persebaran Risiko */}
        <div className="card animate-fade-in delay-1" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div>
              <span className="card-title">Peta Persebaran Risiko Isu (Dampak vs Sensitivitas)</span>
              <span className="card-subtitle">Semakin ke kanan atas, semakin mendesak memerlukan intervensi komunikasi</span>
            </div>
          </div>
          <div className="card-body">
            <EChart option={matrixOption} height={260} />
          </div>
        </div>

        {/* Filter Tab Status Penanganan */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
          {[
            { id: "all", label: "Semua Isu", count: issues.length },
            { id: "open", label: "Butuh Tanggapan Segera", count: issues.filter((i) => i.status === "open").length, color: "var(--color-kritis)" },
            { id: "in_progress", label: "Sedang Ditangani", count: issues.filter((i) => i.status === "in_progress").length, color: "var(--color-sedang)" },
            { id: "resolved", label: "Selesai / Terkendali", count: issues.filter((i) => i.status === "resolved").length, color: "var(--color-positif)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? "btn-primary" : "btn-secondary"}`}
              style={{
                borderRadius: "var(--radius-full)",
                fontSize: "0.82rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: statusFilter === tab.id ? "rgba(255,255,255,0.25)" : "var(--bg-tertiary)",
                  color: statusFilter === tab.id ? "white" : tab.color || "var(--text-secondary)",
                  padding: "2px 7px",
                  borderRadius: "var(--radius-full)",
                  fontWeight: 700,
                  fontSize: "0.72rem",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Daftar Isu */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)" }}>
              Tidak ada isu yang sesuai dengan kategori filter yang dipilih.
            </div>
          ) : (
            filtered.map((issue) => {
              const isCrit = issue.is_critical;
              const isResolved = issue.status === "resolved";
              const isInProg = issue.status === "in_progress";

              return (
                <div
                  key={issue.id}
                  className="card"
                  style={{
                    padding: 22,
                    borderLeft: isCrit ? "4px solid var(--color-kritis)" : isInProg ? "4px solid var(--color-sedang)" : "4px solid var(--color-positif)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <span
                          className="badge"
                          style={{
                            background: isResolved ? "rgba(16, 185, 129, 0.15)" : isInProg ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)",
                            color: isResolved ? "var(--color-positif)" : isInProg ? "var(--color-sedang)" : "var(--color-negatif)",
                            border: `1px solid ${isResolved ? "var(--color-positif-border)" : isInProg ? "var(--color-sedang-border)" : "var(--color-kritis-border)"}`,
                            fontWeight: 700,
                          }}
                        >
                          {isResolved ? "SELESAI DITANGGAPI" : isInProg ? "SEDANG DITANGANI" : "BUTUH TANGGAPAN"}
                        </span>

                        <span className={`badge ${issue.scale === "krisis" ? "badge-kritis" : issue.scale === "besar" ? "badge-warning" : "badge-secondary"}`}>
                          Dampak: {issue.scale.toUpperCase()}
                        </span>

                        <span className="badge badge-secondary">{topicLabel(issue.topic)}</span>
                        {issue.is_sensitive && <span className="badge badge-viral">Sensitifitas Tinggi</span>}
                      </div>

                      <h3 style={{ fontSize: "1.08rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>
                        {issue.title}
                      </h3>

                      <p style={{ fontSize: "0.86rem", color: "var(--text-secondary)", lineHeight: 1.55, margin: "0 0 14px" }}>
                        {issue.summary}
                      </p>

                      <div style={{ display: "flex", gap: 18, fontSize: "0.8rem", color: "var(--text-tertiary)", flexWrap: "wrap" }}>
                        {issue.owner_unit && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--text-secondary)", fontWeight: 600 }}>
                            <UserCheck size={14} color="var(--brand-500)" />
                            Unit Kerja: {issue.owner_unit}
                          </span>
                        )}
                        {issue.ticket_ref && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            Tiket: <code>{issue.ticket_ref}</code>
                          </span>
                        )}
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={14} />
                          Terpantau: {formatWIB(issue.first_seen)}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                      <div>
                        <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>
                          {issue.post_count}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)", marginTop: 2 }}>
                          Total Percakapan Warga
                        </div>
                        <div
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 700,
                            color: issue.neg_ratio > 0.7 ? "var(--color-negatif)" : "var(--color-sedang)",
                            marginTop: 4,
                          }}
                        >
                          {Math.round(issue.neg_ratio * 100)}% Keluhan Negatif
                        </div>
                      </div>

                      <Link href="/replies" className="btn btn-primary btn-sm" style={{ fontSize: "0.78rem" }}>
                        <MessageSquarePlus size={14} /> Siapkan Balasan Humas
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
