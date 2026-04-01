export type HackathonStatus = "ongoing" | "upcoming" | "ended";

export interface Hackathon {
  slug: string;
  title: string;
  status: HackathonStatus;
  tags: string[];
  thumbnailUrl: string;
  period: {
    timezone: string;
    submissionDeadlineAt: string;
    endAt: string;
  };
  links: {
    detail: string;
    rules: string;
    faq: string;
  };
  maxPrizeKRW?: number;
}

export interface Team {
  teamCode: string;
  hackathonSlug: string;
  name: string;
  isOpen: boolean;
  memberCount: number;
  members: string[];
  leader: string;
  lookingFor: string[];
  intro: string;
  contact: {
    type: string;
    url: string;
  };
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  score: number;
  submittedAt: string;
  scoreBreakdown?: {
    participant: number;
    judge: number;
  };
  artifacts?: {
    webUrl?: string;
    pdfUrl?: string;
    planTitle?: string;
  };
}

export interface Leaderboard {
  hackathonSlug: string;
  updatedAt: string;
  entries: LeaderboardEntry[];
}

export interface Badge {
  id: string;
  label: string;
  emoji: string;
  description: string;
  earnedAt: string;
}

export interface TimelineEvent {
  type: "join" | "submit" | "rank";
  hackathonSlug: string;
  hackathonTitle: string;
  at: string;
  detail?: string;
}

export interface Profile {
  nickname: string;
  badges: Badge[];
  bookmarks: string[];
  timeline: TimelineEvent[];
  myTeamCodes: string[];
}

export interface HackathonDetailSection {
  overview: {
    summary: string;
    teamPolicy: { allowSolo: boolean; maxTeamSize: number };
  };
  info: {
    notice: string[];
    links: { rules: string; faq: string };
  };
  eval: {
    metricName: string;
    description: string;
    limits?: { maxRuntimeSec?: number; maxSubmissionsPerDay?: number };
    scoreSource?: "vote";
    scoreDisplay?: {
      label: string;
      breakdown: Array<{ key: string; label: string; weightPercent: number }>;
    };
  };
  schedule: {
    timezone: string;
    milestones: Array<{ name: string; at: string }>;
  };
  prize?: {
    items: Array<{ place: string; amountKRW: number }>;
  };
  teams: { campEnabled: boolean; listUrl: string };
  submit: {
    allowedArtifactTypes: string[];
    submissionUrl: string;
    guide: string[];
    submissionItems?: Array<{ key: string; title: string; format: string }>;
  };
  leaderboard: { publicLeaderboardUrl: string; note: string };
}

export interface HackathonDetail {
  slug: string;
  title: string;
  sections: HackathonDetailSection;
}

export interface Submission {
  id: string;
  hackathonSlug: string;
  githubUrl: string;
  demoUrl: string;
  pdfUrl?: string;
  submittedAt: string;
}
