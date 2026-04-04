import type { Team } from "@/lib/types";

interface HomeTabProps {
  team: Team;
  inviteUrl: string | null;
  isEnded: boolean;
  copied: boolean;
  onCopy: () => void;
}

export default function HomeTab({ team, inviteUrl, isEnded, copied, onCopy }: HomeTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 소개</div>
        <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.7, marginBottom: "0.5rem" }}>
          {team.intro}
        </p>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>팀원 {team.memberCount}명</div>
      </div>

      {inviteUrl && !isEnded && (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>초대 링크</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "0.6rem 0.875rem", borderRadius: 8,
              background: "var(--surface2)", border: "1px solid var(--border)",
              fontSize: "0.8rem", color: "var(--muted)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {inviteUrl}
            </div>
            <button
              onClick={onCopy}
              style={{
                padding: "0.6rem 1rem", borderRadius: 8, fontWeight: 700,
                fontSize: "0.8rem", whiteSpace: "nowrap", cursor: "pointer",
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.12)",
                color: copied ? "#10b981" : "#a78bfa",
                border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.25)",
                transition: "all 0.2s",
              }}
            >
              {copied ? "✓ 복사됨" : "📋 복사"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
