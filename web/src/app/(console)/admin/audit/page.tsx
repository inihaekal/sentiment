"use client";

import { useState, useMemo, useEffect } from "react";
import {
  ClipboardList,
  Search,
  Filter,
  User,
  Clock,
  Code,
  Shield,
  Eye,
} from "lucide-react";
import {
  auditLog as initialLogs,
  formatWIB,
  type AuditEntry,
} from "@/lib/dummy-data";

export default function AuditPage() {
  const [logs] = useState<AuditEntry[]>(initialLogs);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [selectedPayload, setSelectedPayload] = useState<{
    id: number;
    action: string;
    target: string;
    payload: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedPayload(null);
      }
    };
    if (selectedPayload) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedPayload]);

  const filtered = useMemo(() => {
    return logs.filter((log) => {
      if (actionFilter !== "all" && log.action !== actionFilter) return false;
      if (
        search &&
        !log.actor.toLowerCase().includes(search.toLowerCase()) &&
        !log.target.toLowerCase().includes(search.toLowerCase()) &&
        !log.action.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [logs, search, actionFilter]);

  const actionBadge = (action: string) => {
    if (action.includes("approved")) {
      return <span className="badge badge-positif">{action}</span>;
    }
    if (action.includes("flag") || action.includes("escalated")) {
      return <span className="badge badge-warning">{action}</span>;
    }
    if (action.includes("edited") || action.includes("role")) {
      return <span className="badge badge-secondary">{action}</span>;
    }
    return <span className="badge badge-secondary">{action}</span>;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Audit Log & Rekam Jejak Sistem</h1>
          <p className="page-subtitle">
            Catatan permanen setiap mutasi data, persetujuan Humas, perubahan peran, dan aktivasi flag sistem
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div
        className="card"
        style={{
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
        }}
      >
        <div style={{ position: "relative", minWidth: 280 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-tertiary)",
            }}
          />
          <input
            type="text"
            className="input"
            placeholder="Cari aktor, aksi, atau target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: "100%", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Filter size={16} color="var(--text-tertiary)" />
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Aksi:</span>
          <select
            className="input"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            style={{ width: 180, padding: "6px 10px", fontSize: "0.85rem" }}
          >
            <option value="all">Semua Aksi</option>
            <option value="reply_approved">reply_approved</option>
            <option value="reply_edited">reply_edited</option>
            <option value="reply_escalated">reply_escalated</option>
            <option value="reply_sent">reply_sent</option>
            <option value="flag_changed">flag_changed</option>
            <option value="user_role_changed">user_role_changed</option>
            <option value="kb_doc_approved">kb_doc_approved</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th>Waktu (WIB)</th>
                <th>Aktor (Pelaksana)</th>
                <th>Tindakan (Action)</th>
                <th>Target Entitas</th>
                <th>Detail Perubahan</th>
                <th style={{ textAlign: "right" }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-tertiary)" }}>
                    Tidak ada entri log audit yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                      {formatWIB(entry.ts)}
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <User size={14} color="var(--brand-500)" />
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {entry.actor}
                        </span>
                      </div>
                    </td>
                    <td>{actionBadge(entry.action)}</td>
                    <td>
                      <code
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          background: "var(--bg-tertiary)",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {entry.target}
                      </code>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.8rem", maxWidth: 260 }}>
                      {entry.action === "reply_approved" && "Menyetujui balasan untuk komentar warga"}
                      {entry.action === "flag_changed" && `Mengubah status flag ke ${entry.payload.to}`}
                      {entry.action === "reply_edited" && "Mengubah teks draf balasan resmi"}
                      {entry.action === "reply_escalated" && `Eskalasi: ${entry.payload.reason}`}
                      {entry.action === "reply_sent" && "Penerbitan balasan berhasil ke platform"}
                      {entry.action === "user_role_changed" && `Peran diubah dari ${entry.payload.from} ke ${entry.payload.to}`}
                      {entry.action === "kb_doc_approved" && `Menyetujui dokumen KB: ${entry.payload.title}`}
                      {entry.action === "login" && "Login ke web console"}
                      {entry.action === "issue_updated" && "Memperbarui status tiket isu"}
                      {entry.action === "content_approved" && `Menyetujui saran konten (${entry.payload.topic})`}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        onClick={() =>
                          setSelectedPayload({
                            id: entry.id,
                            action: entry.action,
                            target: entry.target,
                            payload: entry.payload,
                          })
                        }
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: 4 }}
                      >
                        <Eye size={12} /> JSON
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Inspector Modal */}
      {selectedPayload && (
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
              maxWidth: 550,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>
                Detail Payload: #{selectedPayload.id} ({selectedPayload.action})
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedPayload(null)}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 10 }}>
              Target: <code>{selectedPayload.target}</code>
            </div>

            <pre
              style={{
                background: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                padding: 14,
                borderRadius: "var(--radius-md)",
                fontSize: "0.82rem",
                fontFamily: "monospace",
                color: "var(--text-primary)",
                overflowX: "auto",
                maxHeight: 280,
              }}
            >
              {JSON.stringify(selectedPayload.payload, null, 2)}
            </pre>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setSelectedPayload(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
