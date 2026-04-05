"use client";

import { useState, memo, useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import HackathonCard from "@/components/HackathonCard";
import { ROLE_COLORS } from "@/lib/constants";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { Team, Hackathon } from "@/lib/types";

// ── 팀 카드 ──────────────────────────────────────────────────────────────────

interface TeamCardProps {
  team: Team;
  hackathon: Hackathon | undefined;
  isEnded: boolean;
}

const MyTeamCard = memo(function MyTeamCard({ team, hackathon, isEnded }: TeamCardProps) {
  const inviteUrl = useMemo(() => {
    const rawUrl = team.contact.url.startsWith("http") ? team.contact.url : null;
    if (!rawUrl) return null;
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return rawUrl.replace(/^https?:\/\/[^/]+/, origin);
  }, [team.contact.url]);
  const { copied, copy } = useCopyToClipboard();

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
        opacity: isEnded ? 0.7 : 1,
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
      {/* 대회 정보 + 액션 버튼 */}
      {hackathon && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
            {hackathon.title}
          </div>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <Link
              href={`/space/${team.teamCode}`}
              style={{
                padding: "6px 12px", borderRadius: 8,
                background: isEnded ? "transparent" : "var(--brand-primary, #7c3aed)",
                color: isEnded ? "var(--text-muted, #6b6b80)" : "var(--text-light, #f0f2f5)",
                border: isEnded ? "1px solid var(--border-subtle, #dde1e6)" : "none",
                fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              {isEnded ? "기록 보기" : "스페이스 가기"}
            </Link>
            <Link
              href={`/hackathons/${team.hackathonSlug}`}
              style={{
                padding: "6px 12px", borderRadius: 8,
                background: "transparent",
                color: "var(--brand-primary, #7c3aed)",
                border: "1px solid rgba(124,58,237,0.3)",
                fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
              }}
            >
              대회 보기
            </Link>
          </div>
        </div>
      )}

      {/* 팀명 + 상태 배지 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "var(--text-main, #12121a)" }}>
          {team.name}
        </span>
        {isEnded ? (
          <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            종료
          </span>
        ) : !team.isOpen ? (
          <span className="badge" style={{ background: "rgba(107,107,128,0.1)", color: "var(--text-muted, #6b6b80)", border: "1px solid rgba(107,107,128,0.2)" }}>
            모집완료
          </span>
        ) : null}
      </div>

      {/* 소개 */}
      <p style={{ fontSize: 13, color: "var(--text-subtle, #4b5563)", margin: 0, lineHeight: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
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

      {/* 팀원 수 */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
        <span style={{ color: "var(--text-muted, #6b6b80)", fontWeight: 400 }}>팀원</span>
        <span style={{ color: "var(--brand-primary, #7c3aed)", fontWeight: 600, letterSpacing: "0.224px" }}>
          {team.memberCount}{team.maxMembers ? `/${team.maxMembers}명` : "명"}
        </span>
      </div>

      {/* 초대 링크 */}
      {inviteUrl && !isEnded && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main, #12121a)", marginBottom: 6 }}>초대 링크</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "8px 12px", borderRadius: 8,
              background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
              fontSize: 12, color: "var(--text-muted, #6b6b80)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {inviteUrl}
            </div>
            <button
              onClick={() => copy(inviteUrl)}
              style={{
                padding: "8px 14px", borderRadius: 8,
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.15)",
                color: copied ? "#10b981" : "var(--brand-primary, #7c3aed)",
                border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.3)",
                cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ── 대기 카드 ─────────────────────────────────────────────────────────────────

interface PendingTeamCardProps {
  team: Team;
  hackathon: Hackathon | undefined;
  myNickname: string;
  onCancel: (teamCode: string, teamName: string) => void;
}

const PendingTeamCard = memo(function PendingTeamCard({ team, hackathon, myNickname, onCancel }: PendingTeamCardProps) {
  const myRequest = (team.joinRequests ?? []).find((r) => r.nickname === myNickname);

  return (
    <div
      style={{
        background: "rgba(245,158,11,0.04)",
        border: "1px solid rgba(245,158,11,0.25)",
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
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "";
      }}
    >
      {/* 대회 정보 */}
      {hackathon && (
        <div style={{ paddingBottom: 12, borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary, #7c3aed)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {hackathon.title}
          </div>
        </div>
      )}

      {/* 팀명 + 상태 배지 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: 16, lineHeight: "24px", color: "var(--text-main, #12121a)" }}>
          {team.name}
        </span>
        <span className="badge badge-upcoming">승인 대기중</span>
      </div>

      {/* 소개 */}
      <p style={{ fontSize: 13, color: "var(--text-subtle, #4b5563)", margin: 0, lineHeight: "20px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {team.intro}
      </p>

      {/* 지원 정보 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        {myRequest?.role && (
          <span className="tag-team">내 지원 직군: {myRequest.role}</span>
        )}
        <span style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)" }}>
          팀원 {team.memberCount}{team.maxMembers ? `/${team.maxMembers}명` : "명"}
        </span>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", paddingTop: 12, borderTop: "1px solid rgba(245,158,11,0.15)" }}>
        {hackathon && (
          <Link
            href={`/hackathons/${team.hackathonSlug}`}
            style={{
              padding: "8px 16px", borderRadius: 8,
              background: "transparent",
              color: "var(--brand-primary, #7c3aed)",
              border: "1px solid rgba(124,58,237,0.3)",
              fontSize: 13, fontWeight: 600, textDecoration: "none",
            }}
          >
            대회 보기
          </Link>
        )}
        <button
          onClick={() => onCancel(team.teamCode, team.name)}
          style={{
            padding: "8px 16px", borderRadius: 8,
            background: "transparent",
            color: "var(--text-muted, #6b6b80)",
            border: "1px solid var(--border-subtle, #dde1e6)",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}
        >
          지원 취소
        </button>
      </div>
    </div>
  );
});

// ── 메인 페이지 ──────────────────────────────────────────────────────────────

export default function MyTeamPage() {
  const profile = useStore((s) => s.profile);
  const teams = useStore((s) => s.teams);
  const hackathons = useStore((s) => s.hackathons);
  const initialized = useStore((s) => s.initialized);
  const cancelJoinRequest = useStore((s) => s.cancelJoinRequest);

  const [endedOpen, setEndedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"teams" | "bookmarks">("teams");

  const myTeamCodes = profile?.myTeamCodes ?? [];
  const myTeams = teams.filter((t) => myTeamCodes.includes(t.teamCode));
  const bookmarkedSlugs = profile?.bookmarks ?? [];
  const bookmarkedHackathons = hackathons.filter((h) => bookmarkedSlugs.includes(h.slug));

  const pendingTeams = teams.filter(
    (t) =>
      !myTeamCodes.includes(t.teamCode) &&
      (t.joinRequests ?? []).some((r) => r.nickname === profile?.nickname)
  );

  const activeTeams = myTeams.filter((t) => {
    const hackathon = hackathons.find((h) => h.slug === t.hackathonSlug);
    return hackathon?.status !== "ended";
  });
  const endedTeams = myTeams.filter((t) => {
    const hackathon = hackathons.find((h) => h.slug === t.hackathonSlug);
    return hackathon?.status === "ended";
  });

  const handleCancel = (teamCode: string, teamName: string) => {
    cancelJoinRequest(teamCode);
    toast.success(`"${teamName}" 지원을 취소했습니다`);
  };

  if (!initialized) {
    return (
      <div>
        <div style={{ marginBottom: "1.75rem" }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>내 팀</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", margin: 0 }}>소속된 팀을 확인하고 관리하세요</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 12, background: "var(--bg-main, #f0f2f5)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = myTeams.length === 0 && pendingTeams.length === 0;

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, lineHeight: "38px", color: "var(--text-main, #12121a)", marginBottom: 4 }}>내 팀</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", margin: 0 }}>소속된 팀을 확인하고 관리하세요</p>
      </div>

      {/* 탭바 */}
      <div style={{ display: "flex", gap: 0, marginBottom: "1.75rem", borderBottom: "1px solid var(--border-subtle, #dde1e6)" }}>
        {(["teams", "bookmarks"] as const).map((tab) => {
          const label = tab === "teams" ? "내 팀" : "북마크";
          const count = tab === "teams" ? myTeams.length + pendingTeams.length : bookmarkedHackathons.length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                fontSize: 14,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid var(--brand-primary, #7c3aed)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: "-1px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  padding: "1px 6px", borderRadius: 9999,
                  background: isActive ? "rgba(124,58,237,0.15)" : "rgba(107,107,128,0.1)",
                  color: isActive ? "var(--brand-primary, #7c3aed)" : "var(--text-muted, #6b6b80)",
                }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 북마크 탭 */}
      {activeTab === "bookmarks" && (
        bookmarkedHackathons.length === 0 ? (
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--bg-main, #f0f2f5)", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main, #12121a)", marginBottom: 6 }}>북마크한 해커톤이 없습니다</div>
            <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: "1.5rem" }}>해커톤 목록에서 별표 버튼으로 저장하세요</div>
            <Link
              href="/hackathons"
              className="btn-primary"
              style={{ fontSize: 13 }}
            >
              해커톤 보러가기
            </Link>
          </div>
        ) : (
          <div className="hackathon-card-grid">
            {bookmarkedHackathons.map((h) => (
              <HackathonCard key={h.slug} h={h} />
            ))}
          </div>
        )
      )}

      {/* 내 팀 탭 */}
      {activeTab === "teams" && (isEmpty ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--bg-main, #f0f2f5)", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main, #12121a)", marginBottom: 6 }}>아직 소속된 팀이 없습니다</div>
          <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: "1.5rem" }}>팀에 지원하거나 직접 만들어보세요</div>
          <Link
            href="/camp"
            className="btn-primary"
            style={{ fontSize: 13 }}
          >
            팀 모집 보러가기
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 승인 대기중 */}
          {pendingTeams.length > 0 && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b", marginBottom: 12, letterSpacing: "0.224px" }}>
                승인 대기중 <span style={{ fontWeight: 400, color: "var(--text-muted, #6b6b80)" }}>({pendingTeams.length}개)</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {pendingTeams.map((team) => (
                  <PendingTeamCard
                    key={team.teamCode}
                    team={team}
                    hackathon={hackathons.find((h) => h.slug === team.hackathonSlug)}
                    myNickname={profile?.nickname ?? ""}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 진행중 팀 */}
          {myTeams.length > 0 && (
            <>
              {activeTeams.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--bg-main, #f0f2f5)", borderRadius: 12, border: "1px solid var(--border-subtle, #dde1e6)" }}>
                  <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)", marginBottom: 12 }}>진행중인 팀이 없습니다</div>
                  <Link
                    href="/camp"
                    className="btn-primary"
                    style={{ fontSize: 13 }}
                  >
                    팀 모집 보러가기
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {activeTeams.map((team) => (
                    <MyTeamCard
                      key={team.teamCode}
                      team={team}
                      hackathon={hackathons.find((h) => h.slug === team.hackathonSlug)}
                      isEnded={false}
                    />
                  ))}
                </div>
              )}

              {/* 종료된 팀 — 아코디언 */}
              {endedTeams.length > 0 && (
                <div>
                  <button
                    onClick={() => setEndedOpen((v) => !v)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8, width: "100%",
                      padding: "12px 16px", borderRadius: 10,
                      background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)",
                      color: "var(--text-muted, #6b6b80)", fontSize: 13, fontWeight: 600,
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.03)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{ flex: 1, textAlign: "left" }}>
                      종료된 팀 <span style={{ fontWeight: 400, fontSize: 12 }}>({endedTeams.length}개)</span>
                    </span>
                    <span style={{ fontSize: 11, transition: "transform 0.2s", display: "inline-block", transform: endedOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      ▼
                    </span>
                  </button>

                  {endedOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                      {endedTeams.map((team) => (
                        <MyTeamCard
                          key={team.teamCode}
                          team={team}
                          hackathon={hackathons.find((h) => h.slug === team.hackathonSlug)}
                          isEnded={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
