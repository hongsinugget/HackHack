"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toast } from "sonner";

const ROLE_COLORS: Record<string, string> = {
  Frontend: "#38bdf8",
  Backend: "#34d399",
  Designer: "#f472b6",
  "ML Engineer": "#a78bfa",
  PM: "#fbbf24",
  기획자: "#fb923c",
  "Data Analyst": "#60a5fa",
  "Data Scientist": "#10b981",
  "DevOps Engineer": "#f59e0b",
  "Full Stack Developer": "#818cf8",
  "AI Researcher": "#e879f9",
  "Data Engineer": "#22d3ee",
  "Service 기획자": "#fb923c",
  발표자: "#facc15",
};

const ALL_ROLES = [
  "Data Analyst", "ML Engineer", "Data Scientist", "DevOps Engineer",
  "Full Stack Developer", "AI Researcher", "Data Engineer",
  "Designer", "PM", "Service 기획자", "발표자",
  "Frontend", "Backend",
];

type Notice = { id: string; text: string; createdAt: string };
type TeamSubmission = { projectName: string; githubUrl: string; demoUrl: string; fileName?: string; submittedAt: string; teamName: string };

export default function SpacePage({ params }: { params: Promise<{ teamCode: string }> }) {
  const { teamCode } = use(params);
  const router = useRouter();

  const teams = useStore((s) => s.teams);
  const hackathons = useStore((s) => s.hackathons);
  const profile = useStore((s) => s.profile);
  const leaveTeam = useStore((s) => s.leaveTeam);
  const updateTeam = useStore((s) => s.updateTeam);
  const deleteTeam = useStore((s) => s.deleteTeam);
  const delegateLeader = useStore((s) => s.delegateLeader);
  const kickMember = useStore((s) => s.kickMember);
  const leaderboards = useStore((s) => s.leaderboards);
  const updateLeaderboard = useStore((s) => s.updateLeaderboard);
  const addTimelineEvent = useStore((s) => s.addTimelineEvent);
  const addBadge = useStore((s) => s.addBadge);
  const initialized = useStore((s) => s.initialized);

  const team = teams.find((t) => t.teamCode === teamCode) ?? null;
  const hackathon = hackathons.find((h) => h.slug === team?.hackathonSlug) ?? null;
  const isMember = (profile?.myTeamCodes ?? []).includes(teamCode);
  const isLeader = !!team && !!profile && !!team.leader && team.leader === profile.nickname;
  const isEnded = hackathon?.status === "ended";

  // 초대 링크
  const [copied, setCopied] = useState(false);
  const inviteUrl = team?.contact.url.startsWith("http")
    ? team.contact.url.replace(/^https?:\/\/[^/]+/, typeof window !== "undefined" ? window.location.origin : "")
    : null;

  // 팀 공지
  const noticeKey = `hh_notices_${teamCode}`;
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeInput, setNoticeInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(noticeKey);
      if (raw) setNotices(JSON.parse(raw));
    } catch {}
  }, [noticeKey]);

  const saveNotices = (next: Notice[]) => {
    setNotices(next);
    localStorage.setItem(noticeKey, JSON.stringify(next));
  };

  const addNotice = () => {
    if (isEnded) return;
    const text = noticeInput.trim();
    if (!text) return;
    const next = [{ id: Date.now().toString(), text, createdAt: new Date().toISOString() }, ...notices];
    saveNotices(next);
    setNoticeInput("");
  };

  const deleteNotice = (id: string) => {
    if (isEnded) return;
    saveNotices(notices.filter((n) => n.id !== id));
  };

  // 팀장 위임 / 삭제
  const [activeTab, setActiveTab] = useState<"home" | "members" | "notices" | "submit" | "settings">("home");

  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateTo, setDelegateTo] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 팀 설정
  const [editIntro, setEditIntro] = useState("");
  const [introDirty, setIntroDirty] = useState(false);
  const [editLookingFor, setEditLookingFor] = useState<string[]>([]);
  const [editMaxMembers, setEditMaxMembers] = useState(4);
  const [recruitDirty, setRecruitDirty] = useState(false);

  useEffect(() => {
    if (team) {
      setEditIntro(team.intro);
      setEditLookingFor(team.lookingFor);
      setEditMaxMembers(team.maxMembers ?? 4);
    }
  }, [team?.teamCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleEditRole = (role: string) => {
    setEditLookingFor((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setRecruitDirty(true);
  };

  // 제출
  const subKey = `hh_sub_${teamCode}`;
  const [submission, setSubmission] = useState<TeamSubmission | null>(null);
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subErrors, setSubErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(subKey);
      if (raw) setSubmission(JSON.parse(raw));
    } catch {}
  }, [subKey]);

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!projectName.trim()) {
      errors.projectName = "프로젝트명을 입력해주세요";
    }
    if (!githubUrl || !/^https?:\/\//.test(githubUrl)) {
      errors.github = "올바른 GitHub URL을 입력해주세요 (https:// 시작)";
    }
    if (!demoUrl || !/^https?:\/\//.test(demoUrl)) {
      errors.demo = "올바른 시연 URL을 입력해주세요 (https:// 시작)";
    }
    setSubErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const newSub: TeamSubmission = {
      projectName: projectName.trim(),
      githubUrl,
      demoUrl,
      fileName: selectedFile?.name,
      submittedAt: new Date().toISOString(),
      teamName: team!.name,
    };
    localStorage.setItem(subKey, JSON.stringify(newSub));
    setSubmission(newSub);

    if (team?.hackathonSlug) {
      // 제출 전 현재 순위 계산 (삽입 순서 기준)
      const currentLb = leaderboards.find((lb) => lb.hackathonSlug === team.hackathonSlug);
      const newRank = (currentLb?.entries.length ?? 0) + 1;

      updateLeaderboard(team.hackathonSlug, {
        teamName: team.name,
        score: 0,
        submittedAt: newSub.submittedAt,
      });
      addTimelineEvent({
        type: "submit",
        hackathonSlug: team.hackathonSlug,
        hackathonTitle: hackathon?.title ?? "",
        at: newSub.submittedAt,
        detail: "팀 제출",
      });

      // 배지: 순위 기반 자동 발급
      if (newRank <= 3) {
        addBadge({ id: "top3", emoji: "🏅", label: "취미를 넘어선", description: "리더보드 3위 이내에 진입했습니다" });
      }
      if (newRank <= 2) {
        addBadge({ id: "top2", emoji: "🥈", label: "밤을 밝혀낸 자", description: "리더보드 2위를 달성했습니다" });
      }
      if (newRank === 1) {
        addBadge({ id: "champion", emoji: "🏆", label: "전설이 된 마스터", description: "리더보드 1위를 달성했습니다" });
      }
    }
    if (!profile?.badges.some((b) => b.id === "submitted")) {
      addBadge({ id: "submitted", emoji: "📦", label: "제출 완료!", description: "첫 결과물을 제출했습니다" });
    }

    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch {}

    toast.success("🎉 제출이 완료됐습니다! 리더보드에 반영됩니다.");
  };

  const handleSaveIntro = () => {
    updateTeam(teamCode, { intro: editIntro });
    setIntroDirty(false);
    toast.success("팀 소개가 저장됐습니다");
  };

  const handleSaveRecruit = () => {
    const isOpen = editLookingFor.length > 0 && (team?.memberCount ?? 0) < editMaxMembers;
    updateTeam(teamCode, { lookingFor: editLookingFor, maxMembers: editMaxMembers, isOpen });
    setRecruitDirty(false);
    toast.success("모집 공고가 저장됐습니다");
  };

  const handleKick = (nickname: string) => {
    kickMember(teamCode, nickname);
    toast.success(`${nickname}님을 내보냈습니다`);
  };

  const handleLeave = () => {
    if (!team) return;
    leaveTeam(teamCode);
    toast.success(`"${team.name}" 팀에서 나왔습니다`);
    router.push("/myteam");
  };

  const handleDelete = () => {
    if (!team) return;
    deleteTeam(teamCode);
    toast.success(`"${team.name}" 팀이 삭제됐습니다`);
    router.push("/myteam");
  };

  const handleDelegate = () => {
    if (!delegateTo) return;
    delegateLeader(teamCode, delegateTo);
    toast.success(`팀장을 ${delegateTo}님께 위임했습니다`);
    setShowDelegateModal(false);
    setDelegateTo("");
  };

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!initialized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>존재하지 않는 팀입니다</div>
        <Link href="/myteam" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "0.9rem" }}>← 내 팀으로</Link>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>이 팀에 소속되어 있지 않습니다</div>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>스페이스는 팀원만 접근할 수 있습니다</p>
        <Link href="/myteam" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "0.9rem" }}>← 내 팀으로</Link>
      </div>
    );
  }

  const tabs = [
    { id: "home", label: "홈", icon: "🏠" },
    { id: "notices", label: "공지", icon: "📌", badge: notices.length > 0 ? notices.length : null },
    { id: "members", label: "팀원", icon: "👥" },
    ...(team.hackathonSlug ? [{ id: "submit", label: "제출", icon: "📤", badge: submission ? "✓" : null }] : []),
    { id: "settings", label: "설정", icon: "⚙️" },
  ] as { id: string; label: string; icon: string; badge?: string | number | null }[];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* 뒤로가기 */}
      <Link href="/myteam" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none", marginBottom: "1.25rem" }}>
        ← 내 팀으로
      </Link>

      {/* 팀 헤더 */}
      <div style={{ marginBottom: "1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#a78bfa", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", padding: "2px 8px", borderRadius: 9999 }}>
            팀 스페이스
          </span>
          {isEnded ? (
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 8px", borderRadius: 9999 }}>
              🏁 종료
            </span>
          ) : team.isOpen ? (
            <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 8px", borderRadius: 9999 }}>
              모집중
            </span>
          ) : (
            <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 8px", borderRadius: 9999 }}>
              모집완료
            </span>
          )}
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.3rem" }}>{team.name}</h1>
        {hackathon && (
          <Link href={`/hackathons/${hackathon.slug}`} style={{ fontSize: "0.82rem", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
            🏆 {hackathon.title} →
          </Link>
        )}
      </div>

      {/* 아카이브 배너 */}
      {isEnded && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.75rem 1.1rem", borderRadius: 10, marginBottom: "1rem",
          background: "rgba(107,107,128,0.08)", border: "1px solid rgba(107,107,128,0.2)",
        }}>
          <span>🏁</span>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>대회가 종료되어 스페이스는 읽기 전용으로 유지됩니다</div>
        </div>
      )}

      {/* 스티키 탭바 */}
      <div style={{
        position: "sticky",
        top: 56,
        zIndex: 10,
        background: "rgba(10,10,15,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        marginBottom: "1.5rem",
        marginLeft: "-1.25rem",
        marginRight: "-1.25rem",
        paddingLeft: "1.25rem",
        paddingRight: "1.25rem",
      }}>
        <div style={{ display: "flex", gap: 0, overflowX: "auto", scrollbarWidth: "none" }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.375rem",
                  padding: "0.875rem 1.1rem",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid #a78bfa" : "2px solid transparent",
                  color: isActive ? "#a78bfa" : "var(--muted)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  position: "relative",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge != null && (
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700, lineHeight: 1,
                    padding: "2px 5px", borderRadius: 9999,
                    background: tab.id === "submit" ? "rgba(16,185,129,0.2)" : "rgba(124,58,237,0.2)",
                    color: tab.id === "submit" ? "#10b981" : "#a78bfa",
                    border: tab.id === "submit" ? "1px solid rgba(16,185,129,0.35)" : "1px solid rgba(124,58,237,0.35)",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}

      {/* 홈 탭 */}
      {activeTab === "home" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 소개</div>
            <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.7, marginBottom: team.lookingFor.length > 0 ? "0.875rem" : "0.5rem" }}>
              {team.intro}
            </p>
            {team.lookingFor.length > 0 && (
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                {team.lookingFor.map((role) => (
                  <span key={role} style={{
                    fontSize: "0.75rem", padding: "3px 10px", borderRadius: 6,
                    border: `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}40`,
                    color: ROLE_COLORS[role] ?? "var(--muted)",
                    background: `${ROLE_COLORS[role] ?? "#6b6b80"}15`,
                  }}>
                    {role}
                  </span>
                ))}
              </div>
            )}
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
                  onClick={handleCopy}
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
      )}

      {/* 팀원 탭 */}
      {activeTab === "members" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.25rem" }}>총 {(team.members ?? []).length}명</div>
          {(team.members ?? []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--muted)", fontSize: "0.85rem" }}>팀원 정보 없음</div>
          ) : (
            (team.members ?? []).map((nickname) => {
              const isMe = nickname === profile?.nickname;
              const isThisLeader = nickname === team.leader;
              return (
                <div key={nickname} style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  padding: "0.75rem 1rem", borderRadius: 10,
                  background: isMe ? "rgba(124,58,237,0.06)" : "var(--surface)",
                  border: isMe ? "1px solid rgba(124,58,237,0.2)" : "1px solid var(--border)",
                }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                    background: isThisLeader ? "rgba(251,191,36,0.2)" : "rgba(124,58,237,0.12)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem",
                  }}>
                    {isThisLeader ? "👑" : "👤"}
                  </div>
                  <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: isMe ? 700 : 400 }}>{nickname}</span>
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    {isThisLeader && (
                      <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>팀장</span>
                    )}
                    {isMe && (
                      <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>나</span>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {/* 설정 탭 안내 */}
          <div style={{ marginTop: "1rem", padding: "0.75rem 1rem", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: "0.8rem", color: "var(--muted)" }}>
            ⚙️ 팀 나가기 · 위임 · 삭제는 <button onClick={() => setActiveTab("settings")} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontWeight: 700, fontSize: "0.8rem", padding: 0 }}>설정 탭</button>에서 할 수 있습니다
          </div>
        </div>
      )}

      {/* 공지 탭 */}
      {activeTab === "notices" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {!isEnded && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNotice()}
                placeholder="공지 내용을 입력하세요 (Enter)"
                style={{
                  flex: 1, padding: "0.625rem 0.875rem", borderRadius: 8,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: "0.875rem", outline: "none",
                }}
              />
              <button
                onClick={addNotice}
                style={{ padding: "0.625rem 1rem", borderRadius: 8, fontWeight: 700, background: "var(--accent)", color: "#fff", border: "none", fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}
              >
                등록
              </button>
            </div>
          )}
          {notices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)", fontSize: "0.875rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              등록된 공지가 없습니다
            </div>
          ) : (
            notices.map((n) => (
              <div key={n.id} style={{
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
                padding: "0.875rem 1rem", borderRadius: 10,
                background: "var(--surface)", border: "1px solid var(--border)",
              }}>
                <span style={{ color: "#a78bfa", fontSize: "0.8rem", flexShrink: 0, marginTop: 3 }}>•</span>
                <span style={{ flex: 1, fontSize: "0.875rem", lineHeight: 1.6 }}>{n.text}</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                    {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                  </span>
                  {!isEnded && (
                    <button
                      onClick={() => deleteNotice(n.id)}
                      style={{ padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 제출 탭 */}
      {activeTab === "submit" && team.hackathonSlug && (
        <div>
          {submission ? (
            <div>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.875rem",
                padding: "1.1rem 1.25rem", borderRadius: 12, marginBottom: "1.25rem",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
              }}>
                <span style={{ fontSize: "1.75rem" }}>🎉</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#10b981" }}>제출 완료</div>
                  <div style={{ fontSize: "0.775rem", color: "var(--muted)" }}>
                    {new Date(submission.submittedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
              <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>{submission.projectName}</div>
                <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#a78bfa", textDecoration: "none" }}>🔗 GitHub</a>
                <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#a78bfa", textDecoration: "none" }}>🌐 시연 링크</a>
                {submission.fileName && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--muted)" }}>📄 {submission.fileName}</div>}
              </div>
            </div>
          ) : isEnded ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
              <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem" }}>제출 마감</div>
              <div style={{ fontSize: "0.85rem" }}>대회가 종료되어 제출할 수 없습니다</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>프로젝트명 *</label>
                <input
                  value={projectName}
                  onChange={(e) => { setProjectName(e.target.value); setSubErrors((p) => ({ ...p, projectName: "" })); }}
                  placeholder="프로젝트 이름을 입력해주세요"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.projectName ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
                />
                {subErrors.projectName && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.projectName}</div>}
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>GitHub URL *</label>
                <input
                  value={githubUrl}
                  onChange={(e) => { setGithubUrl(e.target.value); setSubErrors((p) => ({ ...p, github: "" })); }}
                  placeholder="https://github.com/..."
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.github ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
                />
                {subErrors.github && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.github}</div>}
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>시연 URL *</label>
                <input
                  value={demoUrl}
                  onChange={(e) => { setDemoUrl(e.target.value); setSubErrors((p) => ({ ...p, demo: "" })); }}
                  placeholder="https://..."
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.demo ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
                />
                {subErrors.demo && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.demo}</div>}
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>
                  서비스 소개서 <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>(PDF/PPTX, 선택)</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 8, cursor: "pointer", background: "var(--surface2)", border: "1px solid var(--border)" }}>
                  <input type="file" accept=".pdf,.pptx,.ppt" style={{ display: "none" }} onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                  <span style={{ fontSize: "0.85rem", color: "var(--accent)" }}>📎 파일 선택</span>
                  <span style={{ fontSize: "0.8rem", color: selectedFile ? "var(--text)" : "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selectedFile ? selectedFile.name : "PDF 또는 PPTX 파일"}
                  </span>
                  {selectedFile && (
                    <button onClick={(e) => { e.preventDefault(); setSelectedFile(null); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", flexShrink: 0 }}>✕</button>
                  )}
                </label>
              </div>
              <button
                onClick={handleSubmit}
                style={{ padding: "0.75rem", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                🚀 제출하기
              </button>
            </div>
          )}
        </div>
      )}

      {/* 설정 탭 — 팀장 */}
      {activeTab === "settings" && isLeader && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 팀 소개 */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 소개</div>
            <textarea
              value={editIntro}
              onChange={(e) => { if (!isEnded) { setEditIntro(e.target.value); setIntroDirty(true); } }}
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
                onClick={handleSaveIntro}
                style={{ marginTop: "0.75rem", padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                등록하기
              </button>
            )}
          </section>

          {/* 모집 공고 수정 */}
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", opacity: isEnded ? 0.6 : 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>모집 공고 수정</div>

            {/* 최대 팀원 수 */}
            <div style={{ marginBottom: "1.1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>최대 팀원 수</div>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <button
                    key={n}
                    disabled={isEnded}
                    onClick={() => { setEditMaxMembers(n); setRecruitDirty(true); }}
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

            {/* 모집 역할 */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "0.5rem" }}>모집 역할 <span style={{ fontSize: "0.72rem" }}>(구해진 역할은 체크 해제)</span></div>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {ALL_ROLES.map((role) => {
                  const selected = editLookingFor.includes(role);
                  return (
                    <button
                      key={role}
                      disabled={isEnded}
                      onClick={() => toggleEditRole(role)}
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
                onClick={handleSaveRecruit}
                style={{ padding: "0.5rem 1.25rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
              >
                저장하기
              </button>
            )}
          </section>

          {/* 팀원 관리 (내보내기) */}
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
                        onClick={() => handleKick(nickname)}
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
                  onClick={() => { setShowDelegateModal(true); setDelegateTo(""); }}
                  style={{ padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.85rem", background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", cursor: "pointer", fontWeight: 600, textAlign: "left" }}
                >
                  👑 팀장 위임
                </button>
              )}
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
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
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>취소</button>
                    <button onClick={handleDelete} style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontWeight: 700 }}>삭제 확인</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {/* 설정 탭 — 팀원 */}
      {activeTab === "settings" && !isLeader && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "1.25rem", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14 }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.375rem" }}>팀 나가기</div>
            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem", lineHeight: 1.5 }}>
              팀을 나가면 다시 초대를 받아야 합니다.
            </div>
            <button
              onClick={handleLeave}
              style={{ padding: "0.5rem 1.25rem", borderRadius: 8, fontSize: "0.875rem", background: "transparent", color: "var(--muted)", border: "1px solid var(--border)", cursor: "pointer" }}
            >
              팀 나가기
            </button>
          </div>
        </div>
      )}

      {/* 팀장 위임 모달 */}
      {showDelegateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowDelegateModal(false)}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 400 }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.375rem" }}>👑 팀장 위임</h2>
            <p style={{ fontSize: "0.825rem", color: "var(--muted)", marginBottom: "1.25rem" }}>새로운 팀장을 선택해주세요</p>
            {(team.members ?? []).filter((m) => m !== profile?.nickname).length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>위임할 팀원이 없습니다</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {(team.members ?? []).filter((m) => m !== profile?.nickname).map((nickname) => (
                  <button
                    key={nickname}
                    onClick={() => setDelegateTo(nickname)}
                    style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem 1rem", borderRadius: 10, textAlign: "left",
                      background: delegateTo === nickname ? "rgba(251,191,36,0.12)" : "var(--surface2)",
                      border: delegateTo === nickname ? "1px solid rgba(251,191,36,0.4)" : "1px solid var(--border)",
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>👤</div>
                    <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: delegateTo === nickname ? 700 : 400, color: delegateTo === nickname ? "#fbbf24" : "var(--text)" }}>{nickname}</span>
                    {delegateTo === nickname && <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>선택됨</span>}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowDelegateModal(false)} style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontSize: "0.875rem" }}>취소</button>
              <button
                onClick={handleDelegate}
                disabled={!delegateTo}
                style={{
                  flex: 2, padding: "0.625rem", borderRadius: 8, fontWeight: 700, fontSize: "0.875rem",
                  background: delegateTo ? "rgba(251,191,36,0.2)" : "transparent",
                  color: delegateTo ? "#fbbf24" : "var(--muted)",
                  border: delegateTo ? "1px solid rgba(251,191,36,0.4)" : "1px solid var(--border)",
                  cursor: delegateTo ? "pointer" : "default",
                }}
              >
                위임하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
