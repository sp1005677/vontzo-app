import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";

export const heartsTable = pgTable("hearts", {
  userId: text("user_id").primaryKey(),
  currentHearts: integer("current_hearts").notNull().default(5),
  lastHeartLossAt: timestamp("last_heart_loss_at"),
});

export type Hearts = typeof heartsTable.$inferSelect;
