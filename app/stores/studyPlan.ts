import { defineStore, skipHydrate } from "pinia";
import { computed, ref, watch } from "vue";
import type {
  Module,
  Category,
  Semester,
  CourseTemplate,
  UserPlan,
} from "../types";

export const useStudyPlanStore = defineStore("studyPlan", () => {
  const templates = ref<CourseTemplate[]>([]);
  // Client-only persisted state: prevent Nuxt SSR payload from overwriting localStorage values.
  const userPlans = skipHydrate(ref<UserPlan[]>([]));
  const activePlanId = skipHydrate(ref<string | null>(null));
  const isHydrated = ref(false);

  // Persistence logic moved to client-only lifecycle
  if (import.meta.client) {
    const hydrateFromStorage = () => {
      const storedPlans = localStorage.getItem("studyplanner-user-plans");
      const storedActiveId = localStorage.getItem("studyplanner-active-plan");

      if (storedPlans) {
        try {
          const parsed = JSON.parse(storedPlans);
          if (Array.isArray(parsed)) {
            userPlans.value = parsed;
          }
        } catch (e) {
          console.error("Failed to parse stored plans:", e);
        }
      }

      if (storedActiveId) activePlanId.value = storedActiveId;

      isHydrated.value = true;
    };

    // Delay hydration until after client-side state hydration to avoid SSR payload overwrite.
    queueMicrotask(hydrateFromStorage);

    watch(
      userPlans,
      (newVal) => {
        if (!isHydrated.value) return;
        localStorage.setItem("studyplanner-user-plans", JSON.stringify(newVal));
      },
      { deep: true, flush: "post" },
    );

    watch(
      activePlanId,
      (newVal) => {
        if (!isHydrated.value) return;
        if (newVal) {
          localStorage.setItem("studyplanner-active-plan", newVal);
        } else {
          localStorage.removeItem("studyplanner-active-plan");
        }
      },
      { flush: "post" },
    );
  }

  const activePlan = computed(() =>
    userPlans.value.find((p) => p.id === activePlanId.value),
  );
  const activeTemplate = computed(() =>
    templates.value.find((t) => t.id === activePlan.value?.courseTemplateId),
  );

  const totalRequiredCp = computed(() => {
    return activeTemplate.value?.totalCp || 180;
  });

  const categories = computed<Category[]>(
    () => activeTemplate.value?.categories || [],
  );

  const semesters = computed<Semester[]>(() => {
    if (!activePlan.value) return [];

    const config = activePlan.value.config;
    const sems: Semester[] = [];
    let currentSeason = config.startSeason;
    let currentYear = config.startYear;

    for (let i = 0; i < config.numSemesters; i++) {
      sems.push({
        id: `sem-${i + 1}`,
        label: `${currentSeason} ${currentSeason === "WS" ? `${currentYear % 100}/${(currentYear + 1) % 100}` : currentYear % 100}`,
        season: currentSeason,
        year: currentYear,
        orderIndex: i,
      });
      if (currentSeason === "WS") {
        currentSeason = "SS";
        currentYear++;
      } else {
        currentSeason = "WS";
      }
    }
    return sems;
  });

  const effectiveModules = computed(() => {
    if (!activePlan.value) return [];
    // Deep copy to not mutate the underlying data while recalculating CP
    const modules = activePlan.value.modules.map((m) => ({ ...m }));
    const semesterOrderById = new Map(
      semesters.value.map((sem) => [sem.id, sem.orderIndex]),
    );

    const sortBySemesterOrder = (mods: Module[]) => {
      return mods
        .map((m, index) => ({
          module: m,
          orderIndex: m.semesterId
            ? (semesterOrderById.get(m.semesterId) ?? 999)
            : 999,
          index,
        }))
        .sort((a, b) => a.orderIndex - b.orderIndex || a.index - b.index)
        .map((item) => item.module);
    };

    const applyMaxCap = (mods: Module[], maxCap?: number) => {
      if (maxCap === undefined) return;

      let currentCpSum = 0;
      for (const mod of sortBySemesterOrder(mods)) {
        if (currentCpSum + mod.cp > maxCap) {
          const remaining = Math.max(0, maxCap - currentCpSum);
          mod.cp = remaining;
          currentCpSum += remaining;
        } else {
          currentCpSum += mod.cp;
        }
      }
    };

    for (const category of categories.value) {
      if (category.subCategories?.length) {
        // Subcategory caps apply first.
        for (const subCategory of category.subCategories) {
          const subCategoryModules = modules.filter(
            (m) =>
              m.categoryId === category.id &&
              m.subCategoryId === subCategory.id,
          );
          applyMaxCap(subCategoryModules, subCategory.maxElectiveCp);
        }
      }

      // Parent category cap is enforced across all modules in this category (including subcategories).
      const categoryModules = modules.filter(
        (m) => m.categoryId === category.id,
      );
      applyMaxCap(categoryModules, category.maxElectiveCp);
    }
    return modules;
  });

  const totalPassedCp = computed(() => {
    if (!activePlan.value) return 0;
    return effectiveModules.value
      .filter((m) => m.isPassed)
      .reduce((sum, m) => sum + m.cp, 0);
  });

  const progressPercent = computed(() => {
    if (totalRequiredCp.value === 0) return 0;
    return Math.round((totalPassedCp.value / totalRequiredCp.value) * 100);
  });

  const loadTemplates = async () => {
    try {
      const res = await fetch("/data/courses.json");
      const data = await res.json();
      templates.value = data;
      console.log("Templates loaded:", data.length);
      return data;
    } catch (e) {
      console.error("Failed to load templates:", e);
    }
  };

  const createPlan = (
    name: string,
    templateId: string,
    startSeason: "WS" | "SS",
    startYear: number,
  ) => {
    const templ = templates.value.find((t) => t.id === templateId);
    if (!templ) return;

    const newPlan: UserPlan = {
      id: crypto.randomUUID(),
      name,
      courseTemplateId: templateId,
      config: { startSeason, startYear, numSemesters: 6 },
      modules: templ.modules.map((m) => ({ ...m })), // deep copy modules
    };
    userPlans.value.push(newPlan);
    activePlanId.value = newPlan.id;
  };

  const switchPlan = (id: string) => {
    if (userPlans.value.some((p) => p.id === id)) {
      activePlanId.value = id;
    }
  };

  const currentSemesterInfo = computed(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-indexed
    const year = now.getFullYear();

    // Summer Semester: April 1st - September 30th (4-9)
    // Winter Semester: October 1st - March 31st (10-3)
    let season: "SS" | "WS";
    let academicYear = year;

    if (month >= 4 && month <= 9) {
      season = "SS";
      academicYear = year;
    } else {
      season = "WS";
      // If we are in Jan-Mar, the WS started in the previous calendar year
      academicYear = month <= 3 ? year - 1 : year;
    }

    return { season, year: academicYear };
  });

  const isFutureSemester = (semesterId: string) => {
    const sem = semesters.value.find((s) => s.id === semesterId);
    if (!sem) return false;

    const current = currentSemesterInfo.value;

    if (sem.year > current.year) return true;
    if (sem.year < current.year) return false;

    // Years are equal, check season
    // WS comes after SS in the same academic year (starting WS)
    // Actually, in your semesters generator:
    // If start is WS 2024 -> Next is SS 2025.
    // If start is SS 2024 -> Next is WS 2024.

    // Let's use a simpler comparison: SS is always first half, WS second half of "Academic Year"
    // Wait, in Germany: SS is April-Sept, WS is Oct-March.
    // So for Academic Year 2024:
    // SS 2024 (Apr-Sept)
    // WS 2024 (Oct 2024 - Mar 2025)

    if (current.season === "SS" && sem.season === "WS") return true;
    return false;
  };

  const isPastSemester = (semesterId: string) => {
    const sem = semesters.value.find((s) => s.id === semesterId);
    if (!sem) return false;

    const current = currentSemesterInfo.value;

    if (sem.year < current.year) return true;
    if (sem.year > current.year) return false;

    // Years are equal
    // If current is WS (2nd half), and sem is SS (1st half) within same year
    if (current.season === "WS" && sem.season === "SS") return true;
    return false;
  };

  const deletePlan = (id: string) => {
    userPlans.value = userPlans.value.filter((p) => p.id !== id);
    if (activePlanId.value === id) {
      const nextPlan = userPlans.value?.[0];
      activePlanId.value = nextPlan ? nextPlan.id : null;
    }
  };

  const normalizeSubCategoryId = (
    categoryId: string,
    subCategoryId?: string | null,
  ) => {
    if (!subCategoryId) return null;
    const category = categories.value.find((c) => c.id === categoryId);
    return category?.subCategories?.some(
      (subCategory) => subCategory.id === subCategoryId,
    )
      ? subCategoryId
      : null;
  };

  const addModule = (
    name: string,
    cp: number,
    categoryId: string,
    semesterId: string,
    subCategoryId?: string | null,
  ) => {
    if (!activePlan.value) return;
    activePlan.value.modules.push({
      id: crypto.randomUUID(),
      name,
      cp: Number(cp),
      categoryId,
      subCategoryId: normalizeSubCategoryId(categoryId, subCategoryId),
      semesterId,
      isPassed: false,
      isElective: true,
    });
  };

  const updateModule = (id: string, name: string, cp: number) => {
    if (!activePlan.value) return;
    const mod = activePlan.value.modules.find((m) => m.id === id);
    if (mod) {
      mod.name = name;
      mod.cp = Number(cp);
    }
  };

  const deleteModule = (id: string) => {
    if (!activePlan.value) return;
    activePlan.value.modules = activePlan.value.modules.filter(
      (m) => m.id !== id,
    );
  };

  const moveModule = (
    moduleId: string,
    targetSemesterId: string,
    targetCategoryId: string,
    targetSubCategoryId?: string | null,
  ) => {
    if (!activePlan.value) return;
    // Update the base data rather than mapped data
    const mod = activePlan.value.modules.find((m) => m.id === moduleId);
    if (mod) {
      const normalizedTargetSubCategoryId = normalizeSubCategoryId(
        targetCategoryId,
        targetSubCategoryId,
      );
      const targetCategory = categories.value.find(
        (c) => c.id === targetCategoryId,
      );
      const targetUsesSubCategories =
        (targetCategory?.subCategories?.length ?? 0) > 0;

      if (mod.categoryId === targetCategoryId && targetUsesSubCategories) {
        const currentSubCategoryId = normalizeSubCategoryId(
          mod.categoryId,
          mod.subCategoryId,
        );
        if (currentSubCategoryId !== normalizedTargetSubCategoryId) return;
      }

      mod.semesterId = targetSemesterId;
      mod.categoryId = targetCategoryId;
      mod.subCategoryId = normalizedTargetSubCategoryId;

      // Automatically unpass if moved to a future semester
      if (mod.isPassed && isFutureSemester(targetSemesterId)) {
        mod.isPassed = false;
      }
    }
  };

  const togglePassed = (moduleId: string) => {
    if (!activePlan.value) return;
    const mod = activePlan.value.modules.find((m) => m.id === moduleId);
    if (mod) {
      const semesterId = mod.semesterId;
      if (!semesterId) return;
      // Only allow passing if not in a future semester
      if (!mod.isPassed && isFutureSemester(semesterId)) {
        return;
      }
      mod.isPassed = !mod.isPassed;
    }
  };

  const addSemester = () => {
    if (activePlan.value) {
      activePlan.value.config.numSemesters++;
      return `sem-${activePlan.value.config.numSemesters}`;
    }
    return "";
  };

  const removeSemester = (semId: string) => {
    if (!activePlan.value) return;
    const config = activePlan.value.config;
    if (config.numSemesters <= 1) return; // Prevent removing the last semester

    const semNumStr = semId.split("-")[1];
    if (!semNumStr) return;
    const semNum = parseInt(semNumStr, 10);

    // Shift modules appropriately
    activePlan.value.modules.forEach((m) => {
      if (!m.semesterId) return;
      const mSemNumStr = m.semesterId.split("-")[1];
      if (!mSemNumStr) return;
      const mSemNum = parseInt(mSemNumStr, 10);

      if (mSemNum === semNum) {
        // Move to previous semester, or if it is the first, move to sem-1
        const targetNum = semNum > 1 ? semNum - 1 : 1;
        m.semesterId = `sem-${targetNum}`;
      } else if (mSemNum > semNum) {
        m.semesterId = `sem-${mSemNum - 1}`;
      }
    });

    config.numSemesters--;
  };

  return {
    templates,
    userPlans,
    activePlanId,
    activePlan,
    activeTemplate,
    categories,
    semesters,
    effectiveModules,
    currentSemesterInfo,
    totalPassedCp,
    totalRequiredCp,
    progressPercent,
    isFutureSemester,
    isPastSemester,
    loadTemplates,
    createPlan,
    switchPlan,
    deletePlan,
    addModule,
    updateModule,
    deleteModule,
    moveModule,
    togglePassed,
    addSemester,
    removeSemester,
  };
});
