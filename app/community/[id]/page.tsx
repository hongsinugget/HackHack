"use client";

import { useState, use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { color, typography, borderRadius } from "@/src/styles/theme";
import { MOCK_POSTS } from "@/src/components/community/mockData";

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1_000) return n.toLocaleString("ko-KR");
  return String(n);
}

export default function CommunityPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const post = MOCK_POSTS.find((p) => p.id === id);
  if (!post) notFound();

  const [isLiked, setIsLiked] = useState(false);
  const likeCount = post.likes + (isLiked ? 1 : 0);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {/* ── 뒤로가기 ── */}
      <Link
        href="/community"
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            6,
          fontSize:       typography.textStyles.body2.fontSize,
          fontWeight:     600,
          color:          color.text.subtle,
          textDecoration: "none",
          marginBottom:   "1.5rem",
        }}
      >
        ← 커뮤니티
      </Link>

      {/* ── 글 본문 카드 ── */}
      <div
        style={{
          background:   "#ffffff",
          border:       `1px solid ${color.border.subtle}`,
          borderRadius: borderRadius.md,
          overflow:     "hidden",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            padding:      "1.75rem 1.75rem 1.25rem",
            borderBottom: `1px solid ${color.border.subtle}`,
          }}
        >
          {/* 카테고리 배지 */}
          <span
            style={{
              display:       "inline-flex",
              alignItems:    "center",
              padding:       "2px 10px",
              borderRadius:  borderRadius.pill,
              fontSize:      typography.textStyles.captionTag.fontSize,
              fontWeight:    typography.textStyles.captionTag.fontWeight,
              letterSpacing: `${typography.textStyles.captionTag.letterSpacing}px`,
              background:    color.tag.hackathon.bg,
              color:         color.brand.primary,
              marginBottom:  "0.75rem",
            }}
          >
            {post.category}
          </span>

          {/* 제목 */}
          <h1
            style={{
              fontSize:   typography.textStyles.titleHeading.fontSize,
              fontWeight: typography.textStyles.titleHeading.fontWeight,
              lineHeight: `${typography.textStyles.titleHeading.lineHeight}px`,
              color:      color.text.main,
              margin:     "0 0 1rem",
              wordBreak:  "keep-all",
            }}
          >
            {post.title}
          </h1>

          {/* 메타 */}
          <div
            style={{
              display:       "flex",
              gap:           "0.75rem",
              fontSize:      typography.textStyles.labelSmall.fontSize,
              fontWeight:    typography.textStyles.labelSmall.fontWeight,
              letterSpacing: `${typography.textStyles.labelSmall.letterSpacing}px`,
              color:         color.text.muted,
              flexWrap:      "wrap",
            }}
          >
            {post.author && <span>{post.author}</span>}
            <span>{post.date}</span>
            <span>조회 {formatCount(post.views)}</span>
          </div>
        </div>

        {/* 본문 */}
        <div style={{ padding: "1.75rem" }}>
          <p
            style={{
              margin:     0,
              fontSize:   typography.textStyles.body2.fontSize,
              fontWeight: typography.textStyles.body2.fontWeight,
              lineHeight: "1.8",
              color:      color.text.subtle,
              whiteSpace: "pre-wrap",
              wordBreak:  "keep-all",
            }}
          >
            {post.body}
          </p>
        </div>

        {/* 좋아요 */}
        <div
          style={{
            padding:        "1rem 1.75rem 1.5rem",
            display:        "flex",
            justifyContent: "center",
            borderTop:      `1px solid ${color.border.subtle}`,
          }}
        >
          <button
            onClick={() => setIsLiked((v) => !v)}
            style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          6,
              padding:      "8px 24px",
              borderRadius: borderRadius.pill,
              fontSize:     typography.textStyles.body1.fontSize,
              fontWeight:   600,
              border:       `1px solid ${isLiked ? color.brand.primary : color.border.subtle}`,
              background:   isLiked ? color.tag.hackathon.bg : "transparent",
              color:        isLiked ? color.brand.primary : color.text.muted,
              cursor:       "pointer",
              transition:   "all 0.15s",
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>{isLiked ? "♥" : "♡"}</span>
            좋아요 {formatCount(likeCount)}
          </button>
        </div>
      </div>

    </div>
  );
}
