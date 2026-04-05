"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { getHackathonDetail } from "@/lib/detailData";
import { formatPrize, dDayLabel, isRushMode, computeStatus } from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import { ROLE_COLORS } from "@/lib/constants";


const SECTIONS = [
  { id: "prize", label: "상금" },
  { id: "leaderboard", label: "순위" },
  { id: "overview", label: "대회 소개" },
  { id: "schedule", label: "일정" },
  { id: "eval", label: "평가 기준" },
  { id: "teams", label: "팀 찾기" },
  { id: "submit", label: "제출" },
];

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

  const hackathon = useMemo(
    () => hackathons.find((h) => h.slug === slug) ?? null,
    [hackathons, slug]
  );
  const hackathonTeams = useMemo(
    () => teams.filter((t) => t.hackathonSlug === slug && t.isOpen),
    [teams, slug]
  );
  const allHackathonTeams = useMemo(
    () => teams.filter((t) => t.hackathonSlug === slug),
    [teams, slug]
  );
  const myTeamCodes = useMemo(
    () => new Set(profile?.myTeamCodes ?? []),
    [profile?.myTeamCodes]
  );
  const leaderboard = useMemo(
    () => leaderboards.find((lb) => lb.hackathonSlug === slug) ?? null,
    [leaderboards, slug]
  );
  const detail = useMemo(() => getHackathonDetail(slug), [slug]);

  // 내 팀 (이 해커톤 소속)
  const myTeamInHackathon = useMemo(
    () => allHackathonTeams.find((t) => myTeamCodes.has(t.teamCode)) ?? null,
    [allHackathonTeams, myTeamCodes]
  );

  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState("prize");
  const [confirmTarget, setConfirmTarget] = useState<typeof hackathonTeams[0] | null>(null);
  const [infoModal, setInfoModal] = useState<"rules" | "faq" | null>(null);

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
        <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "0.5rem", color: "var(--text-main)" }}>
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

  const status = computeStatus(hackathon.period);
  const rushMode = isRushMode(hackathon.period.submissionDeadlineAt);
  const dday = dDayLabel(hackathon.period.submissionDeadlineAt);
  const isBookmarked = profile?.bookmarks.includes(slug) ?? false;

  // HackHack Gauge
  const fever = useMemo(() => Math.min(hackathonTeams.length / 10, 1), [hackathonTeams.length]);

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <StatusBadge status={status} variant="card" />
          {status !== "ended" && (
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

        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-main)", marginBottom: "0.75rem", lineHeight: "34px" }}>
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
          {/* 상태 캐릭터 */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#4b5563", letterSpacing: "0.224px", lineHeight: "16px" }}>
              {fever >= 0.7 ? "핵핵!" : fever >= 0.3 ? "달리는중" : "잠잠"}
            </span>
            <img
              src={fever >= 0.7 ? "/HackHack-gauge/핵핵.png" : fever >= 0.3 ? "/HackHack-gauge/달리는중.png" : "/HackHack-gauge/잠잠.png"}
              alt={fever >= 0.7 ? "핵핵!" : fever >= 0.3 ? "달리는 중" : "잠잠"}
              style={{ width: 32, height: 32, objectFit: "contain" }}
            />
          </div>

          {/* 프로그레스바 */}
          <div style={{ flex: 1, position: "relative", height: 8 }}>
            {/* 배경 */}
            <div style={{ position: "absolute", inset: 0, background: "#dee2e6", borderRadius: 4 }} />
            {/* 채워지는 바 */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${Math.max(fever * 100, 4)}%`,
                background: "#ff2e63",
                borderRadius: 4,
                transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
            {/* 열정게이지 (바 끝에 고정) */}
            <img
              src="/HackHack-gauge/열정게이지.svg"
              alt=""
              style={{
                position: "absolute",
                left: `${Math.max(fever * 100, 4)}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 46,
                height: 46,
                objectFit: "contain",
                transition: "left 0.8s cubic-bezier(0.4,0,0.2,1)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* 팀 수 */}
          <div style={{ fontSize: 12, color: "#6b6b80", whiteSpace: "nowrap", flexShrink: 0, fontWeight: 600, letterSpacing: "0.224px" }}>
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
                    color: activeSection === s.id ? "var(--brand-primary, #7c3aed)" : "var(--muted)",
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
              <div className="card" style={{ overflow: "hidden" }}>
                {detail.sections.prize.items.map((item, i) => {
                  const is1st = i === 0;
                  const rankColor = is1st ? "var(--brand-primary)" : "var(--text-main)";
                  const placeLabel = { "1st": "1위", "2nd": "2위", "3rd": "3위" }[item.place] ?? item.place;
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "0.875rem 1.25rem",
                        borderBottom: i < detail.sections.prize!.items.length - 1 ? "1px solid var(--border)" : "none",
                      }}
                    >
                      <div style={{ width: 40, flexShrink: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", lineHeight: "16px", color: rankColor }}>
                        {placeLabel}
                      </div>
                      <div style={{ flex: 1 }} />
                      <div style={{ fontSize: 16, fontWeight: 700, color: rankColor, fontVariantNumeric: "tabular-nums" }}>
                        {formatPrize(item.amountKRW)}
                      </div>
                    </div>
                  );
                })}
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
              <p style={{ marginBottom: "0.75rem", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>
                {detail.sections.leaderboard.note}
              </p>
            )}
            {leaderboard && leaderboard.entries.length > 0 ? (
              <div className="card" style={{ overflow: "hidden" }}>
                {leaderboard.entries.map((entry, i) => {
                  const is1st = i === 0;
                  const rankColor = is1st ? "var(--brand-primary)" : "var(--text-main)";
                  return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "0.875rem 1.25rem",
                      borderBottom: i < leaderboard.entries.length - 1 ? "1px solid var(--border)" : "none",
                    }}
                  >
                    <div style={{ width: 40, flexShrink: 0, fontSize: 12, fontWeight: 600, letterSpacing: "0.224px", lineHeight: "16px", color: rankColor }}>
                      {entry.rank}위
                    </div>
                    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: rankColor, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{entry.teamName}</div>
                      {entry.scoreBreakdown && (
                        <div style={{ fontSize: 12, fontWeight: 400, lineHeight: "16px", letterSpacing: "0.224px", color: "var(--text-muted)" }}>
                          참가자 {entry.scoreBreakdown.participant.toFixed(1)} · 심사위원 {entry.scoreBreakdown.judge.toFixed(1)}
                        </div>
                      )}
                      {entry.artifacts && (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {entry.artifacts.webUrl && (
                            <a href={entry.artifacts.webUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}>웹</a>
                          )}
                          {entry.artifacts.pdfUrl && (
                            <a href={entry.artifacts.pdfUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}>PDF</a>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, lineHeight: "24px", color: "var(--brand-primary)", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      {entry.score < 1 && entry.score > 0 ? entry.score.toFixed(4) : entry.score.toFixed(1)}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap", letterSpacing: "0.224px" }}>
                      {new Date(entry.submittedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ color: "var(--muted)" }}>아직 순위 데이터가 없습니다.</div>
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

                <div className="card" style={{ padding: "1.25rem", display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.224px", marginBottom: "0.3rem" }}>개인 참가</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: detail.sections.overview.teamPolicy.allowSolo ? "var(--brand-secondary, #ff2e63)" : "var(--status-ended-text)" }}>
                      {detail.sections.overview.teamPolicy.allowSolo ? "가능" : "불가"}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.224px", marginBottom: "0.3rem" }}>최대 팀 인원</div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main)" }}>{detail.sections.overview.teamPolicy.maxTeamSize}명</div>
                  </div>
                </div>

                {detail.sections.info.notice.length > 0 && (
                  <div className="card" style={{ padding: "1.25rem" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: "0.75rem", color: "var(--text-main)" }}>유의사항</div>
                    <ul style={{ margin: 0, padding: "0 0 0 1.25rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {detail.sections.info.notice.map((n, i) => (
                        <li key={i} style={{ color: "var(--text-muted)", fontSize: 13, lineHeight: 1.6 }}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(detail.sections.info.rulesContent || detail.sections.info.links.rules || detail.sections.info.faqContent || detail.sections.info.links.faq) && (
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    {(detail.sections.info.rulesContent || detail.sections.info.links.rules) && (
                      detail.sections.info.rulesContent ? (
                        <button
                          onClick={() => setInfoModal("rules")}
                          style={{ padding: "0.5rem 1rem", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          대회 규정
                        </button>
                      ) : (
                        <a href={detail.sections.info.links.rules} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-main)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                          대회 규정
                        </a>
                      )
                    )}
                    {(detail.sections.info.faqContent || detail.sections.info.links.faq) && (
                      detail.sections.info.faqContent ? (
                        <button
                          onClick={() => setInfoModal("faq")}
                          style={{ padding: "0.5rem 1rem", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-main)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                        >
                          FAQ
                        </button>
                      ) : (
                        <a href={detail.sections.info.links.faq} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", padding: "0.5rem 1rem", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: 8, color: "var(--text-main)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
                          FAQ
                        </a>
                      )
                    )}
                  </div>
                )}
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
                            border: isNext ? "2px solid var(--brand-primary)" : "2px solid var(--border)",
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                        {i < detail.sections.schedule.milestones.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "var(--border)", marginTop: 4 }} />
                        )}
                      </div>
                      <div style={{ flex: 1, paddingBottom: i < detail.sections.schedule.milestones.length - 1 ? "0.5rem" : 0 }}>
                        <div style={{ fontWeight: isNext ? 700 : 600, color: isNext ? "var(--brand-primary)" : isPast ? "var(--text-muted)" : "var(--text-main)", fontSize: 14 }}>
                          {m.name}
                          {isNext && <span style={{ marginLeft: "0.5rem", fontSize: 11, fontWeight: 600, background: "var(--brand-primary)", color: "var(--text-light)", padding: "2px 6px", borderRadius: 4, letterSpacing: "0.224px" }}>다음</span>}
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
                  <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main)", marginBottom: "0.5rem" }}>
                    {detail.sections.eval.metricName}
                  </div>
                  <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6, fontSize: 13 }}>
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
                            <span style={{ fontSize: 13, color: "var(--text-main)" }}>{b.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--brand-primary)" }}>{b.weightPercent}%</span>
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
              <div>
                <h2 className="section-title" style={{ margin: 0 }}>팀 찾기</h2>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>지금 팀원을 구하고 있어요</div>
              </div>
              <Link
                href="/camp"
                style={{ fontSize: 13, color: "var(--brand-primary)", textDecoration: "none", fontWeight: 600 }}
              >
                더 많은 팀 보기 →
              </Link>
            </div>

            {hackathonTeams.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {hackathonTeams.slice(0, 3).map((team) => {
                  const isMember = myTeamCodes.has(team.teamCode);
                  return (
                  <div
                    key={team.teamCode}
                    className="card"
                    style={{
                      padding: "1.25rem",
                      display: "flex",
                      flexDirection: "row",
                      gap: "1rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-main)" }}>{team.name}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                          <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>팀원</span>
                          <span style={{ color: "var(--brand-primary)", fontWeight: 600, letterSpacing: "0.224px" }}>{team.memberCount}/{team.maxMembers}명</span>
                        </div>
                        {isMember && (
                          <span style={{ fontSize: 12, background: "rgba(255,46,99,0.15)", color: "var(--brand-secondary)", padding: "2px 6px", borderRadius: 4, fontWeight: 600, letterSpacing: "0.224px" }}>
                            소속된 팀
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 0.6rem", lineHeight: 1.6 }}>{team.intro}</p>
                      {team.lookingFor.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {team.lookingFor.map((role) => (
                            <span key={role} className="tag-team">{role}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      {isMember ? (
                        <Link href="/myteam" className="btn-my-team">
                          내 팀 보기 →
                        </Link>
                      ) : status === "ended" ? (
                        <span style={{ padding: "8px 16px", background: "rgba(107,107,128,0.08)", color: "var(--text-muted)", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "1px solid rgba(107,107,128,0.2)", whiteSpace: "nowrap", display: "inline-block" }}>
                          지원 마감
                        </span>
                      ) : team.isOpen && (
                        <button
                          onClick={() => setConfirmTarget(team)}
                          style={{ padding: "8px 16px", background: "var(--brand-primary)", color: "var(--text-light)", borderRadius: 6, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}
                        >
                          합류하기
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <div className="card" style={{ padding: "2.5rem", textAlign: "center" }}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: "1rem" }}>등록된 팀이 없습니다.</div>
                {detail?.sections.teams.campEnabled && (
                  <Link
                    href={detail.sections.teams.listUrl}
                    style={{ display: "inline-block", padding: "8px 20px", background: "var(--brand-primary)", color: "var(--text-light)", borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600 }}
                  >
                    팀 캠프에서 팀 찾기
                  </Link>
                )}
              </div>
            )}
          </section>

          {/* 섹션 7: 제출 */}
          <section id="submit">
            <h2 className="section-title">{status === "ended" ? "제출 마감" : "제출"}</h2>
            {status === "ended" ? (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontWeight: 700, color: "var(--muted)", marginBottom: "0.375rem" }}>제출 마감</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>이 해커톤의 제출 기간이 종료되었습니다.</div>
              </div>
            ) : myTeamInHackathon ? (
              <div className="card" style={{ padding: "1.5rem" }}>
                <div style={{ marginBottom: "1rem" }}>
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
                  팀 스페이스로 이동 →
                </Link>
              </div>
            ) : (
              <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
                <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>팀이 없습니다</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
                  제출하려면 먼저 팀에 합류하거나 만들어야 합니다
                </div>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <Link
                    href={`/camp?hackathon=${slug}&random=1`}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}
                  >
                    랜덤 매칭
                  </Link>
                  <Link
                    href={`/camp?hackathon=${slug}`}
                    style={{ padding: "0.55rem 1.1rem", borderRadius: 8, background: "transparent", color: "var(--accent)", border: "1px solid rgba(124,58,237,0.35)", fontWeight: 700, textDecoration: "none", fontSize: "0.875rem" }}
                  >
                    팀 만들기 →
                  </Link>
                </div>
              </div>
            )}
          </section>

        </main>
      </div>

      {/* 합류하기 유의사항 확인 모달 */}
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
              팀 합류 전 확인사항
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "1.25rem" }}>
              <strong style={{ color: "var(--text)" }}>{confirmTarget.name}</strong> 팀에 합류하기 전 아래 내용을 확인해주세요.
            </p>

            {detail?.sections.info.notice && detail.sections.info.notice.length > 0 && (
              <div style={{ background: "var(--surface2)", borderRadius: 8, padding: "1rem", marginBottom: "1rem", border: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: 12, letterSpacing: "0.224px", marginBottom: "0.5rem", color: "var(--text-muted)" }}>대회 유의사항</div>
                <ul style={{ margin: 0, paddingLeft: "1.25rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {detail.sections.info.notice.map((n, i) => (
                    <li key={i} style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginBottom: "1.5rem", padding: "0.75rem", background: "var(--surface2)", borderRadius: 8, borderLeft: "3px solid rgba(124,58,237,0.4)" }}>
              합류하기를 누르면 팀의 연락처 링크로 이동합니다. 팀과 직접 소통 후 합류 여부를 결정해주세요.
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmTarget(null)}
                style={{ padding: "0.55rem 1rem", borderRadius: 8, border: "1px solid var(--border)", background: "transparent", color: "var(--muted)", fontSize: "0.85rem", cursor: "pointer" }}
              >
                취소
              </button>
              {confirmTarget.contact.url ? (
                <a
                  href={confirmTarget.contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setConfirmTarget(null)}
                  style={{ padding: "0.55rem 1.25rem", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: "0.85rem", fontWeight: 700, textDecoration: "none" }}
                >
                  확인했습니다, 합류하기 →
                </a>
              ) : (
                <button
                  onClick={() => setConfirmTarget(null)}
                  style={{ padding: "0.55rem 1.25rem", borderRadius: 8, background: "rgba(107,107,128,0.15)", color: "var(--muted)", fontSize: "0.85rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                >
                  연락처 없음 (닫기)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 대회 규정 / FAQ 팝업 */}
      {infoModal && detail && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}
          onClick={() => setInfoModal(null)}
        >
          <div
            className="card"
            style={{ width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontWeight: 800, fontSize: 16, color: "var(--text-main)" }}>
                {infoModal === "rules" ? "대회 규정" : "자주 묻는 질문"}
              </span>
              <button onClick={() => setInfoModal(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)", lineHeight: 1 }}>×</button>
            </div>

            {/* 본문 */}
            <div style={{ overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {infoModal === "rules" && detail.sections.info.rulesContent?.map((rule, i) => (
                <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--brand-primary)", flexShrink: 0, marginTop: 2 }}>{i + 1}</span>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-main)", lineHeight: 1.7 }}>{rule}</p>
                </div>
              ))}
              {infoModal === "faq" && detail.sections.info.faqContent?.map((item, i) => (
                <div key={i} style={{ borderBottom: i < (detail.sections.info.faqContent?.length ?? 0) - 1 ? "1px solid var(--border)" : "none", paddingBottom: "0.75rem" }}>
                  <p style={{ margin: "0 0 0.35rem", fontSize: 13, fontWeight: 700, color: "var(--text-main)" }}>Q. {item.q}</p>
                  <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)", lineHeight: 1.7 }}>A. {item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
