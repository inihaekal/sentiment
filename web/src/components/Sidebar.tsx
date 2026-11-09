"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  AlertTriangle,
  Zap,
  Radio,
  MessageSquareReply,
  Lightbulb,
  TrendingUp,
  Settings,
  BookOpen,
  Users,
  ClipboardList,
  Menu,
  X,
  Shield,
  Sun,
  Moon,
} from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { section: "Monitoring Reputasi" },
  { href: "/", label: "Dashboard Eksekutif", icon: LayoutDashboard },
  { href: "/posts", label: "Pantauan Percakapan", icon: FileText },
  { href: "/topics", label: "Analisis Persepsi Topik", icon: BarChart3 },
  { href: "/issues", label: "Radar Isu & Keluhan", icon: AlertTriangle, badge: "5", badgeType: "kritis" },
  { href: "/velocity", label: "Radar Isu Viral", icon: Zap },
  { href: "/sources", label: "Saluran Media", icon: Radio },
  { section: "Respon & Publikasi Humas" },
  { href: "/replies", label: "Draf Balasan Warga", icon: MessageSquareReply, badge: "23", badgeType: "warning" },
  { href: "/content", label: "Ide Konten Publikasi", icon: Lightbulb },
  { href: "/trends", label: "Peluang & Risiko Tren", icon: TrendingUp },
  { section: "Pengaturan & Akun" },
  { href: "/admin/flags", label: "Kendali Otomatisasi", icon: Settings },
  { href: "/admin/kb", label: "Panduan & SOP Humas", icon: BookOpen },
  { href: "/admin/users", label: "Tim & Hak Akses", icon: Users },
  { href: "/admin/audit", label: "Riwayat Log Sistem", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("brantas_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      document.documentElement.setAttribute("data-theme", initial);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("brantas_theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <>
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          position: "fixed",
          top: 14,
          left: 14,
          zIndex: 50,
          display: "none",
        }}
        id="sidebar-toggle"
        aria-label="Buka navigasi sidebar"
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <style>{`
        @media (max-width: 1024px) {
          #sidebar-toggle { display: inline-flex !important; }
        }
      `}</style>

      <aside className={`sidebar ${mobileOpen ? "open" : ""}`} aria-label="Navigasi Utama">
        <div className="sidebar-brand">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--brand-600)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                <Shield size={18} color="white" />
              </div>
              <div>
                <div
                  style={{
                    color: "white",
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    lineHeight: 1.2,
                  }}
                >
                  Brantas Abipraya
                </div>
                <div
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.68rem",
                    fontWeight: 500,
                  }}
                >
                  Social Intelligence
                </div>
              </div>
            </div>

            {/* Theme Toggle (R-21 / R-34) */}
            <button
              onClick={toggleTheme}
              style={{
                background: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "var(--radius-sm)",
                color: "#94a3b8",
                width: 30,
                height: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
              title={`Beralih ke mode ${theme === "dark" ? "terang (light)" : "gelap (dark)"}`}
              aria-label="Ganti mode tema"
            >
              {theme === "dark" ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} color="#cbd5e1" />}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if ("section" in item && !("href" in item)) {
              return (
                <div key={i} className="nav-section-title">
                  {item.section}
                </div>
              );
            }

            if ("href" in item) {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href!);
              return (
                <Link
                  key={item.href}
                  href={item.href!}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
                    {Icon && <Icon size={16} />}
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      style={{
                        padding: "2px 7px",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        borderRadius: "var(--radius-full)",
                        background: item.badgeType === "kritis" ? "var(--color-kritis)" : "var(--color-sedang)",
                        color: "white",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return null;
          })}
        </nav>

        {/* User profile footer */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "var(--radius-sm)",
                background: "#1e293b",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            >
              BS
            </div>
            <div>
              <div
                style={{
                  color: "#f1f5f9",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Budi Santoso
              </div>
              <div
                style={{
                  color: "#94a3b8",
                  fontSize: "0.68rem",
                }}
              >
                Administrator
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
