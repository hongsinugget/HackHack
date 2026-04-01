"use client";

import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  Frontend: "#38bdf8",
  Backend: "#34d399",
  Designer: "#f472b6",
  "ML Engineer": "#a78bfa",
  PM: "#fbbf24",
  기획자: "#fb923c",
};

export default function MyTeamPage() {
  const profile = useStore((s) => s.profile);
  const teams = useStore((s) => s.teams);
  const hackathons = useStore((s) => s.hackathons);
  const leaveTeam = useStore((s) => s.leaveTeam);
  const initialized = useStore((s) => s.initialized);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const myTeamCodes = profile?.myTeamCodes ?? [];
  const myTeams = teams.filter((t) => myTeamCodes.includes(t.teamCode));

  const handleCopy = (url: string, teamCode: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedCode(teamCode);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  const handleLeave = (teamCode: string, teamName: string) => {
    leaveTeam(teamCode);
    toast.success(`"${teamName}" 팀에서 나왔습니다`);
  };

  if (!initialized) {
    return (
      <div>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>내 팀</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>소속된 팀을 확인하고 관리하세요</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>내 팀</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>소속된 팀을 확인하고 관리하세요</p>
      </div>

      {myTeams.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "5rem 2rem",
          background: "var(--surface)",
          borderRadius: 16,
          border: "1px solid var(--border)",
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏕️</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>아직 소속된 팀이 없습니다</div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>
            팀에 지원하거나 직접 만들어보세요
          </div>
          <Link
            href="/camp"
            style={{
              display: "inline-block",
              padding: "0.625rem 1.5rem",
              borderRadius: 8,
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            팀 모집 보러가기 →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {myTeams.map((team) => {
            const hackathon = hackathons.find((h) => h.slug === team.hackathonSlug);
            const rawUrl = team.contact.url.startsWith("http") ? team.contact.url : null;
            const inviteUrl = rawUrl
              ? rawUrl.replace(/^https?:\/\/[^/]+/, typeof window !== "undefined" ? window.location.origin : "")
              : null;

            return (
              <div
                key={team.teamCode}
                className="card"
                style={{ padding: "1.5rem" }}
              >
                {/* 상단: 해커톤 + 상태 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    {hackathon ? (
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.25rem" }}>
                        🏆 {hackathon.title}
                      </div>
                    ) : team.hackathonSlug ? (
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.25rem" }}>
                        🏆 {team.hackathonSlug}
                      </div>
                    ) : (
                      <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>
                        대회 미지정
                      </div>
                    )}
                    <div style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: "0.1rem" }}>{team.name}</div>
                  </div>
                  {team.isOpen ? (
                    <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                      모집중
                    </span>
                  ) : (
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
                      모집완료
                    </span>
                  )}
                </div>

                {/* 팀 소개 */}
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.6 }}>
                  {team.intro}
                </p>

                {/* 직군 태그 */}
                {team.lookingFor.length > 0 && (
                  <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    {team.lookingFor.map((role) => (
                      <span
                        key={role}
                        style={{
                          fontSize: "0.72rem",
                          padding: "3px 10px",
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
                )}

                {/* 팀원 수 */}
                <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
                  팀원 {team.memberCount}명
                </div>

                {/* 초대 링크 */}
                {inviteUrl && (
                  <div style={{ marginBottom: "1rem" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem" }}>초대 링크</div>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <div style={{
                        flex: 1,
                        padding: "0.5rem 0.75rem",
                        borderRadius: 8,
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}>
                        {inviteUrl}
                      </div>
                      <button
                        onClick={() => handleCopy(inviteUrl, team.teamCode)}
                        style={{
                          padding: "0.5rem 0.875rem",
                          borderRadius: 8,
                          background: copiedCode === team.teamCode ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.12)",
                          color: copiedCode === team.teamCode ? "#10b981" : "#a78bfa",
                          border: copiedCode === team.teamCode ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.25)",
                          cursor: "pointer",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          transition: "all 0.2s",
                        }}
                      >
                        {copiedCode === team.teamCode ? "✓ 복사됨" : "📋 복사"}
                      </button>
                    </div>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
                  <Link
                    href={`/space/${team.teamCode}`}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: 8,
                      background: "rgba(124,58,237,0.15)",
                      color: "#a78bfa",
                      border: "1px solid rgba(124,58,237,0.35)",
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      textDecoration: "none",
                    }}
                  >
                    🏠 스페이스 가기 →
                  </Link>
                  {hackathon && (
                    <Link
                      href={`/hackathons/${team.hackathonSlug}`}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: 8,
                        background: "rgba(124,58,237,0.1)",
                        color: "#a78bfa",
                        border: "1px solid rgba(124,58,237,0.25)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      대회 보기 →
                    </Link>
                  )}
                  <button
                    onClick={() => handleLeave(team.teamCode, team.name)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: 8,
                      background: "transparent",
                      color: "var(--muted)",
                      border: "1px solid var(--border)",
                      fontSize: "0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    팀 나가기
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
