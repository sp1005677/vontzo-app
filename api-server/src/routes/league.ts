import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { leagueBotsTable, leagueResetTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const DRIFT_INTERVAL_MS = 60 * 60 * 1000;

const SEED_BOTS = [
  { id: 1, name: 'Alex "The Hunter" Rivera', baseXp: 4000, currentXp: 4200, title: "Elite Closer", specialty: "Cold Calls", winRate: "94%", streak: 31 },
  { id: 2, name: "Maya Chen", baseXp: 3600, currentXp: 3850, title: "Discovery Ace", specialty: "Needs Discovery", winRate: "88%", streak: 22 },
  { id: 3, name: "Jordan Blake", baseXp: 2900, currentXp: 3100, title: "Objection Slayer", specialty: "Objection Handling", winRate: "82%", streak: 14 },
  { id: 5, name: "Casey Morgan", baseXp: 480, currentXp: 520, title: "Rookie", specialty: "Email Outreach", winRate: "61%", streak: 5 },
  { id: 6, name: "Taylor Swift", baseXp: 350, currentXp: 380, title: "Rookie", specialty: "Cold Calls", winRate: "55%", streak: 3 },
  { id: 7, name: "Pat Wheeler", baseXp: 190, currentXp: 210, title: "Trainee", specialty: "Discovery", winRate: "48%", streak: 1 },
];

/** Calculate the next Monday 00:00 UTC from now */
function nextMondayUtc(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysUntil = day === 1 ? 7 : (8 - day) % 7;
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + daysUntil, 0, 0, 0, 0));
}

async function seedBotsIfNeeded() {
  const existing = await db.select().from(leagueBotsTable).limit(1);
  if (existing.length > 0) return;
  for (const bot of SEED_BOTS) {
    await db.insert(leagueBotsTable).values(bot);
  }
  await db.insert(leagueResetTable).values({ id: 1, nextResetAt: nextMondayUtc() });
}

function applyDrift(bot: { baseXp: number; currentXp: number; lastUpdatedAt: Date }) {
  const elapsed = Date.now() - new Date(bot.lastUpdatedAt).getTime();
  const driftTicks = Math.floor(elapsed / DRIFT_INTERVAL_MS);
  if (driftTicks === 0) return bot.currentXp;
  const drift = driftTicks * (Math.random() > 0.5 ? 35 : 20);
  return Math.max(bot.baseXp, bot.currentXp + drift);
}

// GET /api/league
router.get("/", async (req, res) => {
  try {
    await seedBotsIfNeeded();

    const [resetRow] = await db.select().from(leagueResetTable).where(eq(leagueResetTable.id, 1)).limit(1);
    let nextResetAt = resetRow?.nextResetAt ?? nextMondayUtc();

    // Handle Monday UTC weekly reset
    if (Date.now() > new Date(nextResetAt).getTime()) {
      const newNextReset = nextMondayUtc();
      await db.update(leagueResetTable)
        .set({ lastResetAt: new Date(), nextResetAt: newNextReset })
        .where(eq(leagueResetTable.id, 1));
      nextResetAt = newNextReset;

      for (const bot of SEED_BOTS) {
        await db.update(leagueBotsTable)
          .set({ currentXp: bot.baseXp, lastUpdatedAt: new Date() })
          .where(eq(leagueBotsTable.id, bot.id));
      }
    }

    const bots = await db.select().from(leagueBotsTable);
    const updated = [];
    for (const bot of bots) {
      const newXp = applyDrift(bot);
      if (newXp !== bot.currentXp) {
        await db.update(leagueBotsTable)
          .set({ currentXp: newXp, lastUpdatedAt: new Date() })
          .where(eq(leagueBotsTable.id, bot.id));
      }
      updated.push({ ...bot, currentXp: newXp });
    }

    res.json({ bots: updated, nextResetAt: nextResetAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "GET /league failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
