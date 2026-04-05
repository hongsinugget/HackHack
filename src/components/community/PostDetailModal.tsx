"use client";

import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { color, typography, borderRadius } from "@/src/styles/theme";
import type { PostDetailModalProps } from "./types";

const CATEGORY_EMOJI: Record<string, string> = {
  공지: "📢",
  후기: "📝",
  질문: "❓",
  꿀팁: "💡",
};

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1_000) return n.toLocaleString("ko-KR");
  return String(n);
}

export default function PostDetailModal({ post, onClose }: PostDetailModalProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    // 모달 열릴 때 body 스크롤 잠금
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [handleKeyDown]);

  const modal = (
    /* backdrop */
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: color.bg.overlay.dark,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      {/* 카드 — 클릭 버블링 차단 */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: color.text.white,
          borderRadius: borderRadius.lg,
          width: "100%",
          maxWidth: 480,
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* ── 모달 헤더 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${color.border.subtle}`,
          }}
        >
          <h2
            id="modal-title"
            style={{
              margin: 0,
              fontSize: typography.textStyles.title.fontSize,
              fontWeight: typography.textStyles.title.fontWeight,
              lineHeight: `${typography.textStyles.title.lineHeight}px`,
              color: color.text.main,
              flex: 1,
            }}
          >
            {post.title}
          </h2>

          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            aria-label="닫기"
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 4,
              color: color.text.muted,
              fontSize: 18,
              lineHeight: 1,
              borderRadius: borderRadius.xs,
            }}
          >
            ✕
          </button>
        </div>

        {/* ── 메타 정보 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 24px",
            borderBottom: `1px solid ${color.border.subtle}`,
            flexWrap: "wrap",
          }}
        >
          {/* 카테고리 배지 */}
          <span
            style={{
              fontSize: typography.textStyles.captionTag.fontSize,
              fontWeight: typography.textStyles.captionTag.fontWeight,
              lineHeight: `${typography.textStyles.captionTag.lineHeight}px`,
              letterSpacing: `${typography.textStyles.captionTag.letterSpacing}px`,
              color: color.brand.primary,
              background: color.tag.hackathon.bg,
              borderRadius: borderRadius.tag,
              padding: "2px 8px",
              whiteSpace: "nowrap",
            }}
          >
            {CATEGORY_EMOJI[post.category]} {post.category}
          </span>

          {/* 작성자 · 조회수 · 좋아요 */}
          <span
            style={{
              fontSize: typography.textStyles.labelSmall.fontSize,
              fontWeight: typography.textStyles.labelSmall.fontWeight,
              lineHeight: `${typography.textStyles.labelSmall.lineHeight}px`,
              letterSpacing: `${typography.textStyles.labelSmall.letterSpacing}px`,
              color: color.text.muted,
              whiteSpace: "nowrap",
            }}
          >
            {post.author}&nbsp;·&nbsp;조회수 {formatCount(post.views)}회&nbsp;·&nbsp;좋아요 {post.likes}
          </span>
        </div>

        {/* ── 본문 ── */}
        <div
          style={{
            padding: "20px 24px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: typography.textStyles.body2.fontSize,
              fontWeight: typography.textStyles.body2.fontWeight,
              lineHeight: `${typography.textStyles.body2.lineHeight}px`,
              color: color.text.subtle,
              whiteSpace: "pre-wrap",
              wordBreak: "keep-all",
            }}
          >
            {post.body}
          </p>
        </div>
      </div>
    </div>
  );

  // SSR 안전: document가 없으면 null
  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
