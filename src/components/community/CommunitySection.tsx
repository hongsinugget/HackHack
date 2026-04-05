"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { color, typography, borderRadius, component } from "@/src/styles/theme";
import CategoryTabs from "./CategoryTabs";
import CommunityPostItem from "./CommunityPostItem";
import PostDetailModal from "./PostDetailModal";
import type { CommunitySectionProps, CommunityCategory, CommunityPost } from "./types";

const CommunitySection = function CommunitySection({
  posts,
  viewAllHref = "#",
}: CommunitySectionProps) {
  const [activeCategory, setActiveCategory] = useState<CommunityCategory>("전체");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  // 게시글에서 사용 중인 카테고리만 추출, "전체"는 항상 맨 앞
  const categories = useMemo<CommunityCategory[]>(() => {
    const unique = Array.from(new Set(posts.map((p) => p.category)));
    return ["전체", ...unique] as CommunityCategory[];
  }, [posts]);

  // 카테고리 필터링
  const filtered = useMemo(
    () =>
      activeCategory === "전체"
        ? posts
        : posts.filter((p) => p.category === activeCategory),
    [posts, activeCategory]
  );

  return (
    <>
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          gap: component.community.gap,
          width: 320,
        }}
      >
        {/* ── 헤더 ── */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          {/* 탭 제목 */}
          <span
            style={{
              fontSize: typography.textStyles.titleHeading.fontSize,
              fontWeight: typography.textStyles.titleHeading.fontWeight,
              lineHeight: `${typography.textStyles.titleHeading.lineHeight}px`,
              color: color.brand.primary,
            }}
          >
            커뮤니티
          </span>

          {/* 전체보기 링크 */}
          <Link
            href={viewAllHref}
            style={{
              fontSize: typography.textStyles.body2.fontSize,
              fontWeight: typography.textStyles.body2.fontWeight,
              lineHeight: `${typography.textStyles.body2.lineHeight}px`,
              color: color.brand.primary,
              textDecoration: "none",
              whiteSpace: "nowrap",
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

        {/* ── 게시글 목록 (Figma: 배경·border 없음, 투명) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {filtered.map((post) => (
            <CommunityPostItem
              key={post.id}
              post={post}
              onClick={() => setSelectedPost(post)}
            />
          ))}

          {filtered.length === 0 && (
            <p
              style={{
                fontSize: typography.textStyles.body2.fontSize,
                color: color.text.muted,
                padding: `${borderRadius.md}px`,
                margin: 0,
              }}
            >
              해당 카테고리의 게시글이 없습니다.
            </p>
          )}
        </div>
      </section>

      {/* ── 상세 모달 ── */}
      {selectedPost && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
};

export default CommunitySection;
