import { and, eq } from "drizzle-orm";
import { requireUser } from "../../utils/session";
import { useDb } from "../../utils/db";
import { plans, users } from "../../utils/schema";

// Delete an owned plan; repoint the active plan if it was the one deleted.
export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  const id = getRouterParam(event, "id") as string;
  const db = useDb();

  const existing = await db
    .select({ id: plans.id })
    .from(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, user.id)))
    .get();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Plan not found" });
  }

  await db.delete(plans).where(eq(plans.id, id));

  if (user.activePlanId === id) {
    const next = await db
      .select({ id: plans.id })
      .from(plans)
      .where(eq(plans.userId, user.id))
      .get();
    await db
      .update(users)
      .set({ activePlanId: next?.id ?? null })
      .where(eq(users.id, user.id));
  }

  return { ok: true };
});
