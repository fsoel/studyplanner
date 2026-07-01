import type { UserPlan } from "../types";
import type { NewPlan, PlanRepository } from "./types";

const PLANS_KEY = "studyplanner-user-plans";
const ACTIVE_KEY = "studyplanner-active-plan";

function readPlans(): UserPlan[] {
  try {
    const raw = localStorage.getItem(PLANS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse stored plans:", e);
    return [];
  }
}

function writePlans(plans: UserPlan[]): void {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
}

/** localStorage-backed repository — preserves the original offline behavior. */
export function createLocalStorageRepo(): PlanRepository {
  return {
    async getPlans() {
      return readPlans();
    },
    async getActivePlanId() {
      return localStorage.getItem(ACTIVE_KEY);
    },
    async createPlan(input: NewPlan) {
      const plan: UserPlan = { ...input, id: crypto.randomUUID() };
      const plans = readPlans();
      plans.push(plan);
      writePlans(plans);
      return plan;
    },
    async updatePlan(plan: UserPlan) {
      const plans = readPlans();
      const idx = plans.findIndex((p) => p.id === plan.id);
      if (idx >= 0) plans[idx] = plan;
      else plans.push(plan);
      writePlans(plans);
    },
    async deletePlan(id: string) {
      writePlans(readPlans().filter((p) => p.id !== id));
    },
    async setActivePlanId(id: string | null) {
      if (id) localStorage.setItem(ACTIVE_KEY, id);
      else localStorage.removeItem(ACTIVE_KEY);
    },
  };
}
