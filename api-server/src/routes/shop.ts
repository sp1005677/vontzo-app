import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, heartsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const MAX_HEARTS = 5;
const XP_BOOST_DURATION_MS = 60 * 60 * 1000; // 1 hour

// POST /api/shop/:userId/buy
router.post("/:userId/buy", async (req, res) => {
  try {
    const { userId } = req.params;
    const { item } = req.body; // "heart_refill" | "streak_freeze" | "xp_boost"

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (item === "heart_refill") {
      if (user.xp < 50) return res.status(400).json({ error: "Not enough XP. Need 50 XP." });
      await db.update(usersTable).set({ xp: user.xp - 50 }).where(eq(usersTable.id, userId));
      await db.update(heartsTable).set({ currentHearts: MAX_HEARTS, lastHeartLossAt: null }).where(eq(heartsTable.userId, userId));
      return res.json({ ok: true, xp: user.xp - 50, hearts: MAX_HEARTS });
    }

    if (item === "streak_freeze") {
      if (user.xp < 100) return res.status(400).json({ error: "Not enough XP. Need 100 XP." });
      await db.update(usersTable).set({ xp: user.xp - 100, streakFreezeActive: true }).where(eq(usersTable.id, userId));
      return res.json({ ok: true, xp: user.xp - 100, streakFreezeActive: true });
    }

    if (item === "xp_boost") {
      if (user.xp < 200) return res.status(400).json({ error: "Not enough XP. Need 200 XP." });
      const xpBoostUntil = new Date(Date.now() + XP_BOOST_DURATION_MS);
      await db.update(usersTable).set({ xp: user.xp - 200, xpBoostUntil }).where(eq(usersTable.id, userId));
      return res.json({ ok: true, xp: user.xp - 200, xpBoostUntil: xpBoostUntil.toISOString() });
    }

    return res.status(400).json({ error: "Unknown item. Valid: heart_refill, streak_freeze, xp_boost" });
  } catch (err) {
    req.log.error({ err }, "POST /shop/:userId/buy failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
