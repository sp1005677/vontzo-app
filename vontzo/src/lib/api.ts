const BASE = "/api";
const TOKEN_KEY = "vontzo_token";
const USER_KEY = "vontzo_user";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function getStoredUser(): { userId: string; name: string } | null {
  try {
    const s = localStorage.getItem(USER_KEY);
    return s ? JSON.parse(s) : null;
  } catch { return null; }
}
export function storeAuth(token: string, userId: string, name: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ userId, name }));
}
export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

async function apiFetch<T>(path: string, options?: RequestInit, auth = true): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE}${path}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? "API error");
  }
  return res.json() as Promise<T>;
}

export interface UserState {
  id: string;
  name: string;
  xp: number;
  gems: number;
  currentLevel: number;
  completedLevels: number[];
  levelStars: Record<number, number>;
  skillScores: Record<string, number>;
  streak: number;
  onboardingDone: boolean;
  streakFreezeActive: boolean;
  xpBoostUntil: string | null;
  hearts: number;
}

export interface CoachResponse {
  grade: "S" | "A" | "B" | "C";
  feedback: string;
  audio_cue: "correct" | "wrong";
}

export interface LeagueBot {
  id: number;
  name: string;
  currentXp: number;
  title: string;
  specialty: string;
  winRate: string;
  streak: number;
}

export interface LeagueResponse {
  bots: LeagueBot[];
  nextResetAt: string;
}

export const api = {
  // Auth
  signup: (name: string, email: string, password: string) =>
    apiFetch<{ token: string; userId: string; name: string }>("/auth/signup", {
      method: "POST", body: JSON.stringify({ name, email, password }),
    }, false),

  login: (email: string, password: string) =>
    apiFetch<{ token: string; userId: string; name: string }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    }, false),

  // User
  getUser: (userId: string) => apiFetch<UserState>(`/user/${userId}`),

  syncUser: (userId: string, data: {
    xp: number; gems?: number; currentLevel: number;
    completedLevels: number[]; levelStars: Record<number, number>;
    skillScores: Record<string, number>; streak: number; onboardingDone: boolean;
  }) => apiFetch<{ ok: boolean }>(`/user/${userId}/sync`, { method: "POST", body: JSON.stringify(data) }),

  loseHeart: (userId: string) =>
    apiFetch<{ hearts: number }>(`/user/${userId}/lose-heart`, { method: "POST" }),

  refillHearts: (userId: string, spendXp: boolean) =>
    apiFetch<{ hearts: number; xp: number }>(`/user/${userId}/refill-hearts`, {
      method: "POST", body: JSON.stringify({ spendXp }),
    }),

  // AI Coach
  getCoachFeedback: (params: {
    question: string; chosen_answer: string; correct_answer: string; level_id: number;
  }) => apiFetch<CoachResponse>("/coach", { method: "POST", body: JSON.stringify(params) }),

  // League
  getLeague: () => apiFetch<LeagueResponse>("/league"),

  // Shop
  buyItem: (userId: string, item: "heart_refill" | "streak_freeze" | "xp_boost") =>
    apiFetch<{ ok: boolean; xp: number; gems?: number; hearts?: number; streakFreezeActive?: boolean; xpBoostUntil?: string }>(
      `/shop/${userId}/buy`, { method: "POST", body: JSON.stringify({ item }) }
    ),

  // Gym
  pitchScore: (pitch: string) =>
    apiFetch<{ score: number; breakdown: Record<string, number>; strengths: string[]; improvements: string[]; verdict: string }>(
      "/gym/pitch-score", { method: "POST", body: JSON.stringify({ pitch }) }
    ),

  getObjections: () =>
    apiFetch<{ objections: unknown[] }>("/gym/objections", { method: "POST", body: JSON.stringify({}) }),
};
