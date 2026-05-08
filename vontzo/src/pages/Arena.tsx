import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useGame } from "@/components/GameContext";
import { LEVELS } from "@/data/levels";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Z01Character } from "@/components/Z01Character";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, X, Star, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { soundCorrect, soundWrong } from "@/lib/sounds";
import { api, type CoachResponse } from "@/lib/api";

export default function Arena() {
  const { levelId } = useParams();
  const [, setLocation] = useLocation();
  const { state, loseLife, refillLives, addXP } = useGame();

  const level = LEVELS.find(l => l.id === Number(levelId));

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [roccoExpression, setRoccoExpression] = useState<"neutral" | "happy" | "sad" | "thinking">("thinking");
  const [score, setScore] = useState(0);
  const [showNoLives, setShowNoLives] = useState(false);
  const [coach, setCoach] = useState<CoachResponse | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);

  useEffect(() => {
    if (state.lives === 0) {
      setShowNoLives(true);
    }
  }, []);

  if (!level) {
    setLocation("/map");
    return null;
  }

  const isEliteLevel = level.id >= 11;
  const questions = level.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;

  const handleSelectAnswer = (answerId: string, isCorrect: boolean) => {
    if (selectedAnswer || feedback) return;

    setSelectedAnswer(answerId);
    setCoach(null);

    const chosenAnswer = currentQuestion.answers.find(a => a.id === answerId);
    const correctAnswer = currentQuestion.answers.find(a => a.isCorrect);

    if (isCorrect) {
      soundCorrect();
      setFeedback("correct");
      setRoccoExpression("happy");
      setScore(s => s + 1);
      addXP(10);
    } else {
      soundWrong();
      setFeedback("wrong");
      setRoccoExpression("sad");
      loseLife();
      if (state.lives <= 1) {
        setTimeout(() => setShowNoLives(true), 1500);
      }
    }

    // Fetch AI coach feedback in background
    setCoachLoading(true);
    api
      .getCoachFeedback({
        question: currentQuestion.prompt,
        chosen_answer: chosenAnswer?.text ?? "",
        correct_answer: correctAnswer?.text ?? "",
        level_id: level.id,
      })
      .then((res) => setCoach(res))
      .catch(() => {
        // Fallback to static feedback
        setCoach({
          grade: isCorrect ? "A" : "C",
          feedback: chosenAnswer?.feedback ?? (isCorrect ? "Good read. Keep going." : "Study the correct answer."),
          audio_cue: isCorrect ? "correct" : "wrong",
        });
      })
      .finally(() => setCoachLoading(false));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setFeedback(null);
      setRoccoExpression("thinking");
      setCoach(null);
    } else {
      sessionStorage.setItem(`run_score_${level.id}`, score.toString());
      setLocation(`/results/${level.id}`);
    }
  };

  const gradeColors: Record<string, string> = {
    S: "text-yellow-400 border-yellow-400",
    A: "text-primary border-primary",
    B: "text-yellow-500 border-yellow-500",
    C: "text-destructive border-destructive",
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col relative overflow-hidden">
      {/* Top Bar */}
      <div className="pt-6 px-4 pb-2 flex items-center justify-between gap-4 sticky top-0 z-30 bg-background/90 backdrop-blur-sm">
        <button
          data-testid="button-exit-arena"
          onClick={() => setLocation("/map")}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <Progress value={progress} className="flex-1 h-3" />
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Heart
              key={i}
              className={cn(
                "w-5 h-5",
                i < state.lives
                  ? "text-destructive fill-destructive"
                  : "text-border fill-background"
              )}
            />
          ))}
        </div>
      </div>

      <div className="text-center text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4 px-4">
        {level.name} &mdash; Q{currentQuestionIndex + 1}/{questions.length}
      </div>

      {/* Main Arena */}
      <div className="flex-1 flex flex-col px-4 max-w-2xl w-full mx-auto pb-[240px]">

        {/* Character and Prompt */}
        <div className="flex items-start gap-4 mb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={roccoExpression}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="w-24 h-24 shrink-0 relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-[20px] pointer-events-none" />
              {isEliteLevel ? (
                <Z01Character className="w-full h-full relative z-10" />
              ) : (
                <RoccoCharacter
                  expression={roccoExpression}
                  className="w-full h-full relative z-10 filter drop-shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="bg-card border border-border p-4 rounded-2xl rounded-tl-none shadow-md mt-4 relative z-10">
            <p className="text-foreground text-base md:text-lg leading-relaxed font-medium">
              {currentQuestion.prompt}
            </p>
          </div>
        </div>

        {/* Answers */}
        <div className="flex flex-col gap-4 mt-auto">
          {currentQuestion.answers.map((answer) => {
            const isSelected = selectedAnswer === answer.id;
            const isCorrect = answer.isCorrect;

            let btnClass = "bg-card border-border hover:bg-card/80 text-foreground";
            let shadowClass = "shadow-[0_4px_0_hsl(var(--card-border))] active:shadow-[0_0px_0_hsl(var(--card-border))] active:translate-y-[4px]";

            if (feedback && isSelected) {
              if (isCorrect) {
                btnClass = "bg-green-500 border-green-600 text-white";
                shadowClass = "shadow-[0_4px_0_#166534] translate-y-0";
              } else {
                btnClass = "bg-destructive border-red-700 text-white";
                shadowClass = "shadow-[0_4px_0_#991b1b] translate-y-0";
              }
            } else if (feedback && isCorrect && !isSelected) {
              btnClass = "bg-green-500/20 border-green-600 text-green-400";
              shadowClass = "shadow-[0_4px_0_rgba(22,101,52,0.3)]";
            } else if (feedback && !isSelected) {
              btnClass = "opacity-50 cursor-not-allowed bg-card border-border text-foreground";
              shadowClass = "shadow-[0_4px_0_hsl(var(--card-border))]";
            }

            return (
              <button
                key={answer.id}
                data-testid={`button-answer-${answer.id}`}
                disabled={feedback !== null}
                onClick={() => handleSelectAnswer(answer.id, answer.isCorrect)}
                className={cn(
                  "p-5 rounded-2xl border-2 text-left font-bold text-lg transition-all duration-150",
                  btnClass,
                  shadowClass
                )}
              >
                {answer.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback Drawer */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed bottom-0 left-0 right-0 p-6 md:p-8 border-t-[3px] z-50 rounded-t-3xl min-h-[220px] flex flex-col justify-between",
              feedback === "correct"
                ? "bg-green-500/15 border-green-500 backdrop-blur-xl"
                : "bg-red-500/15 border-destructive backdrop-blur-xl"
            )}
          >
            <div className="max-w-2xl mx-auto w-full">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-4">
                    <h3 className={cn(
                      "text-3xl font-black mb-2 flex items-center gap-2",
                      feedback === "correct" ? "text-green-500" : "text-destructive"
                    )}>
                      {feedback === "correct" ? "Excellent!" : "Not quite."}
                    </h3>
                    {coach && (
                      <div className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center font-black text-xl bg-background",
                        gradeColors[coach.grade] ?? gradeColors["B"]
                      )}>
                        {coach.grade}
                      </div>
                    )}
                    {coachLoading && !coach && (
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    )}
                  </div>
                  <div className={cn(
                    "font-bold text-lg flex items-center gap-1",
                    feedback === "correct" ? "text-green-400" : "text-red-400"
                  )}>
                    {feedback === "correct" ? (
                      <>+10 XP <Star className="w-5 h-5 fill-current" /></>
                    ) : (
                      <>Heart lost <Heart className="w-5 h-5 fill-current" /></>
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {coachLoading && !coach ? (
                  <motion.p
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-muted-foreground font-medium text-base mb-6 italic"
                  >
                    {isEliteLevel ? "Z-01 analyzing..." : "Rocco is coaching..."}
                  </motion.p>
                ) : coach ? (
                  <motion.p
                    key="feedback"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-foreground font-medium text-lg leading-relaxed mb-6 opacity-90"
                  >
                    {coach.feedback}
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <Button
                data-testid="button-continue"
                onClick={handleNext}
                size="lg"
                className={cn(
                  "w-full h-14 rounded-xl font-black text-xl uppercase tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[6px]",
                  feedback === "correct"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-destructive hover:bg-destructive/90 text-white"
                )}
              >
                CONTINUE
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Lives Dialog */}
      <Dialog open={showNoLives} onOpenChange={setShowNoLives}>
        <DialogContent className="sm:max-w-md text-center border-border">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-center mb-2">Out of Hearts!</DialogTitle>
            <DialogDescription className="text-center text-lg">
              You need hearts to keep training. Take a break or refill now.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
            <Heart className="w-24 h-24 text-destructive fill-destructive opacity-50" />
          </div>
          <DialogFooter className="flex-col sm:flex-col gap-3">
            <Button
              data-testid="button-refill-hearts"
              onClick={() => { refillLives(false); setShowNoLives(false); }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-lg h-12 shadow-[0_4px_0_#1e40af] active:shadow-none active:translate-y-1"
            >
              Refill Hearts
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation("/map")}
              className="w-full font-bold text-lg h-12"
            >
              Quit to Map
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
