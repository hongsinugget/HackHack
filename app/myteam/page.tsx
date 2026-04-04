"use client";

import { useState, memo } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import { ROLE_COLORS } from "@/lib/constants";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import type { Team, Hackathon } from "@/lib/types";

// ── 팀 카드 ──────────────────────────────────────────────────────────────────

interface TeamCardProps {
  team: Team;
  hackathon: Hackathon | undefined;
  isEnded: boolean;
  onCancel?: (teamCode: string, teamName: string) => void;
}

const MyTeamCard = memo(function MyTeamCard({ team, hackathon, isEnded }: TeamCardProps) {
  const rawUrl = team.contact.url.startsWith("http") ? team.contact.url : null;
  const inviteUrl = rawUrl
    ? rawUrl.replace(/^https?:\/\/[^/]+/, typeof window !== "undefined" ? window.location.origin : "")
    : null;
  const { copied, copy } = useCopyToClipboard();

  return (
    <div
      className="card"
      style={{
        padding: "1.5rem",
        opacity: isEnded ? 0.6 : 1,
        border: isEnded ? "1px solid rgba(107,107,128,0.2)" : undefined,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          {hackathon ? (
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: isEnded ? "var(--muted)" : "#a78bfa", marginBottom: "0.25rem" }}>
              🏆 {hackathon.title}
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>대회 미지정</div>
          )}
          <div style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: "0.1rem" }}>{team.name}</div>
        </div>
        {isEnded ? (
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
            🏁 종료
          </span>
        ) : team.isOpen ? (
          <span style={{ fontSize: "0.7rem", color: "#10b981", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
            모집중
          </span>
        ) : (
          <span style={{ fontSize: "0.7rem", color: "var(--muted)", background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap" }}>
            모집완료
          </span>
        )}
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.875rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {team.intro}
      </p>

      {team.lookingFor.length > 0 && (
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
          {team.lookingFor.map((role) => (
            <span key={role} style={{
              fontSize: "0.72rem", padding: "3px 10px", borderRadius: 6,
              border: `1px solid ${ROLE_COLORS[role] ?? "#6b6b80"}40`,
              color: ROLE_COLORS[role] ?? "var(--muted)",
              background: `${ROLE_COLORS[role] ?? "#6b6b80"}15`,
            }}>
              {role}
            </span>
          ))}
        </div>
      )}

      <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1rem" }}>
        팀원 {team.memberCount}명{team.maxMembers ? ` / 최대 ${team.maxMembers}명` : ""}
      </div>

      {inviteUrl && !isEnded && (
        <div style={{ marginBottom: "1rem" }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)", marginBottom: "0.4rem" }}>초대 링크</div>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <div style={{
              flex: 1, padding: "0.5rem 0.75rem", borderRadius: 8,
              background: "var(--surface2)", border: "1px solid var(--border)",
              fontSize: "0.75rem", color: "var(--muted)",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {inviteUrl}
            </div>
            <button
              onClick={() => copy(inviteUrl)}
              style={{
                padding: "0.5rem 0.875rem", borderRadius: 8,
                background: copied ? "rgba(16,185,129,0.15)" : "rgba(124,58,237,0.12)",
                color: copied ? "#10b981" : "#a78bfa",
                border: copied ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.25)",
                cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.2s",
              }}
            >
              {copied ? "✓ 복사됨" : "📋 복사"}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid var(--border)" }}>
        <Link
          href={`/space/${team.teamCode}`}
          style={{
            padding: "0.5rem 1rem", borderRadius: 8,
            background: isEnded ? "rgba(107,107,128,0.1)" : "rgba(124,58,237,0.15)",
            color: isEnded ? "var(--muted)" : "#a78bfa",
            border: isEnded ? "1px solid rgba(107,107,128,0.2)" : "1px solid rgba(124,58,237,0.35)",
            fontSize: "0.8rem", fontWeight: 700, textDecoration: "none",
          }}
        >
          {isEnded ? "📁 기록 보기 →" : "🏠 스페이스 가기 →"}
        </Link>
        {hackathon && (
          <Link
            href={`/hackathons/${team.hackathonSlug}`}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              background: "rgba(124,58,237,0.1)", color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.25)",
              fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
            }}
          >
            대회 보기 →
          </Link>
        )}
      </div>
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
      className="card"
      style={{
        padding: "1.5rem",
        border: "1px solid rgba(251,191,36,0.25)",
        background: "rgba(251,191,36,0.03)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div>
          {hackathon ? (
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#a78bfa", marginBottom: "0.25rem" }}>
              🏆 {hackathon.title}
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>대회 미지정</div>
          )}
          <div style={{ fontWeight: 800, fontSize: "1.2rem", marginTop: "0.1rem" }}>{team.name}</div>
        </div>
        <span style={{
          fontSize: "0.7rem", padding: "2px 10px", borderRadius: 9999, whiteSpace: "nowrap",
          background: "rgba(251,191,36,0.12)", color: "#fbbf24",
          border: "1px solid rgba(251,191,36,0.35)",
        }}>
          ⏳ 승인 대기중
        </span>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "0.875rem", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {team.intro}
      </p>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        {myRequest?.role && (
          <span style={{
            fontSize: "0.72rem", padding: "3px 10px", borderRadius: 6,
            border: `1px solid ${ROLE_COLORS[myRequest.role] ?? "#6b6b80"}40`,
            color: ROLE_COLORS[myRequest.role] ?? "var(--muted)",
            background: `${ROLE_COLORS[myRequest.role] ?? "#6b6b80"}15`,
          }}>
            내 지원 직군: {myRequest.role}
          </span>
        )}
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          팀원 {team.memberCount}명{team.maxMembers ? ` / 최대 ${team.maxMembers}명` : ""}
        </span>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.75rem", borderTop: "1px solid rgba(251,191,36,0.15)" }}>
        {hackathon && (
          <Link
            href={`/hackathons/${team.hackathonSlug}`}
            style={{
              padding: "0.5rem 1rem", borderRadius: 8,
              background: "rgba(124,58,237,0.1)", color: "#a78bfa",
              border: "1px solid rgba(124,58,237,0.25)",
              fontSize: "0.8rem", fontWeight: 600, textDecoration: "none",
            }}
          >
            대회 보기 →
          </Link>
        )}
        <button
          onClick={() => onCancel(team.teamCode, team.name)}
          style={{
            padding: "0.5rem 1rem", borderRadius: 8,
            background: "transparent", color: "var(--muted)",
            border: "1px solid var(--border)",
            fontSize: "0.8rem", cursor: "pointer",
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
  const toggleBookmark = useStore((s) => s.toggleBookmark);

  const [endedOpen, setEndedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"teams" | "bookmarks">("teams");

  const myTeamCodes = profile?.myTeamCodes ?? [];
  const myTeams = teams.filter((t) => myTeamCodes.includes(t.teamCode));
  const bookmarkedSlugs = profile?.bookmarks ?? [];
  const bookmarkedHackathons = hackathons.filter((h) => bookmarkedSlugs.includes(h.slug));

  // 승인 대기중인 팀 (joinRequests에 내 닉네임이 있는 팀)
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
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>내 팀</h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>소속된 팀을 확인하고 관리하세요</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
          ))}
        </div>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
      </div>
    );
  }

  const isEmpty = myTeams.length === 0 && pendingTeams.length === 0;

  return (
    <div>
      {/* 헤더 */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.375rem" }}>내 팀</h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>소속된 팀을 확인하고 관리하세요</p>
      </div>

      {/* 탭바 */}
      <div style={{ display: "flex", gap: "0", marginBottom: "1.75rem", borderBottom: "1px solid var(--border)" }}>
        {(["teams", "bookmarks"] as const).map((tab) => {
          const label = tab === "teams" ? "내 팀" : "북마크";
          const count = tab === "teams" ? myTeams.length + pendingTeams.length : bookmarkedHackathons.length;
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.625rem 1.25rem",
                fontSize: "0.9rem",
                fontWeight: isActive ? 700 : 400,
                color: isActive ? "#a78bfa" : "var(--muted)",
                background: "none",
                border: "none",
                borderBottom: isActive ? "2px solid #a78bfa" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s",
                marginBottom: "-1px",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  fontSize: "0.7rem", fontWeight: 700,
                  padding: "1px 6px", borderRadius: 9999,
                  background: isActive ? "rgba(167,139,250,0.2)" : "rgba(107,107,128,0.12)",
                  color: isActive ? "#a78bfa" : "var(--muted)",
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
          <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>☆</div>
            <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>북마크한 해커톤이 없습니다</div>
            <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>해커톤 목록에서 ☆ 버튼으로 저장하세요</div>
            <Link href="/hackathons" style={{ display: "inline-block", padding: "0.625rem 1.5rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
              해커톤 보러가기 →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {bookmarkedHackathons.map((h) => {
              const rush = isRushMode(h.period.submissionDeadlineAt);
              const dday = dDayLabel(h.period.submissionDeadlineAt);
              return (
                <div key={h.slug} style={{ position: "relative" }}>
                  <Link href={h.links.detail} style={{ textDecoration: "none" }}>
                    <div className="card" style={{ padding: "1.5rem", cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.75rem", height: "100%" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <StatusBadge status={h.status} />
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {h.status !== "ended" && (
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: rush ? "#ef4444" : "var(--muted)" }}>
                              {rush ? `🔥 ${dday}` : dday}
                            </span>
                          )}
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleBookmark(h.slug); }}
                            title="북마크 해제"
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "2px 4px", fontSize: "1rem", lineHeight: 1, color: "#a78bfa", transition: "opacity 0.15s" }}
                          >
                            ★
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "0.5rem" }}>
                          {h.title}
                        </h3>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                          {h.tags.map((tag) => <span key={tag} className="tag">{tag}</span>)}
                        </div>
                      </div>
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                        {h.maxPrizeKRW ? (
                          <div>
                            <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: 2 }}>최대 상금</div>
                            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#a78bfa" }}>{formatPrize(h.maxPrizeKRW)}</div>
                          </div>
                        ) : (
                          <div style={{ fontSize: "0.8rem", color: "var(--muted)" }}>상금 미정</div>
                        )}
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "right", lineHeight: 1.6 }}>
                          <div>시작 {new Date(h.period.startAt).toLocaleDateString("ko-KR")}</div>
                          <div>마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString("ko-KR")}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* 내 팀 탭 */}
      {activeTab === "teams" && (isEmpty ? (
        <div style={{ textAlign: "center", padding: "5rem 2rem", background: "var(--surface)", borderRadius: 16, border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏕️</div>
          <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem" }}>아직 소속된 팀이 없습니다</div>
          <div style={{ fontSize: "0.875rem", color: "var(--muted)", marginBottom: "1.5rem" }}>팀에 지원하거나 직접 만들어보세요</div>
          <Link href="/camp" style={{ display: "inline-block", padding: "0.625rem 1.5rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.9rem" }}>
            팀 모집 보러가기 →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* 승인 대기중 */}
          {pendingTeams.length > 0 && (
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#fbbf24", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                ⏳ 승인 대기중 <span style={{ fontWeight: 400, color: "var(--muted)" }}>({pendingTeams.length}개)</span>
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
                <div style={{ textAlign: "center", padding: "2.5rem 1rem", background: "var(--surface)", borderRadius: 14, border: "1px solid var(--border)" }}>
                  <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🏁</div>
                  <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>진행중인 팀이 없습니다</div>
                  <Link href="/camp" style={{ display: "inline-block", marginTop: "1rem", padding: "0.5rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}>
                    팀 모집 보러가기 →
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
                      display: "flex", alignItems: "center", gap: "0.5rem", width: "100%",
                      padding: "0.75rem 1rem", borderRadius: 10,
                      background: "transparent", border: "1px solid var(--border)",
                      color: "var(--muted)", fontSize: "0.875rem", fontWeight: 600,
                      cursor: "pointer", transition: "background 0.15s",
                    }}
                  >
                    <span style={{ flex: 1, textAlign: "left" }}>
                      🏁 종료된 팀 <span style={{ fontWeight: 400, fontSize: "0.8rem" }}>({endedTeams.length}개)</span>
                    </span>
                    <span style={{ fontSize: "0.75rem", transition: "transform 0.2s", display: "inline-block", transform: endedOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                      ▼
                    </span>
                  </button>

                  {endedOpen && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginTop: "0.75rem" }}>
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
