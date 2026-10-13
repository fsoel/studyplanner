import type { Category, Module } from "../types";
import { moduleBelongsToCategoryNode } from "./courseCategories";

export interface CategoryRequirementProgress {
  categoryId: string;
  plannedCp: number;
  minCpFulfilled: boolean;
  qualifies: boolean;
  requiredSubCategoriesFulfilled: number;
  eligibleSubCategoriesFulfilled: number;
}

/**
 * Calculate recursive requirement progress using raw planned module CP.
 * Effective CP is intentionally not used here because max caps must not hide
 * planned work while requirements are being evaluated.
 */
export function calculateCategoryRequirementProgress(
  root: Category,
  modules: Module[],
): Map<string, CategoryRequirementProgress> {
  const progress = new Map<string, CategoryRequirementProgress>();

  const calculate = (node: Category): CategoryRequirementProgress => {
    const plannedCp = modules
      .filter((module) => moduleBelongsToCategoryNode(module, root, node))
      .reduce((sum, module) => sum + module.cp, 0);
    const minCpFulfilled =
      node.minElectiveCp === undefined || plannedCp >= node.minElectiveCp;

    for (const child of node.subCategories || []) calculate(child);

    const requirements = node.subCategoryRequirements;
    const requiredSubCategoriesFulfilled = requirements
      ? requirements.requiredSubCategoryIds.filter(
          (id) => progress.get(id)?.qualifies,
        ).length
      : 0;
    const eligibleSubCategoriesFulfilled = requirements
      ? requirements.eligibleSubCategoryIds.filter(
          (id) => progress.get(id)?.qualifies,
        ).length
      : 0;
    const nestedRequirementsFulfilled = requirements
      ? requiredSubCategoriesFulfilled ===
          requirements.requiredSubCategoryIds.length &&
        eligibleSubCategoriesFulfilled >= requirements.minEligibleSubCategories
      : true;

    const result: CategoryRequirementProgress = {
      categoryId: node.id,
      plannedCp,
      minCpFulfilled,
      qualifies: minCpFulfilled && nestedRequirementsFulfilled,
      requiredSubCategoriesFulfilled,
      eligibleSubCategoriesFulfilled,
    };
    progress.set(node.id, result);
    return result;
  };

  calculate(root);
  return progress;
}
