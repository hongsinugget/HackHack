import type { Team, Profile } from "@/lib/types";
import { ROLE_COLORS } from "@/lib/constants";

interface MembersTabProps {
  team: Team;
  profile: Profile | null;
  onGoToSettings: () => void;
}

export default function MembersTab({ team, profile, onGoToSettings }: MembersTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.25rem" }}>총 {(team.members ?? []).length}명</div>
      {(team.members ?? []).length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: "0.85rem" }}>팀원 정보 없음</div>
      ) : (
        (team.members ?? []).map((nickname) => {
          const isMe = nickname === profile?.nickname;
          const isThisLeader = nickname === team.leader;
          return (
            <div key={nickname} style={{
              display: "flex", alignItems: "center", gap: "0.625rem",
              padding: "0.75rem 1rem", borderRadius: 10,
              background: isMe ? "rgba(124,58,237,0.06)" : "var(--surface)",
              border: isMe ? "1px solid rgba(124,58,237,0.2)" : "1px solid var(--border)",
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                background: isThisLeader ? "rgba(251,191,36,0.2)" : "rgba(124,58,237,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
              }}>
                {isThisLeader ? "👑" : "👤"}
              </div>
              <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: isMe ? 700 : 400 }}>{nickname}</span>
              <div style={{ display: "flex", gap: "0.375rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
                {(team.memberRoles ?? {})[nickname] && (
                  <span style={{
                    fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999,
                    background: `${ROLE_COLORS[(team.memberRoles ?? {})[nickname]] ?? "#6b6b80"}20`,
                    color: ROLE_COLORS[(team.memberRoles ?? {})[nickname]] ?? "var(--muted)",
                    border: `1px solid ${ROLE_COLORS[(team.memberRoles ?? {})[nickname]] ?? "#6b6b80"}40`,
                  }}>
                    {(team.memberRoles ?? {})[nickname]}
                  </span>
                )}
                {isThisLeader && (
                  <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>팀장</span>
                )}
                {isMe && (
                  <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>나</span>
                )}
              </div>
            </div>
          );
        })
      )}

      <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--muted)" }}>
        ⚙️ 팀 나가기 · 위임 · 삭제는{" "}
        <button
          onClick={onGoToSettings}
          style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", padding: 0 }}
        >
          설정 탭
        </button>
        에서 할 수 있습니다
      </div>
    </div>
  );
}
