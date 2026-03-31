import Link from "next/link";
import type { Leaderboard } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export default function RankingPreview({ leaderboards }: { leaderboards: Leaderboard[] }) {
  // 가장 최근 업데이트된 리더보드
  const board = leaderboards.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  if (!board) return null;

  const top = board.entries.slice(0, 3);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">🏅 랭킹</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
            상위 참가팀 · {board.hackathonSlug}
          </div>
        </div>
        <Link
          href="/rankings"
          style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none" }}
        >
          전체 랭킹 보기 →
        </Link>
      </div>

      <div
        className="card"
        style={{ padding: "0.5rem", overflow: "hidden" }}
      >
        {top.map((entry, idx) => (
          <div
            key={entry.rank}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "0.875rem 1rem",
              borderRadius: 8,
              background: idx === 0 ? "rgba(124,58,237,0.08)" : "transparent",
              borderBottom: idx < top.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: "1.25rem", width: 28, flexShrink: 0 }}>
              {MEDALS[idx]}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>
                {entry.teamName}
              </div>
              {entry.scoreBreakdown && (
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                  참가자 {entry.scoreBreakdown.participant}점 · 심사위원 {entry.scoreBreakdown.judge}점
                </div>
              )}
            </div>
            <div
              style={{
                fontWeight: 800,
                fontSize: "1.1rem",
                color: idx === 0 ? "#a78bfa" : "var(--text)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {typeof entry.score === "number" && entry.score < 1
                ? entry.score.toFixed(4)
                : entry.score.toFixed(1)}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
