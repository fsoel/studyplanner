import type { Category, Module, Semester } from "../types";
import { moduleBelongsToCategoryNode } from "./courseCategories";

/**
 * Return a copy of the planned modules with credits beyond each category's
 * elective limit marked as voluntary. The module that reaches or crosses a
 * limit still counts in full; only following modules count as zero.
 */
export function calculateEffectiveModules(
  plannedModules: Module[],
  categories: Category[],
  semesters: Semester[],
  totalCp?: number,
): Module[] {
  const modules = plannedModules.map((module) => ({ ...module }));
  const semesterOrderById = new Map(
    semesters.map((semester) => [semester.id, semester.orderIndex]),
  );

  const sortBySemesterOrder = (scopedModules: Module[]) =>
    scopedModules
      .map((module, index) => ({
        module,
        orderIndex: module.semesterId
          ? (semesterOrderById.get(module.semesterId) ?? 999)
          : 999,
        index,
      }))
      .sort((a, b) => a.orderIndex - b.orderIndex || a.index - b.index)
      .map((item) => item.module);

  const applyMaxCap = (scopedModules: Module[], maxCap?: number) => {
    if (maxCap === undefined) return;

    let countedCp = 0;
    for (const module of sortBySemesterOrder(scopedModules)) {
      if (countedCp >= maxCap) {
        module.cp = 0;
      } else {
        // Count the threshold-crossing module in full. Later modules are
        // voluntary, even if this module took the total above the limit.
        countedCp += module.cp;
      }
    }
  };

  const applyCapsRecursively = (root: Category, node: Category) => {
    for (const child of node.subCategories || []) {
      applyCapsRecursively(root, child);
    }

    const nodeModules = modules.filter((module) =>
      moduleBelongsToCategoryNode(module, root, node),
    );
    applyMaxCap(nodeModules, node.maxElectiveCp);
  };

  for (const category of categories) {
    applyCapsRecursively(category, category);
  }

  // The course-wide credit target follows the same rule as category limits.
  applyMaxCap(modules, totalCp);

  return modules;
}
