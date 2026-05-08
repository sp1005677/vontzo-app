import { pgTable, text, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  passwordHash: text("password_hash").notNull().default(""),
  xp: integer("xp").notNull().default(0),
  gems: integer("gems").notNull().default(0),
  currentLevel: integer("current_level").notNull().default(1),
  completedLevels: jsonb("completed_levels").notNull().default([]),
  levelStars: jsonb("level_stars").notNull().default({}),
  skillScores: jsonb("skill_scores").notNull().default({}),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  streakFreezeActive: boolean("streak_freeze_active").notNull().default(false),
  onboardingDone: boolean("onboarding_done").notNull().default(false),
  xpBoostUntil: timestamp("xp_boost_until"),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
