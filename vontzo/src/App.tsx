import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Map from "@/pages/Map";
import Arena from "@/pages/Arena";
import Results from "@/pages/Results";
import League from "@/pages/League";
import Profile from "@/pages/Profile";
import Shop from "@/pages/Shop";
import Gym from "@/pages/Gym";
import { GameProvider, useGame } from "@/components/GameContext";
import { MainLayout } from "@/components/MainLayout";
import { AuthScreen } from "@/components/AuthScreen";

const queryClient = new QueryClient();

function AuthGate({ children }: { children: React.ReactNode }) {
  const { state, login } = useGame();
  const [, setLocation] = useLocation();

  if (!state.isAuthenticated) {
    return (
      <AuthScreen
        onAuth={(token, userId, name) => {
          login(token, userId, name);
          setLocation("/map");
        }}
      />
    );
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/arena/:levelId" component={Arena} />
      <Route path="/results/:levelId" component={Results} />
      <Route path="/map" component={() => <MainLayout><Map /></MainLayout>} />
      <Route path="/league" component={() => <MainLayout><League /></MainLayout>} />
      <Route path="/profile" component={() => <MainLayout><Profile /></MainLayout>} />
      <Route path="/shop" component={() => <MainLayout><Shop /></MainLayout>} />
      <Route path="/gym" component={() => <MainLayout><Gym /></MainLayout>} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GameProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthGate>
              <Router />
            </AuthGate>
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </GameProvider>
    </QueryClientProvider>
  );
}

export default App;
