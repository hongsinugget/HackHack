"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();

  const teams = useStore((s) => s.teams);
  const hackathons = useStore((s) => s.hackathons);
  const profile = useStore((s) => s.profile);
  const joinTeam = useStore((s) => s.joinTeam);
  const initialized = useStore((s) => s.initialized);

  const [decided, setDecided] = useState<"accepted" | "declined" | null>(null);

  // 초대 코드로 팀 찾기
  const team = teams.find((t) => t.contact.url.includes(`/invite/${code}`));
  const hackathon = hackathons.find((h) => h.slug === team?.hackathonSlug);
  const myTeamCodes = profile?.myTeamCodes ?? [];
  const alreadyJoined = team ? myTeamCodes.includes(team.teamCode) : false;
  const alreadyInHackathon = !!team?.hackathonSlug && teams
    .filter((t) => myTeamCodes.includes(t.teamCode))
    .some((t) => t.hackathonSlug === team.hackathonSlug);

  const handleAccept = () => {
    if (!team) return;
    if (alreadyInHackathon && !alreadyJoined) {
      toast.error("이미 같은 대회의 팀에 소속되어 있습니다");
      return;
    }
    joinTeam(team.teamCode);
    setDecided("accepted");
    toast.success(`🎉 ${team.name} 팀에 합류했습니다!`);
    setTimeout(() => router.push("/myteam"), 1500);
  };

  const handleDecline = () => {
    setDecided("declined");
    setTimeout(() => router.push("/"), 1500);
  };

  if (!initialized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 유효하지 않은 초대 코드
  if (!team) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔗</div>
        <h1 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>유효하지 않은 초대 링크</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
          링크가 만료됐거나 잘못된 주소입니다
        </p>
        <button
          onClick={() => router.push("/")}
          style={{ padding: "0.625rem 1.5rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  // 수락/거절 완료 화면
  if (decided === "accepted") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
        <h1 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>팀 합류 완료!</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>잠시 후 내 팀 페이지로 이동합니다...</p>
      </div>
    );
  }

  if (decided === "declined") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👋</div>
        <h1 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.5rem" }}>초대를 거절했습니다</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>잠시 후 홈으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>💌</div>
          <h1 style={{ fontWeight: 800, fontSize: "1.35rem", marginBottom: "0.375rem" }}>팀 초대장이 도착했습니다</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.875rem" }}>아래 팀의 초대를 수락하시겠습니까?</p>
        </div>

        {/* 팀 카드 */}
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.75rem",
          marginBottom: "1.5rem",
        }}>
          {hackathon && (
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
              🏆 {hackathon.title}
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.875rem" }}>
            <div>
              <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: 2 }}>{team.teamCode}</div>
              <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>{team.name}</div>
            </div>
            {team.isOpen ? (
              <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 10px", borderRadius: 9999 }}>
                모집중
              </span>
            ) : (
              <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999 }}>
                모집완료
              </span>
            )}
          </div>

          <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: "1rem" }}>
            {team.intro}
          </p>

          {team.lookingFor.length > 0 && (
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
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

          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            현재 팀원 {team.memberCount}명
          </div>
        </div>

        {/* 이미 소속된 팀 */}
        {alreadyJoined ? (
          <div style={{ textAlign: "center", padding: "1.25rem", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#10b981", marginBottom: "0.25rem" }}>✓ 이미 소속된 팀입니다</div>
            <button
              onClick={() => router.push("/myteam")}
              style={{ marginTop: "0.75rem", padding: "0.5rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
            >
              내 팀 보러가기 →
            </button>
          </div>
        ) : alreadyInHackathon ? (
          <div style={{ textAlign: "center", padding: "1.25rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.25rem" }}>이미 같은 대회의 팀에 소속되어 있습니다</div>
            <p style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.75rem" }}>한 대회에는 1개 팀만 참여할 수 있습니다</p>
            <button
              onClick={() => router.push("/myteam")}
              style={{ padding: "0.5rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.875rem" }}
            >
              내 팀 보러가기 →
            </button>
          </div>
        ) : (
          /* 수락 / 거절 버튼 */
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleDecline}
              style={{
                flex: 1,
                padding: "0.75rem",
                borderRadius: 10,
                background: "transparent",
                border: "1px solid var(--border)",
                color: "var(--muted)",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              거절하기
            </button>
            <button
              onClick={handleAccept}
              style={{
                flex: 2,
                padding: "0.75rem",
                borderRadius: 10,
                background: "var(--accent)",
                border: "none",
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              🎉 합류하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
