import { ReactNode } from "react";
import { BottomNavbar } from "./BottomNavbar";

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-background pb-16">
      {children}
      <BottomNavbar />
    </div>
  );
}
