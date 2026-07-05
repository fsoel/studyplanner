<template>
  <div class="flex flex-1 flex-col min-h-0">
    <template v-if="store.activePlan">
      <!-- Compact header -->
      <div class="shrink-0 space-y-2">
        <div class="flex items-center gap-2">
          <select
            v-model="store.activePlanId"
            class="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            <option v-for="plan in store.userPlans" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
          <button
            @click="showPlanManager = true"
            title="Manage plans"
            class="shrink-0 rounded-lg border border-indigo-100 bg-indigo-50 p-2.5 text-indigo-600 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-400"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <button
          @click="showProgressOverview = true"
          class="flex w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
        >
          <span class="shrink-0 text-[11px] font-bold uppercase tracking-wide text-gray-400">
            {{ store.totalPassedCp }}/{{ store.totalRequiredCp }} CP
          </span>
          <span class="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
            <span
              class="block h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              :style="{ width: `${store.progressPercent}%` }"
            ></span>
          </span>
          <span class="shrink-0 text-xs font-black text-blue-600 dark:text-blue-400">
            {{ store.progressPercent }}%
          </span>
        </button>

        <!-- Semester switcher -->
        <div class="flex items-center gap-1">
          <button
            class="shrink-0 rounded-lg px-1.5 py-2 text-gray-500 disabled:opacity-30 dark:text-gray-400"
            :disabled="selectedIndex <= 0"
            @click="step(-1)"
          >
            ‹
          </button>
          <div ref="pillScroller" class="no-scrollbar flex flex-1 gap-2 overflow-x-auto py-1">
            <button
              v-for="sem in store.semesters"
              :key="sem.id"
              :data-sem-id="sem.id"
              @click="selectedSemesterId = sem.id"
              class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition-colors"
              :class="pillClasses(sem)"
            >
              {{ sem.label }} · {{ semesterCp(sem.id) }} CP
            </button>
            <button
              @click="addSemester"
              class="shrink-0 rounded-full border border-dashed border-blue-300 px-3 py-1.5 text-xs font-bold text-blue-600 dark:border-blue-700 dark:text-blue-400"
            >
              ＋
            </button>
          </div>
          <button
            class="shrink-0 rounded-lg px-1.5 py-2 text-gray-500 disabled:opacity-30 dark:text-gray-400"
            :disabled="selectedIndex >= store.semesters.length - 1"
            @click="step(1)"
          >
            ›
          </button>
        </div>

        <div class="flex items-center justify-between px-1 pb-1">
          <span class="text-sm font-semibold text-gray-600 dark:text-gray-300">
            Semester {{ selectedIndex + 1 }}
            <span
              v-if="isSelectedCurrent"
              class="ml-1 rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              >Current</span
            >
          </span>
          <button
            v-if="store.semesters.length > 1 && selectedSemesterId"
            @click="semesterPendingRemove = selectedSemesterId"
            class="text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Remove semester
          </button>
        </div>
      </div>

      <!-- Scrollable body: selected semester's modules by category -->
      <div
        class="mt-1 flex-1 overflow-y-auto"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
      >
        <div
          v-for="entry in semesterRows"
          :key="entry.row.key"
          class="mb-1"
        >
          <div class="mb-2 mt-3 flex items-center justify-between gap-2">
            <div
              class="min-w-0 border-l-4 pl-2 text-sm font-bold [overflow-wrap:anywhere]"
              :class="[
                getCategoryHeaderClasses(entry.row.category.color),
                entry.row.kind === 'subCategory' || entry.row.kind === 'direct'
                  ? 'ml-3'
                  : '',
              ]"
            >
              {{ entry.row.displayName }}
            </div>
            <div class="flex shrink-0 items-center gap-2">
              <span
                v-if="entry.row.maxCp !== undefined || entry.row.minCp !== undefined"
                class="rounded-full px-2 py-0.5 text-[10px] font-bold"
                :class="capChipClasses(entry.row)"
              >
                {{ rowTotalCp(entry.row)
                }}{{ entry.row.maxCp !== undefined ? "/" + entry.row.maxCp : "" }} CP
              </span>
              <button
                v-if="entry.row.canAddElective"
                @click="openAddElective(entry.row)"
                class="rounded bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
              >
                + Add
              </button>
            </div>
          </div>

          <div class="space-y-2 pl-1">
            <button
              v-for="mod in entry.modules"
              :key="mod.id"
              @click="sheetModule = mod"
              class="flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors active:scale-[0.99]"
              :class="
                mod.isPassed
                  ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
              "
            >
              <span class="min-w-0 flex-1 truncate font-medium text-gray-800 dark:text-gray-100">
                {{ mod.name }}
              </span>
              <span
                class="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-600 dark:bg-gray-700 dark:text-gray-300"
              >
                {{ mod.cp }} CP
              </span>
              <svg
                v-if="mod.isPassed"
                class="h-4 w-4 shrink-0 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </button>
            <p
              v-if="entry.modules.length === 0"
              class="px-1 py-1 text-xs italic text-gray-400"
            >
              No modules here yet.
            </p>
          </div>
        </div>

        <p
          v-if="semesterRows.length === 0"
          class="mt-8 text-center text-sm text-gray-400"
        >
          No modules in this semester.
        </p>
      </div>
    </template>

    <!-- Empty state (no active plan) -->
    <div
      v-else
      class="flex flex-1 flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <h2 class="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">No Study Plan Active</h2>
      <p class="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Create a plan by selecting a course of studies to get started.
      </p>
      <button
        @click="showPlanManager = true"
        class="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-700"
      >
        Create New Plan
      </button>
    </div>

    <!-- Action sheet -->
    <MobileModuleSheet
      :module="sheetModule"
      :semesters="store.semesters"
      :current-semester-id="sheetModule?.semesterId ?? null"
      :can-pass="sheetCanPass"
      @close="sheetModule = null"
      @toggle-pass="onSheetTogglePass"
      @move="onSheetMove"
      @edit="onSheetEdit"
      @delete="onSheetDelete"
    />

    <!-- Shared modals -->
    <ManagePlansModal
      v-if="showPlanManager"
      :show="showPlanManager"
      :canCancel="store.userPlans.length > 0"
      @close="showPlanManager = false"
    />
    <EditModuleModal
      v-if="showEditModal"
      :show="showEditModal"
      :categoryId="modalCategoryId"
      :subCategoryId="modalSubCategoryId"
      :moduleId="modalModuleId"
      :defaultSemesterId="selectedSemesterId ?? undefined"
      @close="showEditModal = false"
    />
    <ProgressOverviewModal
      v-if="showProgressOverview"
      :show="showProgressOverview"
      @close="showProgressOverview = false"
    />
    <ConfirmModal
      :show="!!semesterPendingRemove"
      title="Remove Semester"
      :message="removeSemesterMessage"
      confirmLabel="Remove Semester"
      @confirm="confirmRemoveSemester"
      @cancel="semesterPendingRemove = null"
    />
    <ConfirmModal
      :show="!!modulePendingDelete"
      title="Delete Module"
      :message="deleteModuleMessage"
      confirmLabel="Delete Module"
      @confirm="confirmDeleteModule"
      @cancel="modulePendingDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch, watchEffect } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { Module, Semester } from "../types";
