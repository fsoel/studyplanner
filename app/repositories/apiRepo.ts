import type { UserPlan } from "../types";
import type { NewPlan, PlanRepository } from "./types";

/** API-backed repository — talks to the Nitro backend on the same origin. */
export function createApiRepo(): PlanRepository {
  return {
    async getPlans() {
      return await $fetch<UserPlan[]>("/api/plans");
    },
    async getActivePlanId() {
      const me = await $fetch<{ activePlanId: string | null }>("/api/me");
      return me.activePlanId;
    },
    async createPlan(input: NewPlan) {
      return await $fetch<UserPlan>("/api/plans", {
        method: "POST",
        body: input,
      });
    },
    async updatePlan(plan: UserPlan) {
      await $fetch(`/api/plans/${plan.id}`, { method: "PUT", body: plan });
    },
    async deletePlan(id: string) {
      await $fetch(`/api/plans/${id}`, { method: "DELETE" });
    },
    async setActivePlanId(id: string | null) {
      await $fetch("/api/me/active-plan", {
        method: "PUT",
        body: { activePlanId: id },
      });
    },
  };
}
