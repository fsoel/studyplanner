import { randomUUID } from "node:crypto";
import { requireUser } from "../../utils/session";
import { useDb } from "../../utils/db";
import { plans } from "../../utils/schema";
import { planInputSchema, rowToPlan } from "../../utils/plans";

// Create a new plan for the authenticated user.
export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  const parsed = planInputSchema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid plan",
      data: parsed.error.issues,
    });
  }

  const id = randomUUID();
  const [row] = await useDb()
    .insert(plans)
    .values({ id, userId: user.id, ...parsed.data })
    .returning();
  if (!row) {
    throw createError({ statusCode: 500, statusMessage: "Failed to create plan" });
  }
  return rowToPlan(row);
});
