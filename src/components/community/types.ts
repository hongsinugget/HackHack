/** 필터 탭에 쓰이는 카테고리 유니온. "전체"는 탭 전용 — 실제 게시글 category에는 사용 불가. */
export type CommunityCategory = "전체" | "공지" | "후기" | "질문" | "꿀팁";
export type PostCategory = Exclude<CommunityCategory, "전체">;

export interface CommunityPost {
  id: string;
  title: string;
  author?: string;
  /** 게시글 실제 카테고리 ("전체" 제외) */
  category: PostCategory;
  views: number;
  likes: number;
  /** 작성일 (예: "2026.04.05") */
  date: string;
  /** 모달 상세 본문 (개행 \n 지원) */
  body: string;
}

// ─── 컴포넌트 Props ───────────────────────────────────────────────────────────


export interface CategoryTabsProps {
  categories: CommunityCategory[];
  active: CommunityCategory;
  onChange: (category: CommunityCategory) => void;
}

export interface PostDetailModalProps {
  post: CommunityPost;
  onClose: () => void;
  isLiked?: boolean;
  onLike?: () => void;
}

export interface CommunitySectionProps {
  posts: CommunityPost[];
  viewAllHref?: string;
}
