"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import type { HackathonStatus } from "@/lib/types";
import HackathonCard from "@/components/HackathonCard";

const STATUS_OPTIONS: { label: string; value: HackathonStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "진행중", value: "ongoing" },
  { label: "예정", value: "upcoming" },
  { label: "종료", value: "ended" },
];

const SORT_OPTIONS = [
  { label: "상금 높은 순", value: "prize" },
  { label: "마감 임박순", value: "deadline" },
];

function SkeletonCard() {
  return (
    <div
      style={{
        height: 220,
        borderRadius: 12,
        background: "#ece5ff",
        opacity: 0.5,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}

export default function HackathonsPage() {
  return (
    <Suspense>
      <HackathonsContent />
    </Suspense>
  );
}

function HackathonsContent() {
  const { hackathons, initialized } = useStore();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<HackathonStatus | "all">("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<"prize" | "deadline">("prize");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  const allTags = useMemo(
    () => Array.from(new Set(hackathons.flatMap((h) => h.tags))),
    [hackathons]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hackathons
      .filter((h) => !q || h.title.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)))
      .filter((h) => statusFilter === "all" || h.status === statusFilter)
      .filter((h) => !tagFilter || h.tags.includes(tagFilter))
      .filter((h) => statusFilter === "ended" || h.status !== "ended")
      .sort((a, b) => {
        if (sort === "prize") return (b.maxPrizeKRW ?? 0) - (a.maxPrizeKRW ?? 0);
        return new Date(a.period.submissionDeadlineAt).getTime() - new Date(b.period.submissionDeadlineAt).getTime();
      });
  }, [hackathons, query, statusFilter, tagFilter, sort]);

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>
          해커톤 목록
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", margin: 0 }}>
          상금·일정·팀 현황을 한눈에 비교하고 참가할 대회를 찾아보세요
        </p>
      </div>

      {/* 검색창 */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none", color: "#6b6b80" }}>
          🔍
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="대회명 또는 태그로 검색..."
          style={{
            width: "100%",
            padding: "10px 1rem 10px 2.75rem",
            borderRadius: 10,
            background: "#ffffff",
            border: "1px solid var(--border-subtle, #dde1e6)",
            color: "var(--text-main, #12121a)",
            fontSize: 14,
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle, #dde1e6)")}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#6b6b80", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* 필터 & 정렬 */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: "1.5rem",
          padding: "1rem 1.25rem",
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid var(--border-subtle, #dde1e6)",
        }}
      >
        {/* 상태 필터 */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: statusFilter === opt.value ? 700 : 400,
                background: statusFilter === opt.value ? "rgba(124,58,237,0.12)" : "transparent",
                color: statusFilter === opt.value ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                border: statusFilter === opt.value ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border-subtle, #dde1e6)" }} />

        {/* 태그 필터 */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: tagFilter === tag ? 700 : 400,
                background: tagFilter === tag ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.06)",
                color: tagFilter === tag ? "var(--brand-primary, #7c3aed)" : "#6b6b80",
                border: tagFilter === tag ? "1px solid rgba(124,58,237,0.35)" : "1px solid rgba(124,58,237,0.15)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tag}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "prize" | "deadline")}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: 13,
              background: "#f0f2f5",
              color: "var(--text-main, #12121a)",
              border: "1px solid var(--border-subtle, #dde1e6)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 결과 수 */}
      {initialized && (
        <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: "1rem" }}>
          {filtered.length}개 해커톤
        </div>
      )}

      {/* 카드 그리드 */}
      {!initialized ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "#ffffff",
            borderRadius: 12,
            border: "1px solid var(--border-subtle, #dde1e6)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔍</div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>조건에 맞는 해커톤이 없습니다</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)" }}>필터를 조정해보세요</div>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); setTagFilter(null); }}
            style={{
              marginTop: "1rem",
              padding: "8px 16px",
              borderRadius: 8,
              fontSize: 13,
              background: "rgba(124,58,237,0.12)",
              color: "var(--brand-primary, #7c3aed)",
              border: "1px solid rgba(124,58,237,0.3)",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {filtered.map((h) => <HackathonCard key={h.slug} h={h} />)}
        </div>
      )}
    </div>
  );
}
