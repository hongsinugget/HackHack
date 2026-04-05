"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";

const INACTIVE_COLOR = "var(--text-subtle, #4b5563)";
const INACTIVE_ICON_COLOR = "#4b5563";
const ACTIVE_COLOR = "var(--brand-primary, #7c3aed)";

function TeamIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#teamclip)">
        <path d="M7.99998 7.33331C8.88403 7.33331 9.73188 7.6845 10.357 8.30962C10.9821 8.93474 11.3333 9.78259 11.3333 10.6666V14.6666H4.66665V10.6666C4.66665 9.78259 5.01784 8.93474 5.64296 8.30962C6.26808 7.6845 7.11592 7.33331 7.99998 7.33331ZM3.52531 9.33731C3.41922 9.69517 3.35655 10.0645 3.33865 10.4373L3.33331 10.6666V14.6666H1.33331V11.6666C1.33318 11.0917 1.54533 10.5369 1.92907 10.1088C2.31281 9.68063 2.84111 9.40923 3.41265 9.34665L3.52531 9.33731ZM12.4746 9.33731C13.0679 9.37347 13.625 9.63462 14.0324 10.0675C14.4397 10.5003 14.6666 11.0723 14.6666 11.6666V14.6666H12.6666V10.6666C12.6666 10.2046 12.6 9.75865 12.4746 9.33731ZM3.66665 5.33331C4.10867 5.33331 4.5326 5.50891 4.84516 5.82147C5.15772 6.13403 5.33331 6.55795 5.33331 6.99998C5.33331 7.44201 5.15772 7.86593 4.84516 8.17849C4.5326 8.49105 4.10867 8.66665 3.66665 8.66665C3.22462 8.66665 2.8007 8.49105 2.48814 8.17849C2.17557 7.86593 1.99998 7.44201 1.99998 6.99998C1.99998 6.55795 2.17557 6.13403 2.48814 5.82147C2.8007 5.50891 3.22462 5.33331 3.66665 5.33331ZM12.3333 5.33331C12.7753 5.33331 13.1993 5.50891 13.5118 5.82147C13.8244 6.13403 14 6.55795 14 6.99998C14 7.44201 13.8244 7.86593 13.5118 8.17849C13.1993 8.49105 12.7753 8.66665 12.3333 8.66665C11.8913 8.66665 11.4674 8.49105 11.1548 8.17849C10.8422 7.86593 10.6666 7.44201 10.6666 6.99998C10.6666 6.55795 10.8422 6.13403 11.1548 5.82147C11.4674 5.50891 11.8913 5.33331 12.3333 5.33331ZM7.99998 1.33331C8.70722 1.33331 9.3855 1.61426 9.8856 2.11436C10.3857 2.61446 10.6666 3.29274 10.6666 3.99998C10.6666 4.70722 10.3857 5.3855 9.8856 5.8856C9.3855 6.38569 8.70722 6.66665 7.99998 6.66665C7.29274 6.66665 6.61446 6.38569 6.11436 5.8856C5.61426 5.3855 5.33331 4.70722 5.33331 3.99998C5.33331 3.29274 5.61426 2.61446 6.11436 2.11436C6.61446 1.61426 7.29274 1.33331 7.99998 1.33331Z" fill={color}/>
      </g>
      <defs>
        <clipPath id="teamclip"><rect width="16" height="16" fill="white"/></clipPath>
      </defs>
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.3334 14.6667H2.66669V13.3334C2.66669 12.4493 3.01788 11.6015 3.643 10.9763C4.26812 10.3512 5.11597 10 6.00002 10H10C10.8841 10 11.7319 10.3512 12.357 10.9763C12.9822 11.6015 13.3334 12.4493 13.3334 13.3334V14.6667ZM8.00002 8.66669C7.47473 8.66669 6.95459 8.56322 6.46929 8.36221C5.98398 8.16119 5.54303 7.86655 5.17159 7.49511C4.80016 7.12368 4.50552 6.68272 4.3045 6.19742C4.10348 5.71212 4.00002 5.19197 4.00002 4.66669C4.00002 4.1414 4.10348 3.62126 4.3045 3.13595C4.50552 2.65065 4.80016 2.20969 5.17159 1.83826C5.54303 1.46683 5.98398 1.17219 6.46929 0.971169C6.95459 0.77015 7.47473 0.666687 8.00002 0.666687C9.06089 0.666687 10.0783 1.08811 10.8284 1.83826C11.5786 2.58841 12 3.60582 12 4.66669C12 5.72755 11.5786 6.74497 10.8284 7.49511C10.0783 8.24526 9.06089 8.66669 8.00002 8.66669Z" fill={color}/>
    </svg>
  );
}

