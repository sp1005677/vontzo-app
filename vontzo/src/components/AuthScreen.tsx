import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoccoCharacter } from "@/components/RoccoCharacter";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import roccoLogo from "@/assets/vontzo_logo.png";

interface Props {
  onAuth: (token: string, userId: string, name: string) => void;
}

export function AuthScreen({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = mode === "signup"
        ? { name: name.trim(), email: email.trim(), password }
        : { email: email.trim(), password };

      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      onAuth(data.token, data.userId, data.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center px-5 py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex flex-col items-center"
      >
        {/* Logo + Character */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
          <RoccoCharacter expression="neutral" className="w-28 h-28 relative z-10 filter drop-shadow-[0_0_24px_rgba(0,86,210,0.6)]" />
        </div>
        <img src={roccoLogo} alt="VONTZO" className="h-8 mb-2 object-contain" />
        <p className="text-muted-foreground text-sm mb-8 text-center">Sales Sharpened. Every Day.</p>

        {/* Tab Toggle */}
        <div className="flex w-full bg-card border border-border rounded-xl p-1 mb-6">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                mode === m
                  ? "bg-primary text-white shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="w-full space-y-4">
          <AnimatePresence>
            {mode === "signup" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === "signup"}
                  className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
          />

          <div className="relative">
            <input
              type={showPw ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 pr-12 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm font-medium text-center"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-lg uppercase tracking-wider shadow-[0_6px_0_#003a9a] active:shadow-none active:translate-y-[6px] transition-all"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground mt-6 text-center">
          Sales training for closers. Master objections, pitches, and discovery.
        </p>
      </motion.div>
    </div>
  );
}
