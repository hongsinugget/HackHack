import Link from "next/link";
import type { Hackathon } from "@/lib/types";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

function HackathonCard({ h }: { h: Hackathon }) {
  const rush = isRushMode(h.period.submissionDeadlineAt);
  const dday = dDayLabel(h.period.submissionDeadlineAt);

  return (
    <Link href={h.links.detail} style={{ textDecoration: "none" }}>
      <div
        className="card"
        style={{ padding: "1.25rem", cursor: "pointer", height: "100%" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
          <StatusBadge status={h.status} />
          {(h.status === "ongoing" || h.status === "upcoming") && (
            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: rush ? "#ef4444" : "var(--muted)",
              }}
            >
              {dday}
            </span>
          )}
        </div>

        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "0.5rem",
            lineHeight: 1.4,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {h.title}
        </h3>

        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {h.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {h.maxPrizeKRW && (
          <div
            style={{
              fontSize: "1.25rem",
              fontWeight: 800,
              color: "#a78bfa",
              marginTop: "auto",
            }}
          >
            {formatPrize(h.maxPrizeKRW)}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HackathonPreview({ hackathons }: { hackathons: Hackathon[] }) {
  const sorted = [...hackathons]
    .sort((a, b) => (b.maxPrizeKRW ?? 0) - (a.maxPrizeKRW ?? 0))
    .slice(0, 3);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">🏆 해커톤 목록</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>상금 높은 순</div>
        </div>
        <Link
          href="/hackathons"
          style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}
        >
          더 많은 해커톤 보러가기 →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {sorted.map((h) => (
          <HackathonCard key={h.slug} h={h} />
        ))}
      </div>
    </section>
  );
}