const navItems = [
  { href: "/", label: "홈" },
  { href: "/hackathons", label: "해커톤" },
  { href: "/camp", label: "팀 모집" },
  { href: "/rankings", label: "랭킹" },
  { href: "/community", label: "커뮤니티" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [searchHovered, setSearchHovered] = useState(false);
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
        borderBottom: "1px solid var(--border-subtle, #dde1e6)",
        background: "var(--bg-main, #f0f2f5)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1215,
          margin: "0 auto",
          padding: "0 57.5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 57,
        }}
      >
        {/* 좌측: 로고 + 네비 링크 */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* 로고 */}
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img src="/icons/logo.svg" alt="hhack" style={{ height: 21, width: "auto" }} />
          </Link>

          {/* 네비 링크 */}
          <div style={{ display: "flex", gap: 4, height: 33, alignItems: "flex-start" }}>
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "6px 11px",
                    borderRadius: active ? 0 : 8,
                    fontSize: 14,
                    fontWeight: active ? 700 : 600,
                    color: active ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                    background: "transparent",
                    textDecoration: "none",
                    borderBottom: active ? "2px solid var(--brand-primary, #7c3aed)" : "2px solid transparent",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* 우측: 검색 + 내 팀 + 프로필 */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {/* 검색창 */}
          <form onSubmit={handleSearch} style={{ position: "relative", flexShrink: 0 }}>
            <img
              src="/icons/search-icon.svg"
              alt=""
              style={{
                position: "absolute",
                left: 11,
                top: "50%",
                transform: "translateY(-50%)",
                width: 16,
                height: 16,
                pointerEvents: "none",
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="해커톤 검색..."
              onMouseEnter={() => setSearchHovered(true)}
              onMouseLeave={() => setSearchHovered(false)}
              style={{
                padding: "6px 12px 6px 32px",
                borderRadius: 100,
                background: "var(--bg-input, #dee2e6)",
                border: "none",
                color: "var(--text-subtle, #4b5563)",
                fontSize: 13,
                width: searchHovered ? 220 : 180,
                outline: "none",
                transition: "width 0.2s",
              }}
            />
          </form>

          {/* 내 팀 + 프로필 */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {(() => {
              const isMyTeamActive = pathname === "/myteam";
              const teamColor = isMyTeamActive ? ACTIVE_COLOR : INACTIVE_COLOR;
              return (
                <Link
                  href="/myteam"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: isMyTeamActive ? 700 : 500,
                    color: teamColor,
                    textDecoration: "none",
                    padding: "6px 10px",
                    borderRadius: 8,
                  }}
                >
                  <TeamIcon color={isMyTeamActive ? "#7c3aed" : INACTIVE_ICON_COLOR} />
                  내 팀
                </Link>
              );
            })()}

            {(() => {
              const isProfileActive = pathname === "/profile";
              const profileColor = isProfileActive ? ACTIVE_COLOR : INACTIVE_COLOR;
              return (
                <Link
                  href="/profile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    fontWeight: isProfileActive ? 700 : 500,
                    color: profileColor,
                    textDecoration: "none",
                    padding: "6px 12px",
                    borderRadius: 8,
                  }}
                >
                  <ProfileIcon color={isProfileActive ? "#7c3aed" : INACTIVE_ICON_COLOR} />
                  {mounted && profile ? profile.nickname : "프로필"}
                </Link>
              );
            })()}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          nav { padding: 0 1rem; }
        }
      `}</style>
    </nav>
  );
}
