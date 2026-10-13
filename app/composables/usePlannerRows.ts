import { computed } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { Category, Module } from "../types";
import {
  findDescendantCategory,
  getCategoryNodeColor,
  moduleBelongsToCategoryNode,
} from "../utils/courseCategories";
import {
  calculateCategoryRequirementProgress,
  type CategoryRequirementProgress,
} from "../utils/categoryRequirements";

export interface PlannerRequirementDisplay {
  role?: "required" | "eligible";
  hasRequirements: boolean;
  requiredCount: number;
  requiredFulfilled: number;
  eligibleMinimum: number;
  eligibleFulfilled: number;
  requirementsFulfilled: boolean;
  minCpWaived: boolean;
}

export interface PlannerRow {
  key: string;
  displayName: string;
  category: Category;
  /** The current nested node, kept as subCategory for component compatibility. */
  subCategory?: Category;
  kind: "category" | "summary" | "direct" | "subCategory";
  isSummary: boolean;
  dragGroupId: string;
  canAddElective: boolean;
  categoryColor: string;
  minCp?: number;
  maxCp?: number;
  depth: number;
  requirement?: PlannerRequirementDisplay;
}

const hasElectiveBounds = (scope: {
  minElectiveCp?: number;
  maxElectiveCp?: number;
}) => scope.minElectiveCp !== undefined || scope.maxElectiveCp !== undefined;

const moduleIsDirectOrUnassigned = (mod: Module, category: Category) =>
  mod.categoryId === category.id &&
  (!mod.subCategoryId || !findDescendantCategory(category, mod.subCategoryId));

/** Whether a module belongs in a given planner row. */
export const moduleBelongsToRow = (mod: Module, row: PlannerRow) => {
  if (mod.categoryId !== row.category.id) return false;

  if (row.kind === "summary") {
    return moduleBelongsToCategoryNode(
      mod,
      row.category,
      row.subCategory ?? row.category,
    );
  }
  if (row.kind === "subCategory") return mod.subCategoryId === row.subCategory?.id;
  if (row.kind === "direct") {
    return row.subCategory
      ? mod.subCategoryId === row.subCategory.id
      : moduleIsDirectOrUnassigned(mod, row.category);
  }
  return moduleIsDirectOrUnassigned(mod, row.category);
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

export const getRequirementSummary = (
  requirement?: PlannerRequirementDisplay,
) => {
  if (!requirement?.hasRequirements) return "";

  const parts: string[] = [];
  if (requirement.requiredCount > 0) {
    parts.push(
      `${Math.min(requirement.requiredFulfilled, requirement.requiredCount)}/${requirement.requiredCount} required`,
    );
  }
  if (requirement.eligibleMinimum > 0) {
    parts.push(
      `${Math.min(requirement.eligibleFulfilled, requirement.eligibleMinimum)}/${requirement.eligibleMinimum} additional`,
    );
  }
  return parts.join(" · ") || "Requirements";
};

/** Shared planner rows for an arbitrarily deep category tree. */
export function usePlannerRows() {
  const store = useStudyPlanStore();

  const plannerRows = computed<PlannerRow[]>(() => {
    const rows: PlannerRow[] = [];

    const progressByRoot = new Map<string, Map<string, CategoryRequirementProgress>>();
    for (const category of store.categories) {
      progressByRoot.set(
        category.id,
        calculateCategoryRequirementProgress(
          category,
          store.activePlan?.modules || [],
        ),
      );
    }

    const addNodeRows = (
      category: Category,
      node: Category,
      depth: number,
      isRoot: boolean,
      parent?: Category,
    ) => {
      const children = node.subCategories || [];
      const hasChildren = children.length > 0;
      const progress = progressByRoot.get(category.id)?.get(node.id);
      const parentRequirements = parent?.subCategoryRequirements;
      const role = parentRequirements?.requiredSubCategoryIds.includes(node.id)
        ? "required"
        : parentRequirements?.eligibleSubCategoryIds.includes(node.id)
          ? "eligible"
          : undefined;
      const fulfilledEligibleIds = parentRequirements
        ? parentRequirements.eligibleSubCategoryIds.filter((id) =>
            progressByRoot.get(category.id)?.get(id)?.qualifies,
          )
        : [];
      // Keep the minimum CP visible for the first qualifying areas that count
      // toward the requirement; waive it for remaining optional areas.
      const countedEligibleIds = parentRequirements
        ? fulfilledEligibleIds.slice(0, parentRequirements.minEligibleSubCategories)
        : [];
      const minCpWaived =
        role === "eligible" &&
        !!parentRequirements &&
        fulfilledEligibleIds.length >= parentRequirements.minEligibleSubCategories &&
        !countedEligibleIds.includes(node.id);
      const nodeRequirements = node.subCategoryRequirements;
      const requirement: PlannerRequirementDisplay | undefined =
        role || nodeRequirements
          ? {
              role,
              hasRequirements: !!nodeRequirements,
              requiredCount: nodeRequirements?.requiredSubCategoryIds.length || 0,
              requiredFulfilled: progress?.requiredSubCategoriesFulfilled || 0,
              eligibleMinimum: nodeRequirements?.minEligibleSubCategories || 0,
              eligibleFulfilled: progress?.eligibleSubCategoriesFulfilled || 0,
              requirementsFulfilled: progress?.qualifies ?? false,
              minCpWaived,
            }
          : undefined;

      rows.push({
        key: node.id,
        displayName: node.name,
        category,
        categoryColor: getCategoryNodeColor(category, node.id),
        ...(isRoot ? {} : { subCategory: node }),
        kind: isRoot && !hasChildren ? "category" : "summary",
        isSummary: hasChildren,
        dragGroupId: node.id,
        canAddElective: !hasChildren && (isRoot ? hasElectiveBounds(node) : true),
        minCp: minCpWaived ? 0 : node.minElectiveCp,
        maxCp: node.maxElectiveCp,
        depth,
        requirement,
      });

      if (!hasChildren) return;

      const hasDirectModules = (store.activePlan?.modules || []).some((mod) =>
        isRoot
          ? moduleIsDirectOrUnassigned(mod, category)
          : mod.categoryId === category.id && mod.subCategoryId === node.id,
      );
      if (hasDirectModules) {
        rows.push({
          key: `${category.id}::${node.id}::direct`,
          displayName: "Unassigned",
          category,
          categoryColor: getCategoryNodeColor(category, node.id),
          ...(isRoot ? {} : { subCategory: node }),
          kind: "direct",
          isSummary: false,
          dragGroupId: node.id,
          canAddElective: false,
          depth: depth + 1,
        });
      }

      for (const child of children) {
        addNodeRows(category, child, depth + 1, false, node);
      }
    };

    for (const category of store.categories) {
      addNodeRows(category, category, 0, true);
    }

    return rows;
  });

  return { plannerRows, moduleBelongsToRow, getCategoryHeaderClasses };
}
