"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/camp", label: "팀 모집" },
  { href: "/rankings", label: "랭킹" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const hasTeam = mounted && (profile?.myTeamCodes ?? []).length > 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    router.push(`/hackathons?q=${encodeURIComponent(q)}`);
    setSearchQuery("");
  };

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--border)",
        background: "rgba(10,10,15,0.9)",
        backdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "2rem",
          height: 56,
        }}
      >
        <Link href="/" style={{ fontWeight: 800, fontSize: "1.1rem", color: "#a78bfa", textDecoration: "none", letterSpacing: "-0.02em" }}>
          핵핵 💨
        </Link>
        <div style={{ display: "flex", gap: "0.25rem", flex: 1 }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  padding: "0.375rem 0.75rem",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  fontWeight: active ? 600 : 400,
                  color: active ? "#a78bfa" : "var(--muted)",
                  background: active ? "rgba(124,58,237,0.12)" : "transparent",
                  textDecoration: "none",
                  transition: "color 0.15s, background 0.15s",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        {/* 검색창 */}
        <form onSubmit={handleSearch} style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "0.625rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.8rem", pointerEvents: "none", color: "var(--muted)" }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="해커톤 검색..."
            style={{
              padding: "0.375rem 0.75rem 0.375rem 2rem",
              borderRadius: 8,
              background: "var(--surface2, #1a1a26)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: "0.8rem",
              width: 180,
              outline: "none",
              transition: "border-color 0.15s, width 0.2s",
            }}
            onFocus={(e) => { e.target.style.borderColor = "rgba(124,58,237,0.5)"; e.target.style.width = "220px"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border)"; e.target.style.width = "180px"; }}
          />
        </form>

        <Link
          href="/myteam"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.875rem",
            fontWeight: pathname === "/myteam" || hasTeam ? 600 : 400,
            color: pathname === "/myteam" ? "#a78bfa" : "var(--muted)",
            background: pathname === "/myteam" ? "rgba(124,58,237,0.12)" : "transparent",
            textDecoration: "none",
            padding: "0.375rem 0.75rem",
            borderRadius: 8,
            border: hasTeam ? "1px solid rgba(124,58,237,0.25)" : "1px solid var(--border)",
            transition: "all 0.15s",
          }}
        >
          {hasTeam && (
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", flexShrink: 0, display: "inline-block" }} />
          )}
          내 팀
        </Link>

        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: profile ? "var(--text)" : "var(--muted)",
            textDecoration: "none",
            padding: "0.375rem 0.75rem",
            borderRadius: 8,
            border: "1px solid var(--border)",
            fontWeight: profile ? 600 : 400,
          }}
        >
          👤 {mounted && profile ? profile.nickname : "프로필"}
        </Link>
      </div>
    </nav>
  );
}
