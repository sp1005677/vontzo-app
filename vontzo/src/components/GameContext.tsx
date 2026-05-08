import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { api, getStoredUser, storeAuth, clearAuth } from "@/lib/api";

export interface GameState {
  userId: string;
  userName: string;
  xp: number;
  gems: number;
  streak: number;
  lives: number;
  lastPlayedDate: string;
  completedLevels: number[];
  currentLevel: number;
  levelStars: Record<number, number>;
  skillScores: Record<string, number>;
  onboardingDone: boolean;
  streakFreezeActive: boolean;
  xpBoostActive: boolean;
  backendLoaded: boolean;
  isAuthenticated: boolean;
}

interface GameContextType {
  state: GameState;
  addXP: (amount: number) => void;
  addGems: (amount: number) => void;
  spendXP: (amount: number) => boolean;
  spendGems: (amount: number) => boolean;
  loseLife: () => void;
  refillLives: (spendXp?: boolean) => void;
  completeLevel: (levelId: number, stars: number) => void;
  resetProgress: () => void;
  markOnboardingDone: () => void;
  login: (token: string, userId: string, name: string) => void;
  logout: () => void;
  updateSkillScore: (skill: string, score: number) => void;
}

const defaultState: GameState = {
  userId: "",
  userName: "",
  xp: 0,
  gems: 0,
  streak: 0,
  lives: 5,
  lastPlayedDate: new Date().toISOString(),
  completedLevels: [],
  currentLevel: 1,
  levelStars: {},
  skillScores: {},
  onboardingDone: false,
  streakFreezeActive: false,
  xpBoostActive: false,
  backendLoaded: false,
  isAuthenticated: false,
};

const STORAGE_KEY = "vontzo_progress";
const GameContext = createContext<GameContextType | undefined>(undefined);

