import { eq } from "drizzle-orm";
import { requireUser } from "../../utils/session";
import { useDb } from "../../utils/db";
import { plans } from "../../utils/schema";
import { rowToPlan } from "../../utils/plans";

// List all plans owned by the authenticated user.
export default defineEventHandler(async (event) => {
  const user = requireUser(event);
  const rows = await useDb()
    .select()
    .from(plans)
    .where(eq(plans.userId, user.id));
  return rows.map(rowToPlan);
});
