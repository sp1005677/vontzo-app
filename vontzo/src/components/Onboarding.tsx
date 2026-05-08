import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Button } from "@/components/ui/button";
import { useGame } from "@/components/GameContext";

const STEPS = [
  {
    expression: "neutral" as const,
    title: "Welcome to VONTZO",
    subtitle: "Train your sales skills daily, just like a sport.",
  },
  {
    expression: "thinking" as const,
    title: "Answer Questions",
    subtitle: "Pick the best sales response. Earn XP and stars.",
  },
  {
    expression: "happy" as const,
    title: "Climb the League",
    subtitle: "Beat Santiago rivals and reach rank #1 in the Closer League.",
  }
];

export function Onboarding() {
  const { markOnboardingDone } = useGame();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      markOnboardingDone();
    }
  };

  const handleSkip = () => {
    markOnboardingDone();
  };

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center text-center max-w-sm p-6"
        >
          <div className="w-40 h-40 relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[20px] pointer-events-none" />
            <RoccoCharacter expression={currentStep.expression} className="w-full h-full relative z-10" />
          </div>
          
          <h2 className="font-black text-2xl mb-4 text-foreground">{currentStep.title}</h2>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            {currentStep.subtitle}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <Button 
              onClick={handleNext} 
              className="w-full font-black text-xl h-14 bg-primary text-primary-foreground shadow-[0_4px_0_#1e40af] active:shadow-none active:translate-y-1"
            >
              {isLast ? "Let us Go" : "Next"}
            </Button>
            
            {!isLast && (
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="w-full font-bold text-muted-foreground hover:text-foreground"
              >
                Skip
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
