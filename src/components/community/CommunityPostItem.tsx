import { memo } from "react";
import { color, typography, component } from "@/src/styles/theme";
import type { CommunityPostItemProps } from "./types";

function formatCount(n: number): string {
  if (n >= 10_000) return `${(n / 10_000).toFixed(1).replace(/\.0$/, "")}만`;
  if (n >= 1_000) return n.toLocaleString("ko-KR");
  return String(n);
}

const CommunityPostItem = memo(function CommunityPostItem({
  post,
  onClick,
}: CommunityPostItemProps) {
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: component.community.rowHeight,
        // Figma: 콘텐츠 302px = 320 - 9px × 2
        paddingLeft: 9,
        paddingRight: 9,
        cursor: "pointer",
        textAlign: "left",
        transition: "background 0.12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "rgba(124,58,237,0.04)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: component.community.rowGap,
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* 제목 */}
        <p
          style={{
            fontSize: typography.textStyles.title.fontSize,
            fontWeight: typography.textStyles.title.fontWeight,
            lineHeight: `${typography.textStyles.title.lineHeight}px`,
            color: color.text.main,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            margin: 0,
          }}
        >
          {post.title}
        </p>

        {/* 메타: 날짜 · 조회수 · 좋아요 */}
        <p
          style={{
            fontSize: typography.textStyles.labelSmall.fontSize,
            fontWeight: typography.textStyles.labelSmall.fontWeight,
            lineHeight: `${typography.textStyles.labelSmall.lineHeight}px`,
            letterSpacing: `${typography.textStyles.labelSmall.letterSpacing}px`,
            color: color.text.muted,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            margin: 0,
          }}
        >
          조회수 {formatCount(post.views)}회&nbsp;·&nbsp;좋아요 {post.likes}
        </p>
      </div>
    </button>
  );
});

export default CommunityPostItem;
