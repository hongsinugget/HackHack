"use client";

import { useRef, useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import type { Badge } from "@/lib/types";
import { ALL_ROLES } from "@/lib/constants";

const AVATAR_EMOJIS = [
  "🧑‍💻", "👩‍💻", "🧑‍🎨", "👩‍🎨", "🧑‍🔬", "👩‍🔬",
  "⚡", "🚀", "🔥", "💡", "🎯", "🏆",
  "🤖", "🦊", "🐼", "🦁", "🦋", "🌟",
];

// "harry" / "nini" 는 이미지 아바타 특수 키
const IMAGE_AVATARS = [
  { key: "harry", src: "/icons/harry-profile.png", alt: "Harry" },
  { key: "nini",  src: "/icons/nini-profile.png",  alt: "NiNi"  },
];

function AvatarBtn({
  selected, onClick, children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 44, height: 44, borderRadius: 22, cursor: "pointer",
        background: selected ? "rgba(124,58,237,0.2)" : "var(--bg-main, #f0f2f5)",
        border: selected ? "2px solid var(--brand-primary, #7c3aed)" : "1px solid var(--border-subtle, #dde1e6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.15s", padding: 0, overflow: "hidden",
      }}
    >
      {children}
    </button>
  );
}

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
    if (e.nativeEvent.isComposing) return; // IME 조합 중 무시 (한글 마지막 글자 중복 방지)
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

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 8,
    background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
    color: "var(--text-main, #12121a)", fontSize: 13, outline: "none",
    lineHeight: "20px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: "var(--text-muted, #6b6b80)",
    display: "block", marginBottom: 8, letterSpacing: "0.224px",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#ffffff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "92vh", display: "flex", flexDirection: "column" }}>

        {/* 헤더 */}
        <div style={{ padding: "18px 24px 16px", borderBottom: "1px solid var(--bg-main, #f0f2f5)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "var(--text-main, #12121a)", margin: 0 }}>프로필 편집</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-subtle, #4b5563)", fontSize: 20, cursor: "pointer", lineHeight: 1, padding: 0 }}>✕</button>
        </div>

        {/* 스크롤 영역 */}
        <div style={{ overflowY: "auto", padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>

          {/* 프로필 사진 */}
          <div>
            <label style={labelStyle}>프로필 사진</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* 초성 버튼 */}
              <AvatarBtn selected={!avatarEmoji} onClick={() => setAvatarEmoji("")}>
                <span style={{ fontSize: 16, fontWeight: 700, color: !avatarEmoji ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)" }}>
                  {profile.nickname[0]}
                </span>
              </AvatarBtn>

              {/* 이모지 */}
              {AVATAR_EMOJIS.map((emoji) => (
                <AvatarBtn key={emoji} selected={avatarEmoji === emoji} onClick={() => setAvatarEmoji(emoji)}>
                  <span style={{ fontSize: "1.4rem", lineHeight: 1 }}>{emoji}</span>
                </AvatarBtn>
              ))}

              {/* 이미지 아바타 (harry, nini) */}
              {IMAGE_AVATARS.map(({ key, src, alt }) => (
                <AvatarBtn key={key} selected={avatarEmoji === key} onClick={() => setAvatarEmoji(key)}>
                  <img src={src} alt={alt} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </AvatarBtn>
              ))}
            </div>
          </div>

          {/* 닉네임 */}
          <div>
            <label style={labelStyle}>닉네임 *</label>
            <input
              value={nickname} maxLength={12}
              onChange={(e) => { setNickname(e.target.value); setNicknameError(""); }}
              style={{ ...inputStyle, border: nicknameError ? "1px solid #ef4444" : "1px solid var(--border-subtle, #dde1e6)" }}
              placeholder="닉네임 (2~12자)"
            />
            {nicknameError && <div style={{ fontSize: 12, color: "#ef4444", marginTop: 4 }}>{nicknameError}</div>}
          </div>

          {/* 한줄 소개 */}
          <div>
            <label style={labelStyle}>한줄 소개</label>
            <textarea
              value={bio} maxLength={100} rows={3}
              onChange={(e) => setBio(e.target.value)}
              placeholder="나를 한 줄로 소개해주세요"
              style={{ ...inputStyle, resize: "none" }}
            />
            <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", textAlign: "right", marginTop: 4, letterSpacing: "0.224px" }}>{bio.length}/100</div>
          </div>

          {/* 직군 */}
          <div>
            <label style={labelStyle}>직군</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ALL_ROLES.map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(role === r ? "" : r)}
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "6px 12px", borderRadius: 8, fontSize: 12.48, cursor: "pointer", transition: "all 0.15s",
                    background: role === r ? "rgba(167,139,250,0.15)" : "transparent",
                    color: role === r ? "#a78bfa" : "var(--text-muted, #6b6b80)",
                    border: role === r ? "1px solid rgba(167,139,250,0.4)" : "1px solid var(--border-subtle, #dde1e6)",
                    fontWeight: role === r ? 600 : 400, lineHeight: "18.72px",
                  }}
                >
                  {r}
                  {role === r && (
                    <span
                      onClick={(e) => { e.stopPropagation(); setRole(""); }}
                      style={{ fontSize: 14, lineHeight: 1, color: "#a78bfa" }}
                    >×</span>
                  )}
                </button>
              ))}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginTop: 8, letterSpacing: "0.224px" }}>팀 지원 시 기본값으로 사용됩니다</div>
          </div>

          {/* 스킬 */}
          <div>
            <label style={labelStyle}>스킬 <span style={{ fontWeight: 400 }}>({skills.length}/15)</span></label>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 6,
              padding: "11px 12px", borderRadius: 8,
              background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
              minHeight: 44, alignItems: "center",
            }}>
              {skills.map((s) => (
                <span key={s} style={{
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "2px 8px", borderRadius: 6, fontSize: 12,
                  background: "rgba(124,58,237,0.15)", color: "var(--brand-tag-purple, #a78bfa)",
                  border: "1px solid rgba(124,58,237,0.3)",
                }}>
                  {s}
                  <button onClick={() => setSkills(skills.filter((x) => x !== s))}
                    style={{ background: "none", border: "none", color: "var(--brand-tag-purple, #a78bfa)", cursor: "pointer", padding: 0, fontSize: 12, lineHeight: 1 }}>×</button>
                </span>
              ))}
              {skills.length < 15 && (
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKey}
                  onBlur={() => skillInput && addSkill(skillInput)}
                  placeholder={skills.length === 0 ? "스킬 입력 후 Enter (예: React, Python)" : ""}
                  style={{ border: "none", background: "transparent", outline: "none", color: "var(--text-subtle, #4b5563)", fontSize: 13, minWidth: 120, flex: 1, lineHeight: "20px" }}
                />
              )}
            </div>
          </div>

          {/* 외부 링크 */}
          <div>
            <label style={labelStyle}>외부 링크</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { icon: "/icons/github-icon.svg",   value: github,    setter: setGithub,    placeholder: "https://github.com/username" },
                { icon: "/icons/link-icon.svg",     value: portfolio, setter: setPortfolio, placeholder: "포트폴리오 URL" },
                { icon: "/icons/linkedin-icon.svg", value: linkedin,  setter: setLinkedin,  placeholder: "https://linkedin.com/in/username" },
              ].map(({ icon, value, setter, placeholder }) => (
                <div key={placeholder} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <img src={icon} alt="" style={{ width: 20, height: 20, flexShrink: 0 }} />
                  <input value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} style={inputStyle} />
                </div>
              ))}
            </div>
          </div>

          {/* 공개 여부 */}
          <div>
            <label style={labelStyle}>프로필 공개 여부</label>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button
                onClick={() => setIsPublic(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 2,
                  padding: "9px 29px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  background: isPublic ? "rgba(124,58,237,0.2)" : "transparent",
                  border: isPublic ? "1px solid var(--brand-primary, #7c3aed)" : "1px solid var(--border-subtle, #dde1e6)",
                  color: isPublic ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                  fontWeight: 600, fontSize: 14, lineHeight: "20px",
                }}
              >
                <img src="/icons/open-icon.svg" alt="" style={{ width: 18, height: 18 }} />
                공개
              </button>
              <button
                onClick={() => setIsPublic(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 2,
                  padding: "8px 28px", borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  background: !isPublic ? "rgba(107,107,128,0.1)" : "transparent",
                  border: !isPublic ? "1px solid rgba(107,107,128,0.4)" : "1px solid var(--border-subtle, #dde1e6)",
                  color: "var(--text-subtle, #4b5563)",
                  fontWeight: 600, fontSize: 14, lineHeight: "20px",
                }}
              >
                <img src="/icons/lock-icon.svg" alt="" style={{ width: 18, height: 18 }} />
                비공개
              </button>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px" }}>
              {isPublic ? "다른 팀원이 내 프로필 정보를 볼 수 있습니다" : "나만 볼 수 있습니다"}
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div style={{ padding: "17px 24px", borderTop: "1px solid var(--border-subtle, #dde1e6)", flexShrink: 0, display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 46, borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-subtle, #4b5563)", cursor: "pointer", fontSize: 16, fontWeight: 700, lineHeight: "24px" }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            style={{ flex: 2, height: 46, borderRadius: 8, background: "var(--brand-primary, #7c3aed)", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: 16, lineHeight: "24px" }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

const ALL_BADGES: Omit<Badge, "earnedAt">[] = [
  { id: "first_spark", emoji: "🔥", label: "첫 불꽃", description: "플랫폼 최초 방문 + 닉네임 설정" },
  { id: "duo_buddy", emoji: "🤝", label: "최강단짝", description: "첫 팀 생성 또는 팀 합류" },
  { id: "submitted", emoji: "📦", label: "제출 완료!", description: "첫 결과물 제출" },
  { id: "top3", emoji: "🏅", label: "취미를 넘어선", description: "리더보드 3위 이내 진입" },
  { id: "top2", emoji: "🥈", label: "전설적인", description: "리더보드 2위 달성" },
  { id: "top1", emoji: "🏆", label: "전설이 된 마스터", description: "리더보드 1위 달성" },
  { id: "regular", emoji: "🔁", label: "단골손님", description: "2개 이상 해커톤 참가" },
];

const BADGE_IMAGES: Record<string, string> = {
  first_spark: "/badge/첫불꽃.png",
  duo_buddy:   "/badge/최강단짝.png",
  submitted:   "/badge/제출완료.png",
  top3:        "/badge/취미를넘어선.png",
  top2:        "/badge/전설적인.png",
  top1:        "/badge/전설이된마스터.png",
  regular:     "/badge/단골손님.png",
};

type BadgePreviewTarget = {
  id: string;
  label: string;
  description: string;
  earnedAt?: string;
};

function BadgePreviewModal({
  badge,
  nickname,
  onClose,
}: {
  badge: BadgePreviewTarget;
  nickname: string;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const imgSrc = BADGE_IMAGES[badge.id];

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true, backgroundColor: null });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${nickname}-${badge.label}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        toast.success(`${badge.label} 배지 카드를 저장했습니다`);
      });
    } catch {
      toast.error("저장에 실패했습니다");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, maxWidth: 420, width: "100%" }}>

        {/* 카드 (html2canvas 캡처 영역) */}
        <div
          ref={cardRef}
          style={{
            width: "100%",
            background: "linear-gradient(145deg, #1a0a3a 0%, #12121a 60%, #1a0a2e 100%)",
            borderRadius: 20,
            padding: "40px 36px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* 배경 장식 */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(124,58,237,0.12)" }} />
            <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(124,58,237,0.08)" }} />
          </div>

          {/* 상단 브랜드 */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 28, alignSelf: "flex-start", position: "relative" }}>
            <img src="/icons/logo.svg" alt="HackHack" style={{ height: 18, opacity: 0.9 }} />
          </div>

          {/* 배지 이미지 */}
          <div style={{ position: "relative", marginBottom: 20 }}>
            <div style={{ width: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {imgSrc ? (
                <img src={imgSrc} alt={badge.label} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <span style={{ fontSize: "4rem" }}>{badge.id}</span>
              )}
            </div>
          </div>

          {/* ACHIEVEMENT 레이블 */}
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "2px", color: "rgba(167,139,250,0.7)", marginBottom: 8, textTransform: "uppercase" }}>
            Achievement Unlocked
          </div>

          {/* 배지 이름 */}
          <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", textAlign: "center", marginBottom: 10, lineHeight: 1.3 }}>
            {badge.label}
          </div>

          {/* 구분선 */}
          <div style={{ width: 48, height: 2, background: "rgba(167,139,250,0.5)", borderRadius: 1, marginBottom: 12 }} />

          {/* 배지 설명 */}
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center", lineHeight: 1.6, marginBottom: 24, padding: "0 4px" }}>
            {badge.description}
          </div>

          {/* 닉네임 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, position: "relative", marginTop: 4 }}>
            <div style={{ fontSize: 10, color: "rgba(167,139,250,0.55)", fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase" }}>Earned by</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#ffffff" }}>{nickname}</div>
          </div>

          {/* 획득일 */}
          {badge.earnedAt && (
            <div style={{ marginTop: 16, fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.5px" }}>
              {new Date(badge.earnedAt).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          )}
        </div>

        {/* 버튼 영역 */}
        <div style={{ display: "flex", gap: 10, width: "100%" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 44, borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "#ffffff", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            닫기
          </button>
          <button
            onClick={handleDownload}
            disabled={exporting}
            style={{ flex: 2, height: 44, borderRadius: 10, background: "var(--brand-primary, #7c3aed)", border: "none", color: "#ffffff", fontWeight: 700, fontSize: 14, cursor: exporting ? "default" : "pointer", opacity: exporting ? 0.7 : 1, transition: "opacity 0.15s" }}
          >
            {exporting ? "저장 중..." : "이미지로 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, initialized } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [previewBadge, setPreviewBadge] = useState<BadgePreviewTarget | null>(null);

  const handleBadgeClick = (badge: Omit<Badge, "earnedAt"> & { earnedAt?: string }, earned: boolean) => {
    if (!earned) return;
    setPreviewBadge({ id: badge.id, label: badge.label, description: badge.description, earnedAt: badge.earnedAt });
  };

  if (!initialized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {[120, 200, 180].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 12, background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem", background: "#ffffff", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👤</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main, #12121a)", marginBottom: "0.375rem" }}>아직 닉네임이 설정되지 않았습니다</div>
        <div style={{ fontSize: "0.875rem", color: "var(--text-muted, #6b6b80)" }}>닉네임 모달이 자동으로 표시됩니다</div>
      </div>
    );
  }

  const earnedIds = useMemo(() => new Set(profile.badges.map((b) => b.id)), [profile.badges]);
  const reversedTimeline = useMemo(() => [...profile.timeline].reverse(), [profile.timeline]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* ── 프로필 헤더 ── */}
      <div style={{
        padding: "1.75rem 2rem",
        background: "#ffffff",
        borderRadius: 16,
        border: "1px solid var(--border-subtle, #dde1e6)",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "1.25rem" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 22, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden",
            fontSize: profile.avatarEmoji && !["harry","nini"].includes(profile.avatarEmoji) ? "2.25rem" : "2rem",
            color: "var(--brand-primary, #7c3aed)", fontWeight: 800,
          }}>
            {["harry","nini"].includes(profile.avatarEmoji ?? "") ? (
              <img
                src={`/icons/${profile.avatarEmoji}-profile.png`}
                alt={profile.avatarEmoji ?? ""}
                style={{ width: "85%", height: "85%", objectFit: "contain" }}
              />
            ) : (
              profile.avatarEmoji || profile.nickname[0]
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 닉네임 + 배지 */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 800, lineHeight: "34px", color: "var(--text-main, #12121a)" }}>
                {profile.nickname}
              </span>
              <span className="badge" style={{
                background: profile.isPublic !== false ? "rgba(16,185,129,0.15)" : "rgba(107,107,128,0.1)",
                color: profile.isPublic !== false ? "var(--status-ongoing-text, #10b981)" : "var(--text-muted, #6b6b80)",
                border: profile.isPublic !== false ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(107,107,128,0.2)",
              }}>
                {profile.isPublic !== false ? "공개" : "비공개"}
              </span>
              {profile.role && (
                <span style={{
                  fontSize: 12, padding: "2px 10px", borderRadius: 9999, fontWeight: 600,
                  background: "rgba(167,139,250,0.15)",
                  color: "#a78bfa",
                  border: "1px solid rgba(167,139,250,0.4)",
                }}>
                  {profile.role}
                </span>
              )}
            </div>

            {/* 한줄 소개 */}
            {profile.bio && (
              <div style={{ fontSize: 14, color: "var(--text-subtle, #4b5563)", lineHeight: 1.6 }}>
                {profile.bio}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowEdit(true)}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)",
              color: "var(--text-subtle, #4b5563)", cursor: "pointer", flexShrink: 0,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-primary, #7c3aed)"; e.currentTarget.style.color = "var(--brand-primary, #7c3aed)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle, #dde1e6)"; e.currentTarget.style.color = "var(--text-subtle, #4b5563)"; }}
          >
            프로필 편집
          </button>
        </div>
      </div>

      {/* ── 성장 배지 ── */}
      <div>
        <div style={{ marginBottom: "1rem" }}>
          <h2 className="section-title">성장 배지</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginTop: 4 }}>
            뱃지를 클릭하면 이미지로 저장할 수 있어요
          </p>
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid var(--border-subtle, #dde1e6)",
            borderRadius: 16,
            padding: "1.5rem",
          }}
        >
          <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginBottom: "1rem", letterSpacing: "0.224px" }}>
            핵핵 · {profile.nickname}의 배지 컬렉션
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
            {ALL_BADGES.map((badge) => {
              const earned = earnedIds.has(badge.id);
              const earnedBadge = profile.badges.find((b) => b.id === badge.id);
              const imgSrc = BADGE_IMAGES[badge.id];
              return (
                <div
                  key={badge.id}
                  onClick={() => handleBadgeClick({ ...badge, earnedAt: earnedBadge?.earnedAt }, earned)}
                  style={{
                    padding: "1rem", borderRadius: 12, textAlign: "center",
                    background: earned ? "rgba(124,58,237,0.08)" : "var(--bg-main, #f0f2f5)",
                    border: earned ? "1px solid rgba(124,58,237,0.2)" : "1px solid var(--border-subtle, #dde1e6)",
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? "none" : "grayscale(1)",
                    cursor: earned ? "pointer" : "default",
                    transition: "all 0.2s",
                  }}
                  title={earned && earnedBadge?.earnedAt ? `${new Date(earnedBadge.earnedAt).toLocaleDateString("ko-KR")} 획득 · 클릭하면 저장` : "미획득"}
                >
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", height: 64 }}>
                    {imgSrc ? (
                      <img src={imgSrc} alt={badge.label} style={{ height: "100%", width: "auto", objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: "2rem", lineHeight: "64px" }}>{badge.emoji}</span>
                    )}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: earned ? "var(--text-main, #12121a)" : "var(--text-muted, #6b6b80)" }}>{badge.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted, #6b6b80)", marginTop: 3, lineHeight: 1.4 }}>{badge.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 해커톤 여정 ── */}
      <div>
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>해커톤 여정</h2>
        {profile.timeline.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", background: "#ffffff", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)" }}>
            <div style={{ color: "var(--text-muted, #6b6b80)", fontSize: 14 }}>아직 기록이 없습니다. 해커톤에 참가해보세요!</div>
          </div>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)", padding: "1.25rem 1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {reversedTimeline.map((event, idx) => (
                <div key={idx} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 12, flexShrink: 0, paddingTop: "0.65rem" }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                      background: "var(--brand-primary, #7c3aed)",
                    }} />
                    {idx < profile.timeline.length - 1 && (
                      <div style={{ width: 1, flex: 1, background: "var(--border-subtle, #dde1e6)", minHeight: 20 }} />
                    )}
                  </div>
                  <div style={{ paddingBottom: idx < profile.timeline.length - 1 ? "1.25rem" : 0, paddingTop: "0.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text-main, #12121a)" }}>{event.hackathonTitle}</div>
                    {event.detail && <div style={{ fontSize: 13, color: "var(--brand-tag-purple, #a78bfa)", marginTop: 2 }}>{event.detail}</div>}
                    <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginTop: 3, letterSpacing: "0.224px" }}>
                      {new Date(event.at).toLocaleDateString("ko-KR")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showEdit && <EditProfileModal onClose={() => setShowEdit(false)} />}
      {previewBadge && profile && (
        <BadgePreviewModal
          badge={previewBadge}
          nickname={profile.nickname}
          onClose={() => setPreviewBadge(null)}
        />
      )}
    </div>
  );
}
