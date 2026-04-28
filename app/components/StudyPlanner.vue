<template>
  <div class="font-sans flex flex-col pt-4 flex-1 min-h-0">
    <div
      class="flex flex-wrap gap-6 mb-6 items-center bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-full"
    >
      <div v-if="store.activePlan" class="flex items-center gap-4">
        <div class="flex flex-col">
          <label
            class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1.5 ml-1"
            >Active Plan</label
          >
          <select
            v-model="store.activePlanId"
            class="p-2.5 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-w-[220px] outline-none font-semibold text-sm transition-all hover:border-gray-300 dark:hover:border-gray-500"
          >
            <option
              v-for="plan in store.userPlans"
              :key="plan.id"
              :value="plan.id"
            >
              {{ plan.name }}
            </option>
          </select>
        </div>

        <div
          class="h-10 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"
        ></div>

        <div class="flex items-center gap-4">
          <div class="flex flex-col">
            <label
              class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1"
              >Timeline</label
            >
            <div
              class="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <span class="text-xs font-bold text-blue-600 dark:text-blue-400"
                >{{ store.activePlan.config.startSeason }}
                {{ store.activePlan.config.startYear }}</span
              >
              <svg
                class="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="3"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
              <span class="text-xs font-bold text-gray-700 dark:text-gray-300"
                >{{ store.semesters[store.semesters.length - 1]?.season }}
                {{ store.semesters[store.semesters.length - 1]?.year }}</span
              >
            </div>
          </div>

          <div class="flex flex-col min-w-[180px]">
            <label
              class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 ml-1"
              >Progress ({{ store.totalPassedCp }} /
              {{ store.totalRequiredCp }} CP)</label
            >
            <div
              class="h-9 flex items-center gap-3 bg-gray-50 dark:bg-gray-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
            >
              <div
                class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  :style="{ width: `${store.progressPercent}%` }"
                ></div>
              </div>
              <span
                class="text-xs font-black text-blue-600 dark:text-blue-400 w-8 text-right"
                >{{ store.progressPercent }}%</span
              >
            </div>
          </div>
        </div>
      </div>

      <button
        @click="showPlanManager = true"
        class="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-500/20 px-4 py-2.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all ml-auto flex items-center gap-2 shadow-sm text-sm"
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        Manage Plans
      </button>
    </div>

    <!-- The Planner Grid -->
    <div
      v-if="store.activePlan"
      class="overflow-auto flex-1 min-h-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 block"
    >
      <table class="w-full text-left border-collapse table-fixed">
        <thead>
          <tr>
            <th
              class="w-48 p-4 border-b-2 border-r-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 z-30 sticky left-0 text-center font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-sm shadow-[10px_0_15px_-5px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_20px_-5px_rgba(0,0,0,0.3)] after:content-[''] after:absolute after:top-0 after:right-[-20px] after:w-[20px] after:h-full after:bg-gradient-to-r after:from-gray-50 after:to-transparent dark:after:from-gray-800 dark:after:to-transparent after:pointer-events-none"
            >
              Categories
            </th>
            <th
              v-for="(sem, index) in store.semesters"
              :key="sem.id"
              class="min-w-[280px] w-[280px] p-5 border-b-2 border-gray-200 dark:border-gray-700 text-center relative group"
              :class="[
                store.currentSemesterInfo.season === sem.season &&
                store.currentSemesterInfo.year === sem.year
                  ? 'bg-blue-50/70 dark:bg-blue-900/20'
                  : 'bg-gray-50/50 dark:bg-gray-800/50',
              ]"
            >
              <div
                class="font-bold text-gray-800 dark:text-gray-100 text-lg mb-1"
              >
                {{ sem.label }}
              </div>
              <div
                class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-3"
              >
                Semester {{ sem.orderIndex + 1 }}
                <span
                  v-if="
                    store.currentSemesterInfo.season === sem.season &&
                    store.currentSemesterInfo.year === sem.year
                  "
                  class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                >
                  Current
                </span>
              </div>
              <div
                class="inline-flex items-center justify-center bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800/50"
              >
                {{ getSemesterCpSum(sem.id) }} CP
              </div>
              <button
                v-if="store.semesters.length > 1"
                @click="requestRemoveSemester(sem.id)"
                title="Remove Semester"
                class="absolute top-3 right-3 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-red-100 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
              </button>
            </th>
            <!-- Add Semester Column Header -->
            <th
              class="min-w-[280px] w-[280px] p-5 border-b-2 border-gray-200 dark:border-gray-700 text-center bg-gray-50/20 dark:bg-gray-800/20 border-dashed border-l-2"
            >
              <button
                @click="store.addSemester"
                class="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 px-5 py-3 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm w-full flex items-center justify-center gap-2 h-full"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
                Add Semester
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in plannerRows"
            :key="row.key"
            class="border-b border-gray-100 dark:border-gray-700/50 group/row"
          >
            <td
              class="p-5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky left-0 align-top z-20 shadow-[10px_0_15px_-5px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_20px_-5px_rgba(0,0,0,0.3)] after:content-[''] after:absolute after:top-0 after:right-[-20px] after:w-[20px] after:h-full after:bg-gradient-to-r after:from-gray-50 after:to-transparent dark:after:from-gray-800 dark:after:to-transparent after:pointer-events-none"
            >
              <div
                class="font-bold text-sm tracking-tight mb-2 border-l-4 pl-3 min-w-0"
                :class="[
                  getCategoryHeaderClasses(row.category.color),
                  row.kind === 'subCategory' || row.kind === 'direct'
                    ? 'ml-4'
                    : '',
                ]"
              >
                <div class="flex items-start justify-between gap-2 min-w-0">
                  <span
                    class="min-w-0 flex-1 [overflow-wrap:anywhere] leading-snug"
                    >{{ row.displayName }}</span
                  >
                  <button
                    v-if="row.canAddElective"
                    @click="
                      openAddElective(
                        row.category.id,
                        row.subCategory?.id ?? null,
                      )
                    "
                    class="shrink-0 text-[10px] bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 dark:hover:bg-blue-800/60 px-2 py-1 rounded transition-colors font-bold"
                    title="Add Elective"
                  >
                    + Add
                  </button>
                </div>
              </div>
              <div
                v-if="row.minCp !== undefined || row.maxCp !== undefined"
                class="text-xs font-normal mt-3 bg-white dark:bg-gray-700 p-2 rounded border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <div
                  v-if="
                    row.minCp !== undefined &&
                    row.maxCp !== undefined &&
                    row.minCp === row.maxCp
                  "
                  class="flex justify-between mb-1 text-gray-700 dark:text-gray-200"
                >
                  <span>Required:</span>
                  <span class="font-bold">{{ row.maxCp }} CP</span>
                </div>
                <div v-else>
                  <div
                    v-if="row.minCp !== undefined"
                    class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"
                  >
                    <span>Min limit:</span>
                    <span class="font-bold">{{ row.minCp }} CP</span>
                  </div>
                  <div
                    v-if="row.maxCp !== undefined"
                    class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"
                  >
                    <span>Max limit:</span>
                    <span class="font-bold">{{ row.maxCp }} CP</span>
                  </div>
                </div>
                <div
                  class="flex justify-between mb-1 text-gray-600 dark:text-gray-300"
                >
                  <span>Planned:</span>
                  <span class="font-bold">{{ getRowCpSum(row) }} CP</span>
                </div>
                <div
                  v-if="row.maxCp !== undefined && getRowCpSum(row) > row.maxCp"
                  class="text-red-600 dark:text-red-400 mt-2 flex items-center gap-1 font-bold bg-red-50 dark:bg-red-900/20 p-1.5 rounded text-[10px] uppercase tracking-wider"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Over Cap!
                </div>
                <div
                  v-if="row.minCp !== undefined && getRowCpSum(row) < row.minCp"
                  class="text-amber-700 dark:text-amber-300 mt-2 flex items-center gap-1 font-bold bg-amber-50 dark:bg-amber-900/20 p-1.5 rounded text-[10px] uppercase tracking-wider"
                >
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM10 7a1 1 0 011 1v3a1 1 0 11-2 0V8a1 1 0 011-1zm1 7a1 1 0 11-2 0 1 1 0 012 0z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  Below Minimum
                </div>
              </div>
            </td>
            <td
              v-for="sem in store.semesters"
              :key="sem.id"
              class="p-3 border-r border-gray-50 dark:border-gray-700/30 hover:bg-blue-50/30 dark:hover:bg-gray-700/50 transition-colors"
              :class="[
                row.isSummary ? 'align-middle' : 'align-top',
                store.currentSemesterInfo.season === sem.season &&
                store.currentSemesterInfo.year === sem.year
                  ? 'bg-blue-50/30 dark:bg-blue-900/10'
                  : 'bg-white dark:bg-gray-800/30',
              ]"
            >
              <div
                v-if="row.isSummary"
                class="flex min-h-[52px] w-full items-center justify-center text-center"
              >
                <span
                  v-if="getRowSemesterCpSum(row, sem.id) > 0"
                  class="inline-flex items-center justify-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded-full text-xs font-bold border border-gray-200 dark:border-gray-600"
                >
                  {{ getRowSemesterCpSum(row, sem.id) }} CP
                </span>
              </div>
              <ClientOnly v-else>
                <draggable
                  :list="localMatrix[sem.id]?.[row.key]"
                  item-key="id"
                  :group="row.dragGroupId"
                  @start="isDragging = true"
                  @end="
                    isDragging = false;
                    updateMatrix();
                  "
                  @change="
                    onChange(
                      $event,
                      sem.id,
                      row.category.id,
                      row.subCategory?.id ?? null,
                    )
                  "
                  class="min-h-[120px] h-full"
                >
                  <template #item="{ element }">
                    <ModuleCard
                      :module="element"
                      :category="row.category"
                      @edit="
                        openEditModule(
                          element.id,
                          row.category.id,
                          element.subCategoryId ?? row.subCategory?.id ?? null,
                        )
                      "
                    />
                  </template>
                </draggable>
              </ClientOnly>
            </td>
            <!-- Add Semester Column Dropzone -->
            <td
              class="p-3 align-top bg-gray-50/10 dark:bg-gray-900/10 border-l-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors"
            >
              <div v-if="row.isSummary" class="min-h-[52px]"></div>
              <ClientOnly v-else>
                <draggable
                  :list="localMatrix['new-semester']?.[row.key]"
                  item-key="id"
                  :group="row.dragGroupId"
                  @start="isDragging = true"
                  @end="
                    isDragging = false;
                    updateMatrix();
                  "
                  @change="
                    onNewSemesterChange(
                      $event,
                      row.key,
                      row.category.id,
                      row.subCategory?.id ?? null,
                    )
                  "
                  class="min-h-[120px] h-full flex flex-col items-center justify-center border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-700 rounded-lg transition-all"
                >
                  <template #item="{ element }">
                    <ModuleCard
                      :module="element"
                      :category="row.category"
                      @edit="
                        openEditModule(
                          element.id,
                          row.category.id,
                          element.subCategoryId ?? row.subCategory?.id ?? null,
                        )
                      "
                    />
                  </template>
                </draggable>
              </ClientOnly>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="flex flex-col items-center justify-center p-16 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-96"
    >
      <svg
        class="w-20 h-20 text-gray-300 dark:text-gray-600 mb-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        ></path>
      </svg>
      <h2 class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
        No Study Plan Active
      </h2>
      <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md text-center">
        Create a new plan by selecting a course of studies to start organizing
        your semesters.
      </p>
      <button
        @click="showPlanManager = true"
        class="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        Create New Plan
      </button>
    </div>

    <ManagePlansModal
      v-if="showPlanManager"
      :show="showPlanManager"
      @close="showPlanManager = false"
      :canCancel="store.userPlans.length > 0"
    />

    <EditModuleModal
      v-if="showEditModal"
      :show="showEditModal"
      :categoryId="modalModeCategoryId"
      :subCategoryId="modalModeSubCategoryId"
      :moduleId="modalModeModuleId"
      @close="showEditModal = false"
    />

    <ConfirmModal
      :show="!!semesterPendingRemove"
      title="Remove Semester"
      :message="removeSemesterMessage"
      confirmLabel="Remove Semester"
      @confirm="confirmRemoveSemester"
      @cancel="semesterPendingRemove = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import draggable from "vuedraggable";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { Category, ElectiveSubCategory, Module } from "../types";
