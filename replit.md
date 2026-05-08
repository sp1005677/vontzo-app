# VONTZO: Sales Sharpened

A gamified sales training PWA (Duolingo-style) built with React + Vite + Tailwind CSS, backed by a PostgreSQL database and Express API with AI coaching via OpenAI.

## Run & Operate

- `pnpm --filter @workspace/vontzo run dev` — frontend (port auto-assigned)
- `pnpm --filter @workspace/api-server run dev` — API server (port 8080, proxied at /api)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- React 18 + Vite 6
- Tailwind CSS + shadcn/ui components
- wouter for routing
- framer-motion for animations
- lucide-react for icons
- canvas-confetti for level complete celebration
- Web Audio API sound manager (no audio files needed)
- Express 5 + Drizzle ORM + PostgreSQL (Replit managed)
- OpenAI via Replit AI Integrations (gpt-5-mini, json_object mode)
- bcryptjs + jsonwebtoken for auth

## Theme

- Primary: `#0056D2` (hsl 216 100% 41%)
- Dark BG: `#0b1120` (hsl 222 49% 8%)
- Accent: `#E1F5FE` (hsl 199 93% 94%) — used for highlights
- Dark premium throughout; no light mode

## Where Things Live

### Frontend (`artifacts/vontzo/`)
- `src/pages/` — Home, Map, Arena, Results, League, Profile, Shop, **Gym**
- `src/components/GameContext.tsx` — state + auth + backend sync
- `src/components/AuthScreen.tsx` — Login/Signup UI
- `src/components/RoccoCharacter.tsx` — expression switcher
- `src/components/Z01Character.tsx` — robot character for levels 11-15
- `src/components/BottomNavbar.tsx` — 5-tab nav (Learn, Gym, League, Profile, Shop)
- `src/lib/api.ts` — typed API client with JWT auth header
- `src/lib/sounds.ts` — Web Audio API sound manager
- `src/data/levels.ts` — 15 levels with 5 questions each
- `src/assets/` — Rocco images (4 expressions) + VONTZO logo
- `public/manifest.json` — PWA manifest
- `public/sw.js` — service worker (offline + cache)

### Backend (`artifacts/api-server/`)
- `src/middlewares/requireAuth.ts` — JWT verification middleware
- `src/routes/auth.ts` — POST /api/auth/signup, POST /api/auth/login
- `src/routes/user.ts` — GET/POST user, lose-heart, refill-hearts
- `src/routes/coach.ts` — POST /api/coach — AI grade + feedback
- `src/routes/league.ts` — GET /api/league — bots + nextResetAt (Monday UTC)
- `src/routes/shop.ts` — POST /api/shop/:userId/buy
- `src/routes/gym.ts` — POST /api/gym/pitch-score, POST /api/gym/objections

### Shared Libs (`lib/`)
- `lib/db/src/schema/users.ts` — users table (with email, passwordHash, gems, levelStars, skillScores, xpBoostUntil)
- `lib/db/src/schema/hearts.ts` — hearts + last_heart_loss_at
- `lib/db/src/schema/league.ts` — league_bots + league_reset tables
- `lib/integrations-openai-ai-server/` — OpenAI client wrapper

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/healthz | no | Health check |
| POST | /api/auth/signup | no | Create account, returns JWT |
| POST | /api/auth/login | no | Login, returns JWT |
| GET | /api/user/:userId | JWT | Load user + live heart count |
| POST | /api/user/:userId/sync | JWT | Sync XP/level/streak/gems from frontend |
| POST | /api/user/:userId/lose-heart | JWT | Lose 1 heart, record timestamp |
| POST | /api/user/:userId/refill-hearts | JWT | Free or 50 XP paid refill |
| POST | /api/coach | JWT | AI grade (S/A/B/C) + coaching feedback |
| GET | /api/league | no | Live bot XP + nextResetAt (Monday UTC) |
| POST | /api/shop/:userId/buy | JWT | heart_refill/streak_freeze/xp_boost |
| POST | /api/gym/pitch-score | no | AI scores a pitch 0-100 with breakdown |
| POST | /api/gym/objections | no | AI generates 5 rapid-fire objections |

