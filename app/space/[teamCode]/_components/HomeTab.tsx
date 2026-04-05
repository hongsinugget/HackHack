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
      {/* 팀 소개 */}
      <div style={{ background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted, #6b6b80)", marginBottom: 12, letterSpacing: "0.224px" }}>팀 소개</div>
        <p style={{ fontSize: 13, color: "var(--text-subtle, #4b5563)", lineHeight: "20px", margin: "0 0 12px 0" }}>
          {team.intro}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <span style={{ color: "var(--text-muted, #6b6b80)" }}>팀원</span>
          <span style={{ color: "var(--brand-primary, #7c3aed)", fontWeight: 600, letterSpacing: "0.224px" }}>
            {team.memberCount}{team.maxMembers ? `/${team.maxMembers}명` : "명"}
          </span>
        </div>
      </div>

      {/* 연락처 */}
      {team.contact?.url && (() => {
        const isExternal = team.contact.url.startsWith("http") && !team.contact.url.includes("/invite/");
        if (!isExternal) return null;
        return (
          <div style={{ background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 12, padding: 24 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted, #6b6b80)", marginBottom: 12, letterSpacing: "0.224px" }}>연락처</div>
            <a
              href={team.contact.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                fontSize: 13, color: "var(--brand-primary, #7c3aed)", fontWeight: 600,
                textDecoration: "none", wordBreak: "break-all",
              }}
            >
              {team.contact.url}
            </a>
          </div>
        );
      })()}

      {/* 초대 링크 */}
      {inviteUrl && !isEnded && (
        <div style={{ background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted, #6b6b80)", marginBottom: 12, letterSpacing: "0.224px" }}>초대 링크</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)",
              fontSize: 12, color: "var(--text-muted, #6b6b80)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {inviteUrl}
            </div>
            <button
              onClick={onCopy}
              style={{
                padding: "8px 14px", borderRadius: 8, fontWeight: 700,
                fontSize: 12, whiteSpace: "nowrap", cursor: "pointer",
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)",
                color: copied ? "#10b981" : "var(--brand-primary, #7c3aed)",
                border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.3)",
                transition: "all 0.2s",
              }}
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
