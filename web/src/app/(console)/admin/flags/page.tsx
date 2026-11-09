"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Power,
  AlertTriangle,
  CheckCircle,
  Lock,
  RefreshCw,
  Clock,
  Shield,
} from "lucide-react";
import {
  systemFlags as initialFlags,
  formatWIB,
  type SystemFlag,
} from "@/lib/dummy-data";

export default function FlagsPage() {
  const [flags, setFlags] = useState<SystemFlag[]>(initialFlags);
  const [confirmModal, setConfirmModal] = useState<{
    flagKey: string;
    targetValue: string;
    flagTitle: string;
  } | null>(null);
  const [confirmInput, setConfirmInput] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setConfirmModal(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const killSwitchFlag = flags.find((f) => f.key === "kill_switch");
  const isKillSwitchActive = killSwitchFlag?.value === "on";

  const triggerToggle = (flag: SystemFlag) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    const newValue = flag.value === "on" ? "off" : "on";

    // Rules from DEV SPEC Section 12.4:
    // Decreasing risk (can be done directly by Humas/Admin):
    // - Turning kill_switch to 'on' (stops all automated processes)
    // - Turning auto_reply_enabled to 'off'
    // - Turning x_collector_enabled to 'off'
    const isDecreasingRisk =
      (flag.key === "kill_switch" && newValue === "on") ||
      (flag.key === "auto_reply_enabled" && newValue === "off") ||
      (flag.key === "x_collector_enabled" && newValue === "off");

    if (isDecreasingRisk) {
      // Execute immediately
      applyFlagChange(flag.key, newValue);
      setSuccessMessage(`Flag "${flag.key}" berhasil diubah menjadi ${newValue.toUpperCase()}.`);
      return;
    }

    // Increasing risk (Requires Admin typed confirmation):
    // Rule: Turning auto_reply_enabled ON is rejected if kill_switch=on!
    if (flag.key === "auto_reply_enabled" && newValue === "on" && isKillSwitchActive) {
      setErrorMessage(
        "Ditolak: Tidak dapat menyalakan auto_reply_enabled karena kill_switch saat ini aktif (ON). Nonaktifkan kill_switch terlebih dahulu."
      );
      return;
    }

    // Open confirmation modal requiring typing flag name
    setConfirmModal({
      flagKey: flag.key,
      targetValue: newValue,
      flagTitle: flag.key,
    });
    setConfirmInput("");
  };

  const applyFlagChange = (key: string, value: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.key === key
          ? {
              ...f,
              value,
              updated_at: new Date(1793020800000).toISOString(),
              updated_by: "admin@brantas.co.id",
            }
          : f
      )
    );
  };

  const handleConfirmSubmit = () => {
    if (!confirmModal) return;
    if (confirmInput.trim() !== confirmModal.flagKey) {
      setErrorMessage(`Konfirmasi gagal: Teks yang diketik harus sama persis dengan "${confirmModal.flagKey}".`);
      return;
    }

    applyFlagChange(confirmModal.flagKey, confirmModal.targetValue);
    setSuccessMessage(
      `Otorisasi Admin berhasil: Flag "${confirmModal.flagKey}" kini aktif (${confirmModal.targetValue.toUpperCase()}). Tercatat di audit log.`
    );
    setConfirmModal(null);
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">System Flags & Kill Switch</h1>
          <p className="page-subtitle">
            Kendali operasional otomatisasi sistem. Menaikkan risiko memerlukan konfirmasi otentikasi Admin.
          </p>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid var(--color-negatif)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--color-negatif)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
          }}
        >
          <AlertTriangle size={18} />
          <div>{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div
          style={{
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid var(--color-positif)",
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            color: "var(--color-positif)",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: "0.85rem",
          }}
        >
          <CheckCircle size={18} />
          <div>{successMessage}</div>
        </div>
      )}

      {/* Emergency Kill Switch Banner */}
      <div
        className="card"
        style={{
          padding: 24,
          marginBottom: 24,
          border: isKillSwitchActive
            ? "2px solid var(--color-negatif)"
            : "1px solid var(--border-color)",
          background: isKillSwitchActive
            ? "rgba(239, 68, 68, 0.08)"
            : "linear-gradient(135deg, rgba(239, 68, 68, 0.03), transparent)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: "var(--radius-full)",
                background: isKillSwitchActive
                  ? "var(--color-negatif)"
                  : "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isKillSwitchActive ? "white" : "var(--color-negatif)",
              }}
            >
              <Power size={26} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <h2 style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
                  EMERGENCY KILL SWITCH
                </h2>
                <span
                  style={{
                    padding: "3px 10px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: isKillSwitchActive
                      ? "var(--color-negatif)"
                      : "rgba(34, 197, 94, 0.2)",
                    color: isKillSwitchActive ? "white" : "var(--color-positif)",
                  }}
                >
                  {isKillSwitchActive ? "ACTIVE (SYSTEM HALTED)" : "STANDBY (NORMAL)"}
                </span>
              </div>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                  marginTop: 4,
                  maxWidth: 600,
                }}
              >
                Menonaktifkan secara seketika semua modul worker otomatis (crawling, auto-reply, publisher).
                Boleh diaktifkan darurat oleh staf Humas bila terjadi insiden atau anomali.
              </p>
            </div>
          </div>

          <button
            onClick={() => killSwitchFlag && triggerToggle(killSwitchFlag)}
            className="btn btn-sm"
            style={{
              padding: "10px 20px",
              background: isKillSwitchActive ? "var(--color-positif)" : "var(--color-negatif)",
              color: "white",
              fontWeight: 700,
              fontSize: "0.9rem",
              borderRadius: "var(--radius-md)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            <Power size={18} />
            {isKillSwitchActive ? "Resume Sistem (Admin)" : "AKTIFKAN KILL SWITCH"}
          </button>
        </div>
      </div>

      {/* Safety Policy Info Banner */}
      <div
        className="card"
        style={{
          padding: 16,
          marginBottom: 24,
          background: "var(--bg-tertiary)",
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Shield size={20} color="var(--brand-500)" style={{ flexShrink: 0 }} />
        <div>
          <strong>Aturan Keamanan Sistem: </strong>
          Menurunkan risiko (mematikan fitur/menyalakan kill switch) dapat dilakukan oleh peran <strong>Humas</strong>.
          Menaikkan risiko (mengaktifkan auto-reply/scraping X) hanya dapat dilakukan oleh peran <strong>Admin</strong> dan
          memerlukan ketik manual nama flag sebagai verifikasi sadar.
        </div>
      </div>

      {/* Flags List */}
      <div className="card" style={{ padding: 20 }}>
        <h2 className="card-title" style={{ marginBottom: 16 }}>Daftar Pengaturan System Flags</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {flags.map((flag) => {
            const isOn = flag.value === "on";

            return (
              <div
                key={flag.key}
                style={{
                  padding: 16,
                  background: "var(--bg-tertiary)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 16,
                }}
              >
                <div style={{ maxWidth: 550 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <code
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        color: "var(--brand-500)",
                      }}
                    >
                      {flag.key}
                    </code>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        background: isOn ? "rgba(34, 197, 94, 0.15)" : "rgba(100, 116, 139, 0.15)",
                        color: isOn ? "var(--color-positif)" : "var(--text-tertiary)",
                      }}
                    >
                      {flag.value.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                    {flag.description}
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", display: "flex", gap: 14 }}>
                    <span>Diubah: {formatWIB(flag.updated_at)}</span>
                    <span>Oleh: {flag.updated_by}</span>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => triggerToggle(flag)}
                    className={`btn btn-sm ${isOn ? "btn-secondary" : "btn-primary"}`}
                    style={{
                      minWidth: 120,
                      fontWeight: 600,
                    }}
                  >
                    {isOn ? "Matikan (OFF)" : "Nyalakan (ON)"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Typed Confirmation Modal for Admin */}
      {confirmModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
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
              maxWidth: 520,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              border: "1px solid var(--color-sedang)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, color: "var(--color-sedang)" }}>
              <Lock size={22} />
              <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                Konfirmasi Otorisasi Admin
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
              Anda akan mengaktifkan flag berisiko: <strong>{confirmModal.flagKey}</strong> menjadi{" "}
              <strong>{confirmModal.targetValue.toUpperCase()}</strong>.
              Tindakan ini akan mempengaruhi alur otomatisasi akun resmi dan dicatat dalam audit log permanen.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}>
                Ketik nama flag <code style={{ color: "var(--brand-500)" }}>{confirmModal.flagKey}</code> untuk konfirmasi:
              </label>
              <input
                type="text"
                className="input"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                placeholder={confirmModal.flagKey}
                style={{ width: "100%", fontFamily: "monospace" }}
                autoFocus
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn btn-secondary" onClick={() => setConfirmModal(null)}>
                Batal
              </button>
              <button
                className="btn btn-primary"
                onClick={handleConfirmSubmit}
                disabled={confirmInput.trim() !== confirmModal.flagKey}
                style={{
                  background: confirmInput.trim() === confirmModal.flagKey ? "var(--color-sedang)" : undefined,
                }}
              >
                Konfirmasi & Ubah Flag
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
