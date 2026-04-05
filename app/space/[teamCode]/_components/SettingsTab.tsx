import type { Team, Profile, JoinRequest } from "@/lib/types";
import { ALL_ROLES, ROLE_COLORS } from "@/lib/constants";

interface SettingsTabProps {
  team: Team;
  profile: Profile | null;
  isLeader: boolean;
  isEnded: boolean;
  editIntro: string;
  introDirty: boolean;
  onIntroChange: (v: string) => void;
  onSaveIntro: () => void;
  editContactUrl: string;
  contactUrlDirty: boolean;
  onContactUrlChange: (v: string) => void;
  onSaveContactUrl: () => void;
  editLookingFor: string[];
  editMaxMembers: number;
  recruitDirty: boolean;
  onToggleEditRole: (role: string) => void;
  onMaxMembersChange: (n: number) => void;
  onSaveRecruit: () => void;
  onKick: (nickname: string) => void;
  onApprove: (nickname: string) => void;
  onReject: (nickname: string) => void;
  showDeleteConfirm: boolean;
  onShowDelegate: () => void;
  onShowDeleteConfirm: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

const sectionStyle: React.CSSProperties = {
  background: "var(--bg-main, #f0f2f5)",
  border: "1px solid var(--border-subtle, #dde1e6)",
  borderRadius: 12,
  padding: 24,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, color: "var(--text-muted, #6b6b80)",
  marginBottom: 16, letterSpacing: "0.224px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)",
  color: "var(--text-main, #12121a)", fontSize: 13, resize: "vertical", outline: "none",
};

export default function SettingsTab({
  team, profile, isLeader, isEnded,
  editIntro, introDirty, onIntroChange, onSaveIntro,
  editContactUrl, contactUrlDirty, onContactUrlChange, onSaveContactUrl,
  editLookingFor, editMaxMembers, recruitDirty, onToggleEditRole, onMaxMembersChange, onSaveRecruit,
  onKick, onApprove, onReject,
  showDeleteConfirm, onShowDelegate, onShowDeleteConfirm, onCancelDelete, onDelete,
  onLeave,
}: SettingsTabProps) {
  if (!isLeader) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={sectionStyle}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main, #12121a)", marginBottom: 6 }}>팀 나가기</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: 16, lineHeight: "20px" }}>
            팀을 나가면 다시 초대를 받아야 합니다.
          </div>
          <button
            onClick={onLeave}
            style={{
              padding: "8px 20px", borderRadius: 8, fontSize: 13,
              background: "transparent", color: "var(--text-muted, #6b6b80)",
              border: "1px solid var(--border-subtle, #dde1e6)", cursor: "pointer",
            }}
          >
            팀 나가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* 가입 요청 */}
      {(team.joinRequests ?? []).length > 0 && (
        <section style={{ ...sectionStyle, border: "1px solid rgba(245,158,11,0.3)" }}>
          <div style={{ ...sectionLabelStyle, color: "#f59e0b" }}>
            가입 요청 {(team.joinRequests ?? []).length}건
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(team.joinRequests ?? []).map((req: JoinRequest) => (
              <div
                key={req.id}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 10,
                  background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main, #12121a)" }}>{req.nickname}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted, #6b6b80)", marginTop: 2, letterSpacing: "0.224px" }}>
                    {new Date(req.requestedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button
                  onClick={() => onApprove(req.nickname)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)", cursor: "pointer" }}
                >
                  승인
                </button>
                <button
                  onClick={() => onReject(req.nickname)}
                  style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, background: "transparent", color: "var(--text-muted, #6b6b80)", border: "1px solid var(--border-subtle, #dde1e6)", cursor: "pointer" }}
                >
                  거절
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 팀 소개 */}
      <section style={sectionStyle}>
        <div style={sectionLabelStyle}>팀 소개</div>
        <textarea
          value={editIntro}
          onChange={(e) => { if (!isEnded) onIntroChange(e.target.value); }}
          rows={4}
          disabled={isEnded}
          placeholder="팀 소개를 입력해주세요"
          style={{ ...inputStyle, cursor: isEnded ? "not-allowed" : "auto" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle, #dde1e6)")}
        />
        {introDirty && !isEnded && (
          <button
            onClick={onSaveIntro}
            className="btn-primary"
            style={{ marginTop: 12, fontSize: 13 }}
          >
            저장하기
          </button>
        )}
      </section>

      {/* 연락처 URL */}
      <section style={sectionStyle}>
        <div style={sectionLabelStyle}>연락처 URL</div>
        <input
          type="url"
          value={editContactUrl}
          onChange={(e) => { if (!isEnded) onContactUrlChange(e.target.value); }}
          disabled={isEnded}
          placeholder="https://open.kakao.com/o/... 또는 오픈채팅 링크"
          style={{ ...inputStyle, resize: undefined, cursor: isEnded ? "not-allowed" : "auto" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle, #dde1e6)")}
        />
        <div style={{ fontSize: 11, color: "var(--text-muted, #6b6b80)", marginTop: 6, letterSpacing: "0.224px" }}>
          홈 탭 팀 소개 아래에 외부 연락처 링크로 표시됩니다
        </div>
        {contactUrlDirty && !isEnded && (
          <button
            onClick={onSaveContactUrl}
            className="btn-primary"
            style={{ marginTop: 12, fontSize: 13 }}
          >
            저장하기
          </button>
        )}
      </section>

      {/* 모집 공고 수정 */}
      <section style={{ ...sectionStyle, opacity: isEnded ? 0.6 : 1 }}>
        <div style={sectionLabelStyle}>모집 공고 수정</div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginBottom: 8, letterSpacing: "0.224px" }}>최대 팀원 수</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                disabled={isEnded}
                onClick={() => onMaxMembersChange(n)}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: 13,
                  fontWeight: editMaxMembers === n ? 700 : 400,
                  background: editMaxMembers === n ? "rgba(124,58,237,0.2)" : "transparent",
                  color: editMaxMembers === n ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)",
                  border: editMaxMembers === n ? "1px solid rgba(124,58,237,0.4)" : "1px solid var(--border-subtle, #dde1e6)",
                  cursor: isEnded ? "not-allowed" : "pointer",
                  transition: "all 0.15s",
                }}
              >
                {n}
              </button>
            ))}
            <span style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", alignSelf: "center", marginLeft: 4 }}>명</span>
          </div>
          <div style={{ fontSize: 11, color: "var(--text-muted, #6b6b80)", marginTop: 6, letterSpacing: "0.224px" }}>
            현재 {team.memberCount}명 참여 중 · 최대 {editMaxMembers}명
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginBottom: 8, letterSpacing: "0.224px" }}>
            모집 역할 <span style={{ fontWeight: 400 }}>(구해진 역할은 체크 해제)</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {ALL_ROLES.map((role) => {
              const selected = editLookingFor.includes(role);
              return (
                <button
                  key={role}
                  disabled={isEnded}
                  onClick={() => onToggleEditRole(role)}
                  style={{
                    padding: "4px 10px", borderRadius: 6, fontSize: 12,
                    fontWeight: selected ? 700 : 400,
                    background: selected ? "rgba(167,139,250,0.15)" : "transparent",
                    color: selected ? "#a78bfa" : "var(--text-muted, #6b6b80)",
                    border: selected ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--border-subtle, #dde1e6)",
                    cursor: isEnded ? "not-allowed" : "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {selected ? "✓ " : ""}{role}
                </button>
              );
            })}
          </div>
        </div>

        {recruitDirty && !isEnded && (
          <button onClick={onSaveRecruit} className="btn-primary" style={{ fontSize: 13 }}>
            저장하기
          </button>
        )}
      </section>

      {/* 팀원 관리 */}
      <section style={sectionStyle}>
        <div style={sectionLabelStyle}>팀원 관리</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(team.members ?? []).map((nickname) => {
            const isMe = nickname === profile?.nickname;
            const isThisLeader = nickname === team.leader;
            return (
              <div
                key={nickname}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px", borderRadius: 8,
                  background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)",
                }}
              >
                <span style={{ fontSize: 13, flex: 1, color: "var(--text-main, #12121a)" }}>
                  {nickname}
                  {isThisLeader && <span style={{ fontSize: 11, color: "var(--brand-primary, #7c3aed)", marginLeft: 6 }}>팀장</span>}
                  {isMe && <span style={{ fontSize: 11, color: "var(--brand-primary, #7c3aed)", marginLeft: 6 }}>나</span>}
                </span>
                {!isMe && (
                  <button
                    onClick={() => onKick(nickname)}
                    style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 12,
                      background: "rgba(239,68,68,0.06)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer",
                    }}
                  >
                    내보내기
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 위험 영역 */}
      <section style={{ ...sectionStyle, border: "1px solid rgba(239,68,68,0.15)" }}>
        <div style={{ ...sectionLabelStyle, color: "#ef4444" }}>위험 영역</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {!isEnded && (
            <button
              onClick={onShowDelegate}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: "rgba(167,139,250,0.12)", color: "#a78bfa",
                border: "1px solid rgba(167,139,250,0.35)", cursor: "pointer", textAlign: "left",
              }}
            >
              팀장 위임
            </button>
          )}
          {!showDeleteConfirm ? (
            <button
              onClick={onShowDeleteConfirm}
              style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 13,
                background: "rgba(255,46,99,0.08)", color: "var(--brand-secondary, #ff2e63)",
                border: "1px solid rgba(255,46,99,0.25)", cursor: "pointer", textAlign: "left",
              }}
            >
              팀 삭제
            </button>
          ) : (
            <div style={{ padding: 16, background: "rgba(255,46,99,0.04)", border: "1px solid rgba(255,46,99,0.2)", borderRadius: 8 }}>
              <p style={{ fontSize: 13, color: "var(--text-main, #12121a)", marginBottom: 12, lineHeight: "20px" }}>
                정말 팀을 삭제하시겠습니까?<br />
                <span style={{ color: "var(--text-muted, #6b6b80)", fontSize: 12 }}>이 작업은 되돌릴 수 없습니다.</span>
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={onCancelDelete}
                  style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 13, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-muted, #6b6b80)", cursor: "pointer" }}
                >
                  취소
                </button>
                <button
                  onClick={onDelete}
                  style={{ flex: 1, padding: "8px", borderRadius: 6, fontSize: 13, fontWeight: 700, background: "rgba(255,46,99,0.12)", color: "var(--brand-secondary, #ff2e63)", border: "1px solid rgba(255,46,99,0.3)", cursor: "pointer" }}
                >
                  삭제 확인
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
