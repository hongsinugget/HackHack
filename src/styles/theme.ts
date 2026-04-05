/**
 * HackHack Design Tokens — TypeScript 버전
 * 출처: design-tokens.json (Figma DesignSystem node 141:5087)
 *
 * 사용법:
 *   import { theme } from "@/src/styles/theme";
 *   style={{ color: theme.color.brand.primary }}
 *   style={{ gap: theme.spacing[14] }}
 */

// ─────────────────────────────────────────────────────────────────────────────
// 인터페이스 정의
// ─────────────────────────────────────────────────────────────────────────────

export interface BrandColors {
  /** #7c3aed — 메인 보라색, 버튼·링크·강조 */
  primary: string;
  /** #5013ba — StatusBadge 배경, 진한 보라색 */
  dark: string;
  /** #ece5ff — HackathonCard 배경, 연한 보라색 */
  light: string;
  /** #6d28d9 — brand-primary hover 상태 */
  hover: string;
  /** #a78bfa — 캐러셀 태그 텍스트, 연보라 */
  tagPurple: string;
  /** #7c51fa — TeamCard 태그 텍스트 */
  teamTag: string;
}

export interface TextColors {
  /** #12121a — 기본 텍스트 */
  main: string;
  /** #4b5563 — 보조 텍스트, 설명글 */
  subtle: string;
  /** #6b6b80 — 흐린 텍스트, 날짜·메타 정보 */
  muted: string;
  /** #f0f2f5 — 어두운 배경 위 텍스트 */
  light: string;
  /** #ffffff — 버튼 내부 텍스트 */
  white: string;
}

export interface BgColors {
  /** #f0f2f5 — 페이지 배경 (라이트 테마) */
  main: string;
  /** #12121a — Footer·다크 영역 배경 */
  dark: string;
  /** #dee2e6 — 검색바·인풋 배경 */
  input: string;
  /** #1a1a26 — 다크 테마 보조 표면 */
  surface: string;
  overlay: {
    /** rgba(0,0,0,0.4) — 캐러셀 뱃지 배경 */
    dark: string;
    /** rgba(0,0,0,0.2) — 캐러셀 컨트롤 배경 */
    carousel: string;
  };
}

export interface BorderColors {
  /** #dde1e6 — 카드·구분선 테두리 (라이트) */
  subtle: string;
  /** #2a2a3a — 캐러셀 테두리 (다크) */
  dark: string;
}

export interface StatusColor {
  text: string;
  bg: string;
  border: string;
}

export interface StatusColors {
  /** 진행중 — 초록 */
  ongoing: StatusColor;
  /** 예정 — 주황 */
  upcoming: StatusColor;
  /** 마감 — 빨강 */
  ended: StatusColor;
}

export interface TagColor {
  bg: string;
  text: string;
  border?: string;
}

export interface TagColors {
  hackathon: TagColor;
  team: TagColor;
  carousel: TagColor & { border: string };
}

export interface PrizeColors {
  /** #fbbf24 — 골드 */
  gold: string;
  /** #4b0082 — 인디고 (HackathonCard) */
  indigo: string;
}

export interface ColorTokens {
  brand: BrandColors;
  text: TextColors;
  bg: BgColors;
  border: BorderColors;
  status: StatusColors;
  tag: TagColors;
  prize: PrizeColors;
}

// ─── Typography ───────────────────────────────────────────────────────────────

export interface TextStyle {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
}

export interface TypographyTokens {
  fontFamily: {
    base: string;
  };
  textStyles: {
    /** 24px / ExtraBold 800 / lh 34 — 캐러셀 메인 제목, 페이지 최상위 제목 */
    display: TextStyle;
    /** 20px / ExtraBold 800 / lh 30 — 섹션 제목 (해커톤 목록, 팀 모집 등) */
    titleHeading: TextStyle;
    /** 16px / Bold 700 / lh 24 — TeamCard 팀명, 랭킹 팀명 */
    title: TextStyle;
    /** 14px / SemiBold 600 / lh 20 — Navbar 메뉴, 버튼 텍스트 */
    body1: TextStyle;
    /** 13px / Regular 400 / lh 20 — 카드 설명글, 서브타이틀, 검색바 placeholder */
    body2: TextStyle;
    /** 12px / SemiBold 600 / lh 16 / ls 0.224 — StatusBadge, HackathonTag, 랭킹 순위 */
    captionTag: TextStyle;
    /** 12px / Regular 400 / lh 16 / ls 0.224 — 날짜·메타 정보, 폼 레이블 */
    labelSmall: TextStyle;
  };
}

