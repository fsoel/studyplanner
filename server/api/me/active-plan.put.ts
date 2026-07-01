import { and, eq } from "drizzle-orm";
import { requireUser } from "../../utils/session";
import { useDb } from "../../utils/db";
import { plans, users } from "../../utils/schema";

// Set (or clear) the user's active plan.
export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  const body = await readBody<{ activePlanId?: string | null }>(event);
  const activePlanId = body?.activePlanId ?? null;
  const db = useDb();

  if (activePlanId) {
    const owned = await db
      .select({ id: plans.id })
      .from(plans)
      .where(and(eq(plans.id, activePlanId), eq(plans.userId, user.id)))
      .get();
    if (!owned) {
      throw createError({ statusCode: 404, statusMessage: "Plan not found" });
    }
  }

  await db
    .update(users)
    .set({ activePlanId })
    .where(eq(users.id, user.id));
  return { ok: true };
});
