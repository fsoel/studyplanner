import type { UserPlan } from "../types";

/** A plan draft before it has a server-assigned id. */
export type NewPlan = Omit<UserPlan, "id">;

/**
 * Persistence abstraction for study plans. Two implementations exist:
 * a localStorage-backed one (offline dev) and an API-backed one (backend).
 */
export interface PlanRepository {
  getPlans(): Promise<UserPlan[]>;
  getActivePlanId(): Promise<string | null>;
  createPlan(input: NewPlan): Promise<UserPlan>;
  updatePlan(plan: UserPlan): Promise<void>;
  deletePlan(id: string): Promise<void>;
  setActivePlanId(id: string | null): Promise<void>;
}
