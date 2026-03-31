"use client";

import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";
import type { Badge } from "@/lib/types";

// 전체 배지 정의
const ALL_BADGES: Omit<Badge, "earnedAt">[] = [
  { id: "first_spark", emoji: "🔥", label: "첫 불꽃", description: "플랫폼 최초 방문 + 닉네임 설정" },
  { id: "duo_buddy", emoji: "🤝", label: "최강단짝", description: "첫 팀 생성 또는 팀 합류" },
  { id: "submitted", emoji: "📦", label: "제출 완료!", description: "첫 결과물 제출" },
  { id: "top3", emoji: "🏅", label: "취미를 넘어선", description: "리더보드 3위 이내 진입" },
  { id: "top2", emoji: "🥈", label: "밤을 밝혀낸 자", description: "리더보드 2위 진입" },
  { id: "top1", emoji: "🏆", label: "전설이 된 마스터", description: "리더보드 1위 달성" },
  { id: "regular", emoji: "🔁", label: "단골손님", description: "2개 이상 해커톤 참가" },
];

const TIMELINE_ICONS: Record<string, string> = {
  join: "🏁",
  submit: "📤",
  rank: "🏅",
};

function EditNicknameModal({ current, onClose }: { current: string; onClose: () => void }) {
  const { updateNickname } = useStore();
  const [value, setValue] = useState(current);
  const [error, setError] = useState("");

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed.length < 2) { setError("2자 이상 입력해주세요"); return; }
    if (trimmed.length > 12) { setError("12자 이하로 입력해주세요"); return; }
    if (/\s/.test(trimmed)) { setError("공백은 사용할 수 없습니다"); return; }
    updateNickname(trimmed);
    toast.success("닉네임이 변경됐습니다");
    onClose();
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "2rem", width: "100%", maxWidth: 380 }}>
        <h3 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>닉네임 수정</h3>
        <input
          autoFocus
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(""); }}
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
          maxLength={12}
          style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: error ? "1px solid #ef4444" : "1px solid var(--border)", color: "var(--text)", fontSize: "0.95rem", marginBottom: 6 }}
        />
        {error && <div style={{ fontSize: "0.78rem", color: "#ef4444", marginBottom: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "0.5rem", borderRadius: 8, background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}>취소</button>
          <button onClick={handleSave} style={{ flex: 2, padding: "0.5rem", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontWeight: 700, cursor: "pointer" }}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { profile, hackathons, initialized } = useStore();
  const [showEdit, setShowEdit] = useState(false);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!cardRef.current || !profile) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "#12121a",
        scale: 2,
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${profile.nickname}-hackhack-card.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("배지 카드를 저장했습니다 🎉");
      });
    } catch {
      toast.error("내보내기에 실패했습니다");
    } finally {
      setExporting(false);
    }
  };

  if (!initialized) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {[120, 200, 180].map((h, i) => (
          <div key={i} style={{ height: h, borderRadius: 12, background: "var(--surface)", animation: "pulse 1.5s ease-in-out infinite" }} />
        ))}
        <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 2rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👤</div>
        <div style={{ fontWeight: 700, marginBottom: "0.375rem" }}>아직 닉네임이 설정되지 않았습니다</div>
        <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>닉네임 모달이 자동으로 표시됩니다</div>
      </div>
    );
  }

  const earnedIds = new Set(profile.badges.map((b) => b.id));
  const bookmarkedHackathons = hackathons.filter((h) => profile.bookmarks.includes(h.slug));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      {/* ── 헤더: 닉네임 ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1.25rem",
          padding: "1.75rem 2rem",
          background: "linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 100%)",
          borderRadius: 16,
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "rgba(124,58,237,0.2)",
            border: "2px solid rgba(124,58,237,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.75rem",
            flexShrink: 0,
          }}
        >
          {profile.nickname[0]}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>{profile.nickname}</div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
            배지 {profile.badges.length}개 · 북마크 {profile.bookmarks.length}개
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 8,
            fontSize: "0.8rem",
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            cursor: "pointer",
          }}
        >
          ✏️ 수정
        </button>
      </div>

      {/* ── 배지 카드 (내보내기 영역) ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>🏅 성장 배지</div>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontWeight: 600,
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              color: "#a78bfa",
              cursor: exporting ? "default" : "pointer",
              opacity: exporting ? 0.6 : 1,
            }}
          >
            {exporting ? "내보내는 중..." : "📸 카드 이미지로 저장"}
          </button>
        </div>

        {/* 배지 카드 (캡처 대상) */}
        <div
          ref={cardRef}
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "1.5rem",
          }}
        >
          <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: "1rem" }}>
            핵핵 · {profile.nickname}의 배지 컬렉션
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
            {ALL_BADGES.map((badge) => {
              const earned = earnedIds.has(badge.id);
              const earnedBadge = profile.badges.find((b) => b.id === badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    padding: "1rem",
                    borderRadius: 12,
                    background: earned ? "rgba(124,58,237,0.1)" : "rgba(107,107,128,0.06)",
                    border: earned ? "1px solid rgba(124,58,237,0.25)" : "1px solid rgba(107,107,128,0.15)",
                    textAlign: "center",
                    opacity: earned ? 1 : 0.45,
                    filter: earned ? "none" : "grayscale(0.8)",
                    transition: "all 0.2s",
                  }}
                  title={earned ? `${earnedBadge?.earnedAt ? new Date(earnedBadge.earnedAt).toLocaleDateString("ko-KR") + " 획득" : ""}` : "미획득"}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.375rem" }}>{earned ? badge.emoji : "🔒"}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.8rem", color: earned ? "var(--text)" : "var(--muted)" }}>
                    {badge.label}
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 3, lineHeight: 1.4 }}>
                    {badge.description}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 여정 타임라인 ── */}
      <div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🗓️ 해커톤 여정</div>
        {profile.timeline.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>아직 기록이 없습니다. 해커톤에 참가해보세요!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {[...profile.timeline].reverse().map((event, idx) => (
              <div key={idx} style={{ display: "flex", gap: "1rem", position: "relative" }}>
                {/* 타임라인 선 */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36, flexShrink: 0 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "rgba(124,58,237,0.15)",
                      border: "1px solid rgba(124,58,237,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      flexShrink: 0,
                    }}
                  >
                    {TIMELINE_ICONS[event.type]}
                  </div>
                  {idx < profile.timeline.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "var(--border)", minHeight: 20 }} />
                  )}
                </div>
                <div style={{ paddingBottom: idx < profile.timeline.length - 1 ? "1.25rem" : 0, paddingTop: "0.5rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{event.hackathonTitle}</div>
                  {event.detail && (
                    <div style={{ fontSize: "0.8rem", color: "#a78bfa", marginTop: 2 }}>{event.detail}</div>
                  )}
                  <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>
                    {new Date(event.at).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── 북마크 해커톤 ── */}
      <div>
        <div style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "1rem" }}>🔖 북마크한 해커톤</div>
        {bookmarkedHackathons.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)" }}>
            <div style={{ color: "var(--muted)", fontSize: "0.875rem" }}>
              북마크한 해커톤이 없습니다.{" "}
              <Link href="/hackathons" style={{ color: "#a78bfa" }}>해커톤 목록</Link>에서 관심 대회를 저장해보세요
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {bookmarkedHackathons.map((h) => (
              <Link key={h.slug} href={h.links.detail} style={{ textDecoration: "none" }}>
                <div className="card" style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.375rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {h.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                    마감 {new Date(h.period.submissionDeadlineAt).toLocaleDateString("ko-KR")}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {showEdit && (
        <EditNicknameModal current={profile.nickname} onClose={() => setShowEdit(false)} />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1}50%{opacity:.4} }`}</style>
    </div>
  );
}
