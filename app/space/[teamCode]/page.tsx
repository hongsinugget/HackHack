"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { NoticesSchema, TeamSubmissionSchema } from "@/lib/schemas";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import HomeTab from "./_components/HomeTab";
import MembersTab from "./_components/MembersTab";
import NoticesTab from "./_components/NoticesTab";
import SubmitTab from "./_components/SubmitTab";
import SettingsTab from "./_components/SettingsTab";
import DelegateModal from "./_components/DelegateModal";
import { ALL_ROLES } from "@/lib/constants";

type Notice = { id: string; text: string; createdAt: string };
type TeamSubmission = { projectName: string; githubUrl: string; demoUrl: string; notes?: string; fileName?: string; submittedAt: string; teamName: string };

const VALID_TEAM_CODE = /^[A-Za-z0-9_-]{1,64}$/;

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
  const approveJoinRequest = useStore((s) => s.approveJoinRequest);
  const rejectJoinRequest = useStore((s) => s.rejectJoinRequest);
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

  const { copied, copy: copyInviteUrl } = useCopyToClipboard();
  const inviteUrl = (() => {
    if (!team?.contact.url) return null;
    try {
      const parsed = new URL(team.contact.url);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
      if (!parsed.pathname.includes("/invite/")) return null;
      return typeof window !== "undefined"
        ? `${window.location.origin}${parsed.pathname}${parsed.search}${parsed.hash}`
        : team.contact.url;
    } catch {
      return null;
    }
  })();

  const noticeKey = `hh_notices_${teamCode}`;
  const [notices, setNotices] = useState<Notice[]>([]);
  const [noticeInput, setNoticeInput] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(noticeKey);
      if (raw) {
        const result = NoticesSchema.safeParse(JSON.parse(raw));
        if (result.success) setNotices(result.data);
        else localStorage.removeItem(noticeKey);
      }
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
    saveNotices([{ id: Date.now().toString(), text, createdAt: new Date().toISOString() }, ...notices]);
    setNoticeInput("");
  };

  const deleteNotice = (id: string) => {
    if (isEnded) return;
    saveNotices(notices.filter((n) => n.id !== id));
  };

  const [activeTab, setActiveTab] = useState<"home" | "members" | "notices" | "submit" | "settings">("home");
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateTo, setDelegateTo] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [editIntro, setEditIntro] = useState("");
  const [introDirty, setIntroDirty] = useState(false);
  const [editContactUrl, setEditContactUrl] = useState("");
  const [contactUrlDirty, setContactUrlDirty] = useState(false);
  const [editLookingFor, setEditLookingFor] = useState<string[]>([]);
  const [editMaxMembers, setEditMaxMembers] = useState(4);
  const [recruitDirty, setRecruitDirty] = useState(false);

  useEffect(() => {
    if (!VALID_TEAM_CODE.test(teamCode)) {
      router.replace("/myteam");
    }
  }, [teamCode, router]);

  useEffect(() => {
    if (team) {
      setEditIntro(team.intro);
      setEditLookingFor(team.lookingFor);
      setEditMaxMembers(team.maxMembers ?? 4);
      const contactUrl = team.contact?.url ?? "";
      const isExternal = contactUrl.startsWith("http") && !contactUrl.includes("/invite/");
      setEditContactUrl(isExternal ? contactUrl : "");
    }
  }, [team?.teamCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleEditRole = (role: string) => {
    setEditLookingFor((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
    setRecruitDirty(true);
  };

  const subKey = `hh_sub_${teamCode}`;
  const [submission, setSubmission] = useState<TeamSubmission | null>(null);
  const [projectName, setProjectName] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [subErrors, setSubErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(subKey);
      if (raw) {
        const result = TeamSubmissionSchema.safeParse(JSON.parse(raw));
        if (result.success) setSubmission(result.data);
        else localStorage.removeItem(subKey);
      }
    } catch {}
  }, [subKey]);

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!projectName.trim()) errors.projectName = "프로젝트명을 입력해주세요";
    if (!githubUrl || !/^https?:\/\//.test(githubUrl)) errors.github = "올바른 GitHub URL을 입력해주세요 (https:// 시작)";
    if (!demoUrl || !/^https?:\/\//.test(demoUrl)) errors.demo = "올바른 시연 URL을 입력해주세요 (https:// 시작)";
    setSubErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const raw = {
      projectName: projectName.trim(), githubUrl, demoUrl,
      notes: notes.trim() || undefined, fileName: selectedFile?.name,
      submittedAt: new Date().toISOString(), teamName: team!.name,
    };
    const parsed = TeamSubmissionSchema.safeParse(raw);
    if (!parsed.success) {
      toast.error("제출 데이터가 유효하지 않습니다. URL 형식을 확인해주세요");
      return;
    }
    const newSub = parsed.data;
    localStorage.setItem(subKey, JSON.stringify(newSub));
    setSubmission(newSub);

    if (team?.hackathonSlug) {
      const currentLb = leaderboards.find((lb) => lb.hackathonSlug === team.hackathonSlug);
      const newRank = (currentLb?.entries.length ?? 0) + 1;
      updateLeaderboard(team.hackathonSlug, { teamName: team.name, score: 0, submittedAt: newSub.submittedAt });
      addTimelineEvent({ type: "submit", hackathonSlug: team.hackathonSlug, hackathonTitle: hackathon?.title ?? "", at: newSub.submittedAt, detail: "팀 제출" });
      if (newRank === 3) addBadge({ id: "top3", emoji: "🏅", label: "취미를 넘어선", description: "리더보드 3위를 달성했습니다" });
      if (newRank === 2) addBadge({ id: "top2", emoji: "🥈", label: "전설적인", description: "리더보드 2위를 달성했습니다" });
      if (newRank === 1) addBadge({ id: "top1", emoji: "🏆", label: "전설이 된 마스터", description: "리더보드 1위를 달성했습니다" });
    }
    if (!profile?.badges.some((b) => b.id === "submitted")) {
      addBadge({ id: "submitted", emoji: "📦", label: "제출 완료!", description: "첫 결과물을 제출했습니다" });
    }
    try {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    } catch {}
    toast.success("제출이 완료됐습니다! 리더보드에 반영됩니다.");
  };

  const handleSaveIntro = () => { updateTeam(teamCode, { intro: editIntro }); setIntroDirty(false); toast.success("팀 소개가 저장됐습니다"); };
  const handleSaveContactUrl = () => {
    const url = editContactUrl.trim();
    updateTeam(teamCode, { contact: { type: "link", url: url || (inviteUrl ?? "") } });
    setContactUrlDirty(false);
    toast.success("연락처가 저장됐습니다");
  };
  const handleSaveRecruit = () => {
    const isOpen = editLookingFor.length > 0 && (team?.memberCount ?? 0) < editMaxMembers;
    updateTeam(teamCode, { lookingFor: editLookingFor, maxMembers: editMaxMembers, isOpen });
    setRecruitDirty(false);
    toast.success("모집 공고가 저장됐습니다");
  };
  const handleKick = (nickname: string) => { kickMember(teamCode, nickname); toast.success(`${nickname}님을 내보냈습니다`); };
  const handleLeave = () => { if (!team) return; leaveTeam(teamCode); toast.success(`"${team.name}" 팀에서 나왔습니다`); router.push("/myteam"); };
  const handleDelete = () => { if (!team) return; deleteTeam(teamCode); toast.success(`"${team.name}" 팀이 삭제됐습니다`); router.push("/myteam"); };
  const handleDelegate = () => { if (!delegateTo) return; delegateLeader(teamCode, delegateTo); toast.success(`팀장을 ${delegateTo}님께 위임했습니다`); setShowDelegateModal(false); setDelegateTo(""); };
  const handleCopy = () => { if (inviteUrl) copyInviteUrl(inviteUrl); };

  if (!initialized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border-subtle, #dde1e6)", borderTop: "3px solid var(--brand-primary, #7c3aed)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (!team) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main, #12121a)", marginBottom: 6 }}>존재하지 않는 팀입니다</div>
        <Link href="/myteam" style={{ color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontSize: 13 }}>← 내 팀으로</Link>
      </div>
    );
  }

  if (!isMember) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main, #12121a)", marginBottom: 6 }}>이 팀에 소속되어 있지 않습니다</div>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: "1.5rem" }}>스페이스는 팀원만 접근할 수 있습니다</p>
        <Link href="/myteam" style={{ color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontSize: 13 }}>← 내 팀으로</Link>
      </div>
    );
  }

  const tabs = [
    { id: "home",     label: "홈",   badge: null },
    { id: "notices",  label: "공지", badge: notices.length > 0 ? notices.length : null },
    { id: "members",  label: "팀원", badge: null },
    ...(team.hackathonSlug ? [{ id: "submit", label: "제출", badge: submission ? "완료" : null }] : []),
    { id: "settings", label: "설정", badge: isLeader && (team.joinRequests ?? []).length > 0 ? (team.joinRequests ?? []).length : null },
  ] as { id: string; label: string; badge?: string | number | null }[];

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>
      {/* 뒤로가기 */}
      <Link
        href="/myteam"
        style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-muted, #6b6b80)", textDecoration: "none", marginBottom: "1.5rem" }}
      >
        ← 내 팀으로
      </Link>

      {/* 팀 헤더 */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", color: "var(--brand-primary, #7c3aed)" }}>
            팀 스페이스
          </span>
          {isEnded ? (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", background: "rgba(255,46,99,0.15)", color: "#FF2E63" }}>종료</span>
          ) : (team.isOpen && team.memberCount < (team.maxMembers ?? Infinity)) ? (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", background: "#5013ba", color: "#f0f2f5" }}>모집중</span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 8px", borderRadius: 9999, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", background: "rgba(107,107,128,0.1)", color: "var(--text-muted, #6b6b80)" }}>모집완료</span>
          )}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>{team.name}</h1>
        {hackathon && (
          <Link
            href={`/hackathons/${hackathon.slug}`}
            style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontWeight: 600 }}
          >
            {hackathon.title} →
          </Link>
        )}
      </div>

      {/* 아카이브 배너 */}
      {isEnded && (
        <div style={{
          padding: "12px 16px", borderRadius: 10, marginBottom: "1rem",
          background: "rgba(107,107,128,0.06)", border: "1px solid rgba(107,107,128,0.2)",
          fontSize: 13, color: "var(--text-muted, #6b6b80)",
        }}>
          대회가 종료되어 스페이스는 읽기 전용으로 유지됩니다
        </div>
      )}

      {/* 스티키 탭바 */}
      <div style={{
        position: "sticky",
        top: 56,
        zIndex: 10,
        background: "var(--bg-main, #f0f2f5)",
        borderBottom: "1px solid var(--border-subtle, #dde1e6)",
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
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "10px 16px",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--brand-primary, #7c3aed)" : "2px solid transparent",
                  color: isActive ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)",
                  fontWeight: isActive ? 700 : 400,
                  fontSize: 14,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "color 0.15s",
                  marginBottom: "-1px",
                }}
              >
                {tab.label}
                {tab.badge != null && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, lineHeight: 1,
                    padding: "1px 5px", borderRadius: 9999,
                    background: tab.id === "submit"
                      ? "rgba(16,185,129,0.15)"
                      : isActive ? "rgba(124,58,237,0.15)" : "rgba(107,107,128,0.1)",
                    color: tab.id === "submit"
                      ? "#10b981"
                      : isActive ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)",
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
      {activeTab === "home" && (
        <HomeTab team={team} inviteUrl={inviteUrl} isEnded={isEnded} copied={copied} onCopy={handleCopy} />
      )}
      {activeTab === "members" && (
        <MembersTab team={team} profile={profile} onGoToSettings={() => setActiveTab("settings")} />
      )}
      {activeTab === "notices" && (
        <NoticesTab notices={notices} noticeInput={noticeInput} isEnded={isEnded} onInputChange={setNoticeInput} onAdd={addNotice} onDelete={deleteNotice} />
      )}
      {activeTab === "submit" && team.hackathonSlug && (
        <SubmitTab
          team={team} hackathon={hackathon} submission={submission} isEnded={isEnded}
          projectName={projectName} githubUrl={githubUrl} demoUrl={demoUrl} notes={notes}
          selectedFile={selectedFile} subErrors={subErrors}
          onProjectNameChange={(v) => { setProjectName(v); setSubErrors((p) => ({ ...p, projectName: "" })); }}
          onGithubUrlChange={(v) => { setGithubUrl(v); setSubErrors((p) => ({ ...p, github: "" })); }}
          onDemoUrlChange={(v) => { setDemoUrl(v); setSubErrors((p) => ({ ...p, demo: "" })); }}
          onNotesChange={setNotes} onFileChange={setSelectedFile} onSubmit={handleSubmit}
        />
      )}
      {activeTab === "settings" && (
        <SettingsTab
          team={team} profile={profile} isLeader={isLeader} isEnded={isEnded}
          editIntro={editIntro} introDirty={introDirty}
          onIntroChange={(v) => { setEditIntro(v); setIntroDirty(true); }}
          onSaveIntro={handleSaveIntro}
          editContactUrl={editContactUrl} contactUrlDirty={contactUrlDirty}
          onContactUrlChange={(v) => { setEditContactUrl(v); setContactUrlDirty(true); }}
          onSaveContactUrl={handleSaveContactUrl}
          editLookingFor={editLookingFor} editMaxMembers={editMaxMembers} recruitDirty={recruitDirty}
          onToggleEditRole={toggleEditRole}
          onMaxMembersChange={(n) => { setEditMaxMembers(n); setRecruitDirty(true); }}
          onSaveRecruit={handleSaveRecruit}
          onKick={handleKick}
          onApprove={(nickname) => { approveJoinRequest(teamCode, nickname); toast.success(`${nickname}님을 팀원으로 승인했습니다`); }}
          onReject={(nickname) => { rejectJoinRequest(teamCode, nickname); toast.success(`${nickname}님의 요청을 거절했습니다`); }}
          showDeleteConfirm={showDeleteConfirm}
          onShowDelegate={() => { setShowDelegateModal(true); setDelegateTo(""); }}
          onShowDeleteConfirm={() => setShowDeleteConfirm(true)}
          onCancelDelete={() => setShowDeleteConfirm(false)}
          onDelete={handleDelete} onLeave={handleLeave}
        />
      )}

      {showDelegateModal && (
        <DelegateModal team={team} profile={profile} delegateTo={delegateTo} onSelect={setDelegateTo} onConfirm={handleDelegate} onClose={() => setShowDelegateModal(false)} />
      )}
    </div>
  );
}
