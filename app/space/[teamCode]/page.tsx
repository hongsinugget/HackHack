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

export default function SpacePage({ params }: { params: Promise<{ teamCode: string }> }) {
  const { teamCode } = use(params);
  const router = useRouter();

  const teams = useStore((s) => s.teams);
  const hackathons = useStore((s) => s.hackathons);
  const profile = useStore((s) => s.profile);
  const leaveTeam = useStore((s) => s.leaveTeam);
  const updateTeam = useStore((s) => s.updateTeam);
  const initialized = useStore((s) => s.initialized);

  const team = teams.find((t) => t.teamCode === teamCode) ?? null;
  const hackathon = hackathons.find((h) => h.slug === team?.hackathonSlug) ?? null;
  const isMember = (profile?.myTeamCodes ?? []).includes(teamCode);

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
    const text = noticeInput.trim();
    if (!text) return;
    const next = [{ id: Date.now().toString(), text, createdAt: new Date().toISOString() }, ...notices];
    saveNotices(next);
    setNoticeInput("");
  };

  const deleteNotice = (id: string) => {
    saveNotices(notices.filter((n) => n.id !== id));
  };

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

  const handleCopy = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 로딩 중
  if (!initialized) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ width: 32, height: 32, border: "3px solid var(--border)", borderTop: "3px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // 팀 없음
  if (!team) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>존재하지 않는 팀입니다</div>
        <Link href="/myteam" style={{ color: "#a78bfa", textDecoration: "none", fontSize: "0.9rem" }}>← 내 팀으로</Link>
      </div>
    );
  }

  // 비소속
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
      {/* 뒤로가기 */}
      <Link href="/myteam" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "var(--muted)", textDecoration: "none", marginBottom: "1.5rem" }}>
        ← 내 팀으로
      </Link>

      {/* 팀 헤더 */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.65rem", color: "var(--muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "2px 8px", borderRadius: 6, fontFamily: "monospace" }}>
            {team.teamCode}
          </span>
          {team.isOpen ? (
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

        {/* 초대 링크 */}
        {inviteUrl && (
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

        {/* 팀 공지 */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>📌 팀 공지</div>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 팀 설정 */}
        <section style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--muted)", marginBottom: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>⚙️ 팀 설정</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 6 }}>팀 소개 수정</label>
              <textarea
                value={editIntro}
                onChange={(e) => { setEditIntro(e.target.value); setSettingsDirty(true); }}
                rows={3}
                style={{
                  width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8,
                  background: "var(--surface2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontSize: "0.875rem", resize: "vertical", outline: "none",
                }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: 2 }}>팀원 모집</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  {editIsOpen ? "현재 모집 중입니다" : "현재 모집이 마감됐습니다"}
                </div>
              </div>
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
            </div>

            {settingsDirty && (
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
          </div>
        </section>

      </div>
    </div>
  );
}
