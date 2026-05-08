import { useGame } from "@/components/GameContext";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Trophy, Star, Flame, CheckCircle, Heart, Award, Zap, Gem, Dumbbell, Target, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

// --- Filo Index Radar Chart ---
interface RadarProps {
  skills: { label: string; value: number }[];
}
function FiloRadar({ skills }: RadarProps) {
  const cx = 100, cy = 100, r = 70;
  const n = skills.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const pt = (i: number, radius: number) => ({
    x: cx + radius * Math.cos(angle(i)),
    y: cy + radius * Math.sin(angle(i)),
  });

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = skills.map((s, i) => pt(i, r * Math.min(s.value / 100, 1)));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[240px]">
      {/* Grid rings */}
      {rings.map((ring, ri) => {
        const pts = skills.map((_, i) => pt(i, r * ring));
        const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
        return <path key={ri} d={path} fill="none" stroke="hsl(var(--border))" strokeWidth="0.75" />;
      })}
      {/* Axes */}
      {skills.map((_, i) => {
        const end = pt(i, r);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="hsl(var(--border))" strokeWidth="0.75" />;
      })}
      {/* Data area */}
      <path d={dataPath} fill="hsla(var(--primary) / 0.25)" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinejoin="round" />
      {/* Data points */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
      ))}
      {/* Labels */}
      {skills.map((s, i) => {
        const labelR = r + 18;
        const p = pt(i, labelR);
        const anchor = p.x < cx - 5 ? "end" : p.x > cx + 5 ? "start" : "middle";
        return (
          <text key={i} x={p.x} y={p.y + 3} textAnchor={anchor} fontSize="8" fontWeight="700" fill="hsl(var(--muted-foreground))" className="uppercase tracking-wide">
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}

function calcFiloSkills(completedLevels: number[], levelStars: Record<number, number>) {
  const sectionSkills = [
    { label: "Cold Call", levels: [1, 2, 3] },
    { label: "Discovery", levels: [4, 5, 6] },
    { label: "Objections", levels: [7, 8, 9] },
    { label: "Demo", levels: [10, 11, 12] },
    { label: "Closing", levels: [13, 14, 15] },
  ];
  return sectionSkills.map((s) => {
    const done = s.levels.filter((l) => completedLevels.includes(l));
    const stars = done.reduce((acc, l) => acc + (levelStars[l] ?? 0), 0);
    const maxStars = s.levels.length * 3;
    const value = Math.round((stars / maxStars) * 100);
    return { label: s.label, value };
  });
}

// Rank label based on XP
function rankLabel(xp: number): string {
  if (xp < 100) return "Rookie";
  if (xp < 300) return "Prospect";
  if (xp < 600) return "Rep";
  if (xp < 1000) return "Closer";
  return "Closer Hero";
}

export default function Profile() {
  const { state, resetProgress, logout } = useGame();

  const badges = [
    { id: "first_sale", label: "First Sale", desc: "Complete your first level", Icon: Trophy, earned: state.completedLevels.length >= 1 },
    { id: "streak_3", label: "On a Roll", desc: "3-day streak", Icon: Flame, earned: state.streak >= 3 },
    { id: "streak_7", label: "7-Day Warrior", desc: "7 days in a row", Icon: Flame, earned: state.streak >= 7 },
    { id: "sharp_eye", label: "Sharp Eye", desc: "Complete 5 levels", Icon: Star, earned: state.completedLevels.length >= 5 },
    { id: "halfway", label: "Halfway There", desc: "Complete 8 levels", Icon: Target, earned: state.completedLevels.length >= 8 },
    { id: "closer", label: "The Closer", desc: "All 15 levels done", Icon: Award, earned: state.completedLevels.length >= 15 },
    { id: "xp_500", label: "XP Hunter", desc: "Earn 500 XP total", Icon: Zap, earned: state.xp >= 500 },
    { id: "gym_rat", label: "Gym Rat", desc: "Use Gym mode", Icon: Dumbbell, earned: false },
  ];

  const filoSkills = calcFiloSkills(state.completedLevels, state.levelStars);
  const rank = rankLabel(state.xp);

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-background pb-8">
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6 bg-card border-b border-border relative">
        <button onClick={logout} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground p-2">
          <LogOut className="w-4 h-4" />
        </button>
        <div className="relative w-28 h-28 mb-3">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
          <RoccoCharacter expression="neutral" className="w-full h-full relative z-10 filter drop-shadow-[0_0_16px_rgba(0,86,210,0.7)]" />
        </div>
        <h1 className="text-2xl font-black text-foreground uppercase tracking-widest">{state.userName}</h1>
        <div className="flex items-center gap-2 mt-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary font-bold text-sm">
          <Trophy className="w-3.5 h-3.5" />
          <span>{rank}</span>
        </div>
      </div>

      <div className="flex-1 p-4 max-w-xl w-full mx-auto space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Star className="w-6 h-6 text-primary fill-primary/20" />, value: state.xp, label: "Total XP" },
            { icon: <Gem className="w-6 h-6 text-cyan-400" />, value: state.gems, label: "Gems" },
            { icon: <Flame className="w-6 h-6 text-orange-500 fill-orange-500/20" />, value: state.streak, label: "Day Streak" },
            { icon: <Heart className="w-6 h-6 text-destructive fill-destructive/20" />, value: `${state.lives}/5`, label: "Hearts" },
            { icon: <CheckCircle className="w-6 h-6 text-green-500" />, value: `${state.completedLevels.length}/15`, label: "Levels Done" },
            { icon: <Trophy className="w-6 h-6 text-amber-400" />, value: state.currentLevel, label: "Current Level" },
          ].map(({ icon, value, label }) => (
            <div key={label} className="bg-card p-4 rounded-2xl border border-border flex flex-col items-center text-center">
              {icon}
              <span className="text-2xl font-black text-foreground mt-1">{value}</span>
              <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* Filo Index */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Filo Index</h2>
          <p className="text-xs text-muted-foreground mb-4">Your sales skill profile across 5 dimensions</p>
          <div className="flex flex-col items-center gap-4">
            <FiloRadar skills={filoSkills} />
            <div className="grid grid-cols-5 gap-2 w-full">
              {filoSkills.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-black text-primary">{s.value}</div>
                  <div className="text-[9px] text-muted-foreground font-bold uppercase leading-tight">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-3">Achievements</h2>
          <div className="grid grid-cols-4 gap-2">
            {badges.map((badge) => {
              const { Icon, earned } = badge;
              return (
                <div key={badge.id} className={`rounded-xl p-2.5 flex flex-col items-center text-center gap-1 ${earned ? "bg-card border border-primary/40" : "bg-card border border-border opacity-40 grayscale"}`}>
                  <Icon className={`w-5 h-5 ${earned ? "text-primary" : "text-muted-foreground"}`} />
                  <span className="font-bold text-[10px] text-foreground leading-tight">{badge.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Streak Freeze */}
        {state.streakFreezeActive && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-400 shrink-0" />
            <div>
              <p className="font-bold text-foreground text-sm">Streak Freeze Active</p>
              <p className="text-xs text-muted-foreground">Your streak is protected for one missed day</p>
            </div>
          </div>
        )}

        {/* Reset */}
        <div className="flex justify-center pt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-destructive border-destructive hover:bg-destructive hover:text-white" data-testid="button-reset-progress">
                Reset Progress
              </Button>
            </DialogTrigger>
            <DialogContent className="border-border">
              <DialogHeader>
                <DialogTitle>Reset all progress?</DialogTitle>
                <DialogDescription>This cannot be undone. All XP, gems, streaks, and completed levels will be lost.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-col sm:flex-col gap-2">
                <Button variant="destructive" onClick={resetProgress} data-testid="button-confirm-reset">Yes, Reset Everything</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