## Architecture Decisions

- JWT stored in localStorage as `vontzo_token`; userId from JWT payload (no hardcoded users)
- GameContext is source of truth for UI; syncs to backend with 1.5s debounce
- On mount: backend data merged into state (backend wins for XP, hearts, streak, gems)
- Heart timer: server-side calculation — 1 heart per hour from last_heart_loss_at
- League reset: every Monday 00:00 UTC (`nextMondayUtc()` function in league.ts)
- Bot XP drifts hourly (±20-40 XP) to simulate live competition
- AI Coach uses gpt-5-mini with json_object response_format for structured output
- Smart fallback bank if AI is unavailable (randomized tactical feedback)
- Images MUST use `@/assets/` Vite alias — NEVER public URL paths
- Rocco always via `<RoccoCharacter expression="..." />` — Z-01 via `<Z01Character />`
- Routes with BottomNavbar: /map, /gym, /league, /profile, /shop (wrapped in MainLayout)
- Routes without: /, /arena/:id, /results/:id

## Product Features

- **Auth**: Login/Signup with JWT+bcrypt. Rocco character on auth screen. 30-day JWT.
- **Home**: VONTZO logo + Rocco + Start Training. Onboarding carousel for new users.
- **Map**: 15 levels, 3 sections, zigzag hex path, locked until previous done.
- **Arena**: 5-question loop, AI coach feedback via /api/coach, S/A/B/C grade, slide-up drawer. Z-01 for levels 11-15.
- **Results**: Score, stars, confetti on ≥3 correct, level-complete sound. Gems awarded on completion.
- **Gym**: Two AI-powered practice modes — Rapid Fire Objections (5 objections, 20s each) + Pitch Perfect (write pitch, AI scores 0-100).
- **League**: 7-bot leaderboard, player at #4, live bot XP from DB, Monday UTC weekly reset, tap competitor for profile modal.
- **Profile**: Stats grid (XP, Gems, Streak, Hearts, Levels, Rank), Filo Index radar chart (5 skills: Cold Call/Discovery/Objections/Demo/Closing), 8 achievement badges, logout button.
- **Shop**: XP + Gems balance shown in header. Heart Refill (free at 0, 50 XP any time), Streak Freeze (100 XP), XP Boost 2x/1hr (200 XP).
- **PWA**: manifest.json + sw.js — installable on iOS/Android.

## Gamification

- **XP**: Earned from completing levels (+10 per question correct). 2x with XP Boost.
- **Gems**: Earned when completing levels (stars count). Shown in Profile + Shop header.
- **Hearts**: 5 max. 1 lost per wrong arena answer. Regen: 1/hour server-side.
- **Streak**: Daily login tracking. Freeze with Streak Freeze item.
- **Ranks**: Rookie (0 XP) → Prospect (100) → Rep (300) → Closer (600) → Closer Hero (1000+)
- **Filo Index**: SVG radar chart of 5 skills, calculated from level stars in each section.
- **Badges**: 8 total (First Sale, On a Roll, 7-Day Warrior, Sharp Eye, Halfway There, The Closer, XP Hunter, Gym Rat)

## User Preferences

- All text in English
- No emojis in UI
- Electric blue glow (#0056D2) behind Rocco characters
- Dark premium theme throughout (#0b1120 BG, #0056D2 primary)

## Gotchas

- NEVER call `refillLives()` in Arena's useEffect on mount
- League.tsx MUST NOT sort leaderboard — order fixed with player at index 3 (rank #4)
- `spendXP(amount)` returns boolean — check before spending
- `api.refillHearts(userId, false)` = free refill (only if hearts = 0), `api.refillHearts(userId, true)` = 50 XP
- Heart regen is server-calculated on GET /api/user/:id — no cron needed
- Bot XP drift is applied on each GET /api/league call and persisted
- JWT secret from SESSION_SECRET env var (falls back to "vontzo-dev-secret" in dev)
- `addXP` applies xpBoostActive multiplier (2x if active)
