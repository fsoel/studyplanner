import { sqliteTable, text, integer, unique } from "drizzle-orm/sqlite-core";
import type { UserPlanConfig, Module } from "../../app/types";

// Authenticated users, keyed by the OIDC (issuer, subject) pair.
export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    subject: text("subject").notNull(),
    email: text("email"),
    name: text("name"),
    activePlanId: text("active_plan_id"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [unique().on(t.issuer, t.subject)],
);

// Opaque, revocable session tokens. The token itself is the cookie value.
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Short-lived CSRF state + PKCE verifier held during the OAuth login redirect.
export const oauthState = sqliteTable("oauth_state", {
  state: text("state").primaryKey(),
  codeVerifier: text("code_verifier").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

// Study plans, stored as self-contained documents (config + modules as JSON)
// to mirror the frontend UserPlan shape exactly.
export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  courseTemplateId: text("course_template_id").notNull(),
  config: text("config", { mode: "json" }).$type<UserPlanConfig>().notNull(),
  modules: text("modules", { mode: "json" }).$type<Module[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export type UserRow = typeof users.$inferSelect;
export type PlanRow = typeof plans.$inferSelect;
