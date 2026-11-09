"use client";

import { Bell, ShieldCheck, Search, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TopHeader() {
  const [timeStr, setTimeStr] = useState("26 Okt 2026, 21:00 WIB");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const day = now.getDate();
      const month = months[now.getMonth()];
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setTimeStr(`${day} ${month} ${year}, ${hours}.${mins} WIB`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottom: "1px solid var(--border-color)",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(16, 185, 129, 0.12)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: "var(--color-positif)",
            padding: "5px 12px",
            borderRadius: "var(--radius-full)",
            fontSize: "0.78rem",
            fontWeight: 700,
          }}
        >
          <span
            className="animate-pulse-soft"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--color-positif)",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.8)",
            }}
          />
          Monitoring Aktif 24/7
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-tertiary)" }}>
          <Clock size={14} />
          <span>{timeStr}</span>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Quick Alert Bell */}
        <Link
          href="/issues"
          style={{
            position: "relative",
            width: 38,
            height: 38,
            borderRadius: "var(--radius-md)",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-secondary)",
            textDecoration: "none",
            transition: "all 0.15s ease",
          }}
          title="5 Isu Membutuhkan Perhatian"
        >
          <Bell size={18} />
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              background: "var(--color-kritis)",
              color: "white",
              fontSize: "0.65rem",
              fontWeight: 800,
              width: 18,
              height: 18,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
            }}
          >
            5
          </span>
        </Link>

        {/* User profile capsule */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            padding: "5px 12px 5px 6px",
            borderRadius: "var(--radius-full)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--brand-500) 0%, var(--brand-700) 100%)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.75rem",
            }}
          >
            BS
          </div>
          <div>
            <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
              Budi Santoso
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)" }}>
              Humas & Corcomm
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
