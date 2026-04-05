"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import type { HackathonStatus } from "@/lib/types";
import { computeStatus } from "@/lib/utils";
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
    const now = new Date();
    return hackathons
      .filter((h) => !q || h.title.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)))
      .filter((h) => statusFilter === "all" || computeStatus(h.period) === statusFilter)
      .filter((h) => !tagFilter || h.tags.includes(tagFilter))
      .sort((a, b) => {
        if (sort === "prize") return (b.maxPrizeKRW ?? 0) - (a.maxPrizeKRW ?? 0);
        return Date.parse(a.period.submissionDeadlineAt) - Date.parse(b.period.submissionDeadlineAt);
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
          상금·일정 현황을 한눈에 비교하고 참가할 대회를 찾아보세요
        </p>
      </div>

      {/* 검색창 */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
          <img src="/icons/search-icon.svg" alt="" width={16} height={16} />
        </span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="대회명 또는 태그로 검색..."
          style={{
            width: "100%",
            padding: "12px 16px 12px 44px",
            borderRadius: 10,
            background: "var(--bg-main, #f0f2f5)",
            border: "1px solid var(--border-subtle, #dde1e6)",
            color: "var(--text-main, #12121a)",
            fontSize: 13,
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
          borderRadius: 10,
          border: "1px solid var(--border-subtle, #dde1e6)",
        }}
      >
        {/* 상태 필터 — Container-Button */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                if (opt.value === "all") setTagFilter(null);
              }}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                fontSize: 12.8,
                fontWeight: statusFilter === opt.value ? 700 : 400,
                background: statusFilter === opt.value ? "rgba(124,58,237,0.2)" : "transparent",
                color: statusFilter === opt.value ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* 태그 필터 — Container-tag / Container-tag-Pressed */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {allTags.map((tag) => {
            const isSelected = tagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setTagFilter(isSelected ? null : tag)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "4px 9px",
                  borderRadius: 2,
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 400,
                  background: isSelected ? "var(--bg-input, #dee2e6)" : "transparent",
                  color: isSelected ? "var(--text-main, #12121a)" : "var(--text-subtle, #4b5563)",
                  border: isSelected ? "none" : "1px solid var(--bg-input, #dee2e6)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  letterSpacing: "0.224px",
                }}
              >
                {tag}
                {isSelected && (
                  <span style={{ fontSize: 10, lineHeight: 1, opacity: 0.6 }}>✕</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 결과 수 + 정렬 */}
      {initialized && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <span style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)" }}>
            {filtered.length}개 해커톤
          </span>
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
            background: "var(--bg-main, #f0f2f5)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem" }}>
            <img src="/icons/search-icon.svg" alt="" width={32} height={32} style={{ opacity: 0.4 }} />
          </div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>
            {tagFilter ? `'${tagFilter}' 태그에 맞는 해커톤이 없어요` : "조건에 맞는 해커톤이 없어요"}
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1rem", flexWrap: "wrap" }}>
            {tagFilter && (
              <button
                onClick={() => setTagFilter(null)}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, background: "rgba(124,58,237,0.12)", color: "var(--brand-primary, #7c3aed)", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                '{tagFilter}' 태그 해제
              </button>
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, background: "rgba(124,58,237,0.12)", color: "var(--brand-primary, #7c3aed)", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                검색어 지우기
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {filtered.map((h) => <HackathonCard key={h.slug} h={h} />)}
        </div>
      )}
    </div>
  );
}
