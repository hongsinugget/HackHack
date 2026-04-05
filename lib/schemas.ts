import { z } from "zod";

// ── 공통 ──────────────────────────────────────────────────────────────────────

/** http(s):// 로 시작하는 유효한 URL — javascript: / data: URI 차단 */
const safeUrl = z
  .string()
  .url()
  .refine(
    (u) => u.startsWith("http://") || u.startsWith("https://"),
    { message: "URL은 http(s)://로 시작해야 합니다" }
  );

const JoinRequestSchema = z.object({
  id: z.string(),
  nickname: z.string(),
  role: z.string().optional(),
  requestedAt: z.string(),
});

// ── Hackathon ────────────────────────────────────────────────────────────────

export const HackathonSchema = z.object({
  slug: z.string(),
  title: z.string(),
  status: z.enum(["ongoing", "upcoming", "ended"]),
  tags: z.array(z.string()),
  thumbnailUrl: z.string(),
  period: z.object({
    timezone: z.string(),
    startAt: z.string(),
    submissionDeadlineAt: z.string(),
    endAt: z.string(),
  }),
  links: z.object({
    detail: z.string(),
    rules: z.string(),
    faq: z.string(),
  }),
  maxPrizeKRW: z.number().optional(),
});

export const HackathonsSchema = z.array(HackathonSchema);

// ── Team ─────────────────────────────────────────────────────────────────────

export const TeamSchema = z.object({
  teamCode: z.string(),
  hackathonSlug: z.string(),
  name: z.string(),
  isOpen: z.boolean(),
  memberCount: z.number(),
  // 구버전 localStorage에 없을 수 있는 필드 — default로 마이그레이션
  maxMembers: z.number().default(5),
  members: z.array(z.string()).default([]),
  leader: z.string().default(""),
  lookingFor: z.array(z.string()),
  intro: z.string(),
  contact: z.object({
    type: z.string(),
    // "#" / "" 플레이스홀더 허용, javascript:/data: URI만 차단
    url: z.string()
      .refine(
        (u) => u === "" || u === "#" || u.startsWith("http://") || u.startsWith("https://"),
        { message: "URL은 http(s)://로 시작해야 합니다" }
      )
      .catch(""),   // 마이그레이션: 구버전 잘못된 URL → "" 로 대체
  }),
  createdAt: z.string(),
  joinRequests: z.array(JoinRequestSchema).optional(),
  memberRoles: z.record(z.string(), z.string()).optional(),
});

export const TeamsSchema = z.array(TeamSchema);

// ── Leaderboard ───────────────────────────────────────────────────────────────

export const LeaderboardEntrySchema = z.object({
  rank: z.number(),
  teamName: z.string(),
  score: z.number(),
  submittedAt: z.string(),
  scoreBreakdown: z
    .object({ participant: z.number(), judge: z.number() })
    .optional(),
  artifacts: z
    .object({
      webUrl: z.string().optional(),
      pdfUrl: z.string().optional(),
      planTitle: z.string().optional(),
    })
    .optional(),
});

export const LeaderboardSchema = z.object({
  hackathonSlug: z.string(),
  updatedAt: z.string(),
  entries: z.array(LeaderboardEntrySchema),
});

export const LeaderboardsSchema = z.array(LeaderboardSchema);

// ── Profile ───────────────────────────────────────────────────────────────────

export const BadgeSchema = z.object({
  id: z.string(),
  label: z.string(),
  emoji: z.string(),
  description: z.string(),
  earnedAt: z.string(),
});

export const TimelineEventSchema = z.object({
  type: z.enum(["join", "submit", "rank"]),
  hackathonSlug: z.string(),
  hackathonTitle: z.string(),
  at: z.string(),
  detail: z.string().optional(),
});

export const ProfileLinksSchema = z.object({
  github: safeUrl.optional(),
  portfolio: safeUrl.optional(),
  linkedin: safeUrl.optional(),
});

export const ProfileSchema = z.object({
  nickname: z.string(),
  avatarEmoji: z.string().optional(),
  bio: z.string().optional(),
  role: z.string().optional(),
  skills: z.array(z.string()).optional(),
  links: ProfileLinksSchema.optional(),
  isPublic: z.boolean().optional(),
  badges: z.array(BadgeSchema),
  bookmarks: z.array(z.string()),
  timeline: z.array(TimelineEventSchema),
  myTeamCodes: z.array(z.string()),
});

// ── Notice (space 페이지 로컬) ───────────────────────────────────────────────

export const NoticeSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: z.string(),
});

export const NoticesSchema = z.array(NoticeSchema);

// ── TeamSubmission (space 페이지 로컬) ───────────────────────────────────────

export const TeamSubmissionSchema = z.object({
  projectName: z.string(),
  githubUrl: z.string(),
  demoUrl: z.string(),
  notes: z.string().optional(),
  fileName: z.string().optional(),
  submittedAt: z.string(),
  teamName: z.string(),
});
