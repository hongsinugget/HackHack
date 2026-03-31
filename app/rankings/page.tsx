"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Leaderboard, LeaderboardEntry } from "@/lib/types";

const MEDAL_COLORS = ["#fbbf24", "#94a3b8", "#b45309"];
const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [140, 100, 80];

function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  const order = [1, 0, 2]; // 2위, 1위, 3위 순으로 배치

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "0.75rem",
        padding: "2rem 1rem 0",
        marginBottom: "2rem",
      }}
    >
      {order.map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const isFirst = idx === 0;

        return (
          <div key={entry.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: 200 }}>
            {/* 메달 + 팀명 */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isFirst ? "2rem" : "1.5rem" }}>{MEDALS[idx]}</div>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: isFirst ? "1rem" : "0.9rem",
                  color: "var(--text)",
                  marginTop: "0.25rem",
                  maxWidth: 140,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {entry.teamName}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: MEDAL_COLORS[idx], marginTop: 2 }}>
                {entry.score < 1 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
              </div>
            </div>

            {/* 포디움 블록 */}
            <div
              style={{
                width: "100%",
                height: PODIUM_HEIGHTS[idx],
                borderRadius: "8px 8px 0 0",
                background: isFirst
                  ? "linear-gradient(180deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.15) 100%)"
                  : "linear-gradient(180deg, rgba(107,107,128,0.2) 0%, rgba(107,107,128,0.08) 100%)",
                border: isFirst ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
                borderBottom: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.5rem",
                fontWeight: 800,
                color: isFirst ? "#a78bfa" : "var(--muted)",
              }}
            >
              {entry.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LeaderboardTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "48px 1fr 120px 120px",
          padding: "0.75rem 1.25rem",
          fontSize: "0.75rem",
          color: "var(--muted)",
          fontWeight: 600,
          borderBottom: "1px solid var(--border)",
          letterSpacing: "0.04em",
        }}
      >
        <div>순위</div>
        <div>팀명</div>
        <div style={{ textAlign: "right" }}>점수</div>
        <div style={{ textAlign: "right" }}>제출일</div>
      </div>
      {entries.map((entry, idx) => (
        <div
          key={entry.rank}
          style={{
            display: "grid",
            gridTemplateColumns: "48px 1fr 120px 120px",
            padding: "1rem 1.25rem",
            alignItems: "center",
            background: entry.rank <= 3 ? `rgba(124,58,237,${0.06 - idx * 0.01})` : "transparent",
            borderBottom: idx < entries.length - 1 ? "1px solid var(--border)" : "none",
            transition: "background 0.15s",
          }}
        >
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: idx < 3 ? MEDAL_COLORS[idx] : "var(--muted)" }}>
            {idx < 3 ? MEDALS[idx] : `#${entry.rank}`}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{entry.teamName}</div>
            {entry.scoreBreakdown && (
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                참가자 {entry.scoreBreakdown.participant} · 심사위원 {entry.scoreBreakdown.judge}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", fontWeight: 800, fontVariantNumeric: "tabular-nums", color: idx === 0 ? "#a78bfa" : "var(--text)" }}>
            {entry.score < 1 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
          </div>
          <div style={{ textAlign: "right", fontSize: "0.75rem", color: "var(--muted)" }}>
            {new Date(entry.submittedAt).toLocaleDateString("ko-KR")}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RankingsPage() {
  const { leaderboards, hackathons, initialized } = useStore();
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    if (leaderboards.length > 0 && !selectedSlug) {
      // 가장 최근 업데이트된 리더보드 기본 선택
      const latest = [...leaderboards].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setSelectedSlug(latest.hackathonSlug);
    }
  }, [leaderboards, selectedSlug]);

  const currentBoard: Leaderboard | undefined = leaderboards.find((b) => b.hackathonSlug === selectedSlug);

  const getTitle = (slug: string) =>
    hackathons.find((h) => h.slug === slug)?.title ?? slug;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>글로벌 랭킹</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>해커톤을 넘나드는 누적 실력을 확인하세요</p>
      </div>

      {/* 해커톤 선택 탭 */}
      {initialized && leaderboards.length > 1 && (
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", overflowX: "auto", paddingBottom: "0.25rem" }}>
          {leaderboards.map((board) => (
            <button
              key={board.hackathonSlug}
              onClick={() => setSelectedSlug(board.hackathonSlug)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: selectedSlug === board.hackathonSlug ? 700 : 400,
                background: selectedSlug === board.hackathonSlug ? "rgba(124,58,237,0.2)" : "var(--surface)",
                color: selectedSlug === board.hackathonSlug ? "#a78bfa" : "var(--muted)",
                border: selectedSlug === board.hackathonSlug ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
            >
              {getTitle(board.hackathonSlug).slice(0, 20)}…
            </button>
          ))}
        </div>
      )}

      {!initialized ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[300, 200].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : !currentBoard || currentBoard.entries.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏁</div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>아직 순위 데이터가 없습니다</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>결과물을 제출하면 리더보드에 반영됩니다</div>
        </div>
      ) : (
        <div>
          {/* 선택된 해커톤 제목 */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>현재 보는 리더보드</div>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{getTitle(currentBoard.hackathonSlug)}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
              업데이트: {new Date(currentBoard.updatedAt).toLocaleString("ko-KR")}
            </div>
          </div>

          {/* 포디움 */}
          {currentBoard.entries.length >= 2 && (
            <Podium entries={currentBoard.entries} />
          )}

          {/* 전체 순위표 */}
          <LeaderboardTable entries={currentBoard.entries} />
        </div>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
