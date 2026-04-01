"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { Hackathon } from "@/lib/types";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

const AUTOPLAY_DELAY = 4000;

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 100%)",
  "linear-gradient(135deg, #0a1a0f 0%, #051a0a 100%)",
  "linear-gradient(135deg, #1a1505 0%, #2e2308 100%)",
  "linear-gradient(135deg, #05091a 0%, #0a102e 100%)",
];

const CTRL_BTN: React.CSSProperties = {
  width: 30,
  height: 30,
  borderRadius: 6,
  background: "rgba(255,255,255,0.1)",
  border: "1px solid rgba(255,255,255,0.18)",
  color: "var(--text)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.8rem",
  flexShrink: 0,
};

export default function HeroCarousel({ hackathons }: { hackathons: Hackathon[] }) {
  const featured = hackathons.filter((h) => h.status !== "ended");

  const autoplayPlugin = Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayPlugin]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  // progressKey resets the CSS animation on each slide change or play/pause
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCurrentIndex(emblaApi.selectedScrollSnap());
      setProgressKey((k) => k + 1);
    };
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const togglePlay = useCallback(() => {
    const ap = emblaApi?.plugins()?.autoplay as { play?: () => void; stop?: () => void } | undefined;
    if (isPlaying) ap?.stop?.();
    else ap?.play?.();
    setIsPlaying((p) => !p);
    setProgressKey((k) => k + 1);
  }, [emblaApi, isPlaying]);

  if (featured.length === 0) return null;

  const pageLabel =
    String(currentIndex + 1).padStart(2, "0") +
    " / " +
    String(featured.length).padStart(2, "0");

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      {/* Carousel viewport */}
      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {featured.map((h, i) => {
            const rush = isRushMode(h.period.submissionDeadlineAt);
            const dday = dDayLabel(h.period.submissionDeadlineAt);
            return (
              <div
                key={h.slug}
                style={{
                  flex: "0 0 100%",
                  minWidth: 0,
                  background: GRADIENT_COLORS[i % GRADIENT_COLORS.length],
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  /* bottom padding leaves room for the fixed control bar */
                  padding: "2rem 2rem 4.5rem",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  gap: "1.5rem",
                  alignItems: "center",
                }}
              >
                {/* Background glow */}
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: rush ? "rgba(239,68,68,0.08)" : "rgba(124,58,237,0.08)",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                  }}
                />

                {/* Left: text content */}
                <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <StatusBadge status={h.status} />
                    {rush && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          padding: "2px 8px",
                          borderRadius: 9999,
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          background: "rgba(239,68,68,0.15)",
                          color: "#ef4444",
                          border: "1px solid rgba(239,68,68,0.3)",
                        }}
                      >
                        🔥 마감 {dday} 남음
                      </span>
                    )}
                  </div>

                  <h2
                    style={{
                      fontSize: "clamp(1.05rem, 2.5vw, 1.45rem)",
                      fontWeight: 800,
                      color: "var(--text)",
                      marginBottom: "0.5rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {h.title}
                  </h2>

                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1rem" }}>
                    {h.tags.map((tag) => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.75rem", marginBottom: "1.25rem" }}>
                    {h.maxPrizeKRW && (
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: 2 }}>최대 상금</div>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: rush ? "#fbbf24" : "#a78bfa" }}>
                          {formatPrize(h.maxPrizeKRW)}
                        </div>
                      </div>
                    )}
                    {!rush && (
                      <div>
                        <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginBottom: 2 }}>마감까지</div>
                        <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text)" }}>{dday}</div>
                      </div>
                    )}
                  </div>

                  <Link
                    href={h.links.detail}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.6rem 1.2rem",
                      borderRadius: 8,
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      background: rush ? "#ef4444" : "var(--accent)",
                      color: "#fff",
                      textDecoration: "none",
                    }}
                  >
                    자세히 보기 →
                  </Link>
                </div>

                {/* Right: character image */}
                <div
                  className="banner-img-wrap"
                  style={{
                    width: 180,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    alignSelf: "stretch",
                  }}
                >
                  <img
                    src="/hongsineogget.png"
                    alt="핵핵 캐릭터"
                    style={{ width: "100%", height: "auto", objectFit: "contain", display: "block" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fixed control bar overlay ── */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 1.5rem 1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
          zIndex: 10,
        }}
      >
        {/* Page indicator + progress bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", minWidth: 60 }}>
          <span
            style={{
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.08em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pageLabel}
          </span>
          {/* Progress bar */}
          <div
            style={{
              width: 60,
              height: 2,
              borderRadius: 2,
              background: "rgba(255,255,255,0.15)",
              overflow: "hidden",
            }}
          >
            <div
              key={progressKey}
              style={{
                height: "100%",
                borderRadius: 2,
                background: "rgba(255,255,255,0.8)",
                transformOrigin: "left center",
                animation: isPlaying
                  ? `hh-progress ${AUTOPLAY_DELAY}ms linear forwards`
                  : "none",
                transform: isPlaying ? undefined : "scaleX(0)",
              }}
            />
          </div>
        </div>

        {/* Control buttons */}
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button onClick={scrollPrev} style={CTRL_BTN} aria-label="이전">◁</button>
          <button onClick={togglePlay} style={CTRL_BTN} aria-label={isPlaying ? "일시정지" : "재생"}>
            {isPlaying ? "‖" : "▶"}
          </button>
          <button onClick={scrollNext} style={CTRL_BTN} aria-label="다음">▷</button>
        </div>
      </div>

      <style>{`
        @keyframes hh-progress {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @media (max-width: 560px) {
          .banner-img-wrap { display: none !important; }
        }
      `}</style>
    </div>
  );
}
