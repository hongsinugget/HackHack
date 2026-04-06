"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { color, typography, component } from "@/src/styles/theme";
import CategoryTabs from "./CategoryTabs";
import CommunityPostItem from "./CommunityPostItem";
import type { CommunitySectionProps, CommunityCategory } from "./types";

const CommunitySection = function CommunitySection({
  posts,
  viewAllHref = "#",
}: CommunitySectionProps) {
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>("전체");

  const categories = useMemo<CommunityCategory[]>(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category)));
    return ["전체", ...unique] as CommunityCategory[];
  }, [posts]);

  const filtered = useMemo(
    () =>
      activeCategory === "전체"
        ? posts
        : posts.filter((p) => p.category === activeCategory),
    [posts, activeCategory]
  );

  return (
    <section
      className="community-section"
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           component.community.gap,
        width:         "100%",
      }}
    >
      {/* ── 헤더 ── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <span
          style={{
            fontSize:   typography.textStyles.titleHeading.fontSize,
            fontWeight: typography.textStyles.titleHeading.fontWeight,
            lineHeight: `${typography.textStyles.titleHeading.lineHeight}px`,
            color:      color.brand.primary,
          }}
        >
          커뮤니티
        </span>
        <Link
          href={viewAllHref}
          style={{
            fontSize:       typography.textStyles.body2.fontSize,
            fontWeight:     typography.textStyles.body2.fontWeight,
            lineHeight:     `${typography.textStyles.body2.lineHeight}px`,
            color:          color.brand.primary,
            textDecoration: "none",
            whiteSpace:     "nowrap",
          }}
        >
          전체보기 →
        </Link>
      </div>

      {/* ── 카테고리 탭 ── */}
      <CategoryTabs
        categories={categories}
        active={activeCategory}
        onChange={setActiveCategory}
      />

      {/* ── 게시글 목록 ── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {filtered.map((post) => (
          <CommunityPostItem key={post.id} post={post} />
        ))}

        {filtered.length === 0 && (
          <p
            style={{
              fontSize: typography.textStyles.body2.fontSize,
              color:    color.text.muted,
              margin:   0,
            }}
          >
            해당 카테고리의 게시글이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
};

export default CommunitySection;
