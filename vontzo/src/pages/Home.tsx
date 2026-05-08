import { useLocation } from "wouter";
import { useGame } from "@/components/GameContext";
import { motion } from "framer-motion";
import { Flame, Star } from "lucide-react";
import vontzoLogo from "@/assets/vontzo_logo.png";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Onboarding } from "@/components/Onboarding";

export default function Home() {
  const { state } = useGame();
  const hasProgress = state.xp > 0 || state.completedLevels.length > 0;
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {!state.onboardingDone && <Onboarding />}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center max-w-md w-full text-center space-y-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <img
            src={vontzoLogo}
            alt="VONTZO"
            style={{
              height: "80px",
              width: "auto",
              objectFit: "contain",
              filter: "drop-shadow(0 0 18px rgba(59,130,246,0.7))",
            }}
          />

          <motion.div
            initial={{ y: 10 }}
            animate={{ y: 0 }}
            transition={{ repeat: Infinity, duration: 2.5, repeatType: "reverse", ease: "easeInOut" }}
            className="w-44 h-44"
          >
            <RoccoCharacter expression="neutral" className="w-full h-full" />
          </motion.div>

          <p className="text-xl text-primary font-bold uppercase" style={{ letterSpacing: "0.45em" }}>
            Sales Sharpened
          </p>
        </motion.div>

        <motion.button
          onClick={() => setLocation("/map")}
          data-testid="button-start-training"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98, y: 4 }}
          className="w-full py-5 bg-primary text-primary-foreground font-black text-xl rounded-xl uppercase tracking-wider shadow-[0_6px_0_#1e40af] active:shadow-[0_0px_0_#1e40af] active:translate-y-[6px] transition-all"
        >
          {hasProgress ? "Continue Training" : "Start Training"}
        </motion.button>

        {hasProgress && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full bg-card p-6 rounded-2xl border border-border shadow-xl"
          >
            <div className="flex justify-between items-center text-foreground font-bold">
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Level</span>
                <span className="text-4xl text-white">{state.currentLevel}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">XP</span>
                <span className="text-4xl text-primary flex items-center gap-1">
                  <Star className="w-6 h-6 fill-primary" /> {state.xp}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Streak</span>
                <span className="text-4xl text-orange-500 flex items-center gap-1">
                  <Flame className="w-6 h-6 fill-orange-500" /> {state.streak}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