import {
  usePlannerRows,
  moduleBelongsToRow,
  getCategoryHeaderClasses,
  type PlannerRow,
} from "../composables/usePlannerRows";
import ManagePlansModal from "./ManagePlansModal.vue";
import EditModuleModal from "./EditModuleModal.vue";
import ProgressOverviewModal from "./ProgressOverviewModal.vue";
import ConfirmModal from "./ConfirmModal.vue";
import MobileModuleSheet from "./MobileModuleSheet.vue";

const store = useStudyPlanStore();
const { plannerRows } = usePlannerRows();

const showPlanManager = ref(false);
const showProgressOverview = ref(false);
const showEditModal = ref(false);
const modalCategoryId = ref("");
const modalSubCategoryId = ref<string | null>(null);
const modalModuleId = ref<string | undefined>(undefined);

const sheetModule = ref<Module | null>(null);
const semesterPendingRemove = ref<string | null>(null);
const modulePendingDelete = ref<Module | null>(null);

// --- Selected semester ---
const selectedSemesterId = ref<string | null>(null);

const currentSemesterId = computed(() => {
  const info = store.currentSemesterInfo;
  return (
    store.semesters.find((s) => s.season === info.season && s.year === info.year)
      ?.id ?? null
  );
});

// Keep the selected semester valid (default to the current one, else the first).
watchEffect(() => {
  const ids = store.semesters.map((s) => s.id);
  if (!selectedSemesterId.value || !ids.includes(selectedSemesterId.value)) {
    selectedSemesterId.value =
      currentSemesterId.value ?? store.semesters[0]?.id ?? null;
  }
});

const selectedIndex = computed(() =>
  store.semesters.findIndex((s) => s.id === selectedSemesterId.value),
);
const isSelectedCurrent = computed(
  () => !!selectedSemesterId.value && selectedSemesterId.value === currentSemesterId.value,
);

const pillClasses = (sem: Semester) => {
  if (sem.id === selectedSemesterId.value) {
    return "border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500";
  }
  if (sem.id === currentSemesterId.value) {
    return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
  }
  return "border-gray-200 bg-white text-gray-600 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300";
};

const step = (dir: number) => {
  const next = selectedIndex.value + dir;
  const sem = store.semesters[next];
  if (sem) selectedSemesterId.value = sem.id;
};

