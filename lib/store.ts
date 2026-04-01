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
  joinTeam: (teamCode: string) => void;
  leaveTeam: (teamCode: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamCode: string, updates: Partial<Team>) => void;
  deleteTeam: (teamCode: string) => void;
  delegateLeader: (teamCode: string, newLeader: string) => void;
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
      myTeamCodes: [],
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

  joinTeam: (teamCode: string) => {
    const { profile, teams } = get();
    if (!profile) return;
    const myTeamCodes = profile.myTeamCodes ?? [];
    if (myTeamCodes.includes(teamCode)) return;
    const updatedProfile = { ...profile, myTeamCodes: [...myTeamCodes, teamCode] };
    saveProfile(updatedProfile);
    const updatedTeams = teams.map((t) =>
      t.teamCode === teamCode
        ? {
            ...t,
            members: [...(t.members ?? []).filter((m) => m !== profile.nickname), profile.nickname],
            memberCount: (t.members ?? []).includes(profile.nickname) ? t.memberCount : t.memberCount + 1,
          }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    set({ profile: updatedProfile, teams: updatedTeams });
  },

  leaveTeam: (teamCode: string) => {
    const { profile, teams } = get();
    if (!profile) return;
    const updatedProfile = { ...profile, myTeamCodes: (profile.myTeamCodes ?? []).filter((c) => c !== teamCode) };
    saveProfile(updatedProfile);
    const updatedTeams = teams.map((t) =>
      t.teamCode === teamCode
        ? {
            ...t,
            members: (t.members ?? []).filter((m) => m !== profile.nickname),
            memberCount: Math.max(0, t.memberCount - 1),
          }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    set({ profile: updatedProfile, teams: updatedTeams });
  },

  addTeam: (team: Team) => {
    const { teams } = get();
    const updated = [team, ...teams];
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  updateTeam: (teamCode: string, updates: Partial<Team>) => {
    const { teams } = get();
    const updated = teams.map((t) => t.teamCode === teamCode ? { ...t, ...updates } : t);
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  deleteTeam: (teamCode: string) => {
    const { teams, profile } = get();
    const updatedTeams = teams.filter((t) => t.teamCode !== teamCode);
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    const updatedProfile = profile
      ? { ...profile, myTeamCodes: (profile.myTeamCodes ?? []).filter((c) => c !== teamCode) }
      : profile;
    if (updatedProfile) saveProfile(updatedProfile);
    set({ teams: updatedTeams, profile: updatedProfile });
  },

  delegateLeader: (teamCode: string, newLeader: string) => {
    const { teams } = get();
    const updated = teams.map((t) => t.teamCode === teamCode ? { ...t, leader: newLeader } : t);
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },
}));
