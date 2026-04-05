"use client";

import { color, typography } from "@/src/styles/theme";
import type { CategoryTabsProps, CommunityCategory } from "./types";

const CategoryTabs = function CategoryTabs({ categories, active, onChange }: CategoryTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="커뮤니티 카테고리"
      style={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {categories.map((cat) => {
        const isActive = cat === active;
        return (
          <button
            key={cat}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(cat as CommunityCategory)}
            style={{
              flexShrink: 0,
              background: "none",
              border: "none",
              borderBottom: isActive
                ? `2px solid ${color.brand.primary}`
                : "2px solid transparent",
              padding: "6px 10px",
              cursor: "pointer",
              fontSize: typography.textStyles.body2.fontSize,
              fontWeight: isActive
                ? typography.textStyles.body1.fontWeight
                : typography.textStyles.body2.fontWeight,
              lineHeight: `${typography.textStyles.body2.lineHeight}px`,
              color: isActive ? color.brand.primary : color.text.muted,
              transition: "color 0.15s, border-color 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryTabs;
