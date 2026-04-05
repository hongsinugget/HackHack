"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Team } from "@/lib/types";
import { toast } from "sonner";
import { computeStatus } from "@/lib/utils";

const ROLE_CATEGORIES: { label: string; roles: string[] }[] = [
  { label: "Data Analyst", roles: ["Data Analyst"] },
  { label: "ML Engineer", roles: ["ML Engineer"] },
  { label: "Data Scientist", roles: ["Data Scientist"] },
  { label: "DevOps Engineer", roles: ["DevOps Engineer"] },
  { label: "Full Stack Developer", roles: ["Full Stack Developer"] },
  { label: "AI Researcher", roles: ["AI Researcher"] },
  { label: "Data Engineer", roles: ["Data Engineer"] },
  { label: "디자이너", roles: ["Designer"] },
  { label: "PM", roles: ["PM"] },
  { label: "Service 기획자", roles: ["Service 기획자"] },
  { label: "발표자", roles: ["발표자"] },
];

import { ROLE_COLORS, ALL_ROLES } from "@/lib/constants";

function TeamCard({
  team,
  hackathonTitle,
  hackathonTags,
  onApply,
  applied,
  isMember,
  isPending,
}: {
  team: Team;
  hackathonTitle?: string;
  hackathonTags?: string[];
  onApply: (teamCode: string) => void;
  applied: boolean;
  isMember: boolean;
  isPending: boolean;
}) {
  return (
    <div
      style={{
        background: "var(--bg-main, #f0f2f5)",
        border: "1px solid var(--border-subtle, #dde1e6)",
        borderRadius: 12,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 0.2s, border-color 0.2s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-2px)";
        el.style.borderColor = "var(--brand-primary, #7c3aed)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
        el.style.borderColor = "var(--border-subtle, #dde1e6)";
      }}
    >
      {/* 대회 정보 */}
      {hackathonTitle && (
        <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--border-subtle, #dde1e6)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {hackathonTitle}
          </div>
        </div>
      )}

      {/* 팀명 + 상태 배지 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "var(--text-main, #12121a)" }}>
          {team.name}
        </span>
        {isMember && (
          <span style={{ fontSize: 12, background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "2px 6px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.224px" }}>
            소속된 팀
          </span>
        )}
        {isPending && (
          <span style={{ fontSize: 12, background: "rgba(245,158,11,0.15)", color: "#f59e0b", padding: "2px 6px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.224px" }}>
            승인 대기중
          </span>
        )}
      </div>

      {/* 소개 */}
      <p style={{ fontSize: 13, color: "var(--text-subtle, #4b5563)", margin: 0, lineHeight: "20px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {team.intro}
      </p>

      {/* 모집 직군 태그 */}
      {team.lookingFor.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {team.lookingFor.map((role) => (
            <span key={role} className="tag-team">{role}</span>
          ))}
        </div>
      )}

      {/* 팀원 수 + 합류 버튼 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
          <span style={{ color: "var(--text-muted, #6b6b80)", fontWeight: 400 }}>팀원</span>
          <span style={{ color: "var(--brand-primary, #7c3aed)", fontWeight: 600, letterSpacing: "0.224px" }}>
            {team.memberCount}/{team.maxMembers}명
          </span>
        </div>
        {isMember ? (
          <span style={{ padding: "8px 16px", background: "rgba(16,185,129,0.1)", color: "#10b981", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1px solid rgba(16,185,129,0.25)" }}>
            소속된 팀
          </span>
        ) : team.isOpen && (
          <button
            onClick={() => onApply(team.teamCode)}
            disabled={applied}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              border: applied ? "1px solid var(--border-subtle, #dde1e6)" : "none",
              background: applied ? "transparent" : "var(--brand-primary, #7c3aed)",
              color: applied ? "var(--text-muted, #6b6b80)" : "var(--text-light, #f0f2f5)",
              cursor: applied ? "default" : "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {applied ? "합류완료" : "합류하기"}
          </button>
        )}
      </div>
    </div>
  );
}

function CreateTeamModal({
  onClose,
  onCreate,
  hackathons,
  joinedHackathonSlugs,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; intro: string; lookingFor: string[]; maxMembers: number; hackathonSlug: string; isOpen: boolean; contactUrl: string }) => string;
  hackathons: { slug: string; title: string; status: string }[];
  joinedHackathonSlugs: Set<string>;
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [hackathonSlug, setHackathonSlug] = useState(hackathons[0]?.slug ?? "");
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(4);
  const [contactUrl, setContactUrl] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const maxLookingFor = Math.max(0, maxMembers - 1);
  const toggleRole = (role: string) => {
    setLookingFor((prev) => {
      if (prev.includes(role)) return prev.filter((r) => r !== role);
      if (prev.length >= maxLookingFor) {
        toast.error(`최대 ${maxLookingFor}개의 직군까지 선택할 수 있어요`);
        return prev;
      }
      return [...prev, role];
    });
  };

  const inviteUrl = useMemo(
    () => `${typeof window !== "undefined" ? window.location.origin : "https://hackhack.vercel.app"}/invite/${inviteCode}`,
    [inviteCode]
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (step === 2) {
    return (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
        <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480 }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>팀 생성 완료!</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b6b80)" }}>
              <b style={{ color: "var(--text-main, #12121a)" }}>{name}</b> 팀이 만들어졌습니다
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main, #12121a)", display: "block", marginBottom: "0.5rem" }}>
              초대 링크
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{
                flex: 1, padding: "0.625rem 0.875rem", borderRadius: 8,
                background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
                fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {inviteUrl}
              </div>
              <button
                onClick={handleCopy}
                style={{
                  padding: "0.625rem 1rem", borderRadius: 8,
                  background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)",
                  color: copied ? "#10b981" : "#a78bfa",
                  border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.3)",
                  cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.2s",
                }}
              >
                {copied ? "✓ 복사됨" : "📋 복사"}
              </button>
            </div>
          </div>

          <div style={{ padding: "0.875rem 1rem", background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 10, marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b6b80)", marginBottom: "0.25rem" }}>초대 코드</div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#a78bfa", letterSpacing: "0.05em" }}>{inviteCode}</div>
          </div>

          <button
            onClick={onClose}
            style={{ width: "100%", padding: "0.625rem", borderRadius: 8, background: "var(--brand-primary, #7c3aed)", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* 헤더 고정 */}
        <div style={{ padding: "1.5rem 2rem 1rem", borderBottom: "1px solid var(--border-subtle, #dde1e6)", flexShrink: 0 }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--text-main, #12121a)" }}>팀 만들기</h2>
        </div>

        {/* 내용 스크롤 영역 */}
        <div style={{ overflowY: "auto", padding: "1.25rem 2rem", flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", display: "block", marginBottom: 6 }}>참가 대회 *</label>
              <select
                value={hackathonSlug}
                onChange={(e) => setHackathonSlug(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-main, #12121a)", fontSize: "0.9rem", outline: "none", cursor: "pointer" }}
              >
                <option value="" disabled>대회를 선택하세요</option>
                {hackathons.map((h) => (
                  <option key={h.slug} value={h.slug} disabled={joinedHackathonSlugs.has(h.slug)}>
                    {h.title}{joinedHackathonSlugs.has(h.slug) ? " (참가중)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", display: "block", marginBottom: 6 }}>팀 이름 *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="팀 이름을 입력하세요"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-main, #12121a)", fontSize: "0.9rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", display: "block", marginBottom: 6 }}>팀 소개</label>
              <textarea
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                placeholder="팀을 소개해주세요"
                rows={3}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-main, #12121a)", fontSize: "0.9rem", resize: "vertical" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", display: "block", marginBottom: 8 }}>최대 팀원 수</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => { setMaxMembers(n); setLookingFor((prev) => prev.slice(0, Math.max(0, n - 1))); }}
                    style={{
                      width: 40, height: 40, borderRadius: 8, fontSize: "0.9rem",
                      fontWeight: maxMembers === n ? 700 : 400,
                      background: maxMembers === n ? "rgba(124,58,237,0.2)" : "transparent",
                      color: maxMembers === n ? "#a78bfa" : "var(--text-muted, #6b6b80)",
                      border: maxMembers === n ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border-subtle, #dde1e6)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {n}
                  </button>
                ))}
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", alignSelf: "center", marginLeft: "0.25rem" }}>명</span>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)" }}>모집 직군</label>
                {maxLookingFor > 0 ? (
                  <span style={{ fontSize: "0.75rem", color: lookingFor.length >= maxLookingFor ? "#a78bfa" : "var(--text-muted, #6b6b80)" }}>
                    {lookingFor.length}/{maxLookingFor}
                  </span>
                ) : (
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b6b80)" }}>(팀원 수 1명 — 선택 불가)</span>
                )}
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {ALL_ROLES.map((role) => {
                  const selected = lookingFor.includes(role);
                  const disabled = !selected && lookingFor.length >= maxLookingFor;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      disabled={disabled && maxLookingFor === 0}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "0.375rem 0.75rem", borderRadius: 8, fontSize: "0.8rem",
                        background: selected ? "rgba(167,139,250,0.2)" : "transparent",
                        color: selected ? "#a78bfa" : disabled ? "var(--border-subtle, #dde1e6)" : "var(--text-muted, #6b6b80)",
                        border: selected ? "1px solid rgba(167,139,250,0.5)" : "1px solid var(--border-subtle, #dde1e6)",
                        cursor: disabled ? "not-allowed" : "pointer",
                        transition: "all 0.15s",
                        opacity: disabled ? 0.45 : 1,
                      }}
                    >
                      {role}
                      {selected && (
                        <span style={{ fontSize: "0.7rem", lineHeight: 1, opacity: 0.8 }}>✕</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted, #6b6b80)", display: "block", marginBottom: 6 }}>
                연락처 <span style={{ fontWeight: 400 }}>(오픈카톡 링크 등, 선택)</span>
              </label>
              <input
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder="https://open.kakao.com/..."
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-main, #12121a)", fontSize: "0.9rem" }}
              />
            </div>
          </div>
        </div>

        {/* 푸터 버튼 고정 */}
        <div style={{ padding: "1rem 2rem 1.5rem", borderTop: "1px solid var(--border-subtle, #dde1e6)", flexShrink: 0, display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-muted, #6b6b80)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            onClick={() => {
              if (!hackathonSlug) { toast.error("참가 대회를 선택해주세요"); return; }
              if (!name.trim()) { toast.error("팀 이름을 입력해주세요"); return; }
              const code = onCreate({ name: name.trim(), intro: intro.trim(), lookingFor, maxMembers, hackathonSlug, isOpen: true, contactUrl: contactUrl.trim() });
              setInviteCode(code);
              setStep(2);
            }}
            style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--brand-primary, #7c3aed)", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            팀 만들기
          </button>
        </div>
      </div>
    </div>
  );
}

function ApplyModal({
  teamCode,
  defaultRole,
  lookingFor,
  onClose,
  onConfirm,
}: {
  teamCode: string;
  defaultRole?: string;
  lookingFor: string[];
  onClose: () => void;
  onConfirm: (teamCode: string, role: string) => void;
}) {
  const [selectedRole, setSelectedRole] = useState(defaultRole ?? "");
  const displayRoles = lookingFor.length > 0 ? lookingFor : ALL_ROLES;

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 420 }}>
        <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>어떤 역할로 참가하시나요?</h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-muted, #6b6b80)", marginBottom: "1.25rem" }}>
          {lookingFor.length > 0 ? "이 팀이 모집 중인 직군이에요" : "전체 직군 중에서 선택하세요"}
        </p>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
          {displayRoles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(role)}
              style={{
                padding: "0.375rem 0.75rem", borderRadius: 8, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s",
                background: selectedRole === role ? `${ROLE_COLORS[role] ?? "#6b6b80"}20` : "transparent",
                color: selectedRole === role ? (ROLE_COLORS[role] ?? "#a78bfa") : "var(--text-muted, #6b6b80)",
                border: selectedRole === role ? `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}50` : "1px solid var(--border-subtle, #dde1e6)",
                fontWeight: selectedRole === role ? 700 : 400,
              }}
            >
              {role}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-muted, #6b6b80)", cursor: "pointer" }}>
            취소
          </button>
          <button
            onClick={() => {
              if (!selectedRole) { toast.error("역할을 선택해주세요"); return; }
              onConfirm(teamCode, selectedRole);
            }}
            style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--brand-primary, #7c3aed)", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            합류하기
          </button>
        </div>
      </div>
    </div>
  );
}

function RandomMatchModal({
  hackathons,
  defaultHackathon,
  onClose,
  onMatch,
}: {
  hackathons: { slug: string; title: string; period: { startAt: string; submissionDeadlineAt: string } }[];
  defaultHackathon: string | null;
  onClose: () => void;
  onMatch: (hackathonSlug: string, category: string | null) => boolean;
}) {
  const activeHackathons = hackathons.filter((h) => computeStatus(h.period) !== "ended");
  const [hackathonSlug, setHackathonSlug] = useState(defaultHackathon ?? activeHackathons[0]?.slug ?? "");
  const [category, setCategory] = useState<string | null>(null);

  const handleMatch = () => {
    if (!hackathonSlug) { toast.error("대회를 선택해주세요"); return; }
    const ok = onMatch(hackathonSlug, category);
    if (ok) onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "#ffffff", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>랜덤 매칭</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b6b80)", marginBottom: "1.75rem" }}>조건에 맞는 팀을 자동으로 배정해드려요</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main, #12121a)", display: "block", marginBottom: "0.5rem" }}>
              참가할 대회 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={hackathonSlug}
              onChange={(e) => setHackathonSlug(e.target.value)}
              style={{
                width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
                background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
                color: hackathonSlug ? "var(--text-main, #12121a)" : "var(--text-muted, #6b6b80)",
                fontSize: "0.9rem", outline: "none", cursor: "pointer",
              }}
            >
              <option value="" disabled>대회를 선택하세요</option>
              {activeHackathons.map((h) => (
                <option key={h.slug} value={h.slug}>{h.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-main, #12121a)", display: "block", marginBottom: "0.5rem" }}>
              내 직군 <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #6b6b80)", fontWeight: 400 }}>(선택)</span>
            </label>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {ROLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setCategory(category === cat.label ? null : cat.label)}
                  style={{
                    padding: "6px 12px", borderRadius: 6, fontSize: 12.8,
                    fontWeight: category === cat.label ? 700 : 400,
                    background: category === cat.label ? "rgba(124,58,237,0.2)" : "transparent",
                    color: category === cat.label ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                    border: "none", cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)", color: "var(--text-muted, #6b6b80)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            onClick={handleMatch}
            style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--brand-primary, #7c3aed)", color: "#ffffff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
          >
            랜덤 매칭하기
          </button>
        </div>
      </div>
    </div>
  );
}

function CampContent() {
  const hackathons = useStore((s) => s.hackathons);
  const teams = useStore((s) => s.teams);
  const initialized = useStore((s) => s.initialized);
  const profile = useStore((s) => s.profile);
  const joinTeam = useStore((s) => s.joinTeam);
  const requestJoin = useStore((s) => s.requestJoin);
  const addTeam = useStore((s) => s.addTeam);
  const searchParams = useSearchParams();

  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [applyTarget, setApplyTarget] = useState<string | null>(null);

  const myTeamCodes = new Set(profile?.myTeamCodes ?? []);

  useEffect(() => {
    const slug = searchParams.get("hackathon");
    if (slug) setSelectedHackathon(slug);
    if (searchParams.get("random") === "1") setShowRandomModal(true);
  }, [searchParams]);

  const activeCategory = ROLE_CATEGORIES.find((c) => c.label === selectedCategory) ?? null;

  const openTeams = teams
    .filter((t) => t.isOpen)
    .filter((t) => !myTeamCodes.has(t.teamCode))
    .filter((t) => t.leader !== profile?.nickname)
    .filter((t) => !(t.members ?? []).includes(profile?.nickname ?? ""))
    .filter((t) => !selectedHackathon || t.hackathonSlug === selectedHackathon)
    .filter((t) => {
      if (activeCategory) return t.lookingFor.some((r) => activeCategory.roles.includes(r));
      return true;
    });

  const handleRandomMatch = (hackathonSlug: string, category: string | null) => {
    if (isAlreadyInHackathon(hackathonSlug)) {
      toast.error("이미 같은 대회의 팀에 소속되어 있습니다");
      return false;
    }
    const categoryObj = ROLE_CATEGORIES.find((c) => c.label === category) ?? null;
    const candidates = teams
      .filter((t) => t.isOpen && t.hackathonSlug === hackathonSlug)
      .filter((t) => {
        if (categoryObj) return t.lookingFor.some((r) => categoryObj.roles.includes(r));
        return true;
      })
      .filter((t) => !myTeamCodes.has(t.teamCode));

    if (candidates.length === 0) {
      toast.error("조건에 맞는 팀이 없습니다");
      return false;
    }
    const picked = candidates[Math.floor(Math.random() * candidates.length)];
    joinTeam(picked.teamCode);
    toast.success(`🎉 ${picked.name} 팀에 자동 배정됐습니다!`);
    return true;
  };

  const isAlreadyInHackathon = (hackathonSlug: string): boolean => {
    if (!hackathonSlug) return false;
    return teams
      .filter((t) => myTeamCodes.has(t.teamCode))
      .some((t) => t.hackathonSlug === hackathonSlug);
  };

  const handleApply = (teamCode: string) => {
    const targetTeam = teams.find((t) => t.teamCode === teamCode);
    if (targetTeam?.hackathonSlug && isAlreadyInHackathon(targetTeam.hackathonSlug)) {
      toast.error("이미 같은 대회의 팀에 소속되어 있습니다");
      return;
    }
    setApplyTarget(teamCode);
  };

  const handleApplyConfirm = (teamCode: string, role: string) => {
    requestJoin(teamCode, role);
    setApplyTarget(null);
    toast.success("지원 요청을 보냈습니다! 팀장의 수락을 기다려주세요 🤝");
  };

  const handleCreateTeam = (data: { name: string; intro: string; lookingFor: string[]; maxMembers: number; hackathonSlug: string; isOpen: boolean; contactUrl: string }): string => {
    if (data.hackathonSlug && isAlreadyInHackathon(data.hackathonSlug)) {
      toast.error("이미 해당 대회의 팀에 소속되어 있습니다");
      return "";
    }
    const inviteCode = "INV-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    const teamCode = "T-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const newTeam: Team = {
      teamCode,
      hackathonSlug: data.hackathonSlug,
      name: data.name,
      isOpen: data.isOpen,
      memberCount: 1,
      maxMembers: data.maxMembers,
      members: [profile?.nickname ?? ""],
      leader: profile?.nickname ?? "",
      lookingFor: data.lookingFor,
      intro: data.intro || "새로 만들어진 팀입니다.",
      contact: { type: "link", url: data.contactUrl || inviteUrl },
      createdAt: new Date().toISOString(),
    };
    addTeam(newTeam);
    joinTeam(teamCode);
    toast.success(`🚀 "${data.name}" 팀이 생성됐습니다!`);
    return inviteCode;
  };

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>
          팀 모집
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", margin: 0 }}>
          직군 기반으로 팀을 찾고, 만들고, 합류하세요
        </p>
      </div>

      {/* 필터 컨테이너 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          padding: "1rem 1.25rem",
          borderRadius: 10,
          border: "1px solid var(--border-subtle, #dde1e6)",
        }}
      >
        {/* 해커톤 필터 — Container-Button 스타일 */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedHackathon(null)}
            style={{
              padding: "6px 12px", borderRadius: 6, fontSize: 12.8,
              fontWeight: !selectedHackathon ? 700 : 400,
              background: !selectedHackathon ? "rgba(124,58,237,0.2)" : "transparent",
              color: !selectedHackathon ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
              border: "none", cursor: "pointer", transition: "all 0.15s",
            }}
          >
            전체 대회
          </button>
          {hackathons.filter((h) => computeStatus(h.period) !== "ended").map((h) => (
            <button
              key={h.slug}
              onClick={() => setSelectedHackathon(selectedHackathon === h.slug ? null : h.slug)}
              style={{
                padding: "6px 12px", borderRadius: 6, fontSize: 12.8,
                fontWeight: selectedHackathon === h.slug ? 700 : 400,
                background: selectedHackathon === h.slug ? "rgba(124,58,237,0.2)" : "transparent",
                color: selectedHackathon === h.slug ? "var(--brand-primary, #7c3aed)" : "var(--text-subtle, #4b5563)",
                border: "none", cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {h.title}
            </button>
          ))}
        </div>

        {/* 구분선 */}
        <div style={{ borderTop: "1px solid var(--border-subtle, #dde1e6)" }} />

        {/* 직군 필터 — Container-tag 스타일 (해커톤 목록 태그 필터와 동일) */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedCategory(null)}
            style={{
              display: "flex", alignItems: "center", gap: 4,
              padding: "4px 9px", borderRadius: 2, fontSize: 12,
              fontWeight: !selectedCategory ? 600 : 400,
              background: !selectedCategory ? "var(--bg-input, #dee2e6)" : "transparent",
              color: "var(--text-subtle, #4b5563)",
              border: !selectedCategory ? "none" : "1px solid var(--bg-input, #dee2e6)",
              cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.224px",
            }}
          >
            전체
          </button>
          {ROLE_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "4px 9px", borderRadius: 2, fontSize: 12,
                fontWeight: selectedCategory === cat.label ? 600 : 400,
                background: selectedCategory === cat.label ? "var(--bg-input, #dee2e6)" : "transparent",
                color: "var(--text-subtle, #4b5563)",
                border: selectedCategory === cat.label ? "none" : "1px solid var(--bg-input, #dee2e6)",
                cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.224px",
              }}
            >
              {cat.label}
              {selectedCategory === cat.label && (
                <span style={{ fontSize: 10, lineHeight: 1, opacity: 0.6 }}>✕</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 팀 목록 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
        <div>
          <div className="section-title">모집 중인 팀</div>
          {initialized && (
            <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginTop: 2 }}>
              {selectedCategory
                ? <><b style={{ color: "var(--brand-primary, #7c3aed)" }}>{selectedCategory}</b> 모집 팀 {openTeams.length}개</>
                : `총 ${openTeams.length}개 팀이 팀원을 찾고 있어요`}
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => setShowRandomModal(true)}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: "rgba(167,139,250,0.2)", color: "var(--brand-primary, #7c3aed)",
              border: "none", cursor: "pointer",
            }}
          >
            랜덤 매칭
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: "var(--brand-primary, #7c3aed)", color: "#ffffff",
              border: "none", cursor: "pointer",
            }}
          >
            + 팀 만들기
          </button>
        </div>
      </div>

      {/* 팀 카드 그리드 */}
      {!initialized ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 180, borderRadius: 12, background: "var(--bg-main, #f0f2f5)", opacity: 0.6, animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : openTeams.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "4rem 2rem",
          background: "var(--bg-main, #f0f2f5)", borderRadius: 12,
        }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏕️</div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem", color: "var(--text-main, #12121a)" }}>모집 중인 팀이 없습니다</div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-muted, #6b6b80)", marginBottom: "1rem" }}>첫 번째로 팀을 만들어보세요!</div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, background: "rgba(124,58,237,0.12)", color: "var(--brand-primary, #7c3aed)", border: "none", cursor: "pointer", fontWeight: 600 }}
          >
            팀 만들기
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {openTeams.map((team) => {
            const h = hackathons.find((h) => h.slug === team.hackathonSlug);
            const isPending = !myTeamCodes.has(team.teamCode) &&
              (team.joinRequests ?? []).some((r) => r.nickname === profile?.nickname);
            return (
              <TeamCard
                key={team.teamCode}
                team={team}
                hackathonTitle={h?.title}
                hackathonTags={h?.tags}
                onApply={handleApply}
                applied={myTeamCodes.has(team.teamCode)}
                isMember={myTeamCodes.has(team.teamCode)}
                isPending={isPending}
              />
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateTeam}
          hackathons={hackathons}
          joinedHackathonSlugs={new Set(
            teams.filter((t) => myTeamCodes.has(t.teamCode) && t.hackathonSlug).map((t) => t.hackathonSlug)
          )}
        />
      )}

      {showRandomModal && (
        <RandomMatchModal
          hackathons={hackathons}
          defaultHackathon={selectedHackathon}
          onClose={() => setShowRandomModal(false)}
          onMatch={handleRandomMatch}
        />
      )}

      {applyTarget && (
        <ApplyModal
          teamCode={applyTarget}
          defaultRole={profile?.role}
          lookingFor={teams.find((t) => t.teamCode === applyTarget)?.lookingFor ?? []}
          onClose={() => setApplyTarget(null)}
          onConfirm={handleApplyConfirm}
        />
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}

export default function CampPage() {
  return (
    <Suspense>
      <CampContent />
    </Suspense>
  );
}
