"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import type { Badge } from "@/lib/types";
import { ALL_ROLES, ROLE_COLORS } from "@/lib/constants";

const ALL_BADGES: Omit<Badge, "earnedAt">[] = [
  { id: "first_spark", emoji: "🔥", label: "첫 불꽃", description: "플랫폼 최초 방문 + 닉네임 설정" },
  { id: "duo_buddy", emoji: "🤝", label: "최강단짝", description: "첫 팀 생성 또는 팀 합류" },
  { id: "submitted", emoji: "📦", label: "제출 완료!", description: "첫 결과물 제출" },
  { id: "top3", emoji: "🏅", label: "취미를 넘어선", description: "리더보드 3위 이내 진입" },
  { id: "top2", emoji: "🥈", label: "밤을 밝혀낸 자", description: "리더보드 2위 진입" },
  { id: "top1", emoji: "🏆", label: "전설이 된 마스터", description: "리더보드 1위 달성" },
  { id: "regular", emoji: "🔁", label: "단골손님", description: "2개 이상 해커톤 참가" },
];

const TIMELINE_ICONS: Record<string, string> = { join: "🏁", submit: "📤", rank: "🏅" };

const AVATAR_EMOJIS = [
  "🧑‍💻", "👩‍💻", "🧑‍🎨", "👩‍🎨", "🧑‍🔬", "👩‍🔬",
  "⚡", "🚀", "🔥", "💡", "🎯", "🏆",
  "🤖", "🦊", "🐼", "🦁", "🦋", "🌟",
];

