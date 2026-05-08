import { useState } from "react";
import { useGame } from "@/components/GameContext";
import { ShoppingBag, Heart, Zap, Shield, FastForward, Loader2, CheckCircle, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { soundClick, soundCorrect } from "@/lib/sounds";

export default function Shop() {
  const { state, refillLives, spendXP } = useGame();
  const [loading, setLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [xpBoostActive, setXpBoostActive] = useState(state.xpBoostActive);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2800);
  };

  const handleFreeRefill = async () => {
    soundClick();
    if (state.lives > 0) { showToast("Hearts not empty — free refill only at 0 hearts.", false); return; }
    setLoading("free");
    try {
      await api.refillHearts(state.userId, false);
      refillLives(false);
      soundCorrect();
      showToast("Hearts fully refilled!");
    } catch (err) { showToast(err instanceof Error ? err.message : "Refill failed.", false); }
    finally { setLoading(null); }
  };

  const handleXpRefill = async () => {
    soundClick();
    if (state.xp < 50) { showToast("Need 50 XP to refill.", false); return; }
    setLoading("xp");
    try {
      const res = await api.buyItem(state.userId, "heart_refill");
      spendXP(50);
      refillLives(false);
      soundCorrect();
      showToast(`Hearts refilled! ${res.xp} XP remaining.`);
    } catch (err) { showToast(err instanceof Error ? err.message : "Purchase failed.", false); }
    finally { setLoading(null); }
  };

  const handleStreakFreeze = async () => {
    soundClick();
    if (state.xp < 100) { showToast("Need 100 XP for Streak Freeze.", false); return; }
    setLoading("freeze");
    try {
      await api.buyItem(state.userId, "streak_freeze");
      spendXP(100);
      soundCorrect();
      showToast("Streak Freeze activated!");
    } catch (err) { showToast(err instanceof Error ? err.message : "Purchase failed.", false); }
    finally { setLoading(null); }
  };

  const handleXpBoost = async () => {
    soundClick();
    if (state.xp < 200) { showToast("Need 200 XP for XP Boost.", false); return; }
    setLoading("boost");
    try {
      await api.buyItem(state.userId, "xp_boost");
      spendXP(200);
      setXpBoostActive(true);
      soundCorrect();
      showToast("XP Boost active! 2x XP for 1 hour.");
    } catch (err) { showToast(err instanceof Error ? err.message : "Purchase failed.", false); }
    finally { setLoading(null); }
  };

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-background">
      {/* Header with balances */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 pt-8 pb-4 flex flex-col items-center">
        <ShoppingBag className="w-10 h-10 text-primary mb-1" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Shop</h1>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary/40" />
            <span className="font-black text-primary text-sm">{state.xp} XP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/10 rounded-full border border-cyan-500/20">
            <Gem className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-black text-cyan-400 text-sm">{state.gems} Gems</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-xl px-5 py-3 shadow-xl flex items-center gap-2 text-sm font-bold w-max max-w-[90vw]",
          toast.ok ? "bg-card border border-green-500/30 text-foreground" : "bg-card border border-destructive/30 text-foreground"
        )}>
          {toast.ok
            ? <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
            : <span className="w-4 h-4 text-destructive shrink-0 font-black">!</span>
          }
          {toast.msg}
        </div>
      )}

      <div className="flex-1 p-4 max-w-xl w-full mx-auto space-y-8 pb-24">
        {/* Hearts */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-foreground uppercase tracking-widest">Hearts</h2>
          <div className="bg-card border border-border p-5 rounded-2xl flex flex-col items-center gap-4">
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Heart key={i} className={cn("w-9 h-9 transition-colors", i < state.lives ? "text-destructive fill-destructive" : "text-border fill-background")} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground font-medium">Regen: 1 heart per hour when not full</p>
            {state.lives < 5 ? (
              <div className="flex flex-col gap-2 w-full">
                {state.lives === 0 && (
                  <Button data-testid="button-refill-shop" variant="outline" onClick={handleFreeRefill} disabled={loading === "free"} className="w-full h-12 font-black">
                    {loading === "free" ? <Loader2 className="w-4 h-4 animate-spin" /> : "Free Refill (Hearts at 0)"}
                  </Button>
                )}
                <Button onClick={handleXpRefill} disabled={state.xp < 50 || loading === "xp"} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black shadow-[0_4px_0_#003a9a] active:shadow-none active:translate-y-1 flex items-center gap-2">
                  {loading === "xp" ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4 fill-current" />Refill Hearts — 50 XP</>}
                </Button>
              </div>
            ) : (
              <div className="w-full h-12 flex items-center justify-center bg-muted text-muted-foreground rounded-xl font-black">Max Hearts</div>
            )}
          </div>
        </section>

        {/* Powerups */}
        <section className="space-y-3">
          <h2 className="text-base font-black text-foreground uppercase tracking-widest">Powerups</h2>
          <div className="space-y-3">
            {/* Streak Freeze */}
            <div className={cn("bg-card border border-border p-4 rounded-2xl flex items-center justify-between", state.xp < 100 && !state.streakFreezeActive ? "opacity-70" : "")}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-blue-500/15 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Streak Freeze</p>
                  <p className="text-xs text-muted-foreground">Protect streak for 1 missed day</p>
                </div>
              </div>
              <Button onClick={handleStreakFreeze} disabled={state.xp < 100 || loading === "freeze" || state.streakFreezeActive} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold min-w-[76px]">
                {loading === "freeze" ? <Loader2 className="w-4 h-4 animate-spin" /> : state.streakFreezeActive ? "Active" : "100 XP"}
              </Button>
            </div>

            {/* XP Boost */}
            <div className={cn("bg-card border border-border p-4 rounded-2xl flex items-center justify-between", state.xp < 200 && !xpBoostActive ? "opacity-70" : "")}>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-amber-500/15 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">XP Boost</p>
                  <p className="text-xs text-muted-foreground">2x XP for the next hour</p>
                </div>
              </div>
              <Button onClick={handleXpBoost} disabled={state.xp < 200 || loading === "boost" || xpBoostActive} size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold min-w-[76px]">
                {loading === "boost" ? <Loader2 className="w-4 h-4 animate-spin" /> : xpBoostActive ? "Active" : "200 XP"}
              </Button>
            </div>

            {/* Coming Soon */}
            <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-purple-500/15 rounded-xl flex items-center justify-center">
                  <FastForward className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Skip Level</p>
                  <p className="text-xs text-muted-foreground">Use Gems to skip a tough level</p>
                </div>
              </div>
              <Button variant="secondary" disabled size="sm">Soon</Button>
            </div>

            {/* Gem Store placeholder */}
            <div className="bg-card border border-border p-4 rounded-2xl flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                  <Gem className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">Gem Store</p>
                  <p className="text-xs text-muted-foreground">Buy Gems with real currency</p>
                </div>
              </div>
              <Button variant="secondary" disabled size="sm">Soon</Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
