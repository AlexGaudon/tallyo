import { InferInsertModel, sql } from "drizzle-orm";
import { boolean, date, pgTable, text, timestamp, unique } from "drizzle-orm/pg-core";

// AUTH RELATED 

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull(),
  image: text("image"),
  createdAt: date("createdAt").notNull(),
  updatedAt: date("updatedAt").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: date("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  expiresAt: date("expiresAt"),
  password: text("password"),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: date("expiresAt").notNull(),
});


// APP RELATED

export type CategorySchema = InferInsertModel<typeof category>

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    treatAsIncome: boolean("treat_as_income").default(sql`false`),
    hideFromInsights: boolean("hidden_in_budgets").default(sql`false`),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    unq: unique().on(table.name, table.userId),
  })
);
