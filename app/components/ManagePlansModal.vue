<template>
  <BaseModal
    :show="show"
    size="lg"
    :show-close="canCancel"
    :close-on-backdrop="canCancel"
    aria-label="Manage plans"
    @close="$emit('close')"
  >
    <div class="flex max-h-[calc(100dvh-2rem)] flex-col p-5 sm:max-h-[calc(100dvh-4rem)] sm:p-8">
      <header class="mb-6 flex items-start gap-3 pr-10">
        <button
          v-if="view === 'create' && store.userPlans.length > 0"
          type="button"
          class="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          aria-label="Back to saved plans"
          title="Back to saved plans"
          @click="view = 'list'"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="min-w-0">
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
            {{ view === 'list' ? 'Manage Plans' : 'Create New Plan' }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{
              view === 'list'
                ? 'Select, rename, or remove one of your saved study plans.'
                : 'Set up the details for your new study plan.'
            }}
          </p>
        </div>
      </header>

      <div class="min-h-0 flex-1 overflow-y-auto pr-1">
        <template v-if="view === 'list'">
          <section v-if="store.userPlans.length > 0">
            <h3 class="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Saved Plans
            </h3>
            <div class="space-y-3">
              <div
                v-for="plan in store.userPlans"
                :key="plan.id"
                class="flex flex-col gap-4 rounded-xl border p-4 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between"
                :class="
                  plan.id === store.activePlanId
                    ? 'accent-soft accent-soft-border'
                    : 'border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700'
                "
              >
                <div class="min-w-0">
                  <template v-if="editingPlanId === plan.id">
                    <div class="flex max-w-lg items-center gap-2">
                      <input
                        v-model="editingName"
                        type="text"
                        class="accent-focus min-w-0 flex-1 rounded-lg border bg-white px-3 py-2 text-base font-semibold text-gray-800 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                        aria-label="Plan name"
                        @keydown.enter.prevent="savePlanName(plan.id)"
                        @keydown.esc="cancelPlanName"
                      />
                      <button
                        type="button"
                        class="accent-bg flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition hover:opacity-90"
                        aria-label="Save plan name"
                        title="Save name"
                        @click="savePlanName(plan.id)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-600 dark:hover:text-gray-100"
                        aria-label="Cancel renaming"
                        title="Cancel"
                        @click="cancelPlanName"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
                        </svg>
                      </button>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex min-w-0 items-center gap-2">
                      <span class="truncate text-lg font-bold text-gray-800 dark:text-gray-100">
                        {{ plan.name }}
                      </span>
                      <span
                        v-if="plan.id === store.activePlanId"
                        class="accent-badge shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                      >
                        Active
                      </span>
                      <button
                        type="button"
                        class="shrink-0 rounded p-1 text-gray-400 transition hover:bg-white hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                        aria-label="Edit plan name"
                        title="Edit plan name"
                        @click="startPlanNameEdit(plan)"
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16.862 3.487a2.1 2.1 0 113.651 2.1L8.25 17.85 4 19l1.15-4.25L16.862 3.487z" />
                        </svg>
                      </button>
                    </div>
                  </template>
                  <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Starts: {{ plan.config.startSeason }} {{ plan.config.startYear }} ·
                    {{ plan.config.numSemesters }} semesters
                  </div>
                </div>

                <div class="flex shrink-0 gap-2 sm:self-center">
                  <button
                    v-if="plan.id !== store.activePlanId"
                    type="button"
                    class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-600"
                    @click="store.switchPlan(plan.id)"
                  >
                    Select
                  </button>
                  <button
                    type="button"
                    class="flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:border-red-800/50 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
                    @click="requestDeletePlan(plan.id)"
                  >
                    <svg class="h-4 w-4 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span class="hidden sm:inline">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <button
            type="button"
            class="accent-panel mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 font-semibold transition hover:shadow-sm"
            @click="openCreateView"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Add new plan
          </button>
        </template>

        <form v-else class="space-y-5" @submit.prevent="submit">
          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" for="new-plan-name">
              Plan name
            </label>
            <input
              id="new-plan-name"
              v-model="form.name"
              type="text"
              class="accent-focus w-full rounded-lg border bg-gray-50 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              placeholder="My Study Plan"
              required
            />
          </div>

          <div>
            <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" for="new-plan-template">
              Course of studies
            </label>
            <select
              id="new-plan-template"
              v-model="form.templateId"
              class="accent-focus w-full rounded-lg border bg-gray-50 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              required
            >
              <option disabled value="">Select a course</option>
              <option v-for="template in store.templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
          </div>

          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" for="new-plan-season">
                Start season
              </label>
              <select
                id="new-plan-season"
                v-model="form.startSeason"
                class="accent-focus w-full rounded-lg border bg-gray-50 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
              >
                <option value="WS">Winter semester</option>
                <option value="SS">Summer semester</option>
              </select>
            </div>
            <div>
              <label class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300" for="new-plan-year">
                Start year
              </label>
              <input
                id="new-plan-year"
                v-model.number="form.startYear"
                type="number"
                min="2000"
                max="2100"
                class="accent-focus w-full rounded-lg border bg-gray-50 px-4 py-2.5 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <p v-if="createError" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
            {{ createError }}
          </p>

          <div class="flex flex-col-reverse gap-2 border-t border-gray-200 pt-5 dark:border-gray-700 sm:flex-row sm:justify-end">
            <button
              v-if="store.userPlans.length > 0"
              type="button"
              class="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              @click="view = 'list'"
            >
              Back to plans
            </button>
            <button
              type="submit"
              :disabled="!isValid || isCreating"
              class="accent-bg rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {{ isCreating ? 'Creating…' : 'Create and select plan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="!!planPendingDelete"
      title="Delete Plan"
      :message="deletePlanMessage"
      confirmLabel="Delete Plan"
      @confirm="confirmDeletePlan"
      @cancel="planPendingDelete = null"
    />
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { UserPlan } from "../types";
import BaseModal from "./BaseModal.vue";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps<{
  show: boolean;
  canCancel: boolean;
}>();