// ─── Border Radius ────────────────────────────────────────────────────────────

export interface BorderRadiusTokens {
  /** 9999px — StatusBadge, 검색바 */
  pill: number;
  /** 20px — 캐러셀 이미지 프레임 */
  xl: number;
  /** 16px — HeroCarousel */
  lg: number;
  /** 12px — 카드 (HackathonCard, TeamCard, 랭킹 컨테이너) */
  md: number;
  /** 8px — 네비 링크, 버튼(일반), RankingMoreButton */
  sm: number;
  /** 6px — 합류하기 버튼, 캐러셀 내 태그 */
  xs: number;
  /** 2px — Hackathon-tag, Team-tag */
  tag: number;
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

/**
 * 컴포넌트 토큰에서 추출한 Gap / Padding 수치 모음 (단위: px)
 * 키는 숫자값 그대로 — theme.spacing[14] 처럼 접근
 */
export type SpacingTokens = {
  readonly [K in
    | 2 | 3 | 4 | 6 | 8 | 9 | 10 | 12 | 14 | 16 | 24 | 32 | 33 | 38 | 40 | 57
  ]: string;
};

// ─── Component tokens ─────────────────────────────────────────────────────────

export interface HackathonCardTokens {
  /** 전체 padding: 24px */
  padding: number;
  gap: {
    /** 상단 제목 블록 ↔ 하단 정보 블록: 14px */
    sections: number;
    /** StatusBadge ↔ D-day 텍스트: 4px */
    header: number;
    /** 태그들 사이: 6px */
    tags: number;
    /** 태그 row ↔ 상금/날짜 row: 16px */
    infoSection: number;
  };
}

export interface TeamCardTokens {
  /** 전체 padding: 24px */
  padding: number;
  gap: {
    /** 팀명 ↔ 설명 ↔ 태그 ↔ 하단 row: 12px */
    sections: number;
    /** 태그들 사이: 6px */
    tags: number;
    /** '팀원' 레이블 ↔ '3/5명' 텍스트: 4px */
    memberCount: number;
  };
}

export interface ButtonTokens {
  /** borderRadius: 6px */
  borderRadius: number;
  /** paddingY: 8px */
  paddingY: number;
  /** paddingX: 16px */
  paddingX: number;
}

export interface StatusBadgeTokens {
  borderRadius: number;
  card: { paddingY: number; paddingX: number };
  carousel: { paddingY: number; paddingX: number };
}

export interface HackathonTagTokens {
  borderRadius: number;
  paddingY: number;
  paddingX: number;
}

export interface TeamTagTokens {
  borderRadius: number;
  paddingY: number;
  paddingX: number;
}

export interface NavbarTokens {
  height: number;
  paddingX: number;
  gap: {
    /** 로고 ↔ nav 링크: 24px */
    logoToNav: number;
    /** nav 링크들 사이: 4px */
    navLinks: number;
    /** 검색바 ↔ 내팀/프로필 영역: 32px */
    rightSection: number;
    /** 내팀 ↔ 프로필: 14px */
    myTeamProfile: number;
  };
  navLink: {
    paddingY: number;
    paddingX: number;
    borderRadius: number;
    activeBorderW: number;
  };
}

export interface SearchTokens {
  width: number;
  borderRadius: number;
  paddingY: number;
  paddingLeft: number;
  paddingRight: number;
  iconSize: number;
}

export interface HeroCarouselTokens {
  borderRadius: number;
  paddingTop: number;
  paddingLeft: number;
  gap: {
    /** 제목 블록 ↔ CTA 링크: 38px */
    titleToLink: number;
    /** 뱃지 ↔ 제목 ↔ 상금: 8px */
    titleInner: number;
  };
  control: {
    paddingX: number;
    paddingY: number;
    borderRadius: number;
  };
  badge: {
    paddingY: number;
    paddingX: number;
    borderRadius: number;
  };
  ctaLink: {
    height: number;
    borderRadius: number;
  };
}

export interface RankingPreviewTokens {
  /** 헤더 ↔ 랭킹 목록: 16px */
  gap: number;
  containerRadius: number;
  containerPadding: number;
  row: {
    /** 순위 col ↔ 이름 col ↔ 점수 col: 16px */
    gap: number;
    /** 팀명 ↔ 점수 상세: 2px */
    innerGap: number;
    borderRadius: number;
    /** 각 행 높이: 71px */
    height: number;
  };
  rankColWidth: number;
}

export interface RankingMoreButtonTokens {
  borderRadius: number;
  padding: number;
  width: number;
}

export interface CommunityTokens {
  /** 헤더 ↔ 목록: 16px */
  gap: number;
  rowHeight: number;
  /** 제목 ↔ 메타 텍스트: 2px */
  rowGap: number;
  rowRadius: number;
  listRadius: number;
}

export interface ComponentTokens {
  hackathonCard: HackathonCardTokens;
  teamCard: TeamCardTokens;
  button: ButtonTokens;
  statusBadge: StatusBadgeTokens;
  hackathonTag: HackathonTagTokens;
  teamTag: TeamTagTokens;
  navbar: NavbarTokens;
  search: SearchTokens;
  heroCarousel: HeroCarouselTokens;
  rankingPreview: RankingPreviewTokens;
  rankingMoreButton: RankingMoreButtonTokens;
  community: CommunityTokens;
}

export interface Theme {
  color: ColorTokens;
  typography: TypographyTokens;
  borderRadius: BorderRadiusTokens;
  spacing: SpacingTokens;
  component: ComponentTokens;
}

// ─────────────────────────────────────────────────────────────────────────────
// 실제 값 (as const → 리터럴 타입 추론)
// ─────────────────────────────────────────────────────────────────────────────

export const theme = {
  // ─── Colors ────────────────────────────────────────────────────────────────
  color: {
    brand: {
      primary:  "#7c3aed",
      dark:     "#5013ba",
      light:    "#ece5ff",
      hover:    "#6d28d9",
      tagPurple:"#a78bfa",
      teamTag:  "#7c51fa",
    },
    text: {
      main:   "#12121a",
      subtle: "#4b5563",
      muted:  "#6b6b80",
      light:  "#f0f2f5",
      white:  "#ffffff",
    },
    bg: {
      main:    "#f0f2f5",
      dark:    "#12121a",
      input:   "#dee2e6",
      surface: "#1a1a26",
      overlay: {
        dark:     "rgba(0,0,0,0.4)",
        carousel: "rgba(0,0,0,0.2)",
      },
    },
    border: {
      subtle: "#dde1e6",
      dark:   "#2a2a3a",
    },
    status: {
      ongoing: {
        text:   "#10b981",
        bg:     "rgba(16,185,129,0.15)",
        border: "rgba(16,185,129,0.3)",
      },
      upcoming: {
        text:   "#f59e0b",
        bg:     "rgba(245,158,11,0.15)",
        border: "rgba(245,158,11,0.3)",
      },
      ended: {
        text:   "#ef4444",
        bg:     "rgba(239,68,68,0.15)",
        border: "rgba(239,68,68,0.3)",
      },
    },
    tag: {
      hackathon: {
        bg:   "rgba(124,58,237,0.15)",
        text: "#12121a",
      },
      team: {
        bg:   "rgba(167,139,250,0.1)",
        text: "#7c51fa",
      },
      carousel: {
        bg:     "rgba(124,58,237,0.15)",
        text:   "#a78bfa",
        border: "rgba(124,58,237,0.25)",
      },
    },
    prize: {
      gold:   "#fbbf24",
      indigo: "#4b0082",
    },
  } satisfies ColorTokens,

  // ─── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: {
      base: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    textStyles: {
      display: {
        fontSize: 24, fontWeight: 800, lineHeight: 34, letterSpacing: 0,
      },
      titleHeading: {
        fontSize: 20, fontWeight: 800, lineHeight: 30, letterSpacing: 0,
      },
      title: {
        fontSize: 16, fontWeight: 700, lineHeight: 24, letterSpacing: 0,
      },
      body1: {
        fontSize: 14, fontWeight: 600, lineHeight: 20, letterSpacing: 0,
      },
      body2: {
        fontSize: 13, fontWeight: 400, lineHeight: 20, letterSpacing: 0,
      },
      captionTag: {
        fontSize: 12, fontWeight: 600, lineHeight: 16, letterSpacing: 0.224,
      },
      labelSmall: {
        fontSize: 12, fontWeight: 400, lineHeight: 16, letterSpacing: 0.224,
      },
    },
  } satisfies TypographyTokens,

