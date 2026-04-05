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
      {/* 히어로 캐러셀 — 전체 너비 */}
      <HeroCarousel hackathons={hackathons} />

      {/* 2-column layout: left 702px | gap 38px | right 320px */}
      <div
        style={{
          display: "flex",
          gap: 38,
          alignItems: "flex-start",
        }}
      >
        {/* Left column */}
        <div style={{ flex: "1 1 702px", minWidth: 0, display: "flex", flexDirection: "column", gap: "3rem" }}>
          <HackathonPreview hackathons={hackathons} />
          <TeamPreview teams={teams} />
        </div>

        {/* Right column */}
        <div style={{ flex: "0 0 320px", width: 320, display: "flex", flexDirection: "column", gap: "2rem" }}>
          <RankingPreview leaderboards={leaderboards} />
          <CommunitySection posts={MOCK_POSTS} viewAllHref="/community" />
        </div>
      </div>

      {/* Footer banner — full bleed (negate layout padding) */}
      <div style={{ margin: "0 -1.25rem -2rem" }}>
        <FooterBanner />
      </div>
    </div>
  );
}
