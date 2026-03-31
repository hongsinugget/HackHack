"use client";

import { useStore } from "@/lib/store";
import HeroCarousel from "@/components/HeroCarousel";
import HackathonPreview from "@/components/HackathonPreview";
import TeamPreview from "@/components/TeamPreview";
import RankingPreview from "@/components/RankingPreview";

export default function HomePage() {
  const { hackathons, teams, leaderboards, initialized } = useStore();

  if (!initialized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {[240, 180, 180].map((h, i) => (
          <div
            key={i}
            style={{
              height: h,
              borderRadius: 12,
              background: "var(--surface)",
              animation: "pulse 1.5s ease-in-out infinite",
            }}
          />
        ))}
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      {/* 히어로 캐러셀 */}
      <HeroCarousel hackathons={hackathons} />

      {/* 해커톤 목록 미리보기 */}
      <HackathonPreview hackathons={hackathons} />

      {/* 팀 모집 미리보기 */}
      <TeamPreview teams={teams} />

      {/* 랭킹 미리보기 */}
      <RankingPreview leaderboards={leaderboards} />
    </div>
  );
}