function EditProfileModal({ onClose }: { onClose: () => void }) {
  const { profile, updateProfile } = useStore();
  if (!profile) return null;

  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji ?? "");
  const [nickname, setNickname] = useState(profile.nickname);
  const [nicknameError, setNicknameError] = useState("");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [role, setRole] = useState(profile.role ?? "");
  const [skills, setSkills] = useState<string[]>(profile.skills ?? []);
  const [skillInput, setSkillInput] = useState("");
  const [github, setGithub] = useState(profile.links?.github ?? "");
  const [portfolio, setPortfolio] = useState(profile.links?.portfolio ?? "");
  const [linkedin, setLinkedin] = useState(profile.links?.linkedin ?? "");
  const [isPublic, setIsPublic] = useState(profile.isPublic ?? true);

  const addSkill = (raw: string) => {
    const s = raw.trim().replace(/,+$/, "");
    if (!s || skills.includes(s) || skills.length >= 15) return;
    setSkills([...skills, s]);
    setSkillInput("");
  };

  const handleSkillKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill(skillInput);
    } else if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const handleSave = () => {
    const trimmed = nickname.trim();
    if (trimmed.length < 2) { setNicknameError("2자 이상 입력해주세요"); return; }
    if (trimmed.length > 12) { setNicknameError("12자 이하로 입력해주세요"); return; }
    if (/\s/.test(trimmed)) { setNicknameError("공백은 사용할 수 없습니다"); return; }

    updateProfile({
      nickname: trimmed,
      avatarEmoji: avatarEmoji || undefined,
      bio: bio.trim() || undefined,
      role: role || undefined,
      skills: skills.length > 0 ? skills : undefined,
      links: {
        github: github.trim() || undefined,
        portfolio: portfolio.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
      },
      isPublic,
    });
    toast.success("프로필이 저장됐습니다");
    onClose();
  };

  const inputStyle = {
    width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
    background: "var(--surface2)", border: "1px solid var(--border)",
    color: "var(--text)", fontSize: "0.875rem", outline: "none",
  };

  const labelStyle = {
    fontSize: "0.75rem", fontWeight: 700 as const, color: "var(--muted)",
    display: "block" as const, marginBottom: "0.5rem",
    textTransform: "uppercase" as const, letterSpacing: "0.04em",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* 헤더 고정 */}
        <div style={{ padding: "1.25rem 1.5rem 1rem", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.1rem" }}>프로필 편집</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", fontSize: "1.25rem", cursor: "pointer", lineHeight: 1 }}>✕</button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: "auto", padding: "1.25rem 1.5rem", flex: 1, display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 프로필 사진 */}
          <div>
            <label style={labelStyle}>프로필 사진</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {/* 현재 선택 해제 */}
              <button
                onClick={() => setAvatarEmoji("")}
                style={{
                  width: 44, height: 44, borderRadius: "50%", fontSize: "1rem", cursor: "pointer",
                  background: !avatarEmoji ? "rgba(124,58,237,0.2)" : "var(--surface2)",
                  border: !avatarEmoji ? "2px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                  color: !avatarEmoji ? "#a78bfa" : "var(--muted)",
                }}
              >
                {profile.nickname[0]}
              </button>
              {AVATAR_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setAvatarEmoji(emoji)}
                  style={{
                    width: 44, height: 44, borderRadius: "50%", fontSize: "1.4rem", cursor: "pointer",
                    background: avatarEmoji === emoji ? "rgba(124,58,237,0.2)" : "var(--surface2)",
                    border: avatarEmoji === emoji ? "2px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                    transition: "all 0.15s",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <label style={labelStyle}>닉네임 *</label>
            <input
              value={nickname}
              maxLength={12}
              onChange={(e) => { setNickname(e.target.value); setNicknameError(""); }}
              style={{ ...inputStyle, border: nicknameError ? "1px solid #ef4444" : "1px solid var(--border)" }}
              placeholder="닉네임 (2~12자)"
            />
            {nicknameError && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{nicknameError}</div>}
          </div>

          {/* 한줄 소개 */}
          <div>
            <label style={labelStyle}>한줄 소개</label>
            <textarea
              value={bio}
              maxLength={100}
              rows={2}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 한 줄로 소개해주세요"
              style={{ ...inputStyle, resize: "none" }}
            />
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", textAlign: "right", marginTop: 3 }}>{bio.length}/100</div>
          </div>

          {/* 직군 */}
          <div>
            <label style={labelStyle}>직군</label>
            <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(role === r ? "" : r)}
                  style={{
                    padding: "0.35rem 0.75rem", borderRadius: 8, fontSize: "0.78rem", cursor: "pointer", transition: "all 0.15s",
                    background: role === r ? `${ROLE_COLORS[r] ?? "#6b6b80"}20` : "transparent",
                    color: role === r ? (ROLE_COLORS[r] ?? "#a78bfa") : "var(--muted)",
                    border: role === r ? `1px solid ${ROLE_COLORS[r] ?? "#6b6b80"}50` : "1px solid var(--border)",
                    fontWeight: role === r ? 700 : 400,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 6 }}>팀 지원 시 기본값으로 사용됩니다</div>
          </div>

          {/* 스킬 */}
          <div>
            <label style={labelStyle}>스킬 <span style={{ fontWeight: 400, textTransform: "none" }}>({skills.length}/15)</span></label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: "0.375rem",
              padding: "0.5rem 0.75rem", borderRadius: 8,
              background: "var(--surface2)", border: "1px solid var(--border)",
              minHeight: 44, alignItems: "center",
            }}>
              {skills.map((s) => (
                <span key={s} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: 6, fontSize: "0.78rem",
                  background: "rgba(124,58,237,0.15)", color: "#a78bfa",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}>
                  {s}
                  <button onClick={() => setSkills(skills.filter((x) => x !== s))}
                    style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", padding: 0, fontSize: "0.75rem", lineHeight: 1 }}>
                    ×
                  </button>
                </span>
              ))}
              {skills.length < 15 && (
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  onBlur={() => skillInput && addSkill(skillInput)}
                  placeholder={skills.length === 0 ? "스킬 입력 후 Enter (예: React, Python)" : ""}
                  style={{ border: "none", background: "transparent", outline: "none", color: "var(--text)", fontSize: "0.8rem", minWidth: 120, flex: 1 }}
                />
              )}
            </div>
          </div>

          {/* 외부 링크 */}
          <div>
            <label style={labelStyle}>외부 링크</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1rem", width: 24, textAlign: "center", flexShrink: 0 }}>🐱</span>
                <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://github.com/username" style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1rem", width: 24, textAlign: "center", flexShrink: 0 }}>🔗</span>
                <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="포트폴리오 URL" style={inputStyle} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1rem", width: 24, textAlign: "center", flexShrink: 0 }}>💼</span>
                <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/username" style={inputStyle} />
              </div>
            </div>
          </div>

          {/* 공개 여부 */}
          <div>
            <label style={labelStyle}>프로필 공개 여부</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[{ label: "공개", value: true }, { label: "비공개", value: false }].map(({ label, value }) => (
                <button
                  key={label}
                  onClick={() => setIsPublic(value)}
                  style={{
                    padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.15s",
                    fontWeight: isPublic === value ? 700 : 400,
                    background: isPublic === value
                      ? (value ? "rgba(16,185,129,0.15)" : "rgba(107,107,128,0.12)")
                      : "transparent",
                    color: isPublic === value
                      ? (value ? "#10b981" : "var(--muted)")
                      : "var(--muted)",
                    border: isPublic === value
                      ? (value ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(107,107,128,0.3)")
                      : "1px solid var(--border)",
                  }}
                >
                  {value ? "🌐 " : "🔒 "}{label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 6 }}>
              {isPublic ? "다른 팀원이 내 프로필 정보를 볼 수 있습니다" : "나만 볼 수 있습니다"}
            </div>
          </div>
        </div>

        {/* 푸터 버튼 고정 */}
        <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--border)", flexShrink: 0, display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>
            취소
          </button>
          <button onClick={handleSave} style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, hackathons, initialized } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!cardRef.current || !profile) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#12121a", scale: 2 });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${profile.nickname}-hackhack-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("배지 카드를 저장했습니다 🎉");
      });
    } catch {
      toast.error("내보내기에 실패했습니다");
    } finally {
      setExporting(false);
    }
  };

  if (!initialized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {[120, 200, 180].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👤</div>
        <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>아직 닉네임이 설정되지 않았습니다</div>
        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>닉네임 모달이 자동으로 표시됩니다</div>
      </div>
    );
  }

  const earnedIds = new Set(profile.badges.map((b) => b.id));
  const bookmarkedHackathons = hackathons.filter((h) => profile.bookmarks.includes(h.slug));
  const hasLinks = profile.links?.github || profile.links?.portfolio || profile.links?.linkedin;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* ── 프로필 헤더 ── */}
      <div style={{
        padding: "1.75rem 2rem",
        background: "linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 100%)",
        borderRadius: 16, border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
          {/* 아바타 */}
          <div style={{
            width: 68, height: 68, borderRadius: "50%", flexShrink: 0,
            background: "rgba(124,58,237,0.2)", border: "2px solid rgba(124,58,237,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: profile.avatarEmoji ? "2rem" : "1.75rem",
          }}>
            {profile.avatarEmoji || profile.nickname[0]}
          </div>

          {/* 정보 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: 4 }}>
              <span style={{ fontSize: "1.5rem", fontWeight: 800 }}>{profile.nickname}</span>
              <span style={{
                fontSize: "0.65rem", padding: "2px 7px", borderRadius: 9999,
                background: profile.isPublic !== false ? "rgba(16,185,129,0.1)" : "rgba(107,107,128,0.1)",
                color: profile.isPublic !== false ? "#10b981" : "var(--muted)",
                border: profile.isPublic !== false ? "1px solid rgba(16,185,129,0.25)" : "1px solid rgba(107,107,128,0.2)",
              }}>
                {profile.isPublic !== false ? "🌐 공개" : "🔒 비공개"}
              </span>
            </div>

            {profile.bio && (
              <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: 8, lineHeight: 1.5 }}>{profile.bio}</div>
            )}

            {/* 직군 + 스킬 태그 */}
            {(profile.role || (profile.skills ?? []).length > 0) && (
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: 8 }}>
                {profile.role && (
                  <span style={{
                    fontSize: "0.72rem", padding: "2px 10px", borderRadius: 9999,
                    background: `${ROLE_COLORS[profile.role] ?? "#6b6b80"}20`,
                    color: ROLE_COLORS[profile.role] ?? "var(--muted)",
                    border: `1px solid ${ROLE_COLORS[profile.role] ?? "#6b6b80"}40`,
                  }}>
                    {profile.role}
                  </span>
                )}
                {(profile.skills ?? []).map((s) => (
                  <span key={s} style={{
                    fontSize: "0.72rem", padding: "2px 8px", borderRadius: 9999,
                    background: "rgba(124,58,237,0.1)", color: "#a78bfa",
                    border: "1px solid rgba(124,58,237,0.25)",
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* 외부 링크 */}
            {hasLinks && (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: 8 }}>
                {profile.links?.github && (
                  <a href={profile.links.github} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    🐱 GitHub
                  </a>
                )}
                {profile.links?.portfolio && (
                  <a href={profile.links.portfolio} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    🔗 포트폴리오
                  </a>
                )}
                {profile.links?.linkedin && (
                  <a href={profile.links.linkedin} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                    💼 LinkedIn
                  </a>
                )}
              </div>
            )}

            <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              배지 {profile.badges.length}개 · 북마크 {profile.bookmarks.length}개
            </div>
          </div>

          {/* 편집 버튼 */}
          <button
            onClick={() => setShowEdit(true)}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", flexShrink: 0 }}
          >
            ✏️ 편집
          </button>
        </div>
      </div>

      {/* ── 배지 카드 ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>🏅 성장 배지</div>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem", fontWeight: 600, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a78bfa", cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.6 : 1 }}
          >
            {exporting ? "내보내는 중..." : "📸 카드 이미지로 저장"}
          </button>
        </div>
        <div ref={cardRef} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.5rem" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "1rem" }}>
            핵핵 · {profile.nickname}의 배지 컬렉션
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
            {ALL_BADGES.map((badge) => {
              const earned = earnedIds.has(badge.id);
              const earnedBadge = profile.badges.find((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: "1rem", borderRadius: 12, textAlign: "center",
                    background: earned ? "rgba(124,58,237,0.1)" : "rgba(107,107,128,0.06)",
                    border: earned ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgba(107,107,128,0.15)",
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? "none" : "grayscale(0.8)",
                    transition: "all 0.2s",
                  }}
                  title={earned && earnedBadge?.earnedAt ? `${new Date(earnedBadge.earnedAt).toLocaleDateString("ko-KR")} 획득` : "미획득"}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.375rem" }}>{earned ? badge.emoji : "🔒"}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: earned ? "var(--text)" : "var(--muted)" }}>{badge.label}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>{badge.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 여정 타임라인 ── */}
      <div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🗓️ 해커톤 여정</div>
        {profile.timeline.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>아직 기록이 없습니다. 해커톤에 참가해보세요!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[...profile.timeline].reverse().map((event, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>
                    {TIMELINE_ICONS[event.type]}
                  </div>
                  {idx < profile.timeline.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "var(--border)", minHeight: 20 }} />
                  )}
                </div>
                <div style={{ paddingBottom: idx < profile.timeline.length - 1 ? "1.25rem" : 0, paddingTop: "0.5rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{event.hackathonTitle}</div>
                  {event.detail && <div style={{ fontSize: "0.8rem", color: "#a78bfa", marginTop: 2 }}>{event.detail}</div>}
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
                    {new Date(event.at).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 북마크 해커톤 ── */}
      <div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🔖 북마크한 해커톤</div>
        {bookmarkedHackathons.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              북마크한 해커톤이 없습니다.{" "}
              <Link href="/hackathons" style={{ color: "#a78bfa" }}>해커톤 목록</Link>에서 관심 대회를 저장해보세요
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {bookmarkedHackathons.map((h) => (
              <Link key={h.slug} href={h.links.detail} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.375rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {h.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}
