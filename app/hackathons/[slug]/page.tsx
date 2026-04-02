"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getHackathonDetail } from "@/lib/detailData";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";

const MEDAL_EMOJI: Record<string, string> = { "1st": "🥇", "2nd": "🥈", "3rd": "🥉" };
const MEDAL_COLORS: Record<string, string> = { "1st": "#fbbf24", "2nd": "#94a3b8", "3rd": "#b45309" };

const SECTIONS = [
  { id: "prize", label: "상금" },
  { id: "leaderboard", label: "순위" },
  { id: "overview", label: "대회 소개" },
  { id: "schedule", label: "일정" },
  { id: "eval", label: "평가 기준" },
  { id: "teams", label: "팀 찾기" },
  { id: "submit", label: "제출" },
];

const ROLE_COLORS: Record<string, string> = {
  "Backend": "#3b82f6",
  "Frontend": "#8b5cf6",
  "ML Engineer": "#10b981",
  "Data": "#f59e0b",
  "Designer": "#ec4899",
  "PM": "#6366f1",
};

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: "smooth" });
  }
}

export default function HackathonDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);

  const hackathons = useStore((s) => s.hackathons);
  const teams = useStore((s) => s.teams);
  const leaderboards = useStore((s) => s.leaderboards);
  const profile = useStore((s) => s.profile);
  const initialized = useStore((s) => s.initialized);
  const toggleBookmark = useStore((s) => s.toggleBookmark);

  const hackathon = hackathons.find((h) => h.slug === slug) ?? null;
  const hackathonTeams = teams.filter((t) => t.hackathonSlug === slug && t.isOpen);
  const allHackathonTeams = teams.filter((t) => t.hackathonSlug === slug);
  const myTeamCodes = new Set(profile?.myTeamCodes ?? []);
  const leaderboard = leaderboards.find((lb) => lb.hackathonSlug === slug) ?? null;
  const detail = getHackathonDetail(slug);

  // 미제출 팀: 해커톤에 속해있지만 리더보드에 없는 팀
  const submittedNames = new Set(leaderboard?.entries.map((e) => e.teamName) ?? []);
  const unsubmittedTeams = allHackathonTeams.filter((t) => !submittedNames.has(t.name));

  // 내 팀 (이 해커톤 소속)
  const myTeamInHackathon = allHackathonTeams.find((t) => myTeamCodes.has(t.teamCode)) ?? null;

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("prize");
  const [confirmTarget, setConfirmTarget] = useState<typeof hackathonTeams[0] | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsDesktop(window.innerWidth >= 1024);
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [slug]);

  // Scroll Spy
  useEffect(() => {
    if (!mounted) return;
    const ids = SECTIONS.map((s) => s.id);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [mounted]);

  if (!initialized || !mounted) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="card"
            style={{ height: 120, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }}
          />
        ))}
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔍</div>
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--text)" }}>
          해커톤을 찾을 수 없습니다
        </div>
        <div style={{ color: "var(--muted)", marginBottom: "1.5rem" }}>
          해당 슬러그의 해커톤이 존재하지 않습니다.
        </div>
        <Link
          href="/hackathons"
          style={{
            display: "inline-block",
            padding: "0.6rem 1.25rem",
            background: "var(--accent)",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          목록으로 돌아가기
        </Link>
      </div>
    );
  }

  const rushMode = isRushMode(hackathon.period.submissionDeadlineAt);
  const dday = dDayLabel(hackathon.period.submissionDeadlineAt);
  const isBookmarked = profile?.bookmarks.includes(slug) ?? false;

  // HackHack Gauge
  const fever = Math.min(hackathonTeams.length / 10, 1);
  const gaugeLabel = fever >= 0.7 ? "💨 핵핵!" : fever >= 0.3 ? "🏃 달리는 중" : "🚶 잠잠";
  const gaugeColor = fever >= 0.7 ? "#ef4444" : fever >= 0.3 ? "#f59e0b" : "var(--muted)";

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <StatusBadge status={hackathon.status} />
          {hackathon.status !== "ended" && (
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: rushMode ? "#ef4444" : "var(--muted)" }}>
              {rushMode ? `🔥 ${dday}` : dday}
            </span>
          )}
          <button
            onClick={() => profile && toggleBookmark(slug)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "0.35rem 0.75rem",
              cursor: "pointer",
              color: isBookmarked ? "#f59e0b" : "var(--muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
          >
            {isBookmarked ? "★ 북마크됨" : "☆ 북마크"}
          </button>
        </div>

        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: "0.75rem", lineHeight: 1.3 }}>
          {hackathon.title}
        </h1>

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
          {hackathon.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        {/* HackHack Gauge */}
        <div
          className="card"
          style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.25rem" }}>핵핵 게이지</div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: gaugeColor }}>{gaugeLabel}</div>
          </div>
          <div style={{ flex: 1, height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${Math.max(fever * 100, 4)}%`,
                height: "100%",
                background: gaugeColor,
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            />
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
            팀 {hackathonTeams.length}
          </div>
        </div>
      </div>

      {/* 사이드바 + 본문 레이아웃 */}
      <div style={{ display: "flex", gap: "2rem", alignItems: "flex-start" }}>
        {/* 사이드바 */}
        {isDesktop && (
          <aside style={{ width: 160, flexShrink: 0, position: "sticky", top: 90 }}>
            <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
              {SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollToSection(s.id)}
                  style={{
                    background: "none",
                    border: "none",
                    borderLeft: activeSection === s.id ? "3px solid var(--accent)" : "3px solid transparent",
                    padding: "0.45rem 0.75rem",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.875rem",
                    fontWeight: activeSection === s.id ? 700 : 400,
                    color: activeSection === s.id ? "#a78bfa" : "var(--muted)",
                    borderRadius: "0 6px 6px 0",
                    transition: "all 0.15s",
                  }}
                >
                  {s.label}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* 본문 */}
        <main style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "3rem", paddingBottom: "60vh" }}>
          {/* 섹션 1: 상금 */}
          <section id="prize">
            <h2 className="section-title">상금</h2>
            {detail?.sections.prize?.items ? (
              <div className="card" style={{ padding: "1.25rem", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "0.6rem 0.75rem", color: "var(--muted)", fontSize: "0.8rem", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>순위</th>
                      <th style={{ textAlign: "right", padding: "0.6rem 0.75rem", color: "var(--muted)", fontSize: "0.8rem", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>상금</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.sections.prize.items.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: "0.75rem", borderBottom: i < detail.sections.prize!.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                          <span style={{ fontSize: "1.1rem", marginRight: "0.5rem" }}>{MEDAL_EMOJI[item.place] ?? item.place}</span>
                          <span style={{ fontWeight: 700, color: MEDAL_COLORS[item.place] ?? "var(--text)" }}>{item.place}</span>
                        </td>
                        <td style={{ padding: "0.75rem", textAlign: "right", fontWeight: 800, fontSize: "1.1rem", color: MEDAL_COLORS[item.place] ?? "var(--text)", borderBottom: i < detail.sections.prize!.items.length - 1 ? "1px solid var(--border)" : "none" }}>
                          {formatPrize(item.amountKRW)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                상금 정보가 없습니다.
              </div>
            )}
          </section>

          {/* 섹션 2: 리더보드 */}
          <section id="leaderboard">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="section-title" style={{ margin: 0 }}>순위</h2>
              {leaderboard && (
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  업데이트: {new Date(leaderboard.updatedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </div>
            {detail?.sections.leaderboard?.note && (
              <div style={{ marginBottom: "0.75rem", padding: "0.6rem 0.875rem", background: "var(--surface2)", borderRadius: 8, fontSize: "0.8rem", color: "var(--muted)", borderLeft: "3px solid var(--accent)" }}>
                {detail.sections.leaderboard.note}
              </div>
            )}
            {leaderboard && leaderboard.entries.length > 0 ? (
              <div className="card" style={{ overflow: "hidden" }}>
                {leaderboard.entries.map((entry, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.875rem 1.25rem",
                      borderBottom: i < leaderboard.entries.length - 1 ? "1px solid var(--border)" : "none",
                      background: i < 3 ? `rgba(124,58,237,${0.05 - i * 0.015})` : "transparent",
                    }}
                  >
                    <div style={{ width: 32, textAlign: "center", fontSize: i < 3 ? "1.2rem" : "0.95rem", fontWeight: 800, color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : "var(--muted)" }}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : entry.rank}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.teamName}</div>
                      {entry.scoreBreakdown && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.2rem" }}>
                          참가자 {entry.scoreBreakdown.participant.toFixed(1)} · 심사위원 {entry.scoreBreakdown.judge.toFixed(1)}
                        </div>
                      )}
                      {entry.artifacts && (
                        <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem" }}>
                          {entry.artifacts.webUrl && (
                            <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>🔗 웹</a>
                          )}
                          {entry.artifacts.pdfUrl && (
                            <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.75rem", color: "var(--accent)", textDecoration: "none" }}>📄 PDF</a>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ fontWeight: 800, color: i < 3 ? "#a78bfa" : "var(--text)", fontSize: "1rem" }}>
                      {entry.score < 1 && entry.score > 0 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", whiteSpace: "nowrap" }}>
                      {new Date(entry.submittedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📊</div>
                <div style={{ color: "var(--muted)" }}>아직 순위 데이터가 없습니다.</div>
              </div>
            )}

            {/* 미제출 팀 */}
            {unsubmittedTeams.length > 0 && (
              <div style={{ marginTop: "0.75rem" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.5rem", paddingLeft: "0.25rem" }}>
                  미제출
                </div>
                <div className="card" style={{ overflow: "hidden" }}>
                  {unsubmittedTeams.map((team, i) => (
                    <div
                      key={team.teamCode}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.75rem 1.25rem",
                        borderBottom: i < unsubmittedTeams.length - 1 ? "1px solid var(--border)" : "none",
                        opacity: 0.6,
                      }}
                    >
                      <div style={{ width: 32, textAlign: "center", fontSize: "0.85rem", color: "var(--muted)" }}>—</div>
                      <div style={{ flex: 1, fontWeight: 600, color: "var(--muted)", fontSize: "0.9rem" }}>{team.name}</div>
                      <div style={{ fontSize: "0.75rem", padding: "0.15rem 0.6rem", borderRadius: 9999, background: "rgba(107,107,128,0.1)", border: "1px solid rgba(107,107,128,0.2)", color: "var(--muted)", whiteSpace: "nowrap" }}>
                        미제출
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* 섹션 3: 개요 */}
          <section id="overview">
            <h2 className="section-title">대회 소개</h2>
            {detail ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="card" style={{ padding: "1.25rem" }}>
                  <p style={{ color: "var(--text)", lineHeight: 1.7, margin: 0 }}>{detail.sections.overview.summary}</p>
                </div>

                <div className="card" style={{ padding: "1.25rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.3rem" }}>개인 참가</div>
                    <div style={{ fontWeight: 700, color: detail.sections.overview.teamPolicy.allowSolo ? "#10b981" : "#ef4444" }}>
                      {detail.sections.overview.teamPolicy.allowSolo ? "✅ 가능" : "❌ 불가"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.3rem" }}>최대 팀 인원</div>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{detail.sections.overview.teamPolicy.maxTeamSize}명</div>
                  </div>
                </div>

                {detail.sections.info.notice.length > 0 && (
                  <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "var(--text)" }}>📢 유의사항</div>
                    <ul style={{ margin: 0, padding: "0 0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {detail.sections.info.notice.map((n, i) => (
                        <li key={i} style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <a
                    href={detail.sections.info.links.rules}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                  >
                    📋 대회 규정
                  </a>
                  <a
                    href={detail.sections.info.links.faq}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}
                  >
                    ❓ FAQ
                  </a>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                상세 정보가 없습니다.
              </div>
            )}
          </section>

          {/* 섹션 4: 일정 */}
          <section id="schedule">
            <h2 className="section-title">일정</h2>
            {detail?.sections.schedule.milestones ? (
              <div className="card" style={{ padding: "1.5rem" }}>
                {detail.sections.schedule.milestones.map((m, i) => {
                  const isPast = new Date(m.at) < new Date();
                  const isNext = !isPast && detail.sections.schedule.milestones.slice(0, i).every((prev) => new Date(prev.at) < new Date());
                  return (
                    <div key={i} style={{ display: "flex", gap: "1rem", paddingBottom: i < detail.sections.schedule.milestones.length - 1 ? "1.5rem" : 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                        <div
                          style={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: isNext ? "var(--accent)" : isPast ? "var(--border)" : "var(--surface2)",
                            border: isNext ? "2px solid #a78bfa" : "2px solid var(--border)",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                        {i < detail.sections.schedule.milestones.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: i < detail.sections.schedule.milestones.length - 1 ? "0.5rem" : 0 }}>
                        <div style={{ fontWeight: isNext ? 700 : 600, color: isNext ? "#a78bfa" : isPast ? "var(--muted)" : "var(--text)", fontSize: "0.9rem" }}>
                          {m.name}
                          {isNext && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", background: "var(--accent)", color: "#fff", padding: "0.1rem 0.4rem", borderRadius: 4 }}>다음</span>}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: isPast ? "var(--muted)" : "var(--muted)", marginTop: "0.2rem" }}>
                          {new Date(m.at).toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                일정 정보가 없습니다.
              </div>
            )}
          </section>

          {/* 섹션 5: 평가 기준 */}
          <section id="eval">
            <h2 className="section-title">평가 기준</h2>
            {detail ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="card" style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#a78bfa", marginBottom: "0.5rem" }}>
                    {detail.sections.eval.metricName}
                  </div>
                  <p style={{ color: "var(--muted)", margin: 0, lineHeight: 1.6, fontSize: "0.9rem" }}>
                    {detail.sections.eval.description}
                  </p>
                </div>

                {(detail.sections.eval.limits?.maxRuntimeSec || detail.sections.eval.limits?.maxSubmissionsPerDay) && (
                  <div className="card" style={{ padding: "1.25rem", display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
                    {detail.sections.eval.limits?.maxRuntimeSec && (
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.3rem" }}>최대 실행 시간</div>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>{detail.sections.eval.limits.maxRuntimeSec / 60}분</div>
                      </div>
                    )}
                    {detail.sections.eval.limits?.maxSubmissionsPerDay && (
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "0.3rem" }}>일일 제출 제한</div>
                        <div style={{ fontWeight: 700, color: "var(--text)" }}>일 {detail.sections.eval.limits.maxSubmissionsPerDay}회</div>
                      </div>
                    )}
                  </div>
                )}

                {detail.sections.eval.scoreDisplay && (
                  <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ fontWeight: 700, marginBottom: "0.75rem", color: "var(--text)" }}>
                      {detail.sections.eval.scoreDisplay.label}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {detail.sections.eval.scoreDisplay.breakdown.map((b, i) => (
                        <div key={i}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>{b.label}</span>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#a78bfa" }}>{b.weightPercent}%</span>
                          </div>
                          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${b.weightPercent}%`, height: "100%", background: "var(--accent)", borderRadius: 3 }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
                평가 정보가 없습니다.
              </div>
            )}
          </section>

          {/* 섹션 6: 팀 찾기 */}
          <section id="teams">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h2 className="section-title" style={{ margin: 0 }}>팀 찾기</h2>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                {hackathon.status !== "ended" && (
                  <Link
                    href={`/camp?hackathon=${slug}`}
                    style={{
                      fontSize: "0.8rem", fontWeight: 700, color: "#a78bfa",
                      padding: "0.35rem 0.75rem", borderRadius: 8,
                      border: "1px solid rgba(124,58,237,0.3)",
                      background: "rgba(124,58,237,0.08)",
                      textDecoration: "none",
                    }}
                  >
                    + 팀 만들기
                  </Link>
                )}
                {detail?.sections.teams.campEnabled && (
                  <Link
                    href={detail.sections.teams.listUrl}
                    style={{ fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}
                  >
                    팀 캠프 →
                  </Link>
                )}
              </div>
            </div>

            {hackathonTeams.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {hackathonTeams.map((team) => {
                  const isMember = myTeamCodes.has(team.teamCode);
                  return (
                  <div
                    key={team.teamCode}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      gap: "1rem",
                      alignItems: "flex-start",
                      border: isMember ? "1px solid rgba(16,185,129,0.3)" : undefined,
                      background: isMember ? "rgba(16,185,129,0.04)" : undefined,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <span style={{ fontWeight: 700, color: "var(--text)" }}>{team.name}</span>
                        {isMember ? (
                          <span style={{ fontSize: "0.7rem", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "0.15rem 0.4rem", borderRadius: 4, fontWeight: 600 }}>
                            ✓ 소속된 팀
                          </span>
                        ) : team.isOpen && (
                          <span style={{ fontSize: "0.7rem", background: "rgba(16,185,129,0.15)", color: "#10b981", padding: "0.15rem 0.4rem", borderRadius: 4, fontWeight: 600 }}>
                            모집중
                          </span>
                        )}
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
                          {team.memberCount}명
                        </span>
                      </div>
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: "0 0 0.6rem", lineHeight: 1.5 }}>{team.intro}</p>
                      {team.lookingFor.length > 0 && (
                        <div style={{ marginBottom: "0.6rem" }}>
                          <span style={{ fontSize: "0.68rem", color: "var(--muted)", display: "block", marginBottom: "0.3rem" }}>🔍 구인중</span>
                          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                            {team.lookingFor.map((role) => (
                              <span
                                key={role}
                                style={{
                                  fontSize: "0.72rem",
                                  padding: "0.15rem 0.5rem",
                                  borderRadius: 4,
                                  background: `${ROLE_COLORS[role] ?? "#6b7280"}22`,
                                  color: ROLE_COLORS[role] ?? "var(--muted)",
                                  fontWeight: 600,
                                }}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {isMember ? (
                      <Link
                        href="/myteam"
                        style={{
                          flexShrink: 0,
                          padding: "0.45rem 0.875rem",
                          background: "rgba(16,185,129,0.1)",
                          color: "#10b981",
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          border: "1px solid rgba(16,185,129,0.25)",
                        }}
                      >
                        내 팀 보기 →
                      </Link>
                    ) : hackathon.status === "ended" ? (
                      <span style={{
                        flexShrink: 0,
                        padding: "0.45rem 0.875rem",
                        background: "rgba(107,107,128,0.08)",
                        color: "var(--muted)",
                        borderRadius: 8,
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        border: "1px solid rgba(107,107,128,0.2)",
                        whiteSpace: "nowrap",
                      }}>
                        🔒 지원 불가
                      </span>
                    ) : team.isOpen && (
                      <button
                        onClick={() => setConfirmTarget(team)}
                        style={{
                          flexShrink: 0,
                          padding: "0.45rem 0.875rem",
                          background: "var(--accent)",
                          color: "#fff",
                          borderRadius: 8,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          border: "none",
                          cursor: "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        지원하기
                      </button>
                    )}
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
                <div style={{ color: "var(--muted)", marginBottom: "1rem" }}>등록된 팀이 없습니다.</div>
                {detail?.sections.teams.campEnabled && (
                  <Link
                    href={detail.sections.teams.listUrl}
                    style={{
                      display: "inline-block",
                      padding: "0.5rem 1.25rem",
                      background: "var(--accent)",
                      color: "#fff",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    팀 캠프에서 팀 찾기
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* 섹션 7: 제출 */}
          <section id="submit">
            <h2 className="section-title">제출</h2>
            {hackathon.status === "ended" ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔒</div>
                <div style={{ fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem" }}>제출 마감</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>이 해커톤의 제출 기간이 종료되었습니다.</div>
              </div>
            ) : myTeamInHackathon ? (
              <div className="card" style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(124,58,237,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>📤</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>제출은 팀 스페이스에서 진행됩니다</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.15rem" }}>
                      <strong style={{ color: "#a78bfa" }}>{myTeamInHackathon.name}</strong> 팀의 스페이스에서 결과물을 제출하세요
                    </div>
                  </div>
                </div>
                {detail?.sections.submit?.guide && detail.sections.submit.guide.length > 0 && (
                  <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "0.875rem", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--muted)", marginBottom: "0.5rem" }}>제출 가이드</div>
                    <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                      {detail.sections.submit.guide.map((g, i) => (
                        <li key={i} style={{ fontSize: "0.83rem", color: "var(--text)", lineHeight: 1.6 }}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link
                  href={`/space/${myTeamInHackathon.teamCode}`}
                  style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}
                >
                  🏠 팀 스페이스로 이동 →
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🏕️</div>
                <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>팀이 없습니다</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                  제출하려면 먼저 팀에 합류하거나 만들어야 합니다
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => scrollToSection("teams")}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: 8, background: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.3)", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}
                  >
                    팀 찾기 →
                  </button>
                  <Link
                    href={`/camp?hackathon=${slug}`}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}
                  >
                    팀 만들기 →
                  </Link>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* 지원하기 유의사항 확인 모달 */}
      {confirmTarget && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => setConfirmTarget(null)}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 440, padding: "1.75rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontWeight: 800, fontSize: "1.1rem", marginBottom: "0.25rem", color: "var(--text)" }}>
              팀 지원 전 확인사항
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
              <strong style={{ color: "var(--text)" }}>{confirmTarget.name}</strong> 팀에 지원하기 전 아래 내용을 확인해주세요.
            </p>

            {detail?.sections.info.notice && detail.sections.info.notice.length > 0 && (
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "1rem", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: "0.5rem", color: "#f59e0b" }}>📢 대회 유의사항</div>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {detail.sections.info.notice.map((n, i) => (
                    <li key={i} style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1.5rem", padding: "0.75rem", background: "var(--surface2)", borderRadius: 8, borderLeft: "3px solid rgba(124,58,237,0.4)" }}>
              지원하기를 누르면 팀의 연락처 링크로 이동합니다. 팀과 직접 소통 후 합류 여부를 결정해주세요.
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmTarget(null)}
                style={{ padding: "0.55rem 1rem", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: "0.85rem", cursor: "pointer" }}
              >
                취소
              </button>
              <a
                href={confirmTarget.contact.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setConfirmTarget(null)}
                style={{ padding: "0.55rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}
              >
                확인했습니다, 지원하기 →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