import ModuleCard from "./ModuleCard.vue";
import ManagePlansModal from "./ManagePlansModal.vue";
import EditModuleModal from "./EditModuleModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const store = useStudyPlanStore();
const showPlanManager = ref(false);
const showEditModal = ref(false);
const isDragging = ref(false);
const hasShownInitialPlanPrompt = ref(false);
const semesterPendingRemove = ref<string | null>(null);

// Helper to extract colors for category headers to match light/dark mode
const getCategoryHeaderClasses = (colorStr: string) => {
  const parts = colorStr.split(" ");
  const lightBg = parts.find((p) => p.startsWith("bg-") && !p.includes(":"));
  const lightText = parts.find(
    (p) => p.startsWith("text-") && !p.includes(":"),
  );
  const darkText = parts.find((p) => p.startsWith("dark:text-"));
  const darkBg = parts.find((p) => p.startsWith("dark:bg-"))?.split("/")[0]; // Remove alpha transparency for border

  return [
    lightText, // Light mode text (strong)
    lightBg?.replace("bg-", "border-"), // Light mode border (light base)
    darkText, // Dark mode text (strong)
    darkBg?.replace("dark:bg-", "dark:border-"), // Dark mode border (dark base)
  ]
    .filter(Boolean)
    .join(" ");
};

