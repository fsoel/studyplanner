import type { PlanRepository } from "./types";
import { createLocalStorageRepo } from "./localStorageRepo";
import { createApiRepo } from "./apiRepo";

let _repo: PlanRepository | undefined;

/** Return the persistence repository selected by the public `storageMode` config. */
export function usePlanRepository(): PlanRepository {
  if (_repo) return _repo;
  const mode = useRuntimeConfig().public.storageMode;
  _repo = mode === "local" ? createLocalStorageRepo() : createApiRepo();
  return _repo;
}

export type { PlanRepository, NewPlan } from "./types";
