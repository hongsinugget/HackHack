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
};

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
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateTo, setDelegateTo] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 팀 설정
  const [editIntro, setEditIntro] = useState("");
  const [editIsOpen, setEditIsOpen] = useState(true);
  const [settingsDirty, setSettingsDirty] = useState(false);

  useEffect(() => {
    if (team) {
      setEditIntro(team.intro);
      setEditIsOpen(team.isOpen);
    }
  }, [team?.teamCode]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleSaveSettings = () => {
    updateTeam(teamCode, { intro: editIntro, isOpen: editIsOpen });
    setSettingsDirty(false);
    toast.success("팀 설정이 저장됐습니다");
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

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      <Link href="/myteam" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        ← 내 팀으로
      </Link>

      {/* 아카이브 배너 */}
      {isEnded && (
        <div style={{
          display: "flex", alignItems: "center", gap: "0.75rem",
          padding: "0.875rem 1.25rem", borderRadius: 12, marginBottom: "1.25rem",
          background: "rgba(107,107,128,0.08)", border: "1px solid rgba(107,107,128,0.25)",
        }}>
          <span style={{ fontSize: "1.1rem" }}>🏁</span>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>이 대회는 종료됐습니다</div>
            <div style={{ fontSize: "0.775rem", color: "var(--muted)" }}>스페이스는 읽기 전용으로 유지됩니다</div>
          </div>
        </div>
      )}

      {/* 팀 헤더 */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
{isEnded ? (
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999 }}>
              종료
            </span>
          ) : team.isOpen ? (
            <span style={{ fontSize: "0.72rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 10px", borderRadius: 9999 }}>
              모집중
            </span>
          ) : (
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999 }}>
              모집완료
            </span>
          )}
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: "0.375rem" }}>{team.name}</h1>
        {hackathon && (
          <Link href={`/hackathons/${hackathon.slug}`} style={{ fontSize: "0.875rem", color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
            🏆 {hackathon.title} →
          </Link>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

        {/* 팀 소개 & 역할 */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>팀 소개</div>
          <p style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.7, marginBottom: team.lookingFor.length > 0 ? "0.875rem" : 0 }}>
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
        </section>

        {/* 팀원 목록 */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            👥 팀원 {(team.members ?? []).length}명
          </div>
          {(team.members ?? []).length === 0 ? (
            <div style={{ textAlign: "center", padding: "1rem", color: "var(--muted)", fontSize: "0.85rem" }}>
              팀원 정보 없음
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {(team.members ?? []).map((nickname) => {
                const isMe = nickname === profile?.nickname;
                const isThisLeader = nickname === team.leader;
                return (
                  <div key={nickname} style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.625rem 0.875rem", borderRadius: 8,
                    background: isMe ? "rgba(124,58,237,0.06)" : "var(--surface2)",
                    border: isMe ? "1px solid rgba(124,58,237,0.2)" : "1px solid var(--border)",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: isThisLeader ? "rgba(251,191,36,0.2)" : "rgba(124,58,237,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.85rem", flexShrink: 0,
                    }}>
                      {isThisLeader ? "👑" : "👤"}
                    </div>
                    <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: isMe ? 700 : 400 }}>{nickname}</span>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      {isThisLeader && (
                        <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(251,191,36,0.15)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)" }}>
                          팀장
                        </span>
                      )}
                      {isMe && (
                        <span style={{ fontSize: "0.68rem", padding: "2px 7px", borderRadius: 9999, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>
                          나
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 초대 링크 — 종료된 대회에서는 숨김 */}
        {inviteUrl && !isEnded && (
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>초대 링크</div>
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
          </section>
        )}

        {/* 제출 섹션 */}
        {team.hackathonSlug && (
          <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📤 결과물 제출
            </div>

            {submission ? (
              /* 제출 완료 상태 */
              <div>
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "1rem", borderRadius: 10, marginBottom: "1rem",
                  background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
                }}>
                  <span style={{ fontSize: "1.5rem" }}>🎉</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#10b981" }}>제출 완료</div>
                    <div style={{ fontSize: "0.775rem", color: "var(--muted)" }}>
                      {new Date(submission.submittedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>
                    {submission.projectName}
                  </div>
                  <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#a78bfa", textDecoration: "none" }}>
                    <span>🔗</span> GitHub
                  </a>
                  <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "#a78bfa", textDecoration: "none" }}>
                    <span>🌐</span> 시연 링크
                  </a>
                  {submission.fileName && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                      <span>📄</span> {submission.fileName}
                    </div>
                  )}
                </div>
              </div>
            ) : isEnded ? (
              /* 종료 후 미제출 */
              <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
                <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>제출 마감</div>
                <div style={{ fontSize: "0.8rem" }}>대회가 종료되어 제출할 수 없습니다</div>
              </div>
            ) : (
              /* 제출 폼 */
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>프로젝트명 *</label>
                  <input
                    value={projectName}
                    onChange={(e) => { setProjectName(e.target.value); setSubErrors((p) => ({ ...p, projectName: "" })); }}
                    placeholder="프로젝트 이름을 입력해주세요"
                    style={{
                      width: "100%", padding: "0.6rem 0.875rem", borderRadius: 8,
                      background: "var(--surface2)", border: `1px solid ${subErrors.projectName ? "#ef4444" : "var(--border)"}`,
                      color: "var(--text)", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                  {subErrors.projectName && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.projectName}</div>}
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>GitHub URL *</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => { setGithubUrl(e.target.value); setSubErrors((p) => ({ ...p, github: "" })); }}
                    placeholder="https://github.com/..."
                    style={{
                      width: "100%", padding: "0.6rem 0.875rem", borderRadius: 8,
                      background: "var(--surface2)", border: `1px solid ${subErrors.github ? "#ef4444" : "var(--border)"}`,
                      color: "var(--text)", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                  {subErrors.github && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.github}</div>}
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>시연 URL *</label>
                  <input
                    value={demoUrl}
                    onChange={(e) => { setDemoUrl(e.target.value); setSubErrors((p) => ({ ...p, demo: "" })); }}
                    placeholder="https://..."
                    style={{
                      width: "100%", padding: "0.6rem 0.875rem", borderRadius: 8,
                      background: "var(--surface2)", border: `1px solid ${subErrors.demo ? "#ef4444" : "var(--border)"}`,
                      color: "var(--text)", fontSize: "0.875rem", outline: "none",
                    }}
                  />
                  {subErrors.demo && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.demo}</div>}
                </div>

                <div>
                  <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>
                    서비스 소개서 <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>(PDF/PPTX, 선택)</span>
                  </label>
                  <label style={{
                    display: "flex", alignItems: "center", gap: "0.625rem",
                    padding: "0.6rem 0.875rem", borderRadius: 8, cursor: "pointer",
                    background: "var(--surface2)", border: "1px solid var(--border)",
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.pptx,.ppt"
                      style={{ display: "none" }}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                    />
                    <span style={{ fontSize: "0.85rem", color: "var(--accent)" }}>📎 파일 선택</span>
                    <span style={{ fontSize: "0.8rem", color: selectedFile ? "var(--text)" : "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {selectedFile ? selectedFile.name : "PDF 또는 PPTX 파일"}
                    </span>
                    {selectedFile && (
                      <button
                        onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                        style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", flexShrink: 0 }}
                      >
                        ✕
                      </button>
                    )}
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  style={{
                    padding: "0.75rem", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem",
                    background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer",
                  }}
                >
                  🚀 제출하기
                </button>
              </div>
            )}
          </section>
        )}

        {/* 팀 공지 */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 팀 공지</div>
          {!isEnded && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
              <input
                value={noticeInput}
                onChange={(e) => setNoticeInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNotice()}
                placeholder="공지 내용을 입력하세요 (Enter)"
                style={{
                  flex: 1, padding: "0.6rem 0.875rem", borderRadius: 8,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: "0.875rem", outline: "none",
                }}
              />
              <button
                onClick={addNotice}
                style={{
                  padding: "0.6rem 1rem", borderRadius: 8, fontWeight: 700,
                  background: "var(--accent)", color: "#fff", border: "none",
                  fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                등록
              </button>
            </div>
          )}
          {notices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.85rem" }}>
              등록된 공지가 없습니다
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {notices.map((n) => (
                <div key={n.id} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.75rem 1rem", borderRadius: 8,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                }}>
                  <span style={{ color: "#a78bfa", fontSize: "0.8rem", flexShrink: 0, marginTop: 2 }}>•</span>
                  <span style={{ flex: 1, fontSize: "0.875rem", lineHeight: 1.5 }}>{n.text}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                      {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </span>
                    {!isEnded && (
                      <button
                        onClick={() => deleteNotice(n.id)}
                        style={{
                          padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem",
                          background: "transparent", border: "1px solid var(--border)",
                          color: "var(--muted)", cursor: "pointer",
                        }}
                      >
                        삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 팀 설정 */}
        <section style={{ background: "var(--surface)", border: isEnded ? "1px solid rgba(107,107,128,0.15)" : "1px solid var(--border)", borderRadius: 14, padding: "1.25rem", opacity: isEnded ? 0.7 : 1 }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚙️ 팀 설정</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>팀 소개 수정</label>
              <textarea
                value={editIntro}
                onChange={(e) => { if (!isEnded) { setEditIntro(e.target.value); setSettingsDirty(true); } }}
                rows={3}
                disabled={isEnded}
                style={{
                  width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: "0.875rem", resize: "vertical", outline: "none",
                  cursor: isEnded ? "not-allowed" : "auto",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 2 }}>팀원 모집</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  {isEnded ? "대회 종료로 모집이 중단됐습니다" : editIsOpen ? "현재 모집 중입니다" : "현재 모집이 마감됐습니다"}
                </div>
              </div>
              {!isEnded && (
                <button
                  onClick={() => { setEditIsOpen(!editIsOpen); setSettingsDirty(true); }}
                  style={{
                    padding: "0.4rem 1rem", borderRadius: 20, fontSize: "0.8rem", fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s",
                    background: editIsOpen ? "rgba(16,185,129,0.15)" : "rgba(107,107,128,0.1)",
                    color: editIsOpen ? "#10b981" : "var(--muted)",
                    border: editIsOpen ? "1px solid rgba(16,185,129,0.3)" : "1px solid var(--border)",
                  }}
                >
                  {editIsOpen ? "모집중" : "모집완료"}
                </button>
              )}
            </div>

            {settingsDirty && !isEnded && (
              <button
                onClick={handleSaveSettings}
                style={{
                  padding: "0.625rem", borderRadius: 8, fontWeight: 700, fontSize: "0.9rem",
                  background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer",
                }}
              >
                저장하기
              </button>
            )}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.25rem", paddingTop: "1rem" }}>
            {isLeader ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {!isEnded && (
                  <button
                    onClick={() => { setShowDelegateModal(true); setDelegateTo(""); }}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem",
                      background: "rgba(251,191,36,0.1)", color: "#fbbf24",
                      border: "1px solid rgba(251,191,36,0.3)", cursor: "pointer", fontWeight: 600,
                    }}
                  >
                    👑 팀장 위임
                  </button>
                )}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    style={{
                      padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem",
                      background: "rgba(239,68,68,0.08)", color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.25)", cursor: "pointer",
                    }}
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
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}
                      >
                        취소
                      </button>
                      <button
                        onClick={handleDelete}
                        style={{ flex: 1, padding: "0.4rem", borderRadius: 6, fontSize: "0.8rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontWeight: 700 }}
                      >
                        삭제 확인
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleLeave}
                style={{
                  padding: "0.5rem 1rem", borderRadius: 8, fontSize: "0.8rem",
                  background: "transparent", color: "var(--muted)",
                  border: "1px solid var(--border)", cursor: "pointer",
                }}
              >
                팀 나가기
              </button>
            )}
          </div>
        </section>

      </div>

      {/* 팀장 위임 모달 */}
      {showDelegateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
          onClick={(e) => e.target === e.currentTarget && setShowDelegateModal(false)}
        >
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "1.75rem", width: "100%", maxWidth: 400 }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.375rem" }}>👑 팀장 위임</h2>
            <p style={{ fontSize: "0.825rem", color: "var(--muted)", marginBottom: "1.25rem" }}>새로운 팀장을 선택해주세요</p>

            {(team.members ?? []).filter((m) => m !== profile?.nickname).length === 0 ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--muted)", fontSize: "0.875rem" }}>
                위임할 팀원이 없습니다
              </div>
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
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(124,58,237,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", flexShrink: 0 }}>
                      👤
                    </div>
                    <span style={{ flex: 1, fontSize: "0.875rem", fontWeight: delegateTo === nickname ? 700 : 400, color: delegateTo === nickname ? "#fbbf24" : "var(--text)" }}>
                      {nickname}
                    </span>
                    {delegateTo === nickname && <span style={{ fontSize: "0.75rem", color: "#fbbf24" }}>선택됨</span>}
                  </button>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={() => setShowDelegateModal(false)}
                style={{ flex: 1, padding: "0.625rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer", fontSize: "0.875rem" }}
              >
                취소
              </button>
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