// Edit Modal state
const modalModeCategoryId = ref("");
const modalModeSubCategoryId = ref<string | null>(null);
const modalModeModuleId = ref<string | undefined>(undefined);

const openAddElective = (
  categoryId: string,
  subCategoryId: string | null = null,
) => {
  modalModeCategoryId.value = categoryId;
  modalModeSubCategoryId.value = subCategoryId;
  modalModeModuleId.value = undefined;
  showEditModal.value = true;
};

const openEditModule = (
  moduleId: string,
  categoryId: string,
  subCategoryId: string | null = null,
) => {
  modalModeCategoryId.value = categoryId;
  modalModeSubCategoryId.value = subCategoryId;
  modalModeModuleId.value = moduleId;
  showEditModal.value = true;
};

const semesterToRemove = computed(() =>
  store.semesters.find((sem) => sem.id === semesterPendingRemove.value),
);
const removeSemesterMessage = computed(() => {
  const label = semesterToRemove.value?.label || "this semester";
  return `This will remove ${label}. Modules in that semester will be moved according to the planner's existing semester shift rules.`;
});

const requestRemoveSemester = (semesterId: string) => {
  semesterPendingRemove.value = semesterId;
};

const confirmRemoveSemester = () => {
  if (!semesterPendingRemove.value) return;
  store.removeSemester(semesterPendingRemove.value);
  semesterPendingRemove.value = null;
};