  // ─── Border Radius ──────────────────────────────────────────────────────────
  borderRadius: {
    pill: 9999,
    xl:   20,
    lg:   16,
    md:   12,
    sm:   8,
    xs:   6,
    tag:  2,
  } satisfies BorderRadiusTokens,

  // ─── Spacing (px 단위, 컴포넌트 Gap·Padding 참조용) ────────────────────────
  spacing: {
    2:  "2px",
    3:  "3px",
    4:  "4px",
    6:  "6px",
    8:  "8px",
    9:  "9px",
    10: "10px",
    12: "12px",
    14: "14px",
    16: "16px",
    24: "24px",
    32: "32px",
    33: "33px",
    38: "38px",
    40: "40px",
    57: "57px",
  } satisfies SpacingTokens,

  // ─── Component Tokens ───────────────────────────────────────────────────────
  component: {
    hackathonCard: {
      padding: 24,
      gap: {
        sections:    14,
        header:      15,
        tags:         6,
        infoSection: 16,
      },
    },
    teamCard: {
      padding: 24,
      gap: {
        sections:    12,
        tags:         6,
        memberCount:  4,
      },
    },
    button: {
      borderRadius: 6,
      paddingY:     8,
      paddingX:    16,
    },
    statusBadge: {
      borderRadius: 9999,
      card:     { paddingY: 4, paddingX: 8 },
      carousel: { paddingY: 3, paddingX: 9 },
    },
    hackathonTag: {
      borderRadius: 2,
      paddingY:     6,
      paddingX:     8,
    },
    teamTag: {
      borderRadius: 2,
      paddingY:     4,
      paddingX:     9,
    },
    navbar: {
      height:   57,
      paddingX: 57.5,
      gap: {
        logoToNav:     24,
        navLinks:       4,
        rightSection:  32,
        myTeamProfile: 14,
      },
      navLink: {
        paddingY:      6,
        paddingX:     11,
        borderRadius:  8,
        activeBorderW: 2,
      },
    },
    search: {
      width:        180,
      borderRadius: 100,
      paddingY:       6,
      paddingLeft:   32,
      paddingRight:  12,
      iconSize:      16,
    },
    heroCarousel: {
      borderRadius: 16,
      paddingTop:   33,
      paddingLeft:  40,
      gap: {
        titleToLink: 38,
        titleInner:   8,
      },
      control: {
        paddingX:     8,
        paddingY:     6,
        borderRadius: 100,
      },
      badge: {
        paddingY:     4,
        paddingX:     8,
        borderRadius: 9999,
      },
      ctaLink: {
        height:       40,
        borderRadius:  8,
      },
    },
    rankingPreview: {
      gap:              16,
      containerRadius:  12,
      containerPadding:  9,
      row: {
        gap:          16,
        innerGap:      2,
        borderRadius:  8,
        height:       71,
      },
      rankColWidth: 40,
    },
    rankingMoreButton: {
      borderRadius:  8,
      padding:      10,
      width:       302,
    },
    community: {
      gap:        16,
      rowHeight:  71,
      rowGap:      2,
      rowRadius:   8,
      listRadius: 12,
    },
  } satisfies ComponentTokens,
} as const satisfies Theme;

// ─── 편의 re-export ──────────────────────────────────────────────────────────

export const { color, typography, borderRadius, spacing, component } = theme;
