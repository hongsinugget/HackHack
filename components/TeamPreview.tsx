import { memo } from "react";
import Link from "next/link";
import type { Team, Hackathon } from "@/lib/types";

const TeamCard = memo(function TeamCard({ team, hackathonTitle }: { team: Team; hackathonTitle?: string }) {
  return (
    <div
      style={{
        background: "var(--bg-main, #f0f2f5)",
        border: "1px solid var(--border-subtle, #dde1e6)",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        height: "100%",
        transition: "transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-2px)";
        el.style.borderColor = "var(--brand-primary, #7c3aed)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.borderColor = "var(--border-subtle, #dde1e6)";
      }}
    >
      {/* 대회 정보 */}
      {hackathonTitle && (
        <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border-subtle, #dde1e6)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {hackathonTitle}
          </div>
        </div>
      )}

      {/* 팀명 */}
      <div style={{ fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "var(--text-main, #12121a)" }}>
        {team.name}
      </div>

      {/* 소개 */}
      <p
        style={{
          fontSize: 13,
          color: "var(--text-subtle, #4b5563)",
          margin: 0,
          lineHeight: "20px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {team.intro}
      </p>

      {/* 태그 */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {team.lookingFor.map((role) => (
          <span key={role} className="tag-team">{role}</span>
        ))}
      </div>

      {/* 팀원 수 + 합류하기 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <span style={{ color: "var(--text-muted, #6b6b80)", fontWeight: 400 }}>팀원</span>
          <span style={{ color: "var(--brand-primary, #7c3aed)", fontWeight: 600, letterSpacing: "0.224px" }}>
            {team.memberCount}/{team.maxMembers}명
          </span>
        </div>
        {team.contact.url ? (
          <Link
            href={team.contact.url}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              borderRadius: 6,
              background: "var(--brand-primary, #7c3aed)",
              color: "var(--text-light, #f0f2f5)",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            합류하기
          </Link>
        ) : (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 16px",
              borderRadius: 6,
              background: "rgba(107,107,128,0.1)",
              color: "var(--text-muted, #6b6b80)",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            연락처 없음
          </span>
        )}
      </div>
    </div>
  );
});

export default function TeamPreview({ teams, hackathons }: { teams: Team[]; hackathons?: Hackathon[] }) {
  const openTeams = teams.filter((t) => t.isOpen).slice(0, 3);

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">팀 모집</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginTop: 2 }}>지금 팀원을 구하고 있어요</div>
        </div>
        <Link
          href="/camp"
          style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontWeight: 600 }}
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
        {openTeams.map((team) => {
          const hackathonTitle = hackathons?.find((h) => h.slug === team.hackathonSlug)?.title;
          return <TeamCard key={team.teamCode} team={team} hackathonTitle={hackathonTitle} />;
        })}
      </div>
    </section>
  );
}
