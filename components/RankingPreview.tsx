"use client";

import { memo, useState, useMemo } from "react";
import type { Leaderboard } from "@/lib/types";

const RankingPreview = memo(function RankingPreview({ leaderboards }: { leaderboards: Leaderboard[] }) {
  const [activeTab, setActiveTab] = useState<"team" | "individual">("team");

  /* 원본 배열 변이 방지: 복사 후 정렬 + useMemo로 렌더마다 재계산 방지 */
  const board = useMemo(
    () =>
      [...leaderboards].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0],
    [leaderboards]
  );

  if (!board) return null;

  const top = board.entries.slice(0, 3);

  /* slug에서 연월 추출 (예: daker-handover-2026-03 → 2026-03) */
  const periodMatch = board.hackathonSlug.match(/(\d{4}-\d{2})$/);
  const period = periodMatch ? periodMatch[1] : board.hackathonSlug;

  return (
    <section>
      {/* RankingPreview-Team 컴포넌트 (node 140:3772) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* 탭 + 기간 정보 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {/* 탭 버튼 */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => setActiveTab("team")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "team"
                  ? "3px solid var(--brand-primary, #7c3aed)"
                  : "3px solid transparent",
                height: 40,
                padding: "0 4px",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: "30px",
                color: activeTab === "team"
                  ? "var(--brand-primary, #7c3aed)"
                  : "#4b5563",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              팀 랭킹
            </button>
            <button
              onClick={() => setActiveTab("individual")}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeTab === "individual"
                  ? "3px solid var(--brand-primary, #7c3aed)"
                  : "3px solid transparent",
                height: 40,
                padding: "0 4px",
                fontSize: 20,
                fontWeight: 800,
                lineHeight: "30px",
                color: activeTab === "individual"
                  ? "var(--brand-primary, #7c3aed)"
                  : "#4b5563",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              개인 랭킹
            </button>
          </div>

          {/* 기간 정보 */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 400,
              lineHeight: "20px",
              color: "#6b6b80",
              textAlign: "right",
            }}
          >
            <div>상위 참가팀</div>
            <div>{period} 기준</div>
          </div>
        </div>

        {/* 랭킹 목록 — bg/border 없음, padding 9px */}
        <div style={{ paddingTop: 9, paddingLeft: 9, paddingRight: 9, paddingBottom: 1, borderRadius: 12 }}>
          {activeTab === "individual" ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 120,
                fontSize: 13,
                color: "#6b6b80",
              }}
            >
              개인 랭킹 유저가 없습니다.
            </div>
          ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {top.map((entry, idx) => {
              const is1st = idx === 0;
              const rankColor = is1st ? "var(--brand-primary, #7c3aed)" : "var(--text-main, #12121a)";

              return (
                <div
                  key={entry.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    height: idx < 2 ? 71 : 70,
                    borderRadius: 8,
                  }}
                >
                  {/* 순위 번호: N위 형식, Caption/Tag 스타일 */}
                  <div
                    style={{
                      width: 40,
                      flexShrink: 0,
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.224px",
                      lineHeight: "16px",
                      color: rankColor,
                    }}
                  >
                    {entry.rank}위
                  </div>

                  {/* 팀명 + 점수 breakdown */}
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <div
                      style={{
                        fontSize: 16,
                        fontWeight: 700,
                        lineHeight: "24px",
                        color: rankColor,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {entry.teamName}
                    </div>
                    {entry.scoreBreakdown && (
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 400,
                          lineHeight: "16px",
                          letterSpacing: "0.224px",
                          color: "#6b6b80",
                          whiteSpace: "nowrap",
                        }}
                      >
                        참가자 {entry.scoreBreakdown.participant}점 · 심사위원 {entry.scoreBreakdown.judge}점
                      </div>
                    )}
                  </div>

                  {/* 점수 */}
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: "24px",
                      color: rankColor,
                      flexShrink: 0,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {typeof entry.score === "number" && entry.score < 1
                      ? entry.score.toFixed(4)
                      : entry.score.toFixed(1)}
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    </section>
  );
});

export default RankingPreview;