// Keep the selected pill centered in the horizontal scroller.
const pillScroller = ref<HTMLElement | null>(null);
const centerSelectedPill = () => {
  const container = pillScroller.value;
  if (!container || !selectedSemesterId.value) return;
  const el = container.querySelector<HTMLElement>(
    `[data-sem-id="${selectedSemesterId.value}"]`,
  );
  if (!el) return;
  const cRect = container.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();
  const delta =
    eRect.left - cRect.left - (container.clientWidth - el.clientWidth) / 2;
  container.scrollBy({ left: delta, behavior: "smooth" });
};
watch(selectedSemesterId, () => nextTick(centerSelectedPill));
onMounted(() => nextTick(centerSelectedPill));

// Swipe left/right on the body to move between semesters.
let touchStartX = 0;
let touchStartY = 0;
const onTouchStart = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  touchStartX = t.clientX;
  touchStartY = t.clientY;
};
const onTouchEnd = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  // Horizontal, decisive swipe only — ignore vertical scrolls and taps.
  if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
  step(dx < 0 ? 1 : -1);
};

const semesterCp = (semId: string) =>
  store.effectiveModules
    .filter((m) => m.semesterId === semId)
    .reduce((sum, m) => sum + m.cp, 0);

const addSemester = () => {
  const id = store.addSemester();
  if (id) selectedSemesterId.value = id;
};

// --- Rows for the selected semester ---
const semesterRows = computed(() => {
  const semId = selectedSemesterId.value;
  if (!semId) return [];
  return plannerRows.value
    .filter((row) => !row.isSummary)
    .map((row) => ({
      row,
      modules: store.effectiveModules.filter(
        (m) => m.semesterId === semId && moduleBelongsToRow(m, row),
      ),
    }))
    .filter((entry) => entry.row.canAddElective || entry.modules.length > 0);
});

const rowTotalCp = (row: PlannerRow) =>
  store.effectiveModules
    .filter((m) => moduleBelongsToRow(m, row))
    .reduce((sum, m) => sum + m.cp, 0);

const capChipClasses = (row: PlannerRow) => {
  const total = rowTotalCp(row);
  if (row.maxCp !== undefined && total > row.maxCp) {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
  if (row.minCp !== undefined && total < row.minCp) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
  }
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
};

// --- Add / edit electives ---
const openAddElective = (row: PlannerRow) => {
  modalCategoryId.value = row.category.id;
  modalSubCategoryId.value = row.subCategory?.id ?? null;
  modalModuleId.value = undefined;
  showEditModal.value = true;
};

// --- Action sheet handlers ---
const sheetCanPass = computed(
  () => !!sheetModule.value && !store.isFutureSemester(sheetModule.value.semesterId),
);

const onSheetTogglePass = () => {
  if (sheetModule.value) store.togglePassed(sheetModule.value.id);
  sheetModule.value = null;
};
const onSheetMove = (targetSemesterId: string) => {
  const mod = sheetModule.value;
  if (mod) {
    store.moveModule(mod.id, targetSemesterId, mod.categoryId, mod.subCategoryId ?? null);
  }
  sheetModule.value = null;
};
const onSheetEdit = () => {
  const mod = sheetModule.value;
  if (mod) {
    modalCategoryId.value = mod.categoryId;
    modalSubCategoryId.value = mod.subCategoryId ?? null;
    modalModuleId.value = mod.id;
    showEditModal.value = true;
  }
  sheetModule.value = null;
};
const onSheetDelete = () => {
  modulePendingDelete.value = sheetModule.value;
  sheetModule.value = null;
};

// --- Confirmations ---
const removeSemesterMessage = computed(() => {
  const label = store.semesters.find((s) => s.id === semesterPendingRemove.value)?.label;
  return `This will remove ${label || "this semester"}. Modules in it will be shifted according to the planner's existing rules.`;
});
const confirmRemoveSemester = () => {
  if (semesterPendingRemove.value) store.removeSemester(semesterPendingRemove.value);
  semesterPendingRemove.value = null;
};

const deleteModuleMessage = computed(
  () => `This will permanently delete "${modulePendingDelete.value?.name}" from your plan.`,
);
const confirmDeleteModule = () => {
  if (modulePendingDelete.value) store.deleteModule(modulePendingDelete.value.id);
  modulePendingDelete.value = null;
};

// --- Prompt to create a plan only when the user has none (mirrors desktop) ---
const ensureActivePlanOrPrompt = () => {
  if (!store.isHydrated || store.templates.length === 0) return;
  if (store.userPlans.length === 0) {
    showPlanManager.value = true;
    return;
  }
  if (!store.activePlan) {
    const first = store.userPlans[0];
    if (first) store.switchPlan(first.id);
  }
};
onMounted(ensureActivePlanOrPrompt);
watch(
  () => [store.isHydrated, store.templates.length, store.userPlans.length, store.activePlanId],
  ensureActivePlanOrPrompt,
);
</script>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
