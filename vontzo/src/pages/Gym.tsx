import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Zap, Mic, CheckCircle, XCircle, Loader2, ChevronRight, RotateCcw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { soundCorrect, soundWrong, soundClick } from "@/lib/sounds";
import { useGame } from "@/components/GameContext";

interface Objection {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  coaching: string;
}

interface PitchResult {
  score: number;
  breakdown: { clarity: number; confidence: number; valueProposition: number; callToAction: number };
  strengths: string[];
  improvements: string[];
  verdict: string;
}

function RadialScore({ score }: { score: number }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";
  return (
    <svg width="120" height="120" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" transform="rotate(-90 50 50)" />
      <text x="50" y="55" textAnchor="middle" fill={color} fontSize="22" fontWeight="900">{score}</text>
    </svg>
  );
}

function RapidFire({ onDone }: { onDone: (score: number) => void }) {
  const [objections, setObjections] = useState<Objection[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch("/api/gym/objections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => { setObjections(d.objections ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || selected !== null) return;
    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          handleSelect(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx, loading, selected]);

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    clearInterval(timerRef.current!);
    setSelected(i);
    const obj = objections[idx];
    if (i === obj?.correctIndex) { soundCorrect(); setScore(s => s + 1); }
    else soundWrong();
    setTimeout(() => {
      if (idx + 1 >= objections.length) { onDone(score + (i === obj?.correctIndex ? 1 : 0)); }
      else { setIdx(i2 => i2 + 1); setSelected(null); }
    }, 2000);
  };

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!objections.length) return <div className="flex-1 flex items-center justify-center text-muted-foreground">Could not load objections. Try again.</div>;

  const obj = objections[idx];
  const progress = ((idx) / objections.length) * 100;

  return (
    <div className="flex flex-col flex-1 p-4 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <span className="font-black text-primary text-lg">{timeLeft}s</span>
        <span className="font-bold text-muted-foreground text-sm">{idx + 1}/{objections.length}</span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 mb-6">
        <p className="text-foreground font-bold text-lg leading-relaxed">"{obj.text}"</p>
      </div>

      <div className="space-y-3 mb-6">
        {obj.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === obj.correctIndex;
          let cls = "bg-card border-border text-foreground hover:bg-card/80";
          if (selected !== null) {
            if (isCorrect) cls = "bg-green-500/20 border-green-500 text-green-300";
            else if (isSelected) cls = "bg-destructive/20 border-destructive text-red-300";
            else cls = "opacity-40 bg-card border-border text-foreground";
          }
          return (
            <button key={i} disabled={selected !== null} onClick={() => handleSelect(i)}
              className={cn("w-full p-4 rounded-xl border-2 text-left font-semibold transition-all flex items-center gap-3", cls)}>
              {selected !== null && isCorrect && <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />}
              {selected !== null && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
              {(selected === null || (!isCorrect && !isSelected)) && <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center shrink-0 text-sm">{String.fromCharCode(65 + i)}</span>}
              {opt}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-foreground font-medium">
          <span className="font-black text-primary block mb-1">Rocco's tip:</span>
          {obj.coaching}
        </motion.div>
      )}
    </div>
  );
}

function PitchPerfect() {
  const [pitch, setPitch] = useState("");
  const [result, setResult] = useState<PitchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const { addXP } = useGame();
  const xpAwarded = useRef(false);

  const score = async () => {
    if (pitch.trim().length < 20) return;
    setLoading(true);
    try {
      const res = await fetch("/api/gym/pitch-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pitch }),
      });
      const data = await res.json();
      setResult(data);
      if (!xpAwarded.current) { addXP(15); xpAwarded.current = true; }
      soundCorrect();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const breakdownLabels: Record<string, string> = { clarity: "Clarity", confidence: "Confidence", valueProposition: "Value Prop", callToAction: "Call to Action" };
    return (
      <div className="flex-1 p-4 max-w-lg mx-auto w-full space-y-5 pb-8">
        <div className="flex flex-col items-center">
          <RadialScore score={result.score} />
          <p className="text-lg font-black text-foreground mt-2">{result.verdict}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(result.breakdown).map(([key, val]) => (
            <div key={key} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-2xl font-black text-primary">{val}</div>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wide">{breakdownLabels[key]}</div>
            </div>
          ))}
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 space-y-1">
          <p className="font-black text-green-400 text-sm uppercase tracking-wide mb-2">Strengths</p>
          {result.strengths.map((s, i) => <p key={i} className="text-sm text-foreground font-medium flex items-start gap-2"><CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />{s}</p>)}
        </div>
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-1">
          <p className="font-black text-amber-400 text-sm uppercase tracking-wide mb-2">To Improve</p>
          {result.improvements.map((s, i) => <p key={i} className="text-sm text-foreground font-medium flex items-start gap-2"><Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />{s}</p>)}
        </div>
        <Button onClick={() => { setResult(null); setPitch(""); xpAwarded.current = false; }} variant="outline" className="w-full">
          <RotateCcw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 max-w-lg mx-auto w-full flex flex-col gap-5">
      <div className="bg-card border border-border rounded-2xl p-4">
        <p className="font-bold text-muted-foreground text-sm mb-2">Context: B2B SaaS. Prospect just answered your cold call. You have 30 seconds.</p>
        <p className="text-foreground font-bold">Write your best opening pitch below.</p>
      </div>
      <textarea
        className="flex-1 min-h-[180px] p-4 rounded-2xl bg-card border-2 border-border focus:border-primary focus:outline-none text-foreground font-medium resize-none placeholder:text-muted-foreground"
        placeholder="Hi [Name], I'll be quick — I help [role] at companies like yours to... Is this relevant for you?"
        value={pitch}
        onChange={e => setPitch(e.target.value)}
        maxLength={500}
      />
      <div className="text-right text-xs text-muted-foreground">{pitch.length}/500</div>
      <Button
        onClick={score}
        disabled={loading || pitch.trim().length < 20}
        className="w-full h-14 bg-primary text-white font-black text-lg uppercase tracking-wider shadow-[0_6px_0_#003a9a] active:shadow-none active:translate-y-[6px]"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Mic className="w-5 h-5 mr-2" />Score My Pitch</>}
      </Button>
    </div>
  );
}

