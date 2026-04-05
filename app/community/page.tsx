"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { color, typography, borderRadius } from "@/src/styles/theme";
import { MOCK_POSTS } from "@/src/components/community/mockData";
import type { CommunityCategory, CommunityPost } from "@/src/components/community/types";

const CATEGORIES: CommunityCategory[] = ["전체", "공지", "후기", "질문", "꿀팁"];

type SortKey = "latest" | "views" | "likes";

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: "최신순",         value: "latest" },
  { label: "조회수 높은 순", value: "views"  },
  { label: "좋아요 높은 순", value: "likes"  },
];

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1_000) return n.toLocaleString("ko-KR");
  return String(n);
}

function PostRow({ post }: { post: CommunityPost }) {
  return (
    <Link
      href={`/community/${post.id}`}
      style={{ textDecoration: "none", display: "block" }}
    >
      <div
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = color.tag.hackathon.bg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.background = "transparent";
        }}
        style={{
          display:      "flex",
          alignItems:   "center",
          gap:          "1rem",
          padding:      "0.875rem 1.25rem",
          cursor:       "pointer",
          transition:   "background 0.12s",
        }}
      >
        {/* 제목 + 작성자 */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <p
            style={{
              fontSize:     typography.textStyles.body1.fontSize,
              fontWeight:   typography.textStyles.body1.fontWeight,
              lineHeight:   `${typography.textStyles.body1.lineHeight}px`,
              color:        color.text.main,
              margin:       0,
              overflow:     "hidden",
              textOverflow: "ellipsis",
              whiteSpace:   "nowrap",
            }}
          >
            {post.title}
          </p>
          {post.author && (
            <p
              style={{
                fontSize:   typography.textStyles.labelSmall.fontSize,
                fontWeight: typography.textStyles.labelSmall.fontWeight,
                lineHeight: `${typography.textStyles.labelSmall.lineHeight}px`,
                color:      color.text.muted,
                margin:     0,
              }}
            >
              {post.author}
            </p>
          )}
        </div>

        {/* 날짜 · 조회수 · 좋아요 */}
        <div
          style={{
            display:       "flex",
            gap:           "0.75rem",
            fontSize:      typography.textStyles.labelSmall.fontSize,
            fontWeight:    typography.textStyles.labelSmall.fontWeight,
            letterSpacing: `${typography.textStyles.labelSmall.letterSpacing}px`,
            color:         color.text.muted,
            flexShrink:    0,
            whiteSpace:    "nowrap",
          }}
        >
          <span>{post.date}</span>
          <span>조회 {formatCount(post.views)}</span>
          <span>❤ {post.likes}</span>
        </div>
      </div>
    </Link>
  );
}

export default function CommunityPage() {
  const [query,          setQuery]          = useState("");
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>("전체");
  const [sort,           setSort]           = useState<SortKey>("latest");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MOCK_POSTS
      .filter((p) => activeCategory === "전체" || p.category === activeCategory)
      .filter((p) => !q || p.title.toLowerCase().includes(q) || (p.author ?? "").toLowerCase().includes(q))
      .sort((a, b) => {
        if (sort === "views") return b.views - a.views;
        if (sort === "likes") return b.likes - a.likes;
        return b.date.localeCompare(a.date);
      });
  }, [query, activeCategory, sort]);

  return (
    <div>
      {/* ── 페이지 헤더 ── */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: color.text.main, marginBottom: 4 }}>
          커뮤니티
        </h1>
        <p style={{ fontSize: typography.textStyles.body2.fontSize, color: color.text.muted, margin: 0 }}>
          해커톤 후기, 꿀팁, 질문을 함께 나눠요
        </p>
      </div>

      {/* ── 검색창 ── */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <img src="/icons/search-icon.svg" alt="" width={16} height={16} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="제목 또는 작성자로 검색..."
          style={{
            width:        "100%",
            padding:      "12px 16px 12px 44px",
            borderRadius: 10,
            background:   color.bg.main,
            border:       `1px solid ${color.border.subtle}`,
            color:        color.text.main,
            fontSize:     typography.textStyles.body2.fontSize,
            outline:      "none",
            transition:   "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e)  => (e.target.style.borderColor = color.border.subtle)}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: color.text.muted, cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}
          >
            ✕
          </button>
        )}
      </div>

      {/* ── 카테고리 필터 ── */}
      <div
        style={{
          display:      "flex",
          gap:          "0.375rem",
          flexWrap:     "wrap",
          alignItems:   "center",
          marginBottom: "1.5rem",
          padding:      "0.25rem 0",
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding:      "6px 12px",
                borderRadius: 6,
                fontSize:     12.8,
                fontWeight:   isActive ? 700 : 400,
                background:   isActive ? "rgba(124,58,237,0.2)" : "transparent",
                color:        isActive ? color.brand.primary : color.text.subtle,
                border:       "none",
                cursor:       "pointer",
                transition:   "all 0.15s",
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* ── 결과 수 + 정렬 ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <span style={{ fontSize: typography.textStyles.body2.fontSize, color: color.text.muted }}>
          {filtered.length}개 게시글
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          style={{
            padding:      "6px 12px",
            borderRadius: 8,
            fontSize:     13,
            background:   color.bg.main,
            color:        color.text.main,
            border:       `1px solid ${color.border.subtle}`,
            cursor:       "pointer",
            outline:      "none",
          }}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* ── 게시글 목록 ── */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: color.bg.main, borderRadius: borderRadius.md }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <img src="/icons/search-icon.svg" alt="" width={32} height={32} style={{ opacity: 0.4 }} />
          </div>
          <div style={{ fontWeight: 700, fontSize: typography.textStyles.body1.fontSize, color: color.text.main, marginBottom: "0.375rem" }}>
            {query ? `'${query}'에 해당하는 게시글이 없어요` : "해당 카테고리의 게시글이 없습니다"}
          </div>
          {query && (
            <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem" }}>
              <button
                onClick={() => setQuery("")}
                style={{ padding: "6px 14px", borderRadius: borderRadius.sm, fontSize: 13, background: "rgba(124,58,237,0.12)", color: color.brand.primary, border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                검색어 지우기
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {filtered.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
