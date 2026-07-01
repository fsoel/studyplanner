import { requireUser } from "../utils/session";

// Current authenticated user + their active plan id.
export default defineEventHandler((event) => {
  const user = requireUser(event);
  return {
    user: { id: user.id, email: user.email, name: user.name },
    activePlanId: user.activePlanId ?? null,
  };
});
