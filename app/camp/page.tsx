"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import type { Team } from "@/lib/types";
import { toast } from "sonner";
import StatusBadge from "@/components/StatusBadge";

const ROLE_CATEGORIES: { label: string; roles: string[]; subRoles?: string[] }[] = [
  { label: "개발자", roles: ["Frontend", "Backend", "ML Engineer"], subRoles: ["Frontend", "Backend", "ML Engineer"] },
  { label: "디자이너", roles: ["Designer"] },
  { label: "PM", roles: ["PM"] },
];

const ROLE_COLORS: Record<string, string> = {
  Frontend: "#38bdf8",
  Backend: "#34d399",
  Designer: "#f472b6",
  "ML Engineer": "#a78bfa",
  PM: "#fbbf24",
  기획자: "#fb923c",
};

function TeamCard({
  team,
  hackathonTitle,
  hackathonTags,
  onApply,
  applied,
  isMember,
}: {
  team: Team;
  hackathonTitle?: string;
  hackathonTags?: string[];
  onApply: (teamCode: string) => void;
  applied: boolean;
  isMember: boolean;
}) {
  return (
    <div className="card" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: 0 }}>
      {/* 대회 정보 */}
      {hackathonTitle && (
        <div style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            🏆 {hackathonTitle}
          </div>
          {hackathonTags && hackathonTags.length > 0 && (
            <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
              {hackathonTags.slice(0, 4).map((tag) => (
                <span key={tag} className="tag" style={{ fontSize: "0.65rem", padding: "1px 6px" }}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: "1rem" }}>{team.name}</div>
        </div>
        {team.isOpen ? (
          <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 8px", borderRadius: 9999 }}>
            모집중
          </span>
        ) : (
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 8px", borderRadius: 9999 }}>
            모집완료
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: "0.875rem", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {team.intro}
      </p>

      {team.lookingFor.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
          {team.lookingFor.map((role) => (
            <span
              key={role}
              style={{
                fontSize: "0.7rem",
                padding: "2px 8px",
                borderRadius: 6,
                border: `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}40`,
                color: ROLE_COLORS[role] ?? "var(--muted)",
                background: `${ROLE_COLORS[role] ?? "#6b6b80"}15`,
              }}
            >
              {role}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>팀원 {team.memberCount}명</span>
        {isMember ? (
          <span style={{
            fontSize: "0.75rem",
            padding: "4px 12px",
            borderRadius: 6,
            border: "1px solid rgba(16,185,129,0.3)",
            background: "rgba(16,185,129,0.08)",
            color: "#10b981",
          }}>
            ✓ 소속된 팀
          </span>
        ) : team.isOpen && (
          <button
            onClick={() => onApply(team.teamCode)}
            disabled={applied}
            style={{
              fontSize: "0.75rem",
              padding: "4px 12px",
              borderRadius: 6,
              border: applied ? "1px solid var(--border)" : "1px solid rgba(124,58,237,0.3)",
              background: applied ? "transparent" : "rgba(124,58,237,0.1)",
              color: applied ? "var(--muted)" : "#a78bfa",
              cursor: applied ? "default" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {applied ? "✓ 지원완료" : "지원하기"}
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
}: {
  onClose: () => void;
  onCreate: (data: { name: string; intro: string; lookingFor: string[]; maxMembers: number; hackathonSlug: string }) => string;
  hackathons: { slug: string; title: string; status: string }[];
}) {
  const [step, setStep] = useState<1 | 2>(1);
  const [hackathonSlug, setHackathonSlug] = useState("");
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [maxMembers, setMaxMembers] = useState(4);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);
  const allRoles = ["Frontend", "Backend", "Designer", "PM", "ML Engineer"];

  const toggleRole = (role: string) =>
    setLookingFor((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const inviteUrl = `${typeof window !== "undefined" ? window.location.origin : "https://hackhack.vercel.app"}/invite/${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (step === 2) {
    return (
      <div
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      >
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480 }}>
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🎉</div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.375rem" }}>팀 생성 완료!</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              <b style={{ color: "var(--text)" }}>{name}</b> 팀이 만들어졌습니다
            </p>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}>
              초대 링크
            </label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <div style={{
                flex: 1,
                padding: "0.625rem 0.875rem",
                borderRadius: 8,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                fontSize: "0.8rem",
                color: "var(--muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {inviteUrl}
              </div>
              <button
                onClick={handleCopy}
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: 8,
                  background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)",
                  color: copied ? "#10b981" : "#a78bfa",
                  border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.3)",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                {copied ? "✓ 복사됨" : "📋 복사"}
              </button>
            </div>
          </div>

          <div style={{
            padding: "0.875rem 1rem",
            background: "rgba(124,58,237,0.06)",
            border: "1px solid rgba(124,58,237,0.15)",
            borderRadius: 10,
            marginBottom: "1.5rem",
          }}>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>초대 코드</div>
            <div style={{ fontSize: "1rem", fontWeight: 800, color: "#a78bfa", letterSpacing: "0.05em" }}>{inviteCode}</div>
          </div>

          <button
            onClick={onClose}
            style={{ width: "100%", padding: "0.625rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
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
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "1.5rem" }}>팀 만들기</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>참가 대회 *</label>
            <select
              value={hackathonSlug}
              onChange={(e) => setHackathonSlug(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", color: hackathonSlug ? "var(--text)" : "var(--muted)", fontSize: "0.9rem", outline: "none", cursor: "pointer" }}
            >
              <option value="" disabled>대회를 선택하세요</option>
              {hackathons.map((h) => (
                <option key={h.slug} value={h.slug}>{h.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>팀 이름 *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="팀 이름을 입력하세요"
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.9rem" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>팀 소개</label>
            <textarea
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              placeholder="팀을 소개해주세요"
              rows={3}
              style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.9rem", resize: "vertical" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 8 }}>최대 팀원 수</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMaxMembers(n)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    fontSize: "0.9rem",
                    fontWeight: maxMembers === n ? 700 : 400,
                    background: maxMembers === n ? "rgba(124,58,237,0.2)" : "transparent",
                    color: maxMembers === n ? "#a78bfa" : "var(--muted)",
                    border: maxMembers === n ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {n}
                </button>
              ))}
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", alignSelf: "center", marginLeft: "0.25rem" }}>명</span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 8 }}>모집 직군</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {allRoles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  style={{
                    padding: "0.375rem 0.75rem",
                    borderRadius: 8,
                    fontSize: "0.8rem",
                    background: lookingFor.includes(role) ? `${ROLE_COLORS[role] ?? "#6b6b80"}20` : "transparent",
                    color: lookingFor.includes(role) ? (ROLE_COLORS[role] ?? "#a78bfa") : "var(--muted)",
                    border: lookingFor.includes(role) ? `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}50` : "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            onClick={() => {
              if (!hackathonSlug) { toast.error("참가할 대회를 선택해주세요"); return; }
              if (!name.trim()) { toast.error("팀 이름을 입력해주세요"); return; }
              const code = onCreate({ name: name.trim(), intro: intro.trim(), lookingFor, maxMembers, hackathonSlug });
              setInviteCode(code);
              setStep(2);
            }}
            style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            팀 생성하기
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
  hackathons: { slug: string; title: string; status: string }[];
  defaultHackathon: string | null;
  onClose: () => void;
  onMatch: (hackathonSlug: string, subRole: string | null, category: string | null) => boolean;
}) {
  const activeHackathons = hackathons.filter((h) => h.status !== "ended");
  const [hackathonSlug, setHackathonSlug] = useState(defaultHackathon ?? activeHackathons[0]?.slug ?? "");
  const [category, setCategory] = useState<string | null>(null);
  const [subRole, setSubRole] = useState<string | null>(null);

  const activeCat = ROLE_CATEGORIES.find((c) => c.label === category) ?? null;

  const handleMatch = () => {
    if (!hackathonSlug) { toast.error("대회를 선택해주세요"); return; }
    const ok = onMatch(hackathonSlug, subRole, category);
    if (ok) onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 440 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "0.375rem" }}>⚡ 랜덤 매칭</h2>
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.75rem" }}>조건에 맞는 팀을 자동으로 배정해드려요</p>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* 대회 선택 */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}>
              참가할 대회 <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              value={hackathonSlug}
              onChange={(e) => setHackathonSlug(e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem 0.875rem",
                borderRadius: 8,
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                color: hackathonSlug ? "var(--text)" : "var(--muted)",
                fontSize: "0.9rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="" disabled>대회를 선택하세요</option>
              {activeHackathons.map((h) => (
                <option key={h.slug} value={h.slug}>{h.title}</option>
              ))}
            </select>
          </div>

          {/* 직군 선택 */}
          <div>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", display: "block", marginBottom: "0.5rem" }}>
              내 직군 <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 400 }}>(선택)</span>
            </label>
            {/* 대분류 */}
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: activeCat?.subRoles ? "0.6rem" : 0 }}>
              {ROLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => {
                    if (category === cat.label) { setCategory(null); setSubRole(null); }
                    else { setCategory(cat.label); setSubRole(null); }
                  }}
                  style={{
                    padding: "0.375rem 0.875rem",
                    borderRadius: 20,
                    fontSize: "0.8rem",
                    fontWeight: category === cat.label ? 700 : 400,
                    background: category === cat.label ? "rgba(124,58,237,0.2)" : "transparent",
                    color: category === cat.label ? "#a78bfa" : "var(--muted)",
                    border: category === cat.label ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {cat.label}{cat.subRoles ? (category === cat.label ? " ▴" : " ▾") : ""}
                </button>
              ))}
            </div>
            {/* 세부 직군 (개발자만) */}
            {activeCat?.subRoles && (
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", paddingLeft: "0.5rem", borderLeft: "2px solid rgba(124,58,237,0.3)", marginTop: "0.5rem" }}>
                {activeCat.subRoles.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubRole(subRole === sub ? null : sub)}
                    style={{
                      padding: "0.3rem 0.75rem",
                      borderRadius: 20,
                      fontSize: "0.78rem",
                      fontWeight: subRole === sub ? 700 : 400,
                      background: subRole === sub ? `${ROLE_COLORS[sub] ?? "#7c3aed"}25` : "var(--surface2)",
                      color: subRole === sub ? (ROLE_COLORS[sub] ?? "#a78bfa") : "var(--muted)",
                      border: subRole === sub ? `1px solid ${ROLE_COLORS[sub] ?? "#7c3aed"}60` : "1px solid var(--border)",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.75rem" }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}
          >
            취소
          </button>
          <button
            onClick={handleMatch}
            style={{ flex: 2, padding: "0.625rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}
          >
            ⚡ 랜덤 매칭하기
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
  const addTeam = useStore((s) => s.addTeam);
  const searchParams = useSearchParams();

  const [selectedHackathon, setSelectedHackathon] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubRole, setSelectedSubRole] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRandomModal, setShowRandomModal] = useState(false);

  const myTeamCodes = new Set(profile?.myTeamCodes ?? []);

  // URL 파라미터에서 대회 자동 선택
  useEffect(() => {
    const slug = searchParams.get("hackathon");
    if (slug) setSelectedHackathon(slug);
  }, [searchParams]);

  const selectedHackathonInfo = hackathons.find((h) => h.slug === selectedHackathon) ?? null;

  const activeCategory = ROLE_CATEGORIES.find((c) => c.label === selectedCategory) ?? null;

  const openTeams = teams
    .filter((t) => t.isOpen)
    .filter((t) => !selectedHackathon || t.hackathonSlug === selectedHackathon)
    .filter((t) => {
      if (selectedSubRole) return t.lookingFor.includes(selectedSubRole);
      if (activeCategory) return t.lookingFor.some((r) => activeCategory.roles.includes(r));
      return true;
    });

  const handleRandomMatch = (hackathonSlug: string, subRole: string | null, category: string | null) => {
    if (isAlreadyInHackathon(hackathonSlug)) {
      toast.error("이미 같은 대회의 팀에 소속되어 있습니다");
      return false;
    }
    const categoryObj = ROLE_CATEGORIES.find((c) => c.label === category) ?? null;
    const candidates = teams
      .filter((t) => t.isOpen && t.hackathonSlug === hackathonSlug)
      .filter((t) => {
        if (subRole) return t.lookingFor.includes(subRole);
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
    joinTeam(teamCode);
    toast.success("지원 완료! 팀장의 수락을 기다려주세요 🤝");
  };

  const handleCreateTeam = (data: { name: string; intro: string; lookingFor: string[]; maxMembers: number; hackathonSlug: string }): string => {
    const inviteCode = "INV-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const inviteUrl = `${window.location.origin}/invite/${inviteCode}`;
    const teamCode = "T-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const newTeam: Team = {
      teamCode,
      hackathonSlug: data.hackathonSlug,
      name: data.name,
      isOpen: data.lookingFor.length > 0,
      memberCount: 1,
      members: [profile?.nickname ?? ""],
      leader: profile?.nickname ?? "",
      lookingFor: data.lookingFor,
      intro: data.intro || "새로 만들어진 팀입니다.",
      contact: { type: "link", url: inviteUrl },
      createdAt: new Date().toISOString(),
    };
    addTeam(newTeam);
    joinTeam(teamCode);
    toast.success(`🚀 "${data.name}" 팀이 생성됐습니다!`);
    return inviteCode;
  };

  return (
    <div>
      <div style={{ marginBottom: "1.75rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>팀 모집</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>직군 기반으로 팀을 찾고, 만들고, 합류하세요</p>
      </div>

      {/* 선택된 대회 컨텍스트 배너 */}
      {selectedHackathonInfo && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.75rem 1.25rem",
          background: "rgba(124,58,237,0.08)",
          border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 12,
          marginBottom: "1.25rem",
        }}>
          <StatusBadge status={selectedHackathonInfo.status} />
          <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.9rem", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedHackathonInfo.title}
          </span>
          <Link
            href={`/hackathons/${selectedHackathon}`}
            style={{ fontSize: "0.8rem", color: "#a78bfa", textDecoration: "none", whiteSpace: "nowrap" }}
          >
            대회 상세 →
          </Link>
        </div>
      )}

      {/* 직군 선택 + 액션 */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.25rem 1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.875rem" }}>
          내 직군 선택
        </div>

        {/* 대분류 */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: activeCategory?.subRoles ? "0.75rem" : "1.25rem" }}>
          <button
            onClick={() => { setSelectedCategory(null); setSelectedSubRole(null); }}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 20,
              fontSize: "0.875rem",
              fontWeight: !selectedCategory ? 700 : 400,
              background: !selectedCategory ? "rgba(124,58,237,0.2)" : "transparent",
              color: !selectedCategory ? "#a78bfa" : "var(--muted)",
              border: !selectedCategory ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            전체
          </button>
          {ROLE_CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => {
                if (selectedCategory === cat.label) {
                  setSelectedCategory(null);
                  setSelectedSubRole(null);
                } else {
                  setSelectedCategory(cat.label);
                  setSelectedSubRole(null);
                }
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 20,
                fontSize: "0.875rem",
                fontWeight: selectedCategory === cat.label ? 700 : 400,
                background: selectedCategory === cat.label ? "rgba(124,58,237,0.2)" : "transparent",
                color: selectedCategory === cat.label ? "#a78bfa" : "var(--muted)",
                border: selectedCategory === cat.label ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {cat.label}{cat.subRoles ? (selectedCategory === cat.label ? " ▴" : " ▾") : ""}
            </button>
          ))}
        </div>

        {/* 세부 직군 (개발자만) */}
        {activeCategory?.subRoles && (
          <div
            style={{
              display: "flex",
              gap: "0.4rem",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
              paddingLeft: "0.5rem",
              borderLeft: "2px solid rgba(124,58,237,0.3)",
            }}
          >
            {activeCategory.subRoles.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubRole(selectedSubRole === sub ? null : sub)}
                style={{
                  padding: "0.35rem 0.875rem",
                  borderRadius: 20,
                  fontSize: "0.8rem",
                  fontWeight: selectedSubRole === sub ? 700 : 400,
                  background: selectedSubRole === sub ? `${ROLE_COLORS[sub] ?? "#7c3aed"}25` : "var(--surface2)",
                  color: selectedSubRole === sub ? (ROLE_COLORS[sub] ?? "#a78bfa") : "var(--muted)",
                  border: selectedSubRole === sub ? `1px solid ${ROLE_COLORS[sub] ?? "#7c3aed"}60` : "1px solid var(--border)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowRandomModal(true)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 700,
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            ⚡ 랜덤 매칭
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "0.625rem 1.25rem",
              borderRadius: 8,
              fontSize: "0.875rem",
              fontWeight: 600,
              background: "transparent",
              color: "var(--text)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            + 팀 만들기
          </button>
        </div>
      </div>

      {/* 팀 목록 헤더 */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700 }}>
          모집 중인 팀
          <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--muted)", marginLeft: "0.5rem" }}>{openTeams.length}개</span>
        </div>
        {(selectedSubRole || selectedCategory) && (
          <div style={{ fontSize: "0.8rem", color: "#a78bfa" }}>
            <b>{selectedSubRole ?? selectedCategory}</b> 모집 팀만 표시 중
          </div>
        )}
      </div>

      {!initialized ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 180, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      ) : openTeams.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏕️</div>
          <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>모집 중인 팀이 없습니다</div>
          <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1rem" }}>첫 번째로 팀을 만들어보세요!</div>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{ padding: "0.5rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}
          >
            팀 만들기
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
          {openTeams.map((team) => {
            const h = hackathons.find((h) => h.slug === team.hackathonSlug);
            return (
            <TeamCard
              key={team.teamCode}
              team={team}
              hackathonTitle={h?.title}
              hackathonTags={h?.tags}
              onApply={handleApply}
              applied={myTeamCodes.has(team.teamCode)}
              isMember={myTeamCodes.has(team.teamCode)}
            />
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateTeam} hackathons={hackathons} />
      )}

      {showRandomModal && (
        <RandomMatchModal
          hackathons={hackathons}
          defaultHackathon={selectedHackathon}
          onClose={() => setShowRandomModal(false)}
          onMatch={handleRandomMatch}
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
