"use client";

import { useState, useMemo, useEffect } from "react";
import {
  BookOpen,
  Plus,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit3,
  Search,
  AlertCircle,
  FileText,
} from "lucide-react";
import {
  kbDocs as initialDocs,
  formatWIB,
  type KBDoc,
} from "@/lib/dummy-data";

export default function KBPage() {
  const [docs, setDocs] = useState<KBDoc[]>(initialDocs);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KBDoc | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formSourceUrl, setFormSourceUrl] = useState("");
  const [formContent, setFormContent] = useState("");

  const filtered = useMemo(() => {
    return docs.filter((d) => {
      if (activeFilter === "active" && !d.is_active) return false;
      if (activeFilter === "draft" && d.is_active) return false;
      if (
        search &&
        !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !d.content.toLowerCase().includes(search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [docs, search, activeFilter]);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormTitle("");
    setFormSourceUrl("");
    setFormContent("");
    setModalOpen(true);
  };

  const handleOpenEdit = (doc: KBDoc) => {
    setEditingDoc(doc);
    setFormTitle(doc.title);
    setFormSourceUrl(doc.source_url);
    setFormContent(doc.content);
    setModalOpen(true);
  };

  const handleSaveDoc = () => {
    if (!formTitle.trim() || !formContent.trim()) return;

    if (editingDoc) {
      // Editing marks is_active=false and approved_by=null per DEV SPEC Section 12.4
      setDocs((prev) =>
        prev.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                title: formTitle,
                source_url: formSourceUrl,
                content: formContent,
                is_active: false,
                approved_by: null,
                approved_at: null,
              }
            : d
        )
      );
    } else {
      // New doc starts as draft
      const newDoc: KBDoc = {
        id: Math.max(...docs.map((d) => d.id), 0) + 1,
        title: formTitle,
        source_url: formSourceUrl,
        content: formContent,
        is_active: false,
        approved_by: null,
        approved_at: null,
      };
      setDocs((prev) => [newDoc, ...prev]);
    }
    setModalOpen(false);
  };

  const handleApprove = (id: number) => {
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              is_active: true,
              approved_by: "humas@brantas.co.id",
              approved_at: new Date(1793020800000).toISOString(),
            }
          : d
      )
    );
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Knowledge Base & Rujukan Guard</h1>
          <p className="page-subtitle">
            Kumpulan dokumen acuan resmi fakta Brantas Abipraya untuk pemeriksaan Guard dan referensi LLM lokal
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="btn btn-primary"
          style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Plus size={16} /> Tambah Dokumen KB
        </button>
      </div>

      {/* Info notice */}
      <div
        className="card"
        style={{
          padding: 14,
          marginBottom: 20,
          background: "var(--bg-tertiary)",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <BookOpen size={18} color="var(--brand-500)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Aturan Pipeline KB: </strong>
          Setiap penambahan atau pengubahan dokumen akan berstatus <strong>Draft</strong> dan dinonaktifkan sementara.
          Setelah disetujui staf Humas/Admin, job Python <code>embed_kb_docs</code> akan men-generate embedding vector (dimensi 384)
          sebelum dokumen dapat dikutip oleh Writer.
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            placeholder="Cari judul atau isi dokumen KB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: 34, width: "100%", fontSize: "0.85rem" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {[
            { id: "all", label: `Semua (${docs.length})` },
            { id: "active", label: `Aktif (${docs.filter((d) => d.is_active).length})` },
            { id: "draft", label: `Draft (${docs.filter((d) => !d.is_active).length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm ${activeFilter === tab.id ? "btn-primary" : "btn-ghost"}`}
              style={{ borderRadius: "var(--radius-full)", fontSize: "0.82rem" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 16 }}>
        {filtered.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: "center", color: "var(--text-tertiary)", gridColumn: "1 / -1" }}>
            Tidak ada dokumen Knowledge Base yang sesuai dengan pencarian atau filter.
          </div>
        ) : (
          filtered.map((doc) => (
            <div
              key={doc.id}
              className="card"
              style={{
                padding: 20,
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
                  alignItems: "flex-start",
                  marginBottom: 10,
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                  {doc.title}
                </div>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    background: doc.is_active ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)",
                    color: doc.is_active ? "var(--color-positif)" : "var(--color-sedang)",
                    flexShrink: 0,
                  }}
                >
                  {doc.is_active ? "Aktif (Terverifikasi)" : "Draft (Menunggu Approval)"}
                </span>
              </div>

              {doc.source_url && (
                <div style={{ marginBottom: 10 }}>
                  <a
                    href={doc.source_url}
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
                    Sumber Referensi: {doc.source_url} <ExternalLink size={12} />
                  </a>
                </div>
              )}

              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  background: "var(--bg-tertiary)",
                  padding: 12,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-color)",
                  maxHeight: 120,
                  overflowY: "auto",
                }}
              >
                {doc.content}
              </p>
            </div>

            {/* Footer */}
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  fontSize: "0.72rem",
                  color: "var(--text-tertiary)",
                  paddingTop: 10,
                  borderTop: "1px solid var(--border-color)",
                  marginBottom: 12,
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <span>ID: #{doc.id}</span>
                {doc.is_active && doc.approved_by && (
                  <span>
                    Disetujui: {doc.approved_by} ({formatWIB(doc.approved_at!)})
                  </span>
                )}
                {!doc.is_active && (
                  <span style={{ color: "var(--color-sedang)" }}>
                    Memerlukan persetujuan staf Humas
                  </span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                <button
                  onClick={() => handleOpenEdit(doc)}
                  className="btn btn-secondary btn-sm"
                  style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <Edit3 size={13} /> Edit
                </button>
                {!doc.is_active && (
                  <button
                    onClick={() => handleApprove(doc.id)}
                    className="btn btn-primary btn-sm"
                    style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
                  >
                    <CheckCircle size={13} /> Setujui Dokumen
                  </button>
                )}
              </div>
            </div>
          </div>
        )))}
      </div>

      {/* Modal Add / Edit */}
      {modalOpen && (
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
              maxWidth: 600,
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
              <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {editingDoc ? "Edit Dokumen Knowledge Base" : "Tambah Dokumen KB Baru"}
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>
                  Judul Dokumen:
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="Contoh: Protokol K3 Proyek Bendungan Bendo"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>
                  URL Sumber / Regulasi (Opsional):
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="https://brantasabipraya.co.id/..."
                  value={formSourceUrl}
                  onChange={(e) => setFormSourceUrl(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>
                  Isi / Fakta Resmi (Teks):
                </label>
                <textarea
                  className="input"
                  rows={6}
                  placeholder="Masukkan ringkasan fakta resmi yang boleh dikutip bot dan tim Humas..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  style={{ width: "100%", resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSaveDoc}
                disabled={!formTitle.trim() || !formContent.trim()}
              >
                Simpan Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