interface PlannerRow {
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
}) => {
  return scope.minElectiveCp !== undefined || scope.maxElectiveCp !== undefined;
};

const getSubCategoryIds = (category: Category) => {
  return new Set(
    (category.subCategories || []).map((subCategory) => subCategory.id),
  );
};

const moduleHasValidSubCategory = (mod: Module, category: Category) => {
  return (
    !!mod.subCategoryId && getSubCategoryIds(category).has(mod.subCategoryId)
  );
};

const moduleIsDirectOrUnassigned = (mod: Module, category: Category) => {
  return (
    mod.categoryId === category.id && !moduleHasValidSubCategory(mod, category)
  );
};

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
          minCp: undefined,
          maxCp: undefined,
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

const moduleBelongsToRow = (mod: Module, row: PlannerRow) => {
  if (mod.categoryId !== row.category.id) return false;
  if (row.kind === "summary") return false;
  if (row.kind === "subCategory") {
    return mod.subCategoryId === row.subCategory?.id;
  }
  if (row.kind === "direct") {
    return moduleIsDirectOrUnassigned(mod, row.category);
  }
  return true;
};

// Local Matrix state to fix drag infinite loop behavior with computed properties in vue 3
const localMatrix = ref<Record<string, Record<string, any>>>({});

const updateMatrix = () => {
  if (!store.activePlan) return;
  const m: Record<string, Record<string, any>> = {};

  store.semesters.forEach((sem) => {
    m[sem.id] = {};
    const semesterMatrix = m[sem.id]!;
    plannerRows.value
      .filter((row) => !row.isSummary)
      .forEach((row) => {
        // Need a deep copy so vuedraggable can mutate it without throwing Vue reactivity warnings immediately
        semesterMatrix[row.key] = JSON.parse(
          JSON.stringify(
            store.effectiveModules.filter(
              (mod) =>
                mod.semesterId === sem.id && moduleBelongsToRow(mod, row),
            ),
          ),
        );
      });
  });

  // Dummy lists for "New Semester" column drop zones
  m["new-semester"] = {};
  const newSemesterMatrix = m["new-semester"]!;
  plannerRows.value
    .filter((row) => !row.isSummary)
    .forEach((row) => {
      newSemesterMatrix[row.key] = [];
    });

  localMatrix.value = m;
};

