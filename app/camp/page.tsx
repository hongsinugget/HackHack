"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Team } from "@/lib/types";
import { toast } from "sonner";

const ROLES = ["개발자", "디자이너", "PM", "데이터"];

const ROLE_MAP: Record<string, string[]> = {
  개발자: ["Backend", "Frontend"],
  디자이너: ["Designer"],
  PM: ["PM"],
  데이터: ["ML Engineer", "데이터"],
};

const ROLE_COLORS: Record<string, string> = {
  Frontend: "#38bdf8",
  Backend: "#34d399",
  Designer: "#f472b6",
  "ML Engineer": "#a78bfa",
  PM: "#fbbf24",
  기획자: "#fb923c",
  데이터: "#67e8f9",
};

function TeamCard({
  team,
  onApply,
  applied,
}: {
  team: Team;
  onApply: (teamCode: string) => void;
  applied: boolean;
}) {
  return (
    <div
      className="card"
      style={{ padding: "1.25rem" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.625rem" }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: 2 }}>{team.teamCode}</div>
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
        {team.isOpen && (
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

function CreateTeamModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: { name: string; intro: string; lookingFor: string[] }) => void }) {
  const [name, setName] = useState("");
  const [intro, setIntro] = useState("");
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const allRoles = ["Frontend", "Backend", "Designer", "PM", "ML Engineer"];

  const toggleRole = (role: string) =>
    setLookingFor((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 480 }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.25rem", marginBottom: "1.5rem" }}>팀 만들기</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
              if (!name.trim()) { toast.error("팀 이름을 입력해주세요"); return; }
              onCreate({ name: name.trim(), intro: intro.trim(), lookingFor });
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

export default function CampPage() {
  const { teams, initialized } = useStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [appliedTeams, setAppliedTeams] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [localTeams, setLocalTeams] = useState<Team[]>([]);

  useEffect(() => {
    setLocalTeams(teams);
  }, [teams]);

  const openTeams = localTeams
    .filter((t) => t.isOpen)
    .sort((a, b) => {
      if (!selectedRole) return 0;
      const aMatch = a.lookingFor.some((r) => (ROLE_MAP[selectedRole] ?? []).includes(r));
      const bMatch = b.lookingFor.some((r) => (ROLE_MAP[selectedRole] ?? []).includes(r));
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });

  const handleRandomMatch = () => {
    if (!selectedRole) { toast.error("먼저 직군을 선택해주세요"); return; }
    const matching = openTeams.filter((t) =>
      t.lookingFor.some((r) => (ROLE_MAP[selectedRole] ?? [selectedRole]).includes(r)) &&
      !appliedTeams.has(t.teamCode)
    );
    if (matching.length === 0) { toast.error("조건에 맞는 팀이 없습니다"); return; }
    const picked = matching[Math.floor(Math.random() * matching.length)];
    setAppliedTeams((prev) => new Set([...prev, picked.teamCode]));
    toast.success(`🎉 ${picked.name} 팀에 자동 배정됐습니다!`);
  };

  const handleApply = (teamCode: string) => {
    setAppliedTeams((prev) => new Set([...prev, teamCode]));
    toast.success("지원 완료! 팀장의 수락을 기다려주세요 🤝");
  };

  const handleCreateTeam = (data: { name: string; intro: string; lookingFor: string[] }) => {
    const inviteCode = "INV-" + Math.random().toString(36).slice(2, 7).toUpperCase();
    const newTeam: Team = {
      teamCode: "T-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      hackathonSlug: "daker-handover-2026-03",
      name: data.name,
      isOpen: data.lookingFor.length > 0,
      memberCount: 1,
      lookingFor: data.lookingFor,
      intro: data.intro || "새로 만들어진 팀입니다.",
      contact: { type: "link", url: "#" },
      createdAt: new Date().toISOString(),
    };
    setLocalTeams((prev) => [newTeam, ...prev]);
    setShowCreateModal(false);
    toast.success(`🚀 "${data.name}" 팀 생성 완료! 초대코드: ${inviteCode}`);
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>팀 모집</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>직군 기반으로 팀을 찾고, 만들고, 합류하세요</p>
      </div>

      {/* 직군 선택 + 액션 */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.875rem" }}>
          내 직군을 선택하세요
        </div>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem" }}>
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRole(selectedRole === role ? null : role)}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: 20,
                fontSize: "0.875rem",
                fontWeight: selectedRole === role ? 700 : 400,
                background: selectedRole === role ? "rgba(124,58,237,0.2)" : "transparent",
                color: selectedRole === role ? "#a78bfa" : "var(--muted)",
                border: selectedRole === role ? "1px solid rgba(124,58,237,0.5)" : "1px solid var(--border)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {role}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            onClick={handleRandomMatch}
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

      {/* 팀 목록 */}
      <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: "1rem", fontWeight: 700 }}>
          모집 중인 팀
          <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--muted)", marginLeft: "0.5rem" }}>{openTeams.length}개</span>
        </div>
        {selectedRole && (
          <div style={{ fontSize: "0.8rem", color: "#a78bfa" }}>
            <b>{selectedRole}</b> 모집 팀을 앞으로 정렬 중
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
          {openTeams.map((team) => (
            <TeamCard
              key={team.teamCode}
              team={team}
              onApply={handleApply}
              applied={appliedTeams.has(team.teamCode)}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal onClose={() => setShowCreateModal(false)} onCreate={handleCreateTeam} />
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
    </div>
  );
}
