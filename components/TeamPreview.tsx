import { memo } from "react";
import Link from "next/link";
import type { Team } from "@/lib/types";
import { ROLE_COLORS } from "@/lib/constants";

const TeamCard = memo(function TeamCard({ team }: { team: Team }) {
  return (
    <div className="card" style={{ padding: "1.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>{team.name}</div>
        </div>
        <span
          style={{
            fontSize: "0.7rem",
            color: "#10b981",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            padding: "2px 8px",
            borderRadius: 9999,
          }}
        >
          모집중
        </span>
      </div>

      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--muted)",
          marginBottom: "0.875rem",
          lineHeight: 1.5,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {team.intro}
      </p>

      <div style={{ marginBottom: "0.75rem" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--muted)", display: "block", marginBottom: "0.375rem" }}>🔍 구인중</span>
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {team.lookingFor.map((role) => (
            <span
              key={role}
              style={{
                fontSize: "0.7rem",
                padding: "2px 8px",
                borderRadius: 6,
                border: `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}40`,
                color: ROLE_COLORS[role] ?? "var(--muted)",
                background: `${ROLE_COLORS[role] ?? "#6b6b80"}15`,
              }}
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
          팀원 {team.memberCount}명
        </span>
        <Link
          href={team.contact.url}
          style={{
            fontSize: "0.75rem",
            color: "#a78bfa",
            textDecoration: "none",
            padding: "4px 10px",
            border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 6,
            background: "rgba(124,58,237,0.08)",
          }}
        >
          합류하기
        </Link>
      </div>
    </div>
  );
});

export default function TeamPreview({ teams }: { teams: Team[] }) {
  const openTeams = teams.filter((t) => t.isOpen).slice(0, 3);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">🤝 팀 모집</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>지금 합류할 수 있는 팀</div>
        </div>
        <Link
          href="/camp"
          style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none" }}
        >
          더 많은 팀 보기 →
        </Link>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {openTeams.map((team) => (
          <TeamCard key={team.teamCode} team={team} />
        ))}
      </div>
    </section>
  );
}
