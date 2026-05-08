import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const leagueBotsTable = pgTable("league_bots", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  baseXp: integer("base_xp").notNull(),
  currentXp: integer("current_xp").notNull(),
  title: text("title").notNull(),
  specialty: text("specialty").notNull(),
  winRate: text("win_rate").notNull(),
  streak: integer("streak").notNull().default(0),
  lastUpdatedAt: timestamp("last_updated_at").notNull().defaultNow(),
});

export const leagueResetTable = pgTable("league_reset", {
  id: integer("id").primaryKey(),
  lastResetAt: timestamp("last_reset_at").notNull().defaultNow(),
  nextResetAt: timestamp("next_reset_at").notNull(),
});

export type LeagueBot = typeof leagueBotsTable.$inferSelect;