// Rebuild matrix only if not actively dragging
watch(
  () => store.effectiveModules,
  () => {
    if (!isDragging.value) {
      updateMatrix();
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => {
  maybeShowInitialPlanPrompt();
});

const maybeShowInitialPlanPrompt = () => {
  if (hasShownInitialPlanPrompt.value) return;

  if (!store.activePlanId && store.templates.length > 0) {
    showPlanManager.value = true;
    hasShownInitialPlanPrompt.value = true;
  }
};

watch(
  () => [store.templates.length, store.activePlanId],
  () => {
    maybeShowInitialPlanPrompt();
  },
);

const getSemesterCpSum = (semId: string) => {
  return store.effectiveModules
    .filter((m) => m.semesterId === semId)
    .reduce((sum, m) => sum + m.cp, 0);
};

const getCategoryCpSum = (catId: string) => {
  return store.effectiveModules
    .filter((m) => m.categoryId === catId)
    .reduce((sum, m) => sum + m.cp, 0);
};

const getRowModules = (row: PlannerRow, semesterId?: string) => {
  return store.effectiveModules.filter((m) => {
    if (semesterId && m.semesterId !== semesterId) return false;
    if (row.kind === "summary") return m.categoryId === row.category.id;
    return moduleBelongsToRow(m, row);
  });
};

const getRowCpSum = (row: PlannerRow) => {
  return getRowModules(row).reduce((sum, m) => sum + m.cp, 0);
};

const getRowSemesterCpSum = (row: PlannerRow, semesterId: string) => {
  return getRowModules(row, semesterId).reduce((sum, m) => sum + m.cp, 0);
};

// Handle generic drag drops mapped back to the pinia store
const onChange = (
  evt: any,
  newSemId: string,
  newCatId: string,
  newSubCatId: string | null,
) => {
  if (evt.added) {
    const mod = evt.added.element;
    store.moveModule(mod.id, newSemId, newCatId, newSubCatId);
  }
};

// Handle drop on the "Add Semester" column empty zones
const onNewSemesterChange = (
  evt: any,
  rowKey: string,
  newCatId: string,
  newSubCatId: string | null,
) => {
  if (evt.added) {
    const mod = evt.added.element;
    const newSemId = store.addSemester(); // Triggers store append and returns target id
    store.moveModule(mod.id, newSemId, newCatId, newSubCatId);

    const newSemesterBucket = localMatrix.value["new-semester"];
    if (newSemesterBucket) {
      newSemesterBucket[rowKey] = []; // Clear visual dummy array
    }
  }
};
</script>