const emit = defineEmits<{ close: [] }>();
const store = useStudyPlanStore();
const view = ref<"list" | "create">(store.userPlans.length === 0 ? "create" : "list");

const form = ref({
  name: "",
  templateId: "",
  startSeason: "WS" as "WS" | "SS",
  startYear: new Date().getFullYear(),
});
const isCreating = ref(false);
const createError = ref("");

const isValid = computed(
  () =>
    form.value.name.trim().length > 0 &&
    form.value.templateId !== "" &&
    Number.isInteger(form.value.startYear) &&
    form.value.startYear >= 2000 &&
    form.value.startYear <= 2100,
);

const resetCreateForm = () => {
  form.value = {
    name: "",
    templateId: "",
    startSeason: "WS",
    startYear: new Date().getFullYear(),
  };
  createError.value = "";
};

const openCreateView = () => {
  resetCreateForm();
  view.value = "create";
};

// Default the plan name to the selected course's name, unless the user has
// already entered a custom name.
watch(
  () => form.value.templateId,
  (templateId) => {
    const template = store.templates.find((candidate) => candidate.id === templateId);
    if (!template) return;
    const current = form.value.name.trim();
    const isAutoFilled =
      current === "" || store.templates.some((candidate) => candidate.name === current);
    if (isAutoFilled) form.value.name = template.name;
  },
);

watch(
  () => props.show,
  (show) => {
    if (!show) return;
    view.value = store.userPlans.length === 0 ? "create" : "list";
    if (view.value === "create") resetCreateForm();
  },
);

watch(
  () => store.userPlans.length,
  (count) => {
    if (count === 0) view.value = "create";
  },
);

const editingPlanId = ref<string | null>(null);
const editingName = ref("");

const startPlanNameEdit = (plan: UserPlan) => {
  editingPlanId.value = plan.id;
  editingName.value = plan.name;
};

const cancelPlanName = () => {
  editingPlanId.value = null;
  editingName.value = "";
};

const savePlanName = (planId: string) => {
  const name = editingName.value.trim();
  if (!name) return;
  store.renamePlan(planId, name);
  cancelPlanName();
};

const planPendingDelete = ref<string | null>(null);
const planToDelete = computed(() =>
  store.userPlans.find((plan) => plan.id === planPendingDelete.value),
);
const deletePlanMessage = computed(() => {
  const planName = planToDelete.value?.name || "this plan";
  return `This will permanently delete "${planName}" and all modules arranged in it.`;
});

const requestDeletePlan = (planId: string) => {
  planPendingDelete.value = planId;
};

const confirmDeletePlan = () => {
  if (!planPendingDelete.value) return;
  store.deletePlan(planPendingDelete.value);
  planPendingDelete.value = null;
  cancelPlanName();
};

const submit = async () => {
  if (!isValid.value || isCreating.value) return;
  isCreating.value = true;
  createError.value = "";
  try {
    await store.createPlan(
      form.value.name.trim(),
      form.value.templateId,
      form.value.startSeason,
      form.value.startYear,
    );
    emit("close");
  } catch {
    createError.value = "The plan could not be created. Please try again.";
  } finally {
    isCreating.value = false;
  }
};
</script>
