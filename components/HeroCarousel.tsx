"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useCallback } from "react";
import type { Hackathon } from "@/lib/types";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

const GRADIENT_COLORS = [
  "linear-gradient(135deg, #1a0a2e 0%, #0f0a1a 100%)",
  "linear-gradient(135deg, #0a1a2e 0%, #0a0f1a 100%)",
  "linear-gradient(135deg, #1a1a0a 0%, #0f1a0a 100%)",
  "linear-gradient(135deg, #2e0a1a 0%, #1a0a0f 100%)",
];

export default function HeroCarousel({ hackathons }: { hackathons: Hackathon[] }) {
  const featured = hackathons.filter((h) => h.status !== "ended");

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (featured.length === 0) return null;

  return (
    <div style={{ position: "relative" }}>
      <div ref={emblaRef} style={{ overflow: "hidden", borderRadius: 16 }}>
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
                  padding: "2.5rem 2rem",
                  position: "relative",
                  overflow: "hidden",
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
                    background: rush
                      ? "rgba(239,68,68,0.08)"
                      : "rgba(124,58,237,0.08)",
                    filter: "blur(60px)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
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
                    fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
                    fontWeight: 800,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                    lineHeight: 1.3,
                    maxWidth: 600,
                  }}
                >
                  {h.title}
                </h2>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
                  {h.tags.map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "1.75rem" }}>
                  {h.maxPrizeKRW && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 2 }}>최대 상금</div>
                      <div
                        style={{
                          fontSize: "1.5rem",
                          fontWeight: 800,
                          color: rush ? "#fbbf24" : "#a78bfa",
                        }}
                      >
                        {formatPrize(h.maxPrizeKRW)}
                      </div>
                    </div>
                  )}
                  {!rush && (
                    <div>
                      <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginBottom: 2 }}>마감까지</div>
                      <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text)" }}>
                        {dday}
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={h.links.detail}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: 8,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    background: rush ? "#ef4444" : "var(--accent)",
                    color: "#fff",
                    textDecoration: "none",
                    transition: "opacity 0.15s",
                  }}
                >
                  자세히 보기 →
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {featured.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(10,10,15,0.8)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ‹
          </button>
          <button
            onClick={scrollNext}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(10,10,15,0.8)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
