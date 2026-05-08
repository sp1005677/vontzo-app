import { useGame } from "@/components/GameContext";
import { Trophy, Medal, Award, Clock, X, Zap, Flame, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { soundClick } from "@/lib/sounds";
import { api, type LeagueBot } from "@/lib/api";

interface Competitor {
  id: number;
  name: string;
  xp: number;
  isUser: boolean;
  title: string;
  specialty: string;
  winRate: string;
  streak: number;
}

const STATIC_BOTS: Record<number, Omit<Competitor, "xp">> = {
  1: { id: 1, name: 'Alex "The Hunter" Rivera', isUser: false, title: "Elite Closer", specialty: "Cold Calls", winRate: "94%", streak: 31 },
  2: { id: 2, name: "Maya Chen", isUser: false, title: "Discovery Ace", specialty: "Needs Discovery", winRate: "88%", streak: 22 },
  3: { id: 3, name: "Jordan Blake", isUser: false, title: "Objection Slayer", specialty: "Objection Handling", winRate: "82%", streak: 14 },
  5: { id: 5, name: "Casey Morgan", isUser: false, title: "Rookie", specialty: "Email Outreach", winRate: "61%", streak: 5 },
  6: { id: 6, name: "Taylor Swift", isUser: false, title: "Rookie", specialty: "Cold Calls", winRate: "55%", streak: 3 },
  7: { id: 7, name: "Pat Wheeler", isUser: false, title: "Trainee", specialty: "Discovery", winRate: "48%", streak: 1 },
};

function BotProfileModal({ bot, onClose }: { bot: Competitor; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 220 }}
        className="w-full max-w-md bg-card border border-border rounded-t-3xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-black text-foreground">{bot.name}</h2>
            <span className="text-sm font-bold text-primary">{bot.title}</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-background rounded-xl p-3 flex flex-col items-center text-center border border-border">
            <Zap className="w-5 h-5 text-primary mb-1" />
            <span className="text-lg font-black text-foreground">{bot.xp}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">XP</span>
          </div>
          <div className="bg-background rounded-xl p-3 flex flex-col items-center text-center border border-border">
            <Target className="w-5 h-5 text-green-500 mb-1" />
            <span className="text-lg font-black text-foreground">{bot.winRate}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Win Rate</span>
          </div>
          <div className="bg-background rounded-xl p-3 flex flex-col items-center text-center border border-border">
            <Flame className="w-5 h-5 text-orange-500 mb-1" />
            <span className="text-lg font-black text-foreground">{bot.streak}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Streak</span>
          </div>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-1">Specialty</span>
          <span className="font-bold text-foreground">{bot.specialty}</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function League() {
  const { state } = useGame();
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedBot, setSelectedBot] = useState<Competitor | null>(null);
  const [botXp, setBotXp] = useState<Record<number, number>>({});
  const [nextResetAt, setNextResetAt] = useState<Date | null>(null);

  // Fetch live bot data from backend
  useEffect(() => {
    api
      .getLeague()
      .then((data) => {
        const xpMap: Record<number, number> = {};
        data.bots.forEach((b: LeagueBot) => { xpMap[b.id] = b.currentXp; });
        setBotXp(xpMap);
        setNextResetAt(new Date(data.nextResetAt));
      })
      .catch(() => {
        // Use static fallback
        setBotXp({ 1: 4200, 2: 3850, 3: 3100, 5: 520, 6: 380, 7: 210 });
      });
  }, []);

  // Countdown timer — use backend nextResetAt if available, otherwise use nearest Sunday
  useEffect(() => {
    const calc = () => {
      const target = nextResetAt ?? (() => {
        const now = new Date();
        const day = now.getDay();
        const daysUntilSunday = day === 0 ? 7 : 7 - day;
        const t = new Date(now);
        t.setDate(now.getDate() + daysUntilSunday);
        t.setHours(23, 59, 59, 0);
        return t;
      })();

      const diff = target.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("00:00:00"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(
        String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
      );
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [nextResetAt]);

  // Build leaderboard: bots from backend XP, Santiago at position 4
  const leaderboard: Competitor[] = [
    { ...STATIC_BOTS[1], xp: botXp[1] ?? 4200 },
    { ...STATIC_BOTS[2], xp: botXp[2] ?? 3850 },
    { ...STATIC_BOTS[3], xp: botXp[3] ?? 3100 },
    { id: 4, name: "Santiago Pallaress", xp: state.xp, isUser: true, title: "Rising Closer", specialty: "In Training", winRate: "—", streak: state.streak },
    { ...STATIC_BOTS[5], xp: botXp[5] ?? 520 },
    { ...STATIC_BOTS[6], xp: botXp[6] ?? 380 },
    { ...STATIC_BOTS[7], xp: botXp[7] ?? 210 },
  ];

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex flex-col items-center justify-center pt-8">
        <Trophy className="w-12 h-12 text-yellow-400 mb-2" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Closer League</h1>
      </div>

      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-3 border-b border-border mx-4 mb-2">
        <Clock className="w-4 h-4" />
        <span>League resets in</span>
        <span className="font-mono font-bold text-foreground">{timeLeft || "—"}</span>
      </div>

      <div className="flex-1 p-4 max-w-xl w-full mx-auto space-y-3 pb-8">
        {leaderboard.map((user, index) => {
          const rank = index + 1;

          return (
            <motion.div
              key={user.id}
              data-testid={`league-row-${user.id}`}
              whileTap={!user.isUser ? { scale: 0.97 } : {}}
              onClick={() => {
                if (!user.isUser) {
                  soundClick();
                  setSelectedBot(user);
                }
              }}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl border transition-all",
                user.isUser
                  ? "bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(59,130,246,0.2)] scale-[1.02]"
                  : "bg-card border-border cursor-pointer hover:border-primary/40 hover:bg-card/80"
              )}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 flex justify-center shrink-0">
                  {rank === 1 ? (
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  ) : rank === 2 ? (
                    <Medal className="w-6 h-6 text-slate-300" />
                  ) : rank === 3 ? (
                    <Award className="w-6 h-6 text-amber-600" />
                  ) : (
                    <span className="font-bold text-muted-foreground">{rank}</span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={cn("font-bold truncate", user.isUser ? "text-primary text-lg" : "text-foreground")}>
                    {user.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{user.title}</span>
                </div>
              </div>
              <div className="font-black text-lg text-primary shrink-0 ml-2">
                {user.xp} XP
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 mx-4 mb-4 mt-auto bg-card border border-border rounded-xl shadow-lg text-center">
        <p className="font-bold text-lg text-foreground">Your League</p>
        <p className="text-muted-foreground text-sm mt-1">Keep training to reach the top 3 and earn the Gold Badge.</p>
      </div>

      <AnimatePresence>
        {selectedBot && (
          <BotProfileModal bot={selectedBot} onClose={() => setSelectedBot(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
