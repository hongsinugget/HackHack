import { create } from "zustand";
import type { Hackathon, Team, Leaderboard, LeaderboardEntry, Profile, Badge, TimelineEvent } from "./types";
import { seedHackathons, seedTeams, seedLeaderboards } from "./seed";

const LS_KEYS = {
  hackathons: "hh_hackathons",
  teams: "hh_teams",
  leaderboards: "hh_leaderboards",
  profile: "hh_profile",
};

function loadOrSeed<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {}
  localStorage.setItem(key, JSON.stringify(fallback));
  return fallback;
}

function saveProfile(profile: Profile) {
  localStorage.setItem(LS_KEYS.profile, JSON.stringify(profile));
}

interface StoreState {
  hackathons: Hackathon[];
  teams: Team[];
  leaderboards: Leaderboard[];
  profile: Profile | null;
  showNicknameModal: boolean;
  initialized: boolean;
  init: () => void;
  setNickname: (nickname: string) => void;
  updateNickname: (nickname: string) => void;
  addBadge: (badge: Omit<Badge, "earnedAt">) => void;
  toggleBookmark: (slug: string) => void;
  updateLeaderboard: (slug: string, entry: Omit<LeaderboardEntry, "rank">) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  hackathons: [],
  teams: [],
  leaderboards: [],
  profile: null,
  showNicknameModal: false,
  initialized: false,

  init: () => {
    const hackathons = loadOrSeed<Hackathon>(LS_KEYS.hackathons, seedHackathons);
    const teams = loadOrSeed<Team>(LS_KEYS.teams, seedTeams);
    const leaderboards = loadOrSeed<Leaderboard>(LS_KEYS.leaderboards, seedLeaderboards);

    let profile: Profile | null = null;
    try {
      const raw = localStorage.getItem(LS_KEYS.profile);
      if (raw) profile = JSON.parse(raw) as Profile;
    } catch {}

    set({
      hackathons,
      teams,
      leaderboards,
      profile,
      showNicknameModal: !profile,
      initialized: true,
    });
  },

  setNickname: (nickname: string) => {
    const firstSpark: Badge = {
      id: "first_spark",
      label: "첫 불꽃",
      emoji: "🔥",
      description: "플랫폼에 처음 입장해 닉네임을 설정했습니다",
      earnedAt: new Date().toISOString(),
    };
    const newProfile: Profile = {
      nickname,
      badges: [firstSpark],
      bookmarks: [],
      timeline: [
        {
          type: "join",
          hackathonSlug: "",
          hackathonTitle: "핵핵 플랫폼",
          at: new Date().toISOString(),
          detail: "첫 방문",
        },
      ],
    };
    saveProfile(newProfile);
    set({ profile: newProfile, showNicknameModal: false });
  },

  updateNickname: (nickname: string) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, nickname };
    saveProfile(updated);
    set({ profile: updated });
  },

  addBadge: (badge: Omit<Badge, "earnedAt">) => {
    const { profile } = get();
    if (!profile) return;
    if (profile.badges.some((b) => b.id === badge.id)) return;
    const newBadge: Badge = { ...badge, earnedAt: new Date().toISOString() };
    const updated = { ...profile, badges: [...profile.badges, newBadge] };
    saveProfile(updated);
    set({ profile: updated });
  },

  toggleBookmark: (slug: string) => {
    const { profile } = get();
    if (!profile) return;
    const bookmarks = profile.bookmarks.includes(slug)
      ? profile.bookmarks.filter((s) => s !== slug)
      : [...profile.bookmarks, slug];
    const updated = { ...profile, bookmarks };
    saveProfile(updated);
    set({ profile: updated });
  },

  updateLeaderboard: (slug: string, entry: Omit<LeaderboardEntry, "rank">) => {
    const { leaderboards } = get();
    const idx = leaderboards.findIndex((lb) => lb.hackathonSlug === slug);
    let updated: Leaderboard[];
    if (idx >= 0) {
      const lb = leaderboards[idx];
      const newEntry: LeaderboardEntry = { ...entry, rank: lb.entries.length + 1 };
      updated = leaderboards.map((lb, i) =>
        i === idx
          ? { ...lb, entries: [...lb.entries, newEntry], updatedAt: new Date().toISOString() }
          : lb
      );
    } else {
      updated = [
        ...leaderboards,
        {
          hackathonSlug: slug,
          updatedAt: new Date().toISOString(),
          entries: [{ ...entry, rank: 1 }],
        },
      ];
    }
    localStorage.setItem(LS_KEYS.leaderboards, JSON.stringify(updated));
    set({ leaderboards: updated });
  },

  addTimelineEvent: (event: TimelineEvent) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, timeline: [...profile.timeline, event] };
    saveProfile(updated);
    set({ profile: updated });
  },
}));
