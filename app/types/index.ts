export type AccentColor = "blue" | "green" | "pink" | "purple" | "yellow";

export interface CpBoundedElective {
  minElectiveCp?: number;
  maxElectiveCp?: number;
}

export interface SubCategoryRequirements {
  requiredSubCategoryIds: string[];
  eligibleSubCategoryIds: string[];
  minEligibleSubCategories: number;
}

export interface Category extends CpBoundedElective {
  id: string;
  name: string;
  color: string;
  subCategories?: Category[];
  subCategoryRequirements?: SubCategoryRequirements;
}

/** @deprecated Categories and subcategories now share the same recursive shape. */
export type ElectiveSubCategory = Category;

export interface Module {
  id: string;
  name: string;
  cp: number;
  categoryId: string;
  subCategoryId?: string | null;
  semesterId: number | null; // 1-based semester number within the plan
  isPassed: boolean;
  isElective: boolean;
}

export interface Semester {
  id: number;
  label: string; // e.g. "WS 19/20" or "SS 20"
  season: "WS" | "SS";
  year: number; // The starting year, e.g., 2019 configures WS 19/20
  orderIndex: number;
}

export interface CourseTemplate {
  id: string;
  name: string;
  totalCp: number;
  numSemesters: number;
  categories: Category[];
  modules: Module[];
}

export interface UserPlanConfig {
  startSeason: "WS" | "SS";
  startYear: number;
  numSemesters: number;
}

export interface UserPlan {
  id: string;
  name: string;
  courseTemplateId: string;
  config: UserPlanConfig;
  modules: Module[];
}
