import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, heartsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

const MAX_HEARTS = 5;
const REGEN_INTERVAL_MS = 60 * 60 * 1000; // 1 heart per hour

function calculateCurrentHearts(storedHearts: number, lastHeartLossAt: Date | null): number {
  if (!lastHeartLossAt || storedHearts >= MAX_HEARTS) return storedHearts;
  const elapsed = Date.now() - new Date(lastHeartLossAt).getTime();
  const regened = Math.floor(elapsed / REGEN_INTERVAL_MS);
  return Math.min(MAX_HEARTS, storedHearts + regened);
}

async function ensureUser(userId: string) {
  const existing = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (existing.length === 0) {
    await db.insert(usersTable).values({ id: userId, name: userId });
  }
  const existingHearts = await db.select().from(heartsTable).where(eq(heartsTable.userId, userId)).limit(1);
  if (existingHearts.length === 0) {
    await db.insert(heartsTable).values({ userId, currentHearts: MAX_HEARTS });
  }
}

// GET /api/user/:userId
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureUser(userId);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [heartRow] = await db.select().from(heartsTable).where(eq(heartsTable.userId, userId)).limit(1);

    const currentHearts = calculateCurrentHearts(heartRow.currentHearts, heartRow.lastHeartLossAt);
    if (currentHearts !== heartRow.currentHearts) {
      await db.update(heartsTable)
        .set({ currentHearts, lastHeartLossAt: currentHearts >= MAX_HEARTS ? null : heartRow.lastHeartLossAt })
        .where(eq(heartsTable.userId, userId));
    }

    res.json({ ...user, hearts: currentHearts });
  } catch (err) {
    req.log.error({ err }, "GET /user/:userId failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/user/:userId/sync
router.post("/:userId/sync", async (req, res) => {
  try {
    const { userId } = req.params;
    const { xp, gems, currentLevel, completedLevels, levelStars, skillScores, streak, onboardingDone } = req.body;
    await ensureUser(userId);
    await db.update(usersTable).set({
      xp: xp ?? 0,
      gems: gems ?? 0,
      currentLevel: currentLevel ?? 1,
      completedLevels: completedLevels ?? [],
      levelStars: levelStars ?? {},
      skillScores: skillScores ?? {},
      streak: streak ?? 0,
      onboardingDone: onboardingDone ?? false,
      lastActive: new Date(),
    }).where(eq(usersTable.id, userId));
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "POST /user/:userId/sync failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/user/:userId/lose-heart
router.post("/:userId/lose-heart", async (req, res) => {
  try {
    const { userId } = req.params;
    await ensureUser(userId);
    const [heartRow] = await db.select().from(heartsTable).where(eq(heartsTable.userId, userId)).limit(1);
    const currentHearts = calculateCurrentHearts(heartRow.currentHearts, heartRow.lastHeartLossAt);
    const newHearts = Math.max(0, currentHearts - 1);
    await db.update(heartsTable)
      .set({ currentHearts: newHearts, lastHeartLossAt: new Date() })
      .where(eq(heartsTable.userId, userId));
    res.json({ hearts: newHearts });
  } catch (err) {
    req.log.error({ err }, "POST /user/:userId/lose-heart failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/user/:userId/refill-hearts
router.post("/:userId/refill-hearts", async (req, res) => {
  try {
    const { userId } = req.params;
    const { spendXp } = req.body;
    await ensureUser(userId);
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const [heartRow] = await db.select().from(heartsTable).where(eq(heartsTable.userId, userId)).limit(1);
    const currentHearts = calculateCurrentHearts(heartRow.currentHearts, heartRow.lastHeartLossAt);

    if (spendXp) {
      if (user.xp < 50) return res.status(400).json({ error: "Not enough XP" });
      await db.update(usersTable).set({ xp: user.xp - 50 }).where(eq(usersTable.id, userId));
    } else {
      if (currentHearts > 0) return res.status(400).json({ error: "Hearts not empty, free refill unavailable" });
    }

    await db.update(heartsTable).set({ currentHearts: MAX_HEARTS, lastHeartLossAt: null }).where(eq(heartsTable.userId, userId));
    res.json({ hearts: MAX_HEARTS, xp: spendXp ? user.xp - 50 : user.xp });
  } catch (err) {
    req.log.error({ err }, "POST /user/:userId/refill-hearts failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
