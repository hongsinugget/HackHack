"use client";

import Link from "next/link";
import type { Hackathon } from "@/lib/types";
import HackathonCard from "./HackathonCard";

export default function HackathonPreview({ hackathons }: { hackathons: Hackathon[] }) {
  const sorted = [...hackathons]
    .filter((h) => h.status !== "ended")
    .sort((a, b) => (b.maxPrizeKRW ?? 0) - (a.maxPrizeKRW ?? 0))
    .slice(0, 2);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">해커톤 목록</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginTop: 2 }}>지금 상금이 제일 높아요</div>
        </div>
        <Link href="/hackathons" style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontWeight: 600 }}>
          더 많은 해커톤 보러가기 →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
        {sorted.map((h) => (
          <HackathonCard key={h.slug} h={h} maxTags={3} />
        ))}
      </div>
    </section>
  );
}
