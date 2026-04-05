"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Hackathon } from "@/lib/types";
import { formatPrize, dDayLabel, isRushMode } from "@/lib/utils";

const AUTOPLAY_DELAY = 4000;

/* 슬라이드별 배경 — 사용자 지정: 1=다크그린, 2=블랙, 3=어두운파란 */
const SLIDE_BG: Record<string, string> = {
  "monthly-vibe-coding-2026-02": "#084627",
  "daker-handover-2026-03": "#0a0a0a",
  "next-ai-sprint-2026": "linear-gradient(162.77deg, #050a1a 0%, #081228 100%)",
};
const SLIDE_BG_FALLBACK = "linear-gradient(135deg, #0d0d1a 0%, #10102a 100%)";

/* 슬라이드별 glow 색상 */
const SLIDE_GLOW: Record<string, string> = {
  "monthly-vibe-coding-2026-02": "rgba(239,68,68,0.08)",
  "daker-handover-2026-03": "rgba(239,68,68,0.08)",
  "next-ai-sprint-2026": "rgba(124,58,237,0.1)",
};

/* 슬라이드별 콘텐츠 이미지 */
const SLIDE_IMG: Record<string, string> = {
  "monthly-vibe-coding-2026-02": "/content/monthly-vibe-coding.png",
  "daker-handover-2026-03": "/content/daker-handover.png",
  "next-ai-sprint-2026": "/content/next-ai-sprint.png",
};

