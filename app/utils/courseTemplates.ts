import type { Category, CourseTemplate, Module } from "../types";
import { findDescendantCategory } from "./courseCategories";

export interface TemplateValidationResult {
  valid: boolean;
  errors: string[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasOptionalNumber = (value: unknown): value is number | undefined =>
  value === undefined || (typeof value === "number" && Number.isFinite(value));

// Older templates did not specify a color for subcategories. Preserve those
// templates while normalizing their inherited parent color into the recursive
// Category shape.
const normalizeCategoryColors = (
  value: unknown,
  inheritedColor?: string,
): unknown => {
  if (!isRecord(value)) return value;

  const normalized: Record<string, unknown> = { ...value };
  if (!("color" in normalized) && inheritedColor !== undefined) {
    normalized.color = inheritedColor;
  }

  if (Array.isArray(normalized.subCategories)) {
    const color =
      typeof normalized.color === "string" ? normalized.color : inheritedColor;
    normalized.subCategories = normalized.subCategories.map((child) =>
      normalizeCategoryColors(child, color),
    );
  }

  return normalized;
};

const validateModule = (
  value: unknown,
  templateIndex: number,
  moduleIndex: number,
  categories: Category[],
  numSemesters: number,
  moduleIds: Set<string>,
  errors: string[],
): value is Module => {
  if (!isRecord(value)) {
    errors.push(`Template ${templateIndex}: module ${moduleIndex} is not an object.`);
    return false;
  }

  const requiredStrings = ["id", "name", "categoryId", "isPassed", "isElective"];
  if (
    requiredStrings.some((key) => {
      const expectedBoolean = key === "isPassed" || key === "isElective";
      return expectedBoolean
        ? typeof value[key] !== "boolean"
        : typeof value[key] !== "string";
    }) ||
    typeof value.cp !== "number" ||
    !Number.isFinite(value.cp) ||
    (value.semesterId !== null &&
      (typeof value.semesterId !== "number" ||
        !Number.isInteger(value.semesterId) ||
        value.semesterId < 1)) ||
    (value.subCategoryId !== undefined &&
      value.subCategoryId !== null &&
      typeof value.subCategoryId !== "string")
  ) {
    errors.push(`Template ${templateIndex}: module ${moduleIndex} has invalid fields.`);
    return false;
  }

  const id = value.id as string;
  if (moduleIds.has(id)) {
    errors.push(`Template ${templateIndex}: duplicate module ID "${id}".`);
  }
  moduleIds.add(id);

  const category = categories.find((candidate) => candidate.id === value.categoryId);
  if (!category) {
    errors.push(
      `Template ${templateIndex}: module ${moduleIndex} references unknown category "${value.categoryId}".`,
    );
  } else if (
    value.subCategoryId !== undefined &&
    value.subCategoryId !== null &&
    !findDescendantCategory(category, value.subCategoryId)
  ) {
    errors.push(
      `Template ${templateIndex}: module ${moduleIndex} references category "${value.subCategoryId}" outside its category tree.`,
    );
  }

  const semesterId = value.semesterId as number | null;
  if (semesterId !== null && semesterId > numSemesters) {
    errors.push(
      `Template ${templateIndex}: module ${moduleIndex} references semester ${semesterId}, outside the template's ${numSemesters} semesters.`,
    );
  }

  return true;
};

const validateCategory = (
  value: unknown,
  templateIndex: number,
  path: string,
  categoryIds: Set<string>,
  errors: string[],
): value is Category => {
  if (!isRecord(value)) {
    errors.push(`Template ${templateIndex}: category ${path} is not an object.`);
    return false;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.color !== "string" ||
    !hasOptionalNumber(value.minElectiveCp) ||
    !hasOptionalNumber(value.maxElectiveCp) ||
    (value.minElectiveCp !== undefined && value.minElectiveCp < 0) ||
    (value.maxElectiveCp !== undefined && value.maxElectiveCp < 0) ||
    (value.minElectiveCp !== undefined &&
      value.maxElectiveCp !== undefined &&
      value.minElectiveCp > value.maxElectiveCp) ||
    (value.subCategories !== undefined && !Array.isArray(value.subCategories))
  ) {
    errors.push(`Template ${templateIndex}: category ${path} has invalid fields.`);
    return false;
  }

  if (categoryIds.has(value.id)) {
    errors.push(`Template ${templateIndex}: duplicate category ID "${value.id}".`);
  }
  categoryIds.add(value.id);

  const children = Array.isArray(value.subCategories) ? value.subCategories : [];
  const childIds = new Set<string>();
  for (const [index, child] of children.entries()) {
    if (isRecord(child) && typeof child.id === "string") childIds.add(child.id);
    validateCategory(child, templateIndex, `${path}.${index}`, categoryIds, errors);
  }

  const requirements = value.subCategoryRequirements;
  if (requirements !== undefined) {
    if (!isRecord(requirements)) {
      errors.push(`Template ${templateIndex}: category ${path} has invalid subcategory requirements.`);
    } else {
      const requiredIds = requirements.requiredSubCategoryIds;
      const eligibleIds = requirements.eligibleSubCategoryIds;
      const minEligible = requirements.minEligibleSubCategories;
      const validLists =
        Array.isArray(requiredIds) &&
        requiredIds.every((id) => typeof id === "string") &&
        Array.isArray(eligibleIds) &&
        eligibleIds.every((id) => typeof id === "string") &&
        Number.isInteger(minEligible) &&
        minEligible >= 0;

      if (!validLists) {
        errors.push(`Template ${templateIndex}: category ${path} has invalid subcategory requirements.`);
      } else {
        const requiredSet = new Set(requiredIds);
        const eligibleSet = new Set(eligibleIds);
        const overlap = requiredIds.filter((id) => eligibleSet.has(id));
        const unknown = [...requiredSet, ...eligibleSet].filter(
          (id) => !childIds.has(id),
        );
        const duplicateRequired = requiredIds.length !== requiredSet.size;
        const duplicateEligible = eligibleIds.length !== eligibleSet.size;

        if (overlap.length > 0) {
          errors.push(
            `Template ${templateIndex}: category ${path} has overlapping required and eligible subcategories.`,
          );
        }
        if (unknown.length > 0) {
          errors.push(
            `Template ${templateIndex}: category ${path} references non-direct subcategories: ${unknown.join(", ")}.`,
          );
        }
        if (duplicateRequired || duplicateEligible) {
          errors.push(
            `Template ${templateIndex}: category ${path} contains duplicate subcategory requirement IDs.`,
          );
        }
        if (minEligible > eligibleSet.size) {
          errors.push(
            `Template ${templateIndex}: category ${path} requires more eligible subcategories than it declares.`,
          );
        }
      }
    }
  }

  return true;
};

export function validateCourseTemplates(
  value: unknown,
): TemplateValidationResult & { templates: CourseTemplate[] } {
  const errors: string[] = [];
  const templates: CourseTemplate[] = [];

  if (!Array.isArray(value)) {
    return { valid: false, errors: ["Course templates must be an array."], templates };
  }

  for (const [templateIndex, candidate] of value.entries()) {
    if (!isRecord(candidate)) {
      errors.push(`Template ${templateIndex} is not an object.`);
      continue;
    }

    const categoryIds = new Set<string>();
    const categories = Array.isArray(candidate.categories)
      ? candidate.categories.map((category) => normalizeCategoryColors(category))
      : [];
    const validCategories = Array.isArray(candidate.categories);
    if (!validCategories) {
      errors.push(`Template ${templateIndex}: categories must be an array.`);
    }
    for (const [categoryIndex, category] of categories.entries()) {
      validateCategory(category, templateIndex, `${categoryIndex}`, categoryIds, errors);
    }

    if (
      typeof candidate.id !== "string" ||
      typeof candidate.name !== "string" ||
      typeof candidate.totalCp !== "number" ||
      !Number.isFinite(candidate.totalCp) ||
      typeof candidate.numSemesters !== "number" ||
      !Number.isInteger(candidate.numSemesters) ||
      candidate.numSemesters < 1 ||
      !Array.isArray(candidate.modules)
    ) {
      errors.push(`Template ${templateIndex}: invalid template fields.`);
      continue;
    }

    const typedCategories = categories.filter((category): category is Category =>
      isRecord(category) &&
      typeof category.id === "string" &&
      typeof category.name === "string" &&
      typeof category.color === "string",
    );
    const moduleIds = new Set<string>();
    const numSemesters = candidate.numSemesters as number;
    for (const [moduleIndex, module] of candidate.modules.entries()) {
      validateModule(
        module,
        templateIndex,
        moduleIndex,
        typedCategories,
        numSemesters,
        moduleIds,
        errors,
      );
    }

    templates.push({ ...candidate, categories } as unknown as CourseTemplate);
  }

  return { valid: errors.length === 0, errors, templates };
}
