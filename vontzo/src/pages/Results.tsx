import { useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGame } from "@/components/GameContext";
import { LEVELS } from "@/data/levels";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Button } from "@/components/ui/button";
import { Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { soundLevelComplete } from "@/lib/sounds";

export default function Results() {
  const { levelId } = useParams();
  const [, setLocation] = useLocation();
  const { completeLevel, addXP } = useGame();
  
  const level = LEVELS.find(l => l.id === Number(levelId));
  const scoreStr = sessionStorage.getItem(`run_score_${levelId}`);
  const score = scoreStr ? parseInt(scoreStr, 10) : 0;
  const total = 5;

  useEffect(() => {
    if (level) {
      soundLevelComplete(); 
      if (score >= 3) { 
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#2563eb', '#60a5fa', '#fbbf24', '#ffffff'] }); 
      }

      let stars = 1;
      if (score === 5) stars = 3;
      else if (score >= 3) stars = 2;
      else stars = 1;
      
      if (score === 0) stars = 0;

      let bonusXP = 25; // Completion bonus
      if (score === 5) bonusXP += 50; // Perfect score bonus

      completeLevel(level.id, stars);
      addXP(bonusXP);
    }
  }, []);

  if (!level) {
    setLocation("/map");
    return null;
  }

  let roccoFeedback = "";
  let expression: "neutral" | "happy" | "sad" | "thinking" = "neutral";
  
  if (score === 5) {
    roccoFeedback = "Flawless! You're built for the arena.";
    expression = "happy";
  } else if (score >= 3) {
    roccoFeedback = "Solid run. Keep sharpening.";
    expression = "thinking";
  } else {
    roccoFeedback = "Back to basics — you'll get it.";
    expression = "sad";
  }

  const isNextLevelAvailable = level.id < LEVELS.length;

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="mb-8 text-yellow-400 relative z-10"
      >
        <Trophy className="w-32 h-32 filter drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
      </motion.div>

      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-6 max-w-md w-full relative z-10"
      >
        <h1 className="text-4xl font-black text-white uppercase tracking-widest">
          Level Complete
        </h1>
        <p className="text-xl text-primary font-bold uppercase tracking-wider">
          {level.name}
        </p>

        <div className="bg-card border border-border p-6 rounded-3xl shadow-2xl flex flex-col items-center gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <div className="text-6xl font-black text-white drop-shadow-md">
            {score} <span className="text-3xl text-muted-foreground">/ {total}</span>
          </div>
          
          <div className="flex gap-3 text-yellow-400 mt-2">
            {[1, 2, 3].map((star) => (
              <motion.div
                key={star}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4 + (star * 0.1), type: "spring" }}
              >
                <Star 
                  className={cn(
                    "w-12 h-12 transition-all filter drop-shadow-md",
                    star <= (score === 5 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0)
                      ? "fill-yellow-400 text-yellow-400 scale-110" 
                      : "text-slate-600 fill-slate-800 scale-100 opacity-30"
                  )} 
                />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 bg-primary/10 border border-primary/20 p-6 rounded-2xl relative overflow-hidden mt-8">
          <div className="w-20 h-20 shrink-0 relative">
            <div className="absolute inset-0 bg-primary/30 rounded-full blur-[15px] pointer-events-none" />
            <RoccoCharacter expression={expression} className="w-full h-full relative z-10 filter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
          </div>
          <p className="text-left font-black text-xl text-white leading-tight italic">
            "{roccoFeedback}"
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-8">
          {isNextLevelAvailable && (
            <Button 
              onClick={() => setLocation(`/arena/${level.id + 1}`)}
              className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xl h-16 uppercase tracking-widest rounded-2xl shadow-[0_6px_0_hsl(var(--primary-border))] active:shadow-none active:translate-y-[6px] transition-all"
            >
              Next Level
            </Button>
          )}
          <Button 
            variant="outline"
            onClick={() => setLocation("/map")}
            className="w-full bg-card hover:bg-card/80 text-foreground font-black text-xl h-16 uppercase tracking-widest rounded-2xl shadow-[0_6px_0_hsl(var(--card-border))] active:shadow-none active:translate-y-[6px] transition-all border-2"
          >
            Review Map
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
