export interface CpBoundedElective {
  minElectiveCp?: number;
  maxElectiveCp?: number;
}

export interface ElectiveSubCategory extends CpBoundedElective {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  minElectiveCp?: number;
  maxElectiveCp?: number; // E.g. max 18 CP allowed across all elective modules in this category
  subCategories?: ElectiveSubCategory[];
}

export interface Module {
  id: string;
  name: string;
  cp: number;
  categoryId: string;
  subCategoryId?: string | null;
  semesterId: string | null; // Can be a custom semester id or relative like 'sem-1'
  isPassed: boolean;
  isElective: boolean;
}

export interface Semester {
  id: string;
  label: string; // e.g. "WS 19/20" or "SS 20"
  season: "WS" | "SS";
  year: number; // The starting year, e.g., 2019 configures WS 19/20
  orderIndex: number;
}

export interface CourseTemplate {
  id: string;
  name: string;
  totalCp: number;
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
