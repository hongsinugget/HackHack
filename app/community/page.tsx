"use client";

import { useState, useMemo } from "react";
import { MOCK_POSTS } from "@/src/components/community/mockData";
import type { CommunityCategory, CommunityPost } from "@/src/components/community/types";

const CATEGORIES: CommunityCategory[] = ["전체", "공지", "후기", "질문", "꿀팁"];

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  공지: { bg: "rgba(124,58,237,0.12)", color: "#7c3aed" },
  후기: { bg: "rgba(16,185,129,0.12)", color: "#10b981" },
  질문: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  꿀팁: { bg: "rgba(239,68,68,0.12)", color: "#ef4444" },
};

function PostModal({ post, onClose }: { post: CommunityPost; onClose: () => void }) {
  const cat = CATEGORY_COLORS[post.category] ?? { bg: "rgba(124,58,237,0.12)", color: "#7c3aed" };
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 200, padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#ffffff", borderRadius: 16, padding: "2rem",
          width: "100%", maxWidth: 560, maxHeight: "85vh",
          display: "flex", flexDirection: "column", gap: "1.25rem",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: cat.bg, color: cat.color }}>
              {post.category}
            </span>
            <h2 style={{ fontSize: 18, fontWeight: 800, lineHeight: "26px", color: "var(--text-main, #12121a)", margin: 0 }}>
              {post.title}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6b6b80", flexShrink: 0, padding: 4, lineHeight: 1 }}>✕</button>
        </div>

        {/* Meta */}
        <div style={{ display: "flex", gap: "1rem", fontSize: 12, color: "#6b6b80", borderBottom: "1px solid #dde1e6", paddingBottom: "1rem" }}>
          {post.author && <span>작성자 {post.author}</span>}
          <span>조회 {post.views.toLocaleString()}</span>
          <span>좋아요 {post.likes}</span>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: 14, lineHeight: "22px", color: "var(--text-main, #12121a)", whiteSpace: "pre-wrap", margin: 0 }}>
            {post.body}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CommunityPage() {
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>("전체");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const filtered = useMemo(
    () => activeCategory === "전체" ? MOCK_POSTS : MOCK_POSTS.filter((p) => p.category === activeCategory),
    [activeCategory]
  );

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>
          커뮤니티
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", margin: 0 }}>
          해커톤 후기, 꿀팁, 질문을 함께 나눠요
        </p>
      </div>

      {/* 카테고리 탭 */}
      <div style={{ display: "flex", gap: 4, marginBottom: "1.5rem" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: activeCategory === cat ? 700 : 600,
              background: activeCategory === cat ? "rgba(124,58,237,0.12)" : "transparent",
              color: activeCategory === cat ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
              border: activeCategory === cat ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 게시글 목록 */}
      <div
        style={{
          background: "#ffffff",
          border: "1px solid var(--border-subtle, #dde1e6)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <div style={{ padding: "3rem 2rem", textAlign: "center", color: "var(--text-muted, #6b6b80)", fontSize: 14 }}>
            해당 카테고리의 게시글이 없습니다.
          </div>
        ) : (
          filtered.map((post, idx) => {
            const cat = CATEGORY_COLORS[post.category] ?? { bg: "rgba(124,58,237,0.12)", color: "#7c3aed" };
            return (
              <div
                key={post.id}
                onClick={() => setSelectedPost(post)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-subtle, #dde1e6)" : "none",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = "#f8f9fa"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = ""; }}
              >
                {/* 카테고리 배지 */}
                <span
                  style={{
                    display: "inline-flex", alignItems: "center",
                    padding: "2px 8px", borderRadius: 9999,
                    fontSize: 11, fontWeight: 600, whiteSpace: "nowrap",
                    background: cat.bg, color: cat.color, flexShrink: 0,
                  }}
                >
                  {post.category}
                </span>

                {/* 제목 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 14, fontWeight: 600, color: "var(--text-main, #12121a)",
                      margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}
                  >
                    {post.title}
                  </p>
                  {post.author && (
                    <p style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", margin: "2px 0 0" }}>
                      {post.author}
                    </p>
                  )}
                </div>

                {/* 메타 */}
                <div style={{ display: "flex", gap: "0.875rem", fontSize: 12, color: "#6b6b80", flexShrink: 0 }}>
                  <span>{post.date}</span>
                  <span>조회 {post.views.toLocaleString()}</span>
                  <span>❤ {post.likes}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 상세 모달 */}
      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
