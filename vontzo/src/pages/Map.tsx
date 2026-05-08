import { useGame } from "@/components/GameContext";
import { HexNode } from "@/components/HexNode";
import { LEVELS } from "@/data/levels";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Flame, Star, Heart, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import vontzoLogo from "@/assets/vontzo_logo.png";

export default function Map() {
  const { state } = useGame();
  const [, setLocation] = useLocation();

  const sections = [
    { id: 1, name: "Section 1: The Rookie", levels: LEVELS.slice(0, 5) },
    { id: 2, name: "Section 2: The Closer", levels: LEVELS.slice(5, 10) },
    { id: 3, name: "Section 3: The Elite", levels: LEVELS.slice(10, 15) },
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center justify-between">
        <img src={vontzoLogo} alt="VONTZO" className="h-8 object-contain" />
        <div className="flex items-center gap-4 font-bold text-sm">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-5 h-5 fill-orange-500" />
            <span>{state.streak}</span>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Star className="w-5 h-5 fill-primary" />
            <span>{state.xp}</span>
          </div>
          <div className="flex items-center gap-1 text-destructive">
            <Heart className="w-5 h-5 fill-destructive" />
            <span>{state.lives}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 flex flex-col items-center space-y-16">
        {sections.map((section, sIndex) => {
          const completedInSection = section.levels.filter(l => state.completedLevels.includes(l.id)).length;
          const totalInSection = section.levels.length;
          const isSectionLocked = section.levels[0].id > state.currentLevel;

          return (
            <div key={section.id} className="w-full max-w-xl flex flex-col items-center">
              {/* Section Header */}
              <div className="w-full bg-gradient-to-b from-primary/30 to-transparent border border-primary/40 rounded-2xl p-6 mb-12 shadow-lg relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-black text-white uppercase tracking-wider">{section.name}</h2>
                  {isSectionLocked && <Lock className="w-6 h-6 text-white/50" />}
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: `${(completedInSection / totalInSection) * 100}%` }}
                  />
                </div>
                <div className="mt-2 text-sm font-bold text-primary-foreground/80 text-right uppercase tracking-wider">
                  {completedInSection} / {totalInSection} Completed
                </div>
              </div>

              {/* Zigzag Levels */}
              <div className="relative flex flex-col items-center">
                {section.levels.map((level, i) => {
                  const isCompleted = state.completedLevels.includes(level.id);
                  const isAvailable = state.currentLevel === level.id;
                  const isLocked = level.id > state.currentLevel;
                  const stars = state.levelStars[level.id] || 0;

                  // Alternate: -60, 0, +60, 0, -60
                  const cycle = i % 4;
                  let translateX = 0;
                  if (cycle === 0) translateX = -60;
                  else if (cycle === 1) translateX = 0;
                  else if (cycle === 2) translateX = 60;
                  else if (cycle === 3) translateX = 0;

                  if (i === 4) translateX = -60; // Just following the 5-item pattern requested

                  return (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + sIndex * 0.1 }}
                      className="relative my-6"
                      style={{ transform: `translateX(${translateX}px)` }}
                    >
                      {/* Connecting Line to next node within section */}
                      {i < section.levels.length - 1 && (
                        <div 
                          className="absolute top-1/2 left-1/2 -z-10"
                          style={{
                            width: '4px',
                            height: '140px',
                            borderLeft: '4px dashed hsl(var(--border))',
                            transformOrigin: 'top left',
                            transform: `rotate(${translateX < 0 && i%2===0 ? -30 : translateX > 0 ? 30 : translateX < 0 ? 30 : -30}deg)`,
                          }}
                        />
                      )}

                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "text-sm font-bold mb-2 absolute -top-10 whitespace-nowrap px-3 py-1 rounded-full",
                          isLocked ? "bg-slate-800 text-slate-400" : "bg-card text-foreground border border-border shadow-md"
                        )}>
                          {level.name}
                        </div>
                        
                        <div className="relative">
                          {isAvailable && (
                            <motion.div 
                              className="absolute inset-0 rounded-full border-2 border-primary/60 pointer-events-none"
                              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }} 
                              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            />
                          )}
                          <HexNode
                            levelId={level.id}
                            status={isCompleted ? "completed" : isAvailable ? "available" : "locked"}
                            stars={stars}
                            onClick={() => {
                              if (!isLocked) {
                                setLocation(`/arena/${level.id}`);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
