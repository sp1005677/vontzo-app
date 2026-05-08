import { useLocation } from "wouter";
import { Map, Trophy, User, ShoppingBag, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { soundClick } from "@/lib/sounds";

const tabs = [
  { name: "Learn", href: "/map", icon: Map },
  { name: "Gym", href: "/gym", icon: Dumbbell },
  { name: "League", href: "/league", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Shop", href: "/shop", icon: ShoppingBag },
];

export function BottomNavbar() {
  const [location, setLocation] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-card/95 backdrop-blur-md border-t border-border flex items-center justify-around px-1">
      {tabs.map((tab) => {
        const isActive = location === tab.href;
        const Icon = tab.icon;
        return (
          <button
            key={tab.name}
            data-testid={`nav-${tab.name.toLowerCase()}`}
            onClick={() => { soundClick(); setLocation(tab.href); }}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative",
              isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn("p-1 rounded-lg transition-all", isActive && "bg-primary/10")}>
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
            </div>
            <span className={cn("text-[9px] font-bold uppercase tracking-wide", isActive ? "text-primary font-black" : "")}>{tab.name}</span>
            {isActive && <span className="absolute bottom-0 w-5 h-0.5 bg-primary rounded-full" />}
          </button>
        );
      })}
    </div>
  );
}
