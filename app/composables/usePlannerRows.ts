import { computed } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { Category, ElectiveSubCategory, Module } from "../types";

export interface PlannerRow {
  key: string;
  displayName: string;
  category: Category;
  subCategory?: ElectiveSubCategory;
  kind: "category" | "summary" | "direct" | "subCategory";
  isSummary: boolean;
  dragGroupId: string;
  canAddElective: boolean;
  minCp?: number;
  maxCp?: number;
}

const hasElectiveBounds = (scope: {
  minElectiveCp?: number;
  maxElectiveCp?: number;
}) => scope.minElectiveCp !== undefined || scope.maxElectiveCp !== undefined;

const getSubCategoryIds = (category: Category) =>
  new Set((category.subCategories || []).map((s) => s.id));

const moduleHasValidSubCategory = (mod: Module, category: Category) =>
  !!mod.subCategoryId && getSubCategoryIds(category).has(mod.subCategoryId);

const moduleIsDirectOrUnassigned = (mod: Module, category: Category) =>
  mod.categoryId === category.id && !moduleHasValidSubCategory(mod, category);

/** Whether a module belongs in a given planner row (category/subcategory/direct). */
export const moduleBelongsToRow = (mod: Module, row: PlannerRow) => {
  if (mod.categoryId !== row.category.id) return false;
  if (row.kind === "summary") return false;
  if (row.kind === "subCategory") return mod.subCategoryId === row.subCategory?.id;
  if (row.kind === "direct") return moduleIsDirectOrUnassigned(mod, row.category);
  return true;
};

/** Derive light/dark text + border classes for a category header from its Tailwind color string. */
export const getCategoryHeaderClasses = (colorStr: string) => {
  const parts = colorStr.split(" ");
  const lightBg = parts.find((p) => p.startsWith("bg-") && !p.includes(":"));
  const lightText = parts.find((p) => p.startsWith("text-") && !p.includes(":"));
  const darkText = parts.find((p) => p.startsWith("dark:text-"));
  const darkBg = parts.find((p) => p.startsWith("dark:bg-"))?.split("/")[0];

  return [
    lightText,
    lightBg?.replace("bg-", "border-"),
    darkText,
    darkBg?.replace("dark:bg-", "dark:border-"),
  ]
    .filter(Boolean)
    .join(" ");
};

/**
 * Shared planner row model (category → optional "Unassigned" → subcategories),
 * used by both the desktop grid and the mobile view.
 */
export function usePlannerRows() {
  const store = useStudyPlanStore();

  const plannerRows = computed<PlannerRow[]>(() => {
    const rows: PlannerRow[] = [];

    for (const category of store.categories) {
      const subCategories = category.subCategories || [];
      const hasSubCategories = subCategories.length > 0;

      rows.push({
        key: category.id,
        displayName: category.name,
        category,
        kind: hasSubCategories ? "summary" : "category",
        isSummary: hasSubCategories,
        dragGroupId: category.id,
        canAddElective: hasElectiveBounds(category) && !hasSubCategories,
        minCp: category.minElectiveCp,
        maxCp: category.maxElectiveCp,
      });

      if (hasSubCategories) {
        const hasDirectOrUnassignedModules = (
          store.activePlan?.modules || []
        ).some((mod) => moduleIsDirectOrUnassigned(mod, category));
        if (hasDirectOrUnassignedModules) {
          rows.push({
            key: `${category.id}::direct`,
            displayName: "Unassigned",
            category,
            kind: "direct",
            isSummary: false,
            dragGroupId: category.id,
            canAddElective: false,
          });
        }

        for (const subCategory of subCategories) {
          rows.push({
            key: `${category.id}::${subCategory.id}`,
            displayName: subCategory.name,
            category,
            subCategory,
            kind: "subCategory",
            isSummary: false,
            dragGroupId: `${category.id}::${subCategory.id}`,
            canAddElective: true,
            minCp: subCategory.minElectiveCp,
            maxCp: subCategory.maxElectiveCp,
          });
        }
      }
    }

    return rows;
  });

  return { plannerRows, moduleBelongsToRow, getCategoryHeaderClasses };
}
