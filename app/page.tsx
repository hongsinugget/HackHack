"use client";

import { useStore } from "@/lib/store";
import HeroCarousel from "@/components/HeroCarousel";
import HackathonPreview from "@/components/HackathonPreview";
import TeamPreview from "@/components/TeamPreview";
import RankingPreview from "@/components/RankingPreview";
import FooterBanner from "@/components/FooterBanner";
import { CommunitySection } from "@/src/components/community";
import { MOCK_POSTS } from "@/src/components/community/mockData";

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
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
      {/* 히어로 캐러셀 — 전체 너비 */}
      <HeroCarousel hackathons={hackathons} />

      {/* 2-column layout: left 702px | gap 38px | right 320px — 모바일에서 단일 컬럼 */}
      <div className="home-2col">
        {/* Left column */}
        <div className="home-left-col" style={{ flex: "1 1 702px", minWidth: 0, display: "flex", flexDirection: "column", gap: "3rem" }}>
          <HackathonPreview hackathons={hackathons} />
          <TeamPreview teams={teams} hackathons={hackathons} />
        </div>

        {/* Right column */}
        <div className="home-right-col" style={{ flex: "0 0 320px", width: 320, display: "flex", flexDirection: "column", gap: "2rem" }}>
          <RankingPreview leaderboards={leaderboards} />
          <CommunitySection posts={MOCK_POSTS} viewAllHref="/community" />
        </div>
      </div>

      {/* Footer banner — full bleed (viewport width 트릭으로 maxWidth 컨테이너 탈출) */}
      <div
        style={{
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          width: "100vw",
          marginBottom: "-2rem",
        }}
      >
        <FooterBanner />
      </div>
    </div>
  );
}