function loadFromStorage(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const user = getStoredUser();
    if (stored) {
      const parsed = JSON.parse(stored);
      const lastPlayed = new Date(parsed.lastPlayedDate ?? Date.now());
      const today = new Date();
      const diffDays = Math.floor(Math.abs(today.getTime() - lastPlayed.getTime()) / 86400000);
      let newStreak = parsed.streak ?? 0;
      if (diffDays === 1) newStreak += 1;
      else if (diffDays > 1) newStreak = 1;
      else if (diffDays === 0 && newStreak === 0) newStreak = 1;
      return {
        ...defaultState, ...parsed,
        userId: user?.userId ?? parsed.userId ?? "",
        userName: user?.name ?? parsed.userName ?? "",
        isAuthenticated: !!user?.userId,
        streak: newStreak,
        lastPlayedDate: today.toISOString(),
        backendLoaded: false,
      };
    }
    if (user) {
      return { ...defaultState, userId: user.userId, userName: user.name, isAuthenticated: true };
    }
  } catch { /* ignore */ }
  return defaultState;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(loadFromStorage);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncedOnce = useRef(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Load from backend on mount (when authenticated)
  useEffect(() => {
    const user = getStoredUser();
    if (!user?.userId) return;
    api.getUser(user.userId)
      .then((u) => {
        setState((prev) => ({
          ...prev,
          userId: u.id,
          userName: u.name,
          xp: u.xp,
          gems: u.gems ?? 0,
          streak: u.streak,
          lives: u.hearts,
          currentLevel: u.currentLevel,
          completedLevels: Array.isArray(u.completedLevels) ? u.completedLevels as number[] : prev.completedLevels,
          levelStars: (u.levelStars as Record<number, number>) ?? prev.levelStars,
          skillScores: (u.skillScores as Record<string, number>) ?? prev.skillScores,
          onboardingDone: u.onboardingDone || prev.onboardingDone,
          streakFreezeActive: u.streakFreezeActive,
          xpBoostActive: !!(u.xpBoostUntil && new Date(u.xpBoostUntil) > new Date()),
          backendLoaded: true,
          isAuthenticated: true,
        }));
      })
      .catch(() => setState((prev) => ({ ...prev, backendLoaded: true })));
  }, []);

  // Debounced backend sync
  useEffect(() => {
    if (!state.backendLoaded || !state.userId) return;
    if (!syncedOnce.current) { syncedOnce.current = true; return; }
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    syncTimerRef.current = setTimeout(() => {
      api.syncUser(state.userId, {
        xp: state.xp, gems: state.gems, currentLevel: state.currentLevel,
        completedLevels: state.completedLevels, levelStars: state.levelStars,
        skillScores: state.skillScores, streak: state.streak, onboardingDone: state.onboardingDone,
      }).catch(() => {});
    }, 1500);
    return () => { if (syncTimerRef.current) clearTimeout(syncTimerRef.current); };
  }, [state.xp, state.gems, state.currentLevel, state.completedLevels, state.levelStars, state.skillScores, state.streak, state.onboardingDone, state.backendLoaded, state.userId]);

  const xpMultiplier = state.xpBoostActive ? 2 : 1;

  const addXP = (amount: number) =>
    setState((prev) => ({ ...prev, xp: prev.xp + amount * xpMultiplier }));

  const addGems = (amount: number) =>
    setState((prev) => ({ ...prev, gems: prev.gems + amount }));

  const spendXP = (amount: number): boolean => {
    if (state.xp < amount) return false;
    setState((prev) => ({ ...prev, xp: Math.max(0, prev.xp - amount) }));
    return true;
  };

  const spendGems = (amount: number): boolean => {
    if (state.gems < amount) return false;
    setState((prev) => ({ ...prev, gems: Math.max(0, prev.gems - amount) }));
    return true;
  };

  const loseLife = () => {
    setState((prev) => ({ ...prev, lives: Math.max(0, prev.lives - 1) }));
    if (state.userId) {
      api.loseHeart(state.userId).then((r) => setState((prev) => ({ ...prev, lives: r.hearts }))).catch(() => {});
    }
  };

  const refillLives = (spendXp = false) => {
    if (spendXp) {
      if (state.xp < 50) return;
      setState((prev) => ({ ...prev, lives: 5, xp: prev.xp - 50 }));
      if (state.userId) api.refillHearts(state.userId, true).then((r) => setState((prev) => ({ ...prev, lives: r.hearts, xp: r.xp }))).catch(() => {});
    } else {
      setState((prev) => ({ ...prev, lives: 5 }));
      if (state.userId) api.refillHearts(state.userId, false).catch(() => {});
    }
  };

  const completeLevel = (levelId: number, stars: number) => {
    setState((prev) => {
      const isNew = !prev.completedLevels.includes(levelId);
      const newCompleted = isNew ? [...prev.completedLevels, levelId] : prev.completedLevels;
      const newLevel = isNew ? Math.max(prev.currentLevel, levelId + 1) : prev.currentLevel;
      const gemBonus = isNew ? Math.max(1, stars) : 0;
      return {
        ...prev,
        completedLevels: newCompleted,
        currentLevel: newLevel,
        levelStars: { ...prev.levelStars, [levelId]: Math.max(prev.levelStars[levelId] || 0, stars) },
        gems: prev.gems + gemBonus,
      };
    });
  };

  const updateSkillScore = (skill: string, score: number) => {
    setState((prev) => ({
      ...prev,
      skillScores: { ...prev.skillScores, [skill]: Math.max(prev.skillScores[skill] ?? 0, score) },
    }));
  };

  const resetProgress = () => {
    const base = { ...defaultState, userId: state.userId, userName: state.userName, isAuthenticated: state.isAuthenticated, backendLoaded: true };
    setState(base);
    if (state.userId) {
      api.syncUser(state.userId, { xp: 0, gems: 0, currentLevel: 1, completedLevels: [], levelStars: {}, skillScores: {}, streak: 0, onboardingDone: false }).catch(() => {});
      api.refillHearts(state.userId, false).catch(() => {});
    }
  };

  const markOnboardingDone = () => setState((prev) => ({ ...prev, onboardingDone: true }));

  const login = (token: string, userId: string, name: string) => {
    storeAuth(token, userId, name);
    setState((prev) => ({ ...prev, userId, userName: name, isAuthenticated: true, backendLoaded: false }));
    api.getUser(userId).then((u) => {
      setState((prev) => ({
        ...prev,
        xp: u.xp, gems: u.gems ?? 0, streak: u.streak, lives: u.hearts,
        currentLevel: u.currentLevel,
        completedLevels: Array.isArray(u.completedLevels) ? u.completedLevels as number[] : [],
        levelStars: (u.levelStars as Record<number, number>) ?? {},
        skillScores: (u.skillScores as Record<string, number>) ?? {},
        onboardingDone: u.onboardingDone,
        streakFreezeActive: u.streakFreezeActive,
        xpBoostActive: !!(u.xpBoostUntil && new Date(u.xpBoostUntil) > new Date()),
        backendLoaded: true,
      }));
    }).catch(() => setState((prev) => ({ ...prev, backendLoaded: true })));
  };

  const logout = () => {
    clearAuth();
    setState({ ...defaultState });
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <GameContext.Provider value={{ state, addXP, addGems, spendXP, spendGems, loseLife, refillLives, completeLevel, resetProgress, markOnboardingDone, login, logout, updateSkillScore }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within a GameProvider");
  return ctx;
}
