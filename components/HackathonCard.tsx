"use client";

import { memo } from "react";
import Link from "next/link";
import type { Hackathon } from "@/lib/types";
import { formatPrize, dDayLabel, computeStatus } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import StarIcon from "./StarIcon";
import { useStore } from "@/lib/store";
import { useShallow } from "zustand/shallow";

function formatDateKo(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("ko-KR");
}

const HackathonCard = memo(function HackathonCard({
  h,
  maxTags,
}: {
  h: Hackathon;
  maxTags?: number;
}) {
  const dday = dDayLabel(h.period.submissionDeadlineAt);
  const status = computeStatus(h.period);
  const { isBookmarked, toggleBookmark } = useStore(
    useShallow((s) => ({
      isBookmarked: s.profile?.bookmarks.includes(h.slug) ?? false,
      toggleBookmark: s.toggleBookmark,
    }))
  );
  const tags = maxTags !== undefined ? h.tags.slice(0, maxTags) : h.tags;

  return (
    <Link href={h.links.detail} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: status === "ended" ? "#e8e8ed" : "#ece5ff",
          border: "1px solid transparent",
          borderRadius: 12,
          padding: 24,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          height: "100%",
          transition: "transform 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "translateY(-2px)";
          el.style.borderColor = "var(--brand-primary, #7c3aed)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement;
          el.style.transform = "";
          el.style.borderColor = "transparent";
        }}
      >
        {/* 상단 섹션: 배지+날짜 행 + 제목 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
          {/* 배지 행 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <StatusBadge status={status} variant="card" />
              {status !== "ended" && (
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", color: "var(--text-main, #12121a)" }}>
                  {dday}
                </span>
              )}
            </div>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(h.slug); }}
              title={isBookmarked ? "북마크 해제" : "북마크"}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, display: "flex", alignItems: "center" }}
            >
              <StarIcon filled={isBookmarked} />
            </button>
          </div>

          {/* 제목 */}
          <h3
            style={{
              fontSize: 20, fontWeight: 800, lineHeight: "30px",
              color: "var(--text-main, #12121a)", margin: 0,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}
          >
            {h.title}
          </h3>
        </div>

        {/* 하단 섹션: 태그 + 상금/날짜 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="tag"
                style={status === "ended" ? { background: "rgba(0,0,0,0.08)", color: "#6b6b80" } : undefined}
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="hackathon-card-bottom">
            {h.maxPrizeKRW ? (
              <span className="hackathon-card-prize" style={{ fontSize: 20, fontWeight: 800, lineHeight: "30px", color: status === "ended" ? "#9a9aab" : "#4b0082" }}>
                {formatPrize(h.maxPrizeKRW)}
              </span>
            ) : (
              <span style={{ fontSize: 13, color: "#6b6b80" }}>상금 미정</span>
            )}
            <div className="hackathon-card-date" style={{ fontSize: 12, color: "#6b6b80", textAlign: "right", lineHeight: "19px" }}>
              <div>시작 {formatDateKo(h.period.startAt)}</div>
              <div>마감 {formatDateKo(h.period.submissionDeadlineAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default HackathonCard;
