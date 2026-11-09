"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MessageSquareReply,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Send,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Filter,
} from "lucide-react";
import {
  replyQueue as initialReplies,
  formatWIB,
  formatRelative,
  platformLabel,
  topicLabel,
  type ReplyQueueItem,
  type ReplyStatus,
  type Platform,
} from "@/lib/dummy-data";

export default function RepliesPage() {
  const [replies, setReplies] = useState<ReplyQueueItem[]>(initialReplies);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [editingReply, setEditingReply] = useState<ReplyQueueItem | null>(null);
  const [editText, setEditText] = useState("");
  const [guardStatus, setGuardStatus] = useState<"pass" | "warn" | "fail">("pass");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditingReply(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered replies
  const filtered = useMemo(() => {
    return replies.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (platformFilter !== "all" && r.platform !== platformFilter) return false;
      return true;
    });
  }, [replies, statusFilter, platformFilter]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: replies.length,
      pending: replies.filter((r) => r.status === "pending").length,
      approved: replies.filter((r) => r.status === "approved").length,
      needs_manual: replies.filter((r) => r.status === "needs_manual").length,
      sent: replies.filter((r) => r.status === "sent").length,
      escalated: replies.filter((r) => r.status === "escalated").length,
    };
  }, [replies]);

  // Actions
  const handleApprove = (id: number) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "approved",
              approved_by: "humas@brantas.co.id",
              approved_at: new Date(1793020800000).toISOString(),
            }
          : r
      )
    );
  };

  const handleReject = (id: number) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "cancelled" } : r
      )
    );
  };

  const handleEscalate = (id: number) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "escalated" } : r
      )
    );
  };

  const handleMarkPosted = (id: number) => {
    setReplies((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "sent",
              sent_at: new Date(1793020800000).toISOString(),
            }
          : r
      )
    );
  };

  const openEditModal = (reply: ReplyQueueItem) => {
    setEditingReply(reply);
    setEditText(reply.draft);
    setGuardStatus("pass");
  };

  const handleSaveEdit = () => {
    if (!editingReply) return;
    setReplies((prev) =>
      prev.map((r) =>
        r.id === editingReply.id ? { ...r, draft: editText } : r
      )
    );
    setEditingReply(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Persetujuan & Pengelolaan Draf Balasan</h1>
          <p className="page-subtitle">
            Tinjau dan setujui respon resmi Humas Brantas Abipraya terhadap komentar masyarakat di media sosial
          </p>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
            Menunggu Persetujuan
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-sedang)" }}>
            {counts.pending}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Perlu verifikasi tim Humas
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
            Disetujui (Siap Kirim)
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--brand-500)" }}>
            {counts.approved}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Menunggu jadwal penerbitan
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
            Posting Manual
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-viral)" }}>
            {counts.needs_manual}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Siap disalin langsung ke medsos
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
            Berhasil Diterbitkan
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-positif)" }}>
            {counts.sent}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Sudah tayang di akun resmi
          </div>
        </div>

        <div className="card" style={{ padding: "18px 20px" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
            Eskalasi ke Manajemen
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--color-negatif)" }}>
            {counts.escalated}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
            Isu butuh arahan pimpinan
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: 24,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        {/* Status Tabs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {[
            { id: "all", label: "Semua", count: counts.all },
            { id: "pending", label: "Menunggu", count: counts.pending },
            { id: "approved", label: "Disetujui", count: counts.approved },
            { id: "needs_manual", label: "Manual Post", count: counts.needs_manual },
            { id: "sent", label: "Terkirim", count: counts.sent },
            { id: "escalated", label: "Dieskalasi", count: counts.escalated },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`btn btn-sm ${statusFilter === tab.id ? "btn-primary" : "btn-ghost"}`}
              style={{
                borderRadius: "var(--radius-full)",
                fontSize: "0.85rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  background: statusFilter === tab.id ? "rgba(255,255,255,0.25)" : "var(--bg-tertiary)",
                  color: statusFilter === tab.id ? "white" : "var(--text-secondary)",
                  padding: "1px 7px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Platform Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="var(--text-tertiary)" />
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Platform:</span>
          <select
            className="input"
            style={{ width: 140, padding: "6px 10px", fontSize: "0.85rem" }}
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="all">Semua Platform</option>
            <option value="ig">Instagram</option>
            <option value="fb">Facebook</option>
            <option value="x">X (Twitter)</option>
            <option value="yt">YouTube</option>
          </select>
        </div>
      </div>

      {/* Reply Queue List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 48,
              textAlign: "center",
              color: "var(--text-secondary)",
            }}
          >
            <CheckCircle size={40} color="var(--color-positif)" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>Tidak ada antrean dalam filter ini</div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-tertiary)", marginTop: 4 }}>
              Semua percakapan publik sudah tertangani atau belum ada antrean baru.
            </p>
          </div>
        ) : (
          filtered.map((r) => {
            const isPending = r.status === "pending";
            const isManual = r.status === "needs_manual";
            const isApproved = r.status === "approved";
            const isSent = r.status === "sent";
            const isEscalated = r.status === "escalated";

            return (
              <div
                key={r.id}
                className="card"
                style={{ padding: 20 }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: 12,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className={`badge badge-${r.platform}`}>
                      {platformLabel(r.platform)}
                    </span>
                    <span className="badge badge-secondary" style={{ textTransform: "capitalize" }}>
                      {r.author_type}
                    </span>
                    <span className={`badge badge-${r.sentiment}`}>
                      {r.sentiment}
                    </span>
                    <span className="badge badge-secondary">
                      {topicLabel(r.topic)}
                    </span>
                    {r.is_critical && (
                      <span className="badge badge-kritis">
                        <AlertTriangle size={12} style={{ marginRight: 4 }} /> Isu Kritis
                      </span>
                    )}
                    {r.is_sensitive && (
                      <span className="badge badge-warning">Sensitif</span>
                    )}
                  </div>

                  {/* Status badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: isPending
                          ? "rgba(245, 158, 11, 0.15)"
                          : isApproved
                          ? "rgba(52, 120, 255, 0.15)"
                          : isManual
                          ? "rgba(139, 92, 246, 0.15)"
                          : isSent
                          ? "rgba(34, 197, 94, 0.15)"
                          : "rgba(239, 68, 68, 0.15)",
                        color: isPending
                          ? "var(--color-sedang)"
                          : isApproved
                          ? "var(--brand-500)"
                          : isManual
                          ? "#8b5cf6"
                          : isSent
                          ? "var(--color-positif)"
                          : "var(--color-negatif)",
                      }}
                    >
                      {r.status === "pending" && "Menunggu Persetujuan"}
                      {r.status === "approved" && "Disetujui"}
                      {r.status === "needs_manual" && "Posting Manual (X/YT)"}
                      {r.status === "sent" && "Terkirim"}
                      {r.status === "cancelled" && "Dibatalkan"}
                      {r.status === "escalated" && "Dieskalasi"}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-tertiary)" }}>
                      #{r.id}
                    </span>
                  </div>
                </div>

                {/* Comment and Draft Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 16,
                    marginBottom: 16,
                  }}
                >
                  {/* Left: Original comment */}
                  <div
                    style={{
                      background: "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      padding: 14,
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.75rem",
                        color: "var(--text-tertiary)",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>
                        Komentar Warga / Publik
                      </span>
                      <span>{formatRelative(r.created_at)}</span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--text-primary)",
                        lineHeight: 1.5,
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{r.comment_text}&rdquo;
                    </div>
                    <div style={{ marginTop: 10, textAlign: "right" }}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--brand-500)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          textDecoration: "none",
                        }}
                      >
                        Buka Postingan Asli <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Right: Draft Reply */}
                  <div
                    style={{
                      background: isPending
                        ? "rgba(52, 120, 255, 0.04)"
                        : "var(--bg-tertiary)",
                      borderRadius: "var(--radius-md)",
                      padding: 14,
                      border: isPending
                        ? "1px solid rgba(52, 120, 255, 0.3)"
                        : "1px solid var(--border-color)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.75rem",
                          marginBottom: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 600,
                            color: "var(--brand-500)",
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <MessageSquareReply size={14} /> Draf Balasan Humas Brantas
                        </span>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            color: "var(--color-positif)",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          <ShieldCheck size={13} /> Guard OK
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          color: r.draft ? "var(--text-primary)" : "var(--text-tertiary)",
                          lineHeight: 1.5,
                        }}
                      >
                        {r.draft || "(Tidak ada balasan bot - isu dialihkan ke penanganan manual Humas)"}
                      </div>
                    </div>

                    {/* Metadata footer */}
                    <div
                      style={{
                        marginTop: 12,
                        paddingTop: 8,
                        borderTop: "1px solid var(--border-color)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: "0.72rem",
                        color: "var(--text-tertiary)",
                        flexWrap: "wrap",
                        gap: 6,
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <Clock size={12} /> Jadwal Kirim: {formatWIB(r.scheduled_at)}
                      </span>
                      {r.approved_by && (
                        <span>Disetujui oleh: {r.approved_by}</span>
                      )}
                      {r.sent_at && (
                        <span style={{ color: "var(--color-positif)" }}>
                          Terkirim: {formatWIB(r.sent_at)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons Toolbar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {isPending && (
                    <>
                      <button
                        onClick={() => openEditModal(r)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <Edit3 size={14} /> Edit Draf
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: "var(--color-negatif)", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <XCircle size={14} /> Tolak
                      </button>
                      <button
                        onClick={() => handleEscalate(r.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--color-sedang)", display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <AlertTriangle size={14} /> Eskalasi ke Legal
                      </button>
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="btn btn-primary btn-sm"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
                      >
                        <CheckCircle size={14} /> Setujui & Jadwalkan
                      </button>
                    </>
                  )}

                  {isManual && (
                    <button
                      onClick={() => handleMarkPosted(r.id)}
                      className="btn btn-primary btn-sm"
                      style={{
                        background: "#8b5cf6",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <Send size={14} /> Konfirmasi Sudah Diposting
                    </button>
                  )}

                  {isApproved && (
                    <span style={{ fontSize: "0.8rem", color: "var(--brand-500)", fontStyle: "italic" }}>
                      Menunggu giliran eksekusi publisher Python...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Draft Modal */}
      {editingReply && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: 620,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                Edit Draf Balasan Humas
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingReply(null)}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
                marginBottom: 12,
                background: "var(--bg-tertiary)",
                padding: 10,
                borderRadius: "var(--radius-sm)",
              }}
            >
              <strong>Komentar Warga:</strong> &ldquo;{editingReply.comment_text}&rdquo;
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  marginBottom: 6,
                  color: "var(--text-secondary)",
                }}
              >
                Teks Draf Balasan:
              </label>
              <textarea
                className="input"
                rows={5}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  // Dynamic guard preview
                  if (e.target.value.toLowerCase().includes("kami janji") || e.target.value.length < 10) {
                    setGuardStatus("warn");
                  } else {
                    setGuardStatus("pass");
                  }
                }}
                style={{ width: "100%", resize: "vertical", fontSize: "0.9rem" }}
              />
            </div>

            {/* Guard Preview Card */}
            <div
              style={{
                background:
                  guardStatus === "pass"
                    ? "rgba(34, 197, 94, 0.1)"
                    : "rgba(245, 158, 11, 0.1)",
                border:
                  guardStatus === "pass"
                    ? "1px solid rgba(34, 197, 94, 0.3)"
                    : "1px solid rgba(245, 158, 11, 0.3)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8rem",
                color:
                  guardStatus === "pass"
                    ? "var(--color-positif)"
                    : "var(--color-sedang)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <ShieldCheck size={18} />
              <div>
                <strong>Pemeriksaan Guard Otomatis: </strong>
                {guardStatus === "pass"
                  ? "Lolos validasi (fakta terverifikasi KB, nada netral, bebas banned phrases)."
                  : "Perhatian: Hindari janji spesifik tanpa rujukan dokumen resmi."}
              </div>
            </div>

            {/* Modal actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => setEditingReply(null)}
              >
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveEdit}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <CheckCircle size={16} /> Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
