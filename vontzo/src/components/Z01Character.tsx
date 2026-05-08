import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function Z01Character({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-slate-800 border-2 border-cyan-500/60",
        className
      )}
      style={{ filter: "drop-shadow(0 0 20px rgba(6,182,212,0.5))" }}
    >
      <Bot className="w-3/5 h-3/5 text-cyan-400" strokeWidth={1.5} />
    </div>
  );
}
