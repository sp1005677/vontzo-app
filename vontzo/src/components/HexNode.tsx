import { Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface HexNodeProps {
  levelId: number;
  status: "locked" | "available" | "completed";
  stars?: number;
  onClick?: () => void;
  className?: string;
}

export function HexNode({ levelId, status, stars = 0, onClick, className }: HexNodeProps) {
  const isLocked = status === "locked";
  const isAvailable = status === "available";
  const isCompleted = status === "completed";

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center w-24 h-28 cursor-pointer transition-transform duration-200",
        isLocked ? "opacity-50 cursor-not-allowed" : "hover:scale-105",
        isAvailable && "animate-pulse",
        className
      )}
      onClick={!isLocked ? onClick : undefined}
    >
      <div 
        className={cn(
          "absolute inset-0 z-0",
          "clip-hexagon",
          isLocked ? "bg-slate-800" : 
          isCompleted ? "bg-blue-600" : "bg-blue-500"
        )}
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          boxShadow: !isLocked ? "0 8px 0 rgba(0,0,0,0.2) inset" : "none"
        }}
      >
        <div 
          className={cn(
            "absolute inset-1 clip-hexagon",
            isLocked ? "bg-slate-900" : 
            isCompleted ? "bg-blue-500" : "bg-blue-400"
          )}
          style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        {isLocked && <Lock className="w-8 h-8 text-slate-600" />}
        {!isLocked && (
          <span className="text-3xl font-black text-white drop-shadow-md">
            {levelId}
          </span>
        )}
        
        {isCompleted && (
          <div className="absolute -bottom-4 flex gap-0.5">
            {[1, 2, 3].map((star) => (
              <Star 
                key={star} 
                className={cn(
                  "w-4 h-4", 
                  star <= stars ? "text-yellow-400 fill-yellow-400" : "text-slate-600 fill-slate-800"
                )} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
