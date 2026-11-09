"use client";

import { useState, useMemo } from "react";
import {
  Lightbulb,
  CheckCircle,
  XCircle,
  Copy,
  Clock,
  Sparkles,
  Share2,
  Calendar,
} from "lucide-react";
import {
  contentSuggestions as initialSuggestions,
  formatWIB,
  topicLabel,
  type ContentSuggestion,
  type SuggestionKind,
} from "@/lib/dummy-data";

export default function ContentPage() {
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>(initialSuggestions);
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return suggestions.filter((s) => {
      if (kindFilter !== "all" && s.kind !== kindFilter) return false;
      return true;
    });
  }, [suggestions, kindFilter]);

  const handleApprove = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "approved" } : s))
    );
  };

  const handleReject = (id: number) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: "rejected" } : s))
    );
  };

  const copyCaption = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const kindBadge = (k: SuggestionKind) => {
    switch (k) {
      case "peluang":
        return <span className="badge badge-positif">Peluang Amplifikasi</span>;
      case "klarifikasi":
        return <span className="badge badge-warning">Klarifikasi Fakta</span>;
      case "evergreen":
        return <span className="badge badge-secondary">Edukasi Evergreen</span>;
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Saran Konten & Rekomendasi Humas</h1>
          <p className="page-subtitle">
            Rekomendasi proaktif berbasis analisis sentimen, Trend Radar, dan rujukan Knowledge Base resmi
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
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
            Total Saran Dihasilkan
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--brand-500)" }}>
            {suggestions.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Otomatis dibuat oleh LLM lokal
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Menunggu Review Humas
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-sedang)" }}>
            {suggestions.filter((s) => s.status === "proposed").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Perlu persetujuan staf
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Disetujui untuk Produksi
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-positif)" }}>
            {suggestions.filter((s) => s.status === "approved").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Siap diterbitkan tim media
          </div>
        </div>

        <div className="card" style={{ padding: "16px 20px" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 4 }}>
            Sudah Diposting
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)" }}>
            {suggestions.filter((s) => s.status === "posted").length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Telah tayang di akun resmi
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          marginBottom: 24,
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        {[
          { id: "all", label: "Semua Kategori" },
          { id: "peluang", label: "Peluang Amplifikasi" },
          { id: "klarifikasi", label: "Klarifikasi Narasi" },
          { id: "evergreen", label: "Konten Evergreen" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setKindFilter(tab.id)}
            className={`btn btn-sm ${kindFilter === tab.id ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "var(--radius-full)", fontSize: "0.85rem" }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestion Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: 20 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: "center", color: "var(--text-tertiary)", gridColumn: "1 / -1" }}>
            Tidak ada saran konten dalam kategori ini.
          </div>
        ) : (
          filtered.map((s) => {
            const isProposed = s.status === "proposed";
            const isApproved = s.status === "approved";
            const isPosted = s.status === "posted";
            const isRejected = s.status === "rejected";

            return (
              <div
                key={s.id}
                className="card"
                style={{
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
              <div>
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {kindBadge(s.kind)}
                    <span className="badge badge-secondary">{topicLabel(s.topic)}</span>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        background: "var(--bg-tertiary)",
                        borderRadius: "var(--radius-sm)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      Format: {s.format}
                    </span>
                  </div>

                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: "var(--radius-full)",
                      background: isApproved
                        ? "rgba(34, 197, 94, 0.15)"
                        : isProposed
                        ? "rgba(245, 158, 11, 0.15)"
                        : isPosted
                        ? "rgba(52, 120, 255, 0.15)"
                        : "rgba(239, 68, 68, 0.15)",
                      color: isApproved
                        ? "var(--color-positif)"
                        : isProposed
                        ? "var(--color-sedang)"
                        : isPosted
                        ? "var(--brand-500)"
                        : "var(--color-negatif)",
                    }}
                  >
                    {isProposed && "Menunggu Review"}
                    {isApproved && "Disetujui"}
                    {isPosted && "Sudah Diposting"}
                    {isRejected && "Ditolak"}
                  </span>
                </div>

                {/* AI Rationale */}
                <div
                  style={{
                    background: "rgba(52, 120, 255, 0.05)",
                    border: "1px solid rgba(52, 120, 255, 0.2)",
                    borderRadius: "var(--radius-md)",
                    padding: "10px 14px",
                    marginBottom: 14,
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} color="var(--brand-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <strong style={{ color: "var(--brand-500)" }}>Alasan Rekomendasi: </strong>
                    {s.rationale}
                  </div>
                </div>

                {/* Caption draft */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      Draf Konten & Caption:
                    </span>
                    <button
                      onClick={() => copyCaption(s.id, s.caption_draft)}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                    >
                      {copiedId === s.id ? (
                        <span style={{ color: "var(--color-positif)", display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle size={12} /> Tersalin!
                        </span>
                      ) : (
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Copy size={12} /> Salin Teks
                        </span>
                      )}
                    </button>
                  </div>
                  <div
                    style={{
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      padding: 12,
                      fontSize: "0.85rem",
                      lineHeight: 1.5,
                      color: "var(--text-primary)",
                      whiteSpace: "pre-wrap",
                      maxHeight: 220,
                      overflowY: "auto",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    {s.caption_draft}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.75rem",
                    color: "var(--text-tertiary)",
                    paddingTop: 10,
                    borderTop: "1px solid var(--border-color)",
                    marginBottom: 12,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={13} /> Waktu Tayang Optimal: {formatWIB(s.suggested_time)}
                  </span>
                  <span>ID #{s.id}</span>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  {isProposed && (
                    <>
                      <button
                        onClick={() => handleReject(s.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--color-negatif)" }}
                      >
                        <XCircle size={14} style={{ marginRight: 4 }} /> Tolak
                      </button>
                      <button
                        onClick={() => handleApprove(s.id)}
                        className="btn btn-primary btn-sm"
                      >
                        <CheckCircle size={14} style={{ marginRight: 4 }} /> Setujui Konten
                      </button>
                    </>
                  )}
                  {isApproved && (
                    <button
                      onClick={() =>
                        setSuggestions((prev) =>
                          prev.map((item) =>
                            item.id === s.id ? { ...item, status: "posted" } : item
                          )
                        )
                      }
                      className="btn btn-secondary btn-sm"
                    >
                      <Share2 size={14} style={{ marginRight: 4 }} /> Tandai Sudah Diposting
                    </button>
                  )}
                  {isPosted && (
                    <span style={{ fontSize: "0.8rem", color: "var(--color-positif)", display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={14} /> Selesai Diterbitkan
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        }))}
      </div>
    </>
  );
}
