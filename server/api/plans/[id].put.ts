import { and, eq } from "drizzle-orm";
import { requireUser } from "../../utils/session";
import { useDb } from "../../utils/db";
import { plans } from "../../utils/schema";
import { planInputSchema, rowToPlan } from "../../utils/plans";

// Full replace of an owned plan.
export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  const id = getRouterParam(event, "id") as string;
  const parsed = planInputSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid plan",
      data: parsed.error.issues,
    });
  }

  const db = useDb();
  const existing = await db
    .select({ id: plans.id })
    .from(plans)
    .where(and(eq(plans.id, id), eq(plans.userId, user.id)))
    .get();
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: "Plan not found" });
  }

  const [row] = await db
    .update(plans)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(plans.id, id))
    .returning();
  if (!row) {
    throw createError({ statusCode: 500, statusMessage: "Failed to update plan" });
  }
  return rowToPlan(row);
});
