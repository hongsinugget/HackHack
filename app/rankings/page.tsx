"use client";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/lib/store";
import type { Leaderboard, LeaderboardEntry, Team } from "@/lib/types";

const MEDAL_COLORS = ["var(--brand-primary)", "#94a3b8", "#b45309"];
const MEDALS = ["🥇", "🥈", "🥉"];
const PODIUM_HEIGHTS = [140, 100, 80];

// ── 개인 랭킹 집계 타입 ──────────────────────────────
type UserRankEntry = {
  rank: number;
  nickname: string;
  totalScore: number;
  hackathonCount: number;
  bestRank: number;
};

function computeUserRanking(
  leaderboards: Leaderboard[],
  teams: Team[],
  period: "all" | "30d" | "7d"
): UserRankEntry[] {
  const cutoff =
    period === "all"
      ? null
      : new Date(Date.now() - (period === "7d" ? 7 : 30) * 24 * 60 * 60 * 1000);

  const userMap = new Map<
    string,
    { totalScore: number; hackathonSlugs: Set<string>; bestRank: number }
  >();

  for (const lb of leaderboards) {
    for (const entry of lb.entries) {
      if (cutoff && new Date(entry.submittedAt) < cutoff) continue;
      const team = teams.find((t) => t.name === entry.teamName);
      const members = team?.members?.filter(Boolean) ?? [];
      if (members.length === 0) continue;

      for (const nickname of members) {
        if (!userMap.has(nickname)) {
          userMap.set(nickname, {
            totalScore: 0,
            hackathonSlugs: new Set(),
            bestRank: Infinity,
          });
        }
        const u = userMap.get(nickname)!;
        u.totalScore += entry.score;
        u.hackathonSlugs.add(lb.hackathonSlug);
        if (entry.rank < u.bestRank) u.bestRank = entry.rank;
      }
    }
  }

  return Array.from(userMap.entries())
    .sort((a, b) => b[1].totalScore - a[1].totalScore)
    .map(([nickname, data], idx) => ({
      rank: idx + 1,
      nickname,
      totalScore: data.totalScore,
      hackathonCount: data.hackathonSlugs.size,
      bestRank: data.bestRank === Infinity ? 0 : data.bestRank,
    }));
}

