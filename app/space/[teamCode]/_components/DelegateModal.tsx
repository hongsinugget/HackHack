import type { Team, Profile } from "@/lib/types";

interface DelegateModalProps {
  team: Team;
  profile: Profile | null;
  delegateTo: string;
  onSelect: (nickname: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DelegateModal({ team, profile, delegateTo, onSelect, onConfirm, onClose }: DelegateModalProps) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 400 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.375rem" }}>👑 팀장 위임</h2>
        <p style={{ fontSize: "0.825rem", color: "var(--muted)", marginBottom: "1.25rem" }}>새로운 팀장을 선택해주세요</p>
        {(team.members ?? []).filter((m) => m !== profile?.nickname).length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>위임할 팀원이 없습니다</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
            {(team.members ?? []).filter((m) => m !== profile?.nickname).map((nickname) => (
              <button
                key={nickname}
                onClick={() => onSelect(nickname)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem 1rem", borderRadius: 10, textAlign: "left",
                  background: delegateTo === nickname ? "rgba(251,191,36,0.12)" : "var(--surface2)",
                  border: delegateTo === nickname ? "1px solid rgba(251,191,36,0.4)" : "1px solid var(--border)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>👤</div>
                <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: delegateTo === nickname ? 700 : 400, color: delegateTo === nickname ? "#fbbf24" : "var(--text)" }}>{nickname}</span>
                {delegateTo === nickname && <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>선택됨</span>}
              </button>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontSize: "0.875rem" }}>취소</button>
          <button
            onClick={onConfirm}
            disabled={!delegateTo}
            style={{
              flex: 2, padding: "0.625rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem",
              background: delegateTo ? "rgba(251,191,36,0.2)" : "transparent",
              color: delegateTo ? "#fbbf24" : "var(--muted)",
              border: delegateTo ? "1px solid rgba(251,191,36,0.4)" : "1px solid var(--border)",
              cursor: delegateTo ? "pointer" : "default",
            }}
          >
            위임하기
          </button>
        </div>
      </div>
    </div>
  );
}
