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
}