export default function HeroCarousel({ hackathons }: { hackathons: Hackathon[] }) {
  const featured = hackathons.filter((h) => h.status !== "ended");

  /* Autoplay 인스턴스를 ref로 안정화 — 렌더마다 재생성 방지 */
  const autoplayRef = useRef(Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false }));
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplayRef.current]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
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

  const scrollPrev = useCallback(() => { emblaApi?.scrollPrev(); }, [emblaApi]);
  const scrollNext = useCallback(() => { emblaApi?.scrollNext(); }, [emblaApi]);

  /* isPlaying을 deps에서 제거 — setIsPlaying updater로 stale closure 방지 */
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const ap = emblaApi?.plugins()?.autoplay as { play?: () => void; stop?: () => void } | undefined;
      if (prev) ap?.stop?.();
      else ap?.play?.();
      return !prev;
    });
    setProgressKey((k) => k + 1);
  }, [emblaApi]);

  if (featured.length === 0) return null;

  const pageLabel =
    String(currentIndex + 1).padStart(2, "0") +
    " / " +
    String(featured.length).padStart(2, "0");

  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden" }}>
      <div ref={emblaRef} style={{ overflow: "hidden" }}>
        <div style={{ display: "flex" }}>
          {featured.map((h, idx) => {
            const rush = isRushMode(h.period.submissionDeadlineAt);
            const dday = dDayLabel(h.period.submissionDeadlineAt);
            const bg = SLIDE_BG[h.slug] ?? SLIDE_BG_FALLBACK;
            const glow = SLIDE_GLOW[h.slug] ?? "rgba(124,58,237,0.08)";
            const contentImg = SLIDE_IMG[h.slug];

            /* D-day 배지 텍스트 — 모든 슬라이드 동일 스타일 */
            const ddayText =
              dday === "마감" ? "🔥 D-Day 마감" :
              dday === "D-Day" ? "🔥 마감 D-Day 남음" :
              rush ? `🔥 마감 ${dday} 남음` : dday;

            return (
              <div
                key={h.slug}
                style={{
                  flex: "0 0 100%",
                  minWidth: 0,
                  height: 329,
                  background: bg,
                  borderRadius: 16,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* 배경 glow */}
                <div
                  style={{
                    position: "absolute",
                    top: -60,
                    right: -60,
                    width: 300,
                    height: 300,
                    borderRadius: "50%",
                    background: glow,
                    filter: "blur(60px)",
                    pointerEvents: "none",
                  }}
                />

                {/* 내부 레이아웃 */}
                <div
                  style={{
                    position: "absolute",
                    left: 40,
                    top: 33,
                    right: 40,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    gap: 24,
                  }}
                >
                  {/* 좌측 콘텐츠 */}
                  <div
                    style={{
                      flex: "1 1 608px",
                      maxWidth: 608,
                      display: "flex",
                      flexDirection: "column",
                      gap: 38,
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                      {/* HeroCarousel-Badge: D-day만 표시, 상태 배지 없음 */}
                      <div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 8px",
                            borderRadius: 9999,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: "0.224px",
                            background: "rgba(0,0,0,0.4)",
                            color: "var(--text-light, #f0f2f5)",
                          }}
                        >
                          {ddayText}
                        </span>
                      </div>

                      {/* 제목 */}
                      <h2
                        style={{
                          fontSize: 24,
                          fontWeight: 800,
                          lineHeight: "34px",
                          color: "var(--text-light, #f0f2f5)",
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {h.title}
                      </h2>

                      {/* 상금 — 단일 노란색 텍스트 */}
                      {h.maxPrizeKRW && (
                        <div style={{ fontSize: 24, fontWeight: 800, lineHeight: "34px", color: "#fbbf24" }}>
                          상금 최대 {formatPrize(h.maxPrizeKRW)}
                        </div>
                      )}
                    </div>

                    {/* CTA: 배경 없음, 텍스트 + right-icon.svg */}
                    <Link
                      href={h.links.detail}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 40,
                        padding: "10px 0",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 600,
                        background: "transparent",
                        color: "var(--text-light, #f0f2f5)",
                        textDecoration: "none",
                        alignSelf: "flex-start",
                        whiteSpace: "nowrap",
                        gap: 2,
                      }}
                    >
                      자세히 보기
                      <img
                        src="/icons/right-icon.svg"
                        alt=""
                        style={{ width: 16, height: 16, display: "block" }}
                      />
                    </Link>
                  </div>

                  {/* 우측 콘텐츠 이미지 329×223, borderRadius:20 */}
                  {contentImg && (
                    <div
                      className="hero-img-wrap"
                      style={{
                        width: 329,
                        height: 223,
                        flexShrink: 0,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={contentImg}
                        alt={h.title}
                        width={329}
                        height={223}
                        priority={idx === 0}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단 컨트롤 바 */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "0 24px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 100%)",
          zIndex: 10,
        }}
      >
        {/* 페이지 번호 + 프로그레스 바 */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, minWidth: 0, marginRight: 16 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "rgba(255,255,255,0.75)",
              letterSpacing: "0.08em",
              fontVariantNumeric: "tabular-nums",
              flexShrink: 0,
            }}
          >
            {pageLabel}
          </span>
          <div
            style={{
              flex: 1,
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
                animation: isPlaying ? `hh-progress ${AUTOPLAY_DELAY}ms linear forwards` : "none",
                transform: isPlaying ? undefined : "scaleX(0)",
              }}
            />
          </div>
        </div>

        {/* 컨트롤 pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(0,0,0,0.2)",
            borderRadius: 100,
            padding: "6px 8px",
            gap: 2,
            flexShrink: 0,
          }}
        >
          <button
            onClick={scrollPrev}
            aria-label="이전"
            style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img src="/icons/left-icon.svg" alt="" style={{ width: 20, height: 20 }} />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "일시정지" : "재생"}
            style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img src={isPlaying ? "/icons/pause-icon.svg" : "/icons/ri-play-icon.svg"} alt="" style={{ width: 20, height: 20 }} />
          </button>
          <button
            onClick={scrollNext}
            aria-label="다음"
            style={{ width: 24, height: 24, background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <img src="/icons/right-icon.svg" alt="" style={{ width: 20, height: 20 }} />
          </button>
        </div>
      </div>
    </div>
  );
}
