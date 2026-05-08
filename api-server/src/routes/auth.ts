import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { db } from "@workspace/db";
import { usersTable, heartsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { signToken } from "../middlewares/requireAuth";

const router: IRouter = Router();
const SALT_ROUNDS = 10;

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // Check if email taken
    const existing = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const userId = nanoid(12);

    await db.insert(usersTable).values({
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });

    await db.insert(heartsTable).values({ userId, currentHearts: 5 });

    const token = signToken({ userId, name: name.trim() });
    res.status(201).json({ token, userId, name: name.trim() });
  } catch (err) {
    req.log.error({ err }, "POST /auth/signup failed");
    res.status(500).json({ error: "Signup failed" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email.toLowerCase().trim()))
      .limit(1);

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Support legacy "santiago" account without password
    if (user.passwordHash && !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken({ userId: user.id, name: user.name });
    res.json({ token, userId: user.id, name: user.name });
  } catch (err) {
    req.log.error({ err }, "POST /auth/login failed");
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;