type Mode = null | "rapid" | "pitch";

export default function Gym() {
  const [mode, setMode] = useState<Mode>(null);
  const [rapidResult, setRapidResult] = useState<number | null>(null);

  if (mode === "rapid" && rapidResult === null) {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-3">
          <button onClick={() => setMode(null)} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="font-black text-lg text-foreground uppercase tracking-widest">Rapid Fire</h1>
        </div>
        <RapidFire onDone={(s) => setRapidResult(s)} />
      </div>
    );
  }

  if (mode === "rapid" && rapidResult !== null) {
    const total = 5;
    const pct = Math.round((rapidResult / total) * 100);
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background items-center justify-center p-6 gap-6">
        <RadialScore score={pct} />
        <div className="text-center">
          <h2 className="text-3xl font-black text-foreground">{rapidResult}/{total} Correct</h2>
          <p className="text-muted-foreground mt-1">{pct >= 80 ? "Elite closer. Keep it up." : pct >= 60 ? "Solid — review the missed ones." : "Study the objection bank and retry."}</p>
        </div>
        <Button onClick={() => { setMode(null); setRapidResult(null); soundClick(); }} className="bg-primary text-white font-bold px-8">Back to Gym</Button>
      </div>
    );
  }

  if (mode === "pitch") {
    return (
      <div className="flex flex-col min-h-[100dvh] bg-background">
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex items-center gap-3">
          <button onClick={() => setMode(null)} className="text-muted-foreground hover:text-foreground"><ChevronRight className="w-5 h-5 rotate-180" /></button>
          <h1 className="font-black text-lg text-foreground uppercase tracking-widest">Pitch Perfect</h1>
        </div>
        <PitchPerfect />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-[100dvh] bg-background">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border p-4 flex flex-col items-center pt-8">
        <Dumbbell className="w-12 h-12 text-primary mb-2" />
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Gym</h1>
        <p className="text-muted-foreground text-sm mt-1">AI-powered practice modes</p>
      </div>
      <div className="flex-1 p-4 max-w-xl mx-auto w-full space-y-4 pb-8 mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { soundClick(); setMode("rapid"); }}
          className="w-full bg-card border-2 border-primary/40 rounded-2xl p-6 text-left hover:border-primary transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-xl text-foreground">Rapid Fire Objections</h2>
              <p className="text-muted-foreground text-sm">5 objections, 20 seconds each</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            AI generates real prospect objections. Pick the best response under pressure. Builds instinct for live calls.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Fast-paced</span>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">AI objections</span>
          </div>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { soundClick(); setMode("pitch"); }}
          className="w-full bg-card border-2 border-border rounded-2xl p-6 text-left hover:border-primary transition-all"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Mic className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h2 className="font-black text-xl text-foreground">Pitch Perfect</h2>
              <p className="text-muted-foreground text-sm">Write and score your pitch</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Write your best 30-second sales pitch. AI scores it 0-100 across clarity, value prop, confidence, and call-to-action.
          </p>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full">+15 XP</span>
            <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full">AI scored</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
