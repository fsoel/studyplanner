import { z } from "zod";
import type { UserPlan } from "../../app/types";
import type { PlanRow } from "./schema";

const moduleSchema = z.object({
  id: z.string(),
  name: z.string(),
  cp: z.number(),
  categoryId: z.string(),
  subCategoryId: z.string().nullable().optional(),
  semesterId: z.string().nullable(),
  isPassed: z.boolean(),
  isElective: z.boolean(),
});

const configSchema = z.object({
  startSeason: z.enum(["WS", "SS"]),
  startYear: z.number(),
  numSemesters: z.number(),
});

export const planInputSchema = z.object({
  name: z.string().min(1),
  courseTemplateId: z.string(),
  config: configSchema,
  modules: z.array(moduleSchema),
});

export type PlanInput = z.infer<typeof planInputSchema>;

/** Map a database row to the frontend UserPlan shape. */
export function rowToPlan(row: PlanRow): UserPlan {
  return {
    id: row.id,
    name: row.name,
    courseTemplateId: row.courseTemplateId,
    config: row.config,
    modules: row.modules,
  };
}
