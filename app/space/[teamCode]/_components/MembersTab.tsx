"use client";

import { useState } from "react";
import Image from "next/image";
import type { Team, Profile } from "@/lib/types";
import { ROLE_COLORS } from "@/lib/constants";

const IMAGE_AVATAR_KEYS = ["harry", "nini"];

const BADGE_IMAGES: Record<string, string> = {
  first_spark: "/badge/첫불꽃.png",
  duo_buddy:   "/badge/최강단짝.png",
  submitted:   "/badge/제출완료.png",
  top3:        "/badge/취미를넘어선.png",
  top2:        "/badge/전설적인.png",
  top1:        "/badge/전설이된마스터.png",
  regular:     "/badge/단골손님.png",
};

function Avatar({ avatarEmoji, nickname, size }: { avatarEmoji?: string; nickname: string; size: number }) {
  const isImageKey = avatarEmoji && IMAGE_AVATAR_KEYS.includes(avatarEmoji);
  const isEmoji = avatarEmoji && !isImageKey;

  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: "rgba(124,58,237,0.1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: isEmoji ? Math.round(size * 0.5) : Math.round(size * 0.38), fontWeight: 700,
      color: "var(--brand-primary, #7c3aed)",
      overflow: "hidden",
      lineHeight: 1,
    }}>
      {isImageKey ? (
        <Image
          src={`/icons/${avatarEmoji}-profile.png`}
          alt={avatarEmoji}
          width={size}
          height={size}
          style={{ width: "80%", height: "80%", objectFit: "contain", display: "block" }}
        />
      ) : (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
          {isEmoji ? avatarEmoji : nickname.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}

interface MembersTabProps {
  team: Team;
  profile: Profile | null;
  onGoToSettings: () => void;
}

interface MemberProfileModalProps {
  nickname: string;
  teamRole?: string;
  isLeader: boolean;
  isMe: boolean;
  myProfile: Profile | null;
  onClose: () => void;
}

function MemberProfileModal({ nickname, teamRole, isLeader, isMe, myProfile, onClose }: MemberProfileModalProps) {
  const isPublic = myProfile?.isPublic;
  const p = isMe ? myProfile : null;

  const hasLinks = p?.links && Object.values(p.links).some(Boolean);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg-card, #fff)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 380,
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* 헤더 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle, #dde1e6)",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px" }}>
            팀원 프로필
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 20, color: "var(--text-muted, #6b6b80)",
              lineHeight: 1, padding: "2px 4px",
            }}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* 아바타 + 이름 + 뱃지 */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar avatarEmoji={isMe ? myProfile?.avatarEmoji : undefined} nickname={nickname} size={60} />
            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-main, #12121a)" }}>
                  {nickname}
                </span>
                {isMe && (
                  <span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 9999, background: "rgba(124,58,237,0.1)", color: "var(--brand-primary, #7c3aed)", border: "1px solid rgba(124,58,237,0.25)" }}>
                    나
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {isLeader && (
                  <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 9999, background: "rgba(124,58,237,0.1)", color: "var(--brand-primary, #7c3aed)", border: "1px solid rgba(124,58,237,0.3)" }}>
                    팀장
                  </span>
                )}
                {teamRole && (
                  <span style={{
                    fontSize: 11, padding: "2px 7px", borderRadius: 9999,
                    background: `${ROLE_COLORS[teamRole] ?? "#6b6b80"}20`,
                    color: ROLE_COLORS[teamRole] ?? "var(--text-muted, #6b6b80)",
                    border: `1px solid ${ROLE_COLORS[teamRole] ?? "#6b6b80"}40`,
                  }}>
                    {teamRole}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 프로필 공개일 때 */}
          {isMe && isPublic && p ? (
            <>
              {/* 한줄 소개 */}
              {p.bio && (
                <div style={{
                  fontSize: 13, color: "var(--text-subtle, #4b5563)", lineHeight: "1.7",
                  background: "var(--bg-main, #f0f2f5)", borderRadius: 10,
                  padding: "12px 14px",
                }}>
                  {p.bio}
                </div>
              )}

              {/* 직군 */}
              {p.role && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px", marginBottom: 8 }}>
                    직군
                  </div>
                  <span style={{
                    fontSize: 12, padding: "4px 10px", borderRadius: 8,
                    background: "rgba(167,139,250,0.15)",
                    color: "#a78bfa",
                    border: "1px solid rgba(167,139,250,0.4)",
                    fontWeight: 500,
                  }}>
                    {p.role}
                  </span>
                </div>
              )}

              {/* 스킬 */}
              {p.skills && p.skills.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px", marginBottom: 8 }}>
                    스킬
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {p.skills.map((skill) => (
                      <span key={skill} style={{
                        fontSize: 12, padding: "3px 9px", borderRadius: 6,
                        background: "rgba(124,58,237,0.08)",
                        color: "var(--brand-primary, #7c3aed)",
                        border: "1px solid rgba(124,58,237,0.2)",
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 외부 링크 */}
              {hasLinks && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px", marginBottom: 8 }}>
                    외부 링크
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {p.links?.github && (
                      <a
                        href={p.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                      >
                        <img src="/icons/github-icon.svg" alt="GitHub" style={{ width: 18, height: 18, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.links.github.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    )}
                    {p.links?.portfolio && (
                      <a
                        href={p.links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                      >
                        <img src="/icons/link-icon.svg" alt="포트폴리오" style={{ width: 18, height: 18, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.links.portfolio.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    )}
                    {p.links?.linkedin && (
                      <a
                        href={p.links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                      >
                        <img src="/icons/linkedin-icon.svg" alt="LinkedIn" style={{ width: 18, height: 18, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {p.links.linkedin.replace(/^https?:\/\//, "")}
                        </span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* 획득 배지 */}
              {p.badges && p.badges.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px", marginBottom: 8 }}>
                    획득 배지
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {p.badges
                      .filter((b, i, arr) => arr.findIndex((x) => x.id === b.id) === i && !!BADGE_IMAGES[b.id])
                      .map((badge) => (
                        <div
                          key={badge.id}
                          title={badge.description}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                            padding: "10px 12px", borderRadius: 10,
                            background: "var(--bg-main, #f0f2f5)",
                            border: "1px solid var(--border-subtle, #dde1e6)",
                            minWidth: 64,
                          }}
                        >
                          <img
                            src={BADGE_IMAGES[badge.id]}
                            alt={badge.label}
                            style={{ width: 40, height: 40, objectFit: "contain" }}
                          />
                          <span style={{ fontSize: 11, color: "var(--text-subtle, #4b5563)", fontWeight: 500, textAlign: "center", lineHeight: "1.3" }}>
                            {badge.label}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* 아무 정보도 없는 경우 */}
              {!p.bio && !p.role && !(p.skills?.length) && !hasLinks && !(p.badges?.length) && (
                <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", textAlign: "center", padding: "8px 0" }}>
                  아직 등록된 프로필 정보가 없습니다.
                </div>
              )}
            </>
          ) : isMe && !isPublic ? (
            /* 내 프로필이 비공개 */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "16px 0", fontSize: 13, color: "var(--text-muted, #6b6b80)",
            }}>
              <img src="/icons/lock-icon.svg" alt="비공개" style={{ width: 22, height: 22, opacity: 0.5 }} />
              <span>내 프로필이 비공개 상태입니다.</span>
              <span style={{ fontSize: 12 }}>프로필 페이지에서 공개로 전환할 수 있습니다.</span>
            </div>
          ) : (
            /* 다른 팀원 (데이터 없음) */
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              padding: "16px 0", fontSize: 13, color: "var(--text-muted, #6b6b80)",
            }}>
              <img src="/icons/lock-icon.svg" alt="비공개" style={{ width: 22, height: 22, opacity: 0.5 }} />
              <span>🔒 프로필 비공개</span>
              <span style={{ fontSize: 12 }}>해당 팀원이 프로필을 공개하지 않았습니다.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembersTab({ team, profile, onGoToSettings }: MembersTabProps) {
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const myNickname = profile?.nickname ?? "";
  const rawMembers = team.members ?? [];
  const members = rawMembers.includes(myNickname)
    ? rawMembers
    : [myNickname, ...rawMembers];

  const selectedTeamRole = selectedMember ? (team.memberRoles ?? {})[selectedMember] : undefined;
  const selectedIsLeader = selectedMember === team.leader;
  const selectedIsMe = selectedMember === myNickname;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginBottom: 4, letterSpacing: "0.224px" }}>
        총 {members.length}명
      </div>

      {members.map((nickname) => {
        const isMe = nickname === myNickname;
        const isThisLeader = nickname === team.leader;
        const role = (team.memberRoles ?? {})[nickname];
        return (
          <div
            key={nickname}
            style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10,
              background: isMe ? "rgba(124,58,237,0.05)" : "var(--bg-main, #f0f2f5)",
              border: isMe ? "1px solid rgba(124,58,237,0.2)" : "1px solid var(--border-subtle, #dde1e6)",
            }}
          >
            {/* 아바타 — 클릭 시 프로필 팝업 */}
            <button
              onClick={() => setSelectedMember(nickname)}
              title="프로필 보기"
              style={{
                width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                border: "none", cursor: "pointer",
                transition: "opacity 0.15s",
                padding: 0, background: "transparent",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Avatar avatarEmoji={isMe ? profile?.avatarEmoji : undefined} nickname={nickname} size={34} />
            </button>

            {/* 닉네임 */}
            <span style={{ flex: 1, fontSize: 14, fontWeight: isMe ? 700 : 400, color: "var(--text-main, #12121a)" }}>
              {nickname}
            </span>

            {/* 뱃지들 */}
            <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {role && (
                <span style={{
                  fontSize: 11, padding: "2px 7px", borderRadius: 9999,
                  background: `${ROLE_COLORS[role] ?? "#6b6b80"}20`,
                  color: ROLE_COLORS[role] ?? "var(--text-muted, #6b6b80)",
                  border: `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}40`,
                  letterSpacing: "0.224px",
                }}>
                  {role}
                </span>
              )}
              {isThisLeader && (
                <span style={{
                  fontSize: 11, padding: "2px 7px", borderRadius: 9999,
                  background: "rgba(124,58,237,0.1)",
                  color: "var(--brand-primary, #7c3aed)",
                  border: "1px solid rgba(124,58,237,0.3)",
                  letterSpacing: "0.224px",
                }}>
                  팀장
                </span>
              )}
              {isMe && (
                <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 9999, background: "rgba(124,58,237,0.1)", color: "var(--brand-primary, #7c3aed)", border: "1px solid rgba(124,58,237,0.25)", letterSpacing: "0.224px" }}>
                  나
                </span>
              )}
            </div>
          </div>
        );
      })}

      <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--bg-main, #f0f2f5)", borderRadius: 8, border: "1px solid var(--border-subtle, #dde1e6)", fontSize: 13, color: "var(--text-muted, #6b6b80)" }}>
        팀 나가기 · 위임 · 삭제는{" "}
        <button
          onClick={onGoToSettings}
          style={{ background: "none", border: "none", color: "var(--brand-primary, #7c3aed)", cursor: "pointer", fontWeight: 700, fontSize: 13, padding: 0 }}
        >
          설정 탭
        </button>
        에서 할 수 있습니다
      </div>

      {selectedMember && (
        <MemberProfileModal
          nickname={selectedMember}
          teamRole={selectedTeamRole}
          isLeader={selectedIsLeader}
          isMe={selectedIsMe}
          myProfile={profile}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </div>
  );
}
