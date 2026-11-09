"use client";

import { useState } from "react";
import {
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  AlertTriangle,
  CheckCircle,
  Mail,
  Clock,
} from "lucide-react";
import {
  users as initialUsers,
  formatWIB,
  type User,
  type UserRole,
} from "@/lib/dummy-data";

export default function UsersPage() {
  const [userList, setUserList] = useState<User[]>(initialUsers);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Check how many active admins exist
  const activeAdminsCount = userList.filter((u) => u.role === "admin" && u.is_active).length;

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    const target = userList.find((u) => u.id === userId);
    if (!target) return;

    // Rule: Cannot demote the last active admin
    if (target.role === "admin" && newRole !== "admin" && activeAdminsCount <= 1) {
      setFeedback({
        type: "error",
        text: "Ditolak: Tidak dapat menurunkan peran Admin terakhir dalam sistem.",
      });
      return;
    }

    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setFeedback({
      type: "success",
      text: `Peran pengguna ${target.email} berhasil diubah menjadi ${newRole.toUpperCase()}.`,
    });
  };

  const handleToggleActive = (userId: number) => {
    const target = userList.find((u) => u.id === userId);
    if (!target) return;

    // Rule: Cannot deactivate the last active admin
    if (target.role === "admin" && target.is_active && activeAdminsCount <= 1) {
      setFeedback({
        type: "error",
        text: "Ditolak: Tidak dapat menonaktifkan akun Admin terakhir dalam sistem.",
      });
      return;
    }

    const nextState = !target.is_active;
    setUserList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, is_active: nextState } : u))
    );
    setFeedback({
      type: "success",
      text: `Status akun ${target.email} kini ${nextState ? "AKTIF" : "NONAKTIF"}.`,
    });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pengguna & Manajemen Hak Akses</h1>
          <p className="page-subtitle">
            Kelola staf, penetapan peran (RBAC: Viewer, Humas, Admin), dan status sesi akun Brantas Abipraya
          </p>
        </div>
      </div>

      {feedback && (
        <div
          style={{
            background:
              feedback.type === "success"
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
            border: `1px solid ${feedback.type === "success" ? "var(--color-positif)" : "var(--color-negatif)"}`,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: feedback.type === "success" ? "var(--color-positif)" : "var(--color-negatif)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
          }}
        >
          {feedback.type === "success" ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <div>{feedback.text}</div>
        </div>
      )}

      {/* Role explanation */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-secondary">Viewer</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Pengamat Eksekutif</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
            Akses baca KPI dan data agregat. Teks komentar warga disamarkan untuk perlindungan privasi. Tidak dapat melakukan mutasi.
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-positif">Humas</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Staf Operasional</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
            Melihat teks komentar penuh. Berwenang menyetujui/mengedit draf balasan, memperbarui tiket isu, dan mengaktifkan kill switch darurat.
          </p>
        </div>

        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-warning">Admin</span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Administrator Sistem</span>
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4, margin: 0 }}>
            Semua wewenang Humas + mengelola akun pengguna serta menyalakan flag fitur otomatis berisiko (auto-reply & scraping X).
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="card" style={{ padding: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Daftar Pengguna Aktif & Terdaftar</h2>

        <div style={{ overflowX: "auto" }}>
          <table className="table" style={{ width: "100%", fontSize: "0.85rem" }}>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Peran (Role)</th>
                <th>Status</th>
                <th>Login Terakhir</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {userList.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "32px 16px", color: "var(--text-tertiary)" }}>
                    Tidak ada data pengguna terdaftar.
                  </td>
                </tr>
              ) : (
                userList.map((user) => (
                  <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          background: "var(--brand-500)",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                        }}
                      >
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-tertiary)" }}>ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{user.email}</td>
                  <td>
                    <select
                      className="input"
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                      style={{ padding: "4px 8px", fontSize: "0.82rem", fontWeight: 600 }}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="humas">Humas</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        background: user.is_active ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: user.is_active ? "var(--color-positif)" : "var(--color-negatif)",
                      }}
                    >
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-tertiary)", fontSize: "0.8rem" }}>
                    {user.last_login ? formatWIB(user.last_login) : "Belum pernah"}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`btn btn-sm ${user.is_active ? "btn-ghost" : "btn-secondary"}`}
                      style={{
                        fontSize: "0.78rem",
                        color: user.is_active ? "var(--color-negatif)" : "var(--color-positif)",
                      }}
                    >
                      {user.is_active ? "Nonaktifkan" : "Aktifkan"}
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
