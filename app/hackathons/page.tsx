"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import type { Hackathon, HackathonStatus } from "@/lib/types";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";

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

function HackathonCard({ h }: { h: Hackathon }) {
  const rush = isRushMode(h.period.submissionDeadlineAt);
  const dday = dDayLabel(h.period.submissionDeadlineAt);

  return (
    <Link href={h.links.detail} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{
          padding: "1.5rem",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          height: "100%",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <StatusBadge status={h.status} />
          {h.status !== "ended" && (
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: rush ? "#ef4444" : "var(--muted)",
              }}
            >
              {rush ? `🔥 ${dday}` : dday}
            </span>
          )}
        </div>

        <div>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text)",
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              marginBottom: "0.5rem",
            }}
          >
            {h.title}
          </h3>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {h.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          {h.maxPrizeKRW ? (
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: 2 }}>최대 상금</div>
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#a78bfa" }}>
                {formatPrize(h.maxPrizeKRW)}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>상금 미정</div>
          )}
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--muted)",
              textAlign: "right",
            }}
          >
            마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        height: 200,
        borderRadius: 12,
        background: "var(--surface)",
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

  const allTags = Array.from(new Set(hackathons.flatMap((h) => h.tags)));

  const q = query.trim().toLowerCase();

  const filtered = hackathons
    .filter((h) => !q || h.title.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)))
    .filter((h) => statusFilter === "all" || h.status === statusFilter)
    .filter((h) => !tagFilter || h.tags.includes(tagFilter))
    .sort((a, b) => {
      if (sort === "prize") return (b.maxPrizeKRW ?? 0) - (a.maxPrizeKRW ?? 0);
      return new Date(a.period.submissionDeadlineAt).getTime() - new Date(b.period.submissionDeadlineAt).getTime();
    });

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>해커톤 목록</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
          상금·일정·팀 현황을 한눈에 비교하고 참가할 대회를 찾아보세요
        </p>
      </div>

      {/* 검색창 */}
      <div style={{ position: "relative", marginBottom: "1rem" }}>
        <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", fontSize: "1rem", pointerEvents: "none" }}>🔍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="대회명 또는 태그로 검색..."
          style={{
            width: "100%",
            padding: "0.75rem 1rem 0.75rem 2.75rem",
            borderRadius: 10,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            color: "var(--text)",
            fontSize: "0.95rem",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1rem" }}
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
          background: "var(--surface)",
          borderRadius: 12,
          border: "1px solid var(--border)",
        }}
      >
        {/* 상태 필터 */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              style={{
                padding: "0.375rem 0.75rem",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: statusFilter === opt.value ? 700 : 400,
                background: statusFilter === opt.value ? "rgba(124,58,237,0.2)" : "transparent",
                color: statusFilter === opt.value ? "#a78bfa" : "var(--muted)",
                border: statusFilter === opt.value ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "var(--border)" }} />

        {/* 태그 필터 */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
              style={{
                padding: "0.25rem 0.625rem",
                borderRadius: 6,
                fontSize: "0.72rem",
                fontWeight: tagFilter === tag ? 700 : 400,
                background: tagFilter === tag ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.06)",
                color: tagFilter === tag ? "#a78bfa" : "#7c6da0",
                border: tagFilter === tag ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(124,58,237,0.15)",
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
              padding: "0.375rem 0.75rem",
              borderRadius: 8,
              fontSize: "0.8rem",
              background: "var(--surface2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              cursor: "pointer",
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
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
          {filtered.length}개 해커톤
        </div>
      )}

      {/* 카드 그리드 */}
      {!initialized ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "4rem 2rem",
            background: "var(--surface)",
            borderRadius: 12,
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🔍</div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>조건에 맞는 해커톤이 없습니다</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>필터를 조정해보세요</div>
          <button
            onClick={() => { setQuery(""); setStatusFilter("all"); setTagFilter(null); }}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: 8,
              fontSize: "0.85rem",
              background: "rgba(124,58,237,0.15)",
              color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.3)",
              cursor: "pointer",
            }}
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {filtered.map((h) => <HackathonCard key={h.slug} h={h} />)}
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
