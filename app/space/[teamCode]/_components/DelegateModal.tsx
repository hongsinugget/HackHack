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
  const candidates = (team.members ?? []).filter((m) => m !== profile?.nickname);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 400 }}>
        <h2 style={{ fontWeight: 800, fontSize: 20, lineHeight: "30px", color: "var(--text-main, #12121a)", marginBottom: 6 }}>팀장 위임</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: 20 }}>새로운 팀장을 선택해주세요</p>

        {candidates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted, #6b6b80)", fontSize: 13 }}>
            위임할 팀원이 없습니다
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {candidates.map((nickname) => (
              <button
                key={nickname}
                onClick={() => onSelect(nickname)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 10, textAlign: "left",
                  background: delegateTo === nickname ? "rgba(251,191,36,0.08)" : "var(--bg-main, #f0f2f5)",
                  border: delegateTo === nickname ? "1px solid rgba(251,191,36,0.35)" : "1px solid var(--border-subtle, #dde1e6)",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: delegateTo === nickname ? "rgba(251,191,36,0.15)" : "rgba(124,58,237,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                  color: delegateTo === nickname ? "#fbbf24" : "var(--brand-primary, #7c3aed)",
                }}>
                  {nickname.charAt(0).toUpperCase()}
                </div>
                <span style={{ flex: 1, fontSize: 14, fontWeight: delegateTo === nickname ? 700 : 400, color: delegateTo === nickname ? "#fbbf24" : "var(--text-main, #12121a)" }}>
                  {nickname}
                </span>
                {delegateTo === nickname && (
                  <span style={{ fontSize: 12, color: "#fbbf24", letterSpacing: "0.224px" }}>선택됨</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "10px", borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-muted, #6b6b80)", cursor: "pointer", fontSize: 13 }}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={!delegateTo}
            style={{
              flex: 2, padding: "10px", borderRadius: 8, fontWeight: 700, fontSize: 13,
              background: delegateTo ? "rgba(251,191,36,0.15)" : "transparent",
              color: delegateTo ? "#fbbf24" : "var(--text-muted, #6b6b80)",
              border: delegateTo ? "1px solid rgba(251,191,36,0.35)" : "1px solid var(--border-subtle, #dde1e6)",
              cursor: delegateTo ? "pointer" : "default",
              transition: "all 0.15s",
            }}
          >
            위임하기
          </button>
        </div>
      </div>
    </div>
  );
}
