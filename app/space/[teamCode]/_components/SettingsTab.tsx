import type { Team, Profile, JoinRequest } from "@/lib/types";
import { ALL_ROLES, ROLE_COLORS } from "@/lib/constants";

interface SettingsTabProps {
  team: Team;
  profile: Profile | null;
  isLeader: boolean;
  isEnded: boolean;
  // 팀 소개 편집
  editIntro: string;
  introDirty: boolean;
  onIntroChange: (v: string) => void;
  onSaveIntro: () => void;
  // 모집 편집
  editLookingFor: string[];
  editMaxMembers: number;
  recruitDirty: boolean;
  onToggleEditRole: (role: string) => void;
  onMaxMembersChange: (n: number) => void;
  onSaveRecruit: () => void;
  // 팀원 관리
  onKick: (nickname: string) => void;
  // 가입 요청
  onApprove: (nickname: string) => void;
  onReject: (nickname: string) => void;
  // 위험 영역
  showDeleteConfirm: boolean;
  onShowDelegate: () => void;
  onShowDeleteConfirm: () => void;
  onCancelDelete: () => void;
  onDelete: () => void;
  // 팀원 이탈
  onLeave: () => void;
}

export default function SettingsTab({
  team, profile, isLeader, isEnded,
  editIntro, introDirty, onIntroChange, onSaveIntro,
  editLookingFor, editMaxMembers, recruitDirty, onToggleEditRole, onMaxMembersChange, onSaveRecruit,
  onKick, onApprove, onReject,
  showDeleteConfirm, onShowDelegate, onShowDeleteConfirm, onCancelDelete, onDelete,
  onLeave,
}: SettingsTabProps) {
  if (!isLeader) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ padding: "1.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
          <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>팀 나가기</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
            팀을 나가면 다시 초대를 받아야 합니다.
          </div>
          <button
            onClick={onLeave}
            style={{ padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: "0.875rem", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", cursor: "pointer" }}
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
        <section style={{ background: "var(--surface)", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#fbbf24", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            가입 요청 {(team.joinRequests ?? []).length}건
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {(team.joinRequests ?? []).map((req: JoinRequest) => (
              <div key={req.id} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: 10, background: "var(--surface2)", border: "1px solid var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{req.nickname}</div>
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                    {new Date(req.requestedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <button
                  onClick={() => onApprove(req.nickname)}
                  style={{ padding: "0.4rem 0.875rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 700, background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", cursor: "pointer" }}
                >
                  승인
                </button>
                <button
                  onClick={() => onReject(req.nickname)}
                  style={{ padding: "0.4rem 0.875rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", cursor: "pointer" }}
                >
                  거절
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 팀 소개 */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 소개</div>
        <textarea
          value={editIntro}
          onChange={(e) => { if (!isEnded) { onIntroChange(e.target.value); } }}
          rows={4}
          disabled={isEnded}
          placeholder="팀 소개를 입력해주세요"
          style={{
            width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
            background: "var(--surface2)", border: "1px solid var(--border)",
            color: "var(--text)", fontSize: "0.875rem", resize: "vertical", outline: "none",
            cursor: isEnded ? "not-allowed" : "auto",
          }}
        />
        {introDirty && !isEnded && (
          <button
            onClick={onSaveIntro}
            style={{ marginTop: "0.75rem", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
          >
            등록하기
          </button>
        )}
      </section>

      {/* 모집 공고 수정 */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", opacity: isEnded ? 0.6 : 1 }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>모집 공고 수정</div>

        <div style={{ marginBottom: "1.1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>최대 팀원 수</div>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {[2, 3, 4, 5, 6, 7, 8].map((n) => (
              <button
                key={n}
                disabled={isEnded}
                onClick={() => onMaxMembersChange(n)}
                style={{
                  width: 36, height: 36, borderRadius: 8, fontSize: "0.875rem",
                  fontWeight: editMaxMembers === n ? 700 : 400,
                  background: editMaxMembers === n ? "rgba(124,58,237,0.2)" : "transparent",
                  color: editMaxMembers === n ? "#a78bfa" : "var(--muted)",
                  border: editMaxMembers === n ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                  cursor: isEnded ? "not-allowed" : "pointer",
                }}
              >
                {n}
              </button>
            ))}
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", alignSelf: "center", marginLeft: 4 }}>명</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.375rem" }}>
            현재 {team.memberCount}명 참여 중 · 최대 {editMaxMembers}명
          </div>
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>모집 역할 <span style={{ fontSize: "0.72rem" }}>(구해진 역할은 체크 해제)</span></div>
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {ALL_ROLES.map((role) => {
              const selected = editLookingFor.includes(role);
              return (
                <button
                  key={role}
                  disabled={isEnded}
                  onClick={() => onToggleEditRole(role)}
                  style={{
                    padding: "0.3rem 0.75rem", borderRadius: 20, fontSize: "0.78rem",
                    fontWeight: selected ? 700 : 400,
                    background: selected ? `${ROLE_COLORS[role] ?? "#7c3aed"}20` : "transparent",
                    color: selected ? (ROLE_COLORS[role] ?? "#a78bfa") : "var(--muted)",
                    border: selected ? `1px solid ${ROLE_COLORS[role] ?? "#7c3aed"}50` : "1px solid var(--border)",
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
          <button
            onClick={onSaveRecruit}
            style={{ padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
          >
            저장하기
          </button>
        )}
      </section>

      {/* 팀원 관리 */}
      <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀원 관리</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {(team.members ?? []).map((nickname) => {
            const isMe = nickname === profile?.nickname;
            return (
              <div key={nickname} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.625rem 0.875rem", borderRadius: 8,
                background: "var(--surface2)", border: "1px solid var(--border)",
              }}>
                <span style={{ fontSize: "0.875rem", flex: 1 }}>
                  {nickname === team.leader ? "👑 " : "👤 "}{nickname}
                  {isMe && <span style={{ fontSize: "0.7rem", color: "#a78bfa", marginLeft: 6 }}>(나)</span>}
                </span>
                {!isMe && (
                  <button
                    onClick={() => onKick(nickname)}
                    style={{
                      padding: "3px 10px", borderRadius: 6, fontSize: "0.75rem",
                      background: "rgba(239,68,68,0.08)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer",
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
      <section style={{ background: "var(--surface)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "1.25rem" }}>
        <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>위험 영역</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {!isEnded && (
            <button
              onClick={onShowDelegate}
              style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.85rem", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", cursor: "pointer", fontWeight: 600, textAlign: "left" }}
            >
              👑 팀장 위임
            </button>
          )}
          {!showDeleteConfirm ? (
            <button
              onClick={onShowDeleteConfirm}
              style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.85rem", background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer", textAlign: "left" }}
            >
              🗑️ 팀 삭제
            </button>
          ) : (
            <div style={{ padding: "1rem", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 8 }}>
              <p style={{ fontSize: "0.825rem", color: "var(--text)", marginBottom: "0.75rem", lineHeight: 1.5 }}>
                정말 팀을 삭제하시겠습니까?<br />
                <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>이 작업은 되돌릴 수 없습니다.</span>
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={onCancelDelete} style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>취소</button>
                <button onClick={onDelete} style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontWeight: 700 }}>삭제 확인</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
