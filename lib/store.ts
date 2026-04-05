import { create } from "zustand";
import type { ZodType } from "zod";
import type { Hackathon, Team, Leaderboard, LeaderboardEntry, Profile, Badge, TimelineEvent, JoinRequest } from "./types";
import { seedHackathons, seedTeams, seedLeaderboards } from "./seed";
import { HackathonsSchema, TeamSchema, TeamsSchema, LeaderboardsSchema, ProfileSchema } from "./schemas";

const LS_KEYS = {
  hackathons: "hh_hackathons",
  teams: "hh_teams",
  leaderboards: "hh_leaderboards",
  profile: "hh_profile",
};

function loadOrSeed<T>(key: string, fallback: T[], schema: ZodType<T[]>): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      const result = schema.safeParse(parsed);
      if (result.success) {
        // 스키마 default/catch로 마이그레이션된 값이 있을 수 있으므로
        // 파싱된 결과를 다시 저장해 다음 로드부터 에러 없이 통과하도록 함
        const migrated = JSON.stringify(result.data);
        if (migrated !== raw) localStorage.setItem(key, migrated);
        return result.data;
      }
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[store] localStorage "${key}" 스키마 불일치 — 시드 데이터로 복구합니다.`);
      }
      localStorage.removeItem(key);
    }
  } catch (e) {
    console.error(`[store] localStorage "${key}" 로드 실패:`, e);
  }
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
  initError: string | null;
  init: () => void;
  setNickname: (nickname: string) => void;
  updateNickname: (nickname: string) => void;
  addBadge: (badge: Omit<Badge, "earnedAt">) => void;
  toggleBookmark: (slug: string) => void;
  updateLeaderboard: (slug: string, entry: Omit<LeaderboardEntry, "rank">) => void;
  addTimelineEvent: (event: TimelineEvent) => void;
  joinTeam: (teamCode: string, role?: string) => void;
  leaveTeam: (teamCode: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (teamCode: string, updates: Partial<Team>) => void;
  deleteTeam: (teamCode: string) => void;
  delegateLeader: (teamCode: string, newLeader: string) => void;
  kickMember: (teamCode: string, nickname: string) => void;
  requestJoin: (teamCode: string, role?: string) => void;
  approveJoinRequest: (teamCode: string, nickname: string) => void;
  rejectJoinRequest: (teamCode: string, nickname: string) => void;
  cancelJoinRequest: (teamCode: string) => void;
  setMyRole: (role: string) => void;
  updateProfile: (updates: Partial<Pick<Profile, "nickname" | "avatarEmoji" | "bio" | "role" | "skills" | "links" | "isPublic">>) => void;
}

export const useStore = create<StoreState>((set, get) => ({
  hackathons: [],
  teams: [],
  leaderboards: [],
  profile: null,
  showNicknameModal: false,
  initialized: false,
  initError: null,

  init: () => {
    try {
      const hackathons = loadOrSeed<Hackathon>(LS_KEYS.hackathons, seedHackathons, HackathonsSchema);
      const teams = loadOrSeed<Team>(LS_KEYS.teams, seedTeams, TeamsSchema);
      const leaderboards = loadOrSeed<Leaderboard>(LS_KEYS.leaderboards, seedLeaderboards, LeaderboardsSchema);

      let profile: Profile | null = null;
      try {
        const raw = localStorage.getItem(LS_KEYS.profile);
        if (raw) {
          const parsed = JSON.parse(raw);
          const result = ProfileSchema.safeParse(parsed);
          if (result.success) {
            profile = result.data;
          } else {
            if (process.env.NODE_ENV !== "production") {
              console.error("[store] 프로필 스키마 불일치:", result.error.issues);
            } else {
              console.error("[store] 프로필 스키마 불일치, 초기화합니다");
            }
            localStorage.removeItem(LS_KEYS.profile);
          }
        }
      } catch (e) {
        console.error("[store] 프로필 로드 실패:", e);
      }

      set({
        hackathons,
        teams,
        leaderboards,
        profile,
        showNicknameModal: !profile,
        initialized: true,
        initError: null,
      });
    } catch (e) {
      console.error("[store] init 실패:", e);
      set({
        initialized: true,
        initError: e instanceof Error ? e.message : "데이터를 불러오는 중 오류가 발생했습니다.",
      });
    }
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
    const validated = ProfileSchema.safeParse(newProfile);
    if (!validated.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[store] setNickname 스키마 검증 실패:", validated.error.issues);
      }
      return;
    }
    saveProfile(validated.data);
    set({ profile: validated.data, showNicknameModal: false });
  },

  updateNickname: (nickname: string) => {
    const { profile } = get();
    if (!profile) return;
    const merged = { ...profile, nickname };
    const validated = ProfileSchema.safeParse(merged);
    if (!validated.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[store] updateNickname 스키마 검증 실패:", validated.error.issues);
      }
      return;
    }
    saveProfile(validated.data);
    set({ profile: validated.data });
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
    const validated = LeaderboardsSchema.safeParse(updated);
    if (!validated.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[store] updateLeaderboard 스키마 검증 실패:", validated.error.issues);
      }
      return;
    }
    localStorage.setItem(LS_KEYS.leaderboards, JSON.stringify(validated.data));
    set({ leaderboards: validated.data });
  },

  addTimelineEvent: (event: TimelineEvent) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, timeline: [...profile.timeline, event] };
    saveProfile(updated);
    set({ profile: updated });
  },

  joinTeam: (teamCode: string, role?: string) => {
    const { profile, teams, hackathons } = get();
    if (!profile) return;
    const myTeamCodes = profile.myTeamCodes ?? [];
    if (myTeamCodes.includes(teamCode)) return;

    const team = teams.find((t) => t.teamCode === teamCode);
    const hackathon = team ? hackathons.find((h) => h.slug === team.hackathonSlug) : null;
    const isCreating = !!team && team.leader === profile.nickname;
    const now = new Date().toISOString();

    // 배지: 🤝 최강단짝
    const badges = [...profile.badges];
    if (!badges.some((b) => b.id === "duo_buddy")) {
      badges.push({
        id: "duo_buddy",
        emoji: "🤝",
        label: "최강단짝",
        description: "팀에 합류하거나 팀을 만들었습니다",
        earnedAt: now,
      });
    }

    // 타임라인: 팀 합류/생성 이벤트
    const newEvent: TimelineEvent = {
      type: "join",
      hackathonSlug: team?.hackathonSlug ?? "",
      hackathonTitle: hackathon?.title ?? "",
      at: now,
      detail: isCreating ? `팀 생성: ${team?.name}` : `팀 합류: ${team?.name}`,
    };
    const timeline = [...profile.timeline, newEvent];

    // 배지: 🔁 단골손님 (2개 이상 해커톤 참가)
    const joinedSlugs = new Set(
      timeline
        .filter((e) => e.type === "join" && e.hackathonSlug !== "")
        .map((e) => e.hackathonSlug)
    );
    if (joinedSlugs.size >= 2 && !badges.some((b) => b.id === "regular")) {
      badges.push({
        id: "regular",
        emoji: "🔁",
        label: "단골손님",
        description: "2개 이상의 해커톤에 참가했습니다",
        earnedAt: now,
      });
    }

    const updatedProfile = { ...profile, myTeamCodes: [...myTeamCodes, teamCode], badges, timeline };
    saveProfile(updatedProfile);

    const updatedTeams = teams.map((t) => {
      if (t.teamCode !== teamCode) return t;
      const alreadyIn = (t.members ?? []).includes(profile.nickname);
      const newMembers = [...(t.members ?? []).filter((m) => m !== profile.nickname), profile.nickname];
      const newCount = alreadyIn ? t.memberCount : t.memberCount + 1;
      const isFull = t.maxMembers != null && newCount >= t.maxMembers;
      return {
        ...t,
        members: newMembers,
        memberCount: newCount,
        isOpen: isFull ? false : t.isOpen,
        memberRoles: role ? { ...(t.memberRoles ?? {}), [profile.nickname]: role } : t.memberRoles,
      };
    });
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    set({ profile: updatedProfile, teams: updatedTeams });
  },

  leaveTeam: (teamCode: string) => {
    const { profile, teams } = get();
    if (!profile) return;
    const team = teams.find((t) => t.teamCode === teamCode);
    const updatedProfile = { ...profile, myTeamCodes: (profile.myTeamCodes ?? []).filter((c) => c !== teamCode) };
    saveProfile(updatedProfile);
    // 팀장이거나 마지막 멤버면 팀 자체를 삭제해 유령 팀이 남지 않도록 처리
    const remainingMembers = (team?.members ?? []).filter((m) => m !== profile.nickname);
    const isLeaderLeaving = team?.leader === profile.nickname;
    const isLastMember = remainingMembers.length === 0;
    const updatedTeams = (isLeaderLeaving || isLastMember)
      ? teams.filter((t) => t.teamCode !== teamCode)
      : teams.map((t) =>
          t.teamCode === teamCode
            ? {
                ...t,
                members: remainingMembers,
                memberCount: Math.max(0, t.memberCount - 1),
              }
            : t
        );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    set({ profile: updatedProfile, teams: updatedTeams });
  },

  addTeam: (team: Team) => {
    const { teams } = get();
    const teamValidated = TeamSchema.safeParse(team);
    if (!teamValidated.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[store] addTeam 스키마 검증 실패:", teamValidated.error.issues);
      }
      return;
    }
    const updated = [teamValidated.data, ...teams];
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  updateTeam: (teamCode: string, updates: Partial<Team>) => {
    const { teams } = get();
    const updated = teams.map((t) => {
      if (t.teamCode !== teamCode) return t;
      const merged = { ...t, ...updates };
      const validated = TeamSchema.safeParse(merged);
      if (!validated.success) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[store] updateTeam 스키마 검증 실패:", validated.error.issues);
        }
        return t; // 검증 실패 시 원본 유지
      }
      return validated.data;
    });
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

  kickMember: (teamCode: string, nickname: string) => {
    const { teams } = get();
    const updated = teams.map((t) =>
      t.teamCode === teamCode
        ? {
            ...t,
            members: (t.members ?? []).filter((m) => m !== nickname),
            memberCount: Math.max(0, t.memberCount - 1),
          }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  requestJoin: (teamCode: string, role?: string) => {
    const { profile, teams } = get();
    if (!profile) return;
    const team = teams.find((t) => t.teamCode === teamCode);
    if (!team) return;
    if ((profile.myTeamCodes ?? []).includes(teamCode)) return;
    if ((team.joinRequests ?? []).some((r) => r.nickname === profile.nickname)) return;

    const newRequest: JoinRequest = {
      id: crypto.randomUUID(),
      nickname: profile.nickname,
      role,
      requestedAt: new Date().toISOString(),
    };
    const updated = teams.map((t) =>
      t.teamCode === teamCode
        ? { ...t, joinRequests: [...(t.joinRequests ?? []), newRequest] }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  approveJoinRequest: (teamCode: string, nickname: string) => {
    const { profile, teams, hackathons } = get();
    const team = teams.find((t) => t.teamCode === teamCode);
    if (!team) return;

    // 팀에 멤버 추가 + 요청 제거
    const request = team.joinRequests?.find((r) => r.nickname === nickname);
    const updatedTeams = teams.map((t) => {
      if (t.teamCode !== teamCode) return t;
      const alreadyIn = (t.members ?? []).includes(nickname);
      const newMembers = [...(t.members ?? []).filter((m) => m !== nickname), nickname];
      const newCount = alreadyIn ? t.memberCount : t.memberCount + 1;
      const isFull = t.maxMembers != null && newCount >= t.maxMembers;
      return {
        ...t,
        members: newMembers,
        memberCount: newCount,
        isOpen: isFull ? false : t.isOpen,
        joinRequests: (t.joinRequests ?? []).filter((r) => r.nickname !== nickname),
        memberRoles: request?.role ? { ...(t.memberRoles ?? {}), [nickname]: request.role } : t.memberRoles,
      };
    });
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updatedTeams));
    set({ teams: updatedTeams });

    // 승인된 닉네임이 현재 프로필이면 myTeamCodes + 배지 + 타임라인 업데이트
    if (profile?.nickname === nickname && !(profile.myTeamCodes ?? []).includes(teamCode)) {
      const hackathon = hackathons.find((h) => h.slug === team.hackathonSlug);
      const now = new Date().toISOString();
      const badges = [...profile.badges];
      if (!badges.some((b) => b.id === "duo_buddy")) {
        badges.push({ id: "duo_buddy", emoji: "🤝", label: "최강단짝", description: "팀에 합류하거나 팀을 만들었습니다", earnedAt: now });
      }
      const newEvent: TimelineEvent = {
        type: "join",
        hackathonSlug: team.hackathonSlug ?? "",
        hackathonTitle: hackathon?.title ?? "",
        at: now,
        detail: `팀 합류: ${team.name}`,
      };
      const timeline = [...profile.timeline, newEvent];
      const joinedSlugs = new Set(timeline.filter((e) => e.type === "join" && e.hackathonSlug !== "").map((e) => e.hackathonSlug));
      if (joinedSlugs.size >= 2 && !badges.some((b) => b.id === "regular")) {
        badges.push({ id: "regular", emoji: "🔁", label: "단골손님", description: "2개 이상의 해커톤에 참가했습니다", earnedAt: now });
      }
      const updatedProfile = { ...profile, myTeamCodes: [...(profile.myTeamCodes ?? []), teamCode], badges, timeline };
      saveProfile(updatedProfile);
      set({ profile: updatedProfile });
    }
  },

  rejectJoinRequest: (teamCode: string, nickname: string) => {
    const { teams } = get();
    const updated = teams.map((t) =>
      t.teamCode === teamCode
        ? { ...t, joinRequests: (t.joinRequests ?? []).filter((r) => r.nickname !== nickname) }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  cancelJoinRequest: (teamCode: string) => {
    const { profile, teams } = get();
    if (!profile) return;
    const updated = teams.map((t) =>
      t.teamCode === teamCode
        ? { ...t, joinRequests: (t.joinRequests ?? []).filter((r) => r.nickname !== profile.nickname) }
        : t
    );
    localStorage.setItem(LS_KEYS.teams, JSON.stringify(updated));
    set({ teams: updated });
  },

  setMyRole: (role: string) => {
    const { profile } = get();
    if (!profile) return;
    const updated = { ...profile, role };
    saveProfile(updated);
    set({ profile: updated });
  },

  updateProfile: (updates) => {
    const { profile } = get();
    if (!profile) return;
    const merged = { ...profile, ...updates };
    const validated = ProfileSchema.safeParse(merged);
    if (!validated.success) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[store] updateProfile 스키마 검증 실패:", validated.error.issues);
      }
      return;
    }
    saveProfile(validated.data);
    set({ profile: validated.data });
  },
}));