// ── 포디움 (팀별) ─────────────────────────────────────
function TeamPodium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3);
  const order = [1, 0, 2];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0.75rem", padding: "2rem 1rem 0", marginBottom: "2rem" }}>
      {order.map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const isFirst = idx === 0;
        const isThird = idx === 2;
        const podiumBg = isFirst
          ? "linear-gradient(180deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.15) 100%)"
          : isThird
          ? "linear-gradient(180deg, rgba(180,83,9,0.35) 0%, rgba(180,83,9,0.12) 100%)"
          : "linear-gradient(180deg, rgba(107,107,128,0.2) 0%, rgba(107,107,128,0.08) 100%)";
        const podiumBorder = isFirst
          ? "1px solid rgba(124,58,237,0.4)"
          : isThird
          ? "1px solid rgba(180,83,9,0.4)"
          : "1px solid var(--border)";
        const podiumColor = isFirst ? "#a78bfa" : isThird ? "#b45309" : "var(--muted)";
        return (
          <div key={entry.rank} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: 200 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: isFirst ? "2rem" : "1.5rem" }}>{MEDALS[idx]}</div>
              <div style={{ fontWeight: 800, fontSize: isFirst ? "1rem" : "0.9rem", color: "var(--text)", marginTop: "0.25rem", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.teamName}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: MEDAL_COLORS[idx], marginTop: 2 }}>
                {entry.score < 1 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
              </div>
            </div>
            <div style={{ width: "100%", height: PODIUM_HEIGHTS[idx], borderRadius: "8px 8px 0 0", background: podiumBg, border: podiumBorder, borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: podiumColor }}>
              {entry.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 포디움 (개인) ─────────────────────────────────────
function UserPodium({ entries }: { entries: UserRankEntry[] }) {
  const top3 = entries.slice(0, 3);
  const order = [1, 0, 2];
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "0.75rem", padding: "2rem 1rem 0", marginBottom: "2rem" }}>
      {order.map((idx) => {
        const entry = top3[idx];
        if (!entry) return null;
        const isFirst = idx === 0;
        return (
          <div key={entry.nickname} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", flex: 1, maxWidth: 200 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 800, fontSize: isFirst ? "1rem" : "0.9rem", color: "var(--text)", marginTop: "0.25rem", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {entry.nickname}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: MEDAL_COLORS[idx], marginTop: 2 }}>
                {entry.totalScore < 1 ? entry.totalScore.toFixed(4) : entry.totalScore.toFixed(1)}
              </div>
            </div>
            <div style={{ width: "100%", height: PODIUM_HEIGHTS[idx], borderRadius: "8px 8px 0 0", background: isFirst ? "linear-gradient(180deg, rgba(124,58,237,0.4) 0%, rgba(124,58,237,0.15) 100%)" : "linear-gradient(180deg, rgba(107,107,128,0.2) 0%, rgba(107,107,128,0.08) 100%)", border: isFirst ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border)", borderBottom: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: 800, color: isFirst ? "#a78bfa" : "var(--muted)" }}>
              {entry.rank}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 팀별 순위표 ──────────────────────────────────────
function TeamTable({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 120px 120px", padding: "0.75rem 1.25rem", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", letterSpacing: "0.04em" }}>
        <div>순위</div><div>팀명</div><div style={{ textAlign: "right" }}>점수</div><div style={{ textAlign: "right" }}>제출일</div>
      </div>
      {entries.map((entry, i) => {
        const is1st = i === 0;
        const rankColor = is1st ? "var(--brand-primary)" : "var(--text-main)";
        return (
          <div
            key={entry.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "0.875rem 1.25rem",
              borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ width: 40, flexShrink: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", lineHeight: "16px", color: rankColor }}>
              {entry.rank}위
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: rankColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.teamName}</div>
              {entry.scoreBreakdown && (
                <div style={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.224px", color: "var(--text-muted)" }}>
                  참가자 {entry.scoreBreakdown.participant.toFixed(1)} · 심사위원 {entry.scoreBreakdown.judge.toFixed(1)}
                </div>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: "var(--brand-primary)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
              {entry.score < 1 && entry.score > 0 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", letterSpacing: "0.224px" }}>
              {new Date(entry.submittedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 개인 순위표 ──────────────────────────────────────
function UserTable({ entries }: { entries: UserRankEntry[] }) {
  return (
    <div style={{ overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "48px 1fr 100px 80px", padding: "0.75rem 1.25rem", fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600, borderBottom: "1px solid var(--border)", letterSpacing: "0.04em" }}>
        <div>순위</div><div>닉네임</div><div style={{ textAlign: "right" }}>누적 점수</div><div style={{ textAlign: "right" }}>참가 수</div>
      </div>
      {entries.map((entry, idx) => (
        <div key={entry.nickname} style={{ display: "grid", gridTemplateColumns: "48px 1fr 100px 80px", padding: "1rem 1.25rem", alignItems: "center", background: "transparent", borderBottom: idx < entries.length - 1 ? "1px solid var(--border)" : "none" }}>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, color: idx < 3 ? MEDAL_COLORS[idx] : "var(--muted)" }}>
            #{entry.rank}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{entry.nickname}</div>
            {entry.bestRank > 0 && (
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                최고 순위 {entry.bestRank}위
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", fontWeight: 800, color: idx === 0 ? "#a78bfa" : "var(--text)" }}>
            {entry.totalScore < 1 ? entry.totalScore.toFixed(4) : entry.totalScore.toFixed(1)}
          </div>
          <div style={{ textAlign: "right", fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>
            {entry.hackathonCount}회
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────
export default function RankingsPage() {
  const leaderboards = useStore((s) => s.leaderboards);
  const hackathons = useStore((s) => s.hackathons);
  const teams = useStore((s) => s.teams);
  const initialized = useStore((s) => s.initialized);
  const [rankingMode, setRankingMode] = useState<"user" | "team">("user");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [period, setPeriod] = useState<"all" | "30d" | "7d">("all");

  useEffect(() => {
    if (leaderboards.length > 0 && !selectedSlug) {
      const latest = [...leaderboards].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];
      setSelectedSlug(latest.hackathonSlug);
    }
  }, [leaderboards, selectedSlug]);

  const currentBoard = leaderboards.find((b) => b.hackathonSlug === selectedSlug);

  const filteredTeamEntries = useMemo(() => {
    if (!currentBoard) return [];
    if (period === "all") return currentBoard.entries;
    const days = period === "7d" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return currentBoard.entries.filter((e) => new Date(e.submittedAt) >= cutoff);
  }, [currentBoard, period]);

  const userEntries = useMemo(
    () => computeUserRanking(leaderboards, teams, period),
    [leaderboards, teams, period]
  );

  const getTitle = (slug: string) =>
    hackathons.find((h) => h.slug === slug)?.title ?? slug;

  const PERIOD_LABELS = { all: "전체", "30d": "최근 30일", "7d": "최근 7일" } as const;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>글로벌 랭킹</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>해커톤을 넘나드는 누적 실력을 확인하세요</p>
      </div>

      {/* 개인/팀별 모드 탭 */}
      <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", background: "var(--surface)", borderRadius: 10, padding: "0.25rem", border: "1px solid var(--border)", width: "fit-content" }}>
        {([["user", "개인 랭킹"], ["team", "팀별 랭킹"]] as const).map(([mode, label]) => (
          <button
            key={mode}
            onClick={() => setRankingMode(mode)}
            style={{
              padding: "0.45rem 1.1rem", borderRadius: 8, fontSize: "0.875rem",
              fontWeight: rankingMode === mode ? 700 : 400,
              background: rankingMode === mode ? "var(--accent)" : "transparent",
              color: rankingMode === mode ? "#fff" : "var(--muted)",
              border: "none", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 팀별 모드: 해커톤 선택 탭 */}
      {rankingMode === "team" && initialized && leaderboards.length > 1 && (
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem", overflowX: "auto", paddingBottom: "0.25rem", flexWrap: "wrap" }}>
          {leaderboards.map((board) => (
            <button
              key={board.hackathonSlug}
              onClick={() => setSelectedSlug(board.hackathonSlug)}
              style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 12.8,
                fontWeight: selectedSlug === board.hackathonSlug ? 700 : 400,
                background: selectedSlug === board.hackathonSlug ? "rgba(124,58,237,0.2)" : "transparent",
                color: selectedSlug === board.hackathonSlug ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                border: "none", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s",
              }}
            >
              {getTitle(board.hackathonSlug).slice(0, 20)}…
            </button>
          ))}
        </div>
      )}

      {/* 기간 필터 */}
      {initialized && (
        <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.5rem" }}>
          {(["all", "7d", "30d"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "0.4rem 0.875rem", borderRadius: 8, fontSize: "0.8rem",
                fontWeight: period === p ? 700 : 400,
                background: "transparent",
                color: period === p ? "var(--brand-primary)" : "var(--muted)",
                border: "none",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      )}

      {/* 로딩 스켈레톤 */}
      {!initialized ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[300, 200].map((h, i) => (
            <div key={i} style={{ height: h, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>

      ) : rankingMode === "user" ? (
        /* ── 개인 랭킹 뷰 ── */
        userEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>
              {period !== "all" ? "해당 기간에 집계된 데이터가 없습니다" : "아직 개인 랭킹 데이터가 없습니다"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {period !== "all" ? "다른 기간을 선택해보세요" : "팀에 소속된 상태로 결과물을 제출하면 반영됩니다"}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>집계 기준</div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>전체 해커톤 누적 점수</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>팀 점수를 팀원 전원에게 동일하게 집계합니다</div>
            </div>
            {userEntries.length >= 3 && <UserPodium entries={userEntries} />}
            <UserTable entries={userEntries} />
          </div>
        )

      ) : (
        /* ── 팀별 랭킹 뷰 ── */
        !currentBoard || filteredTeamEntries.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>
              {currentBoard && period !== "all" ? "해당 기간에 제출된 결과가 없습니다" : "아직 순위 데이터가 없습니다"}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              {currentBoard && period !== "all" ? "다른 기간을 선택해보세요" : "결과물을 제출하면 리더보드에 반영됩니다"}
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 4 }}>현재 보는 리더보드</div>
              <div style={{ fontWeight: 700, fontSize: "1rem" }}>{getTitle(currentBoard.hackathonSlug)}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                업데이트: {new Date(currentBoard.updatedAt).toLocaleString("ko-KR")}
              </div>
            </div>
            {filteredTeamEntries.length >= 3 && <TeamPodium entries={filteredTeamEntries} />}
            <TeamTable entries={filteredTeamEntries} />
          </div>
        )
      )}

    </div>
  );
}
