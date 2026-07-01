<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 py-10 overflow-y-auto"
  >
    <div
      class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-2xl my-auto transform transition-all border border-gray-200 dark:border-gray-700"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
          Manage Plans
        </h2>
        <button
          v-if="canCancel"
          @click="$emit('close')"
          class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Current Plans List -->
      <div v-if="store.userPlans.length > 0" class="mb-8">
        <h3
          class="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-3"
        >
          Saved Plans
        </h3>
        <div class="space-y-3 max-h-60 overflow-y-auto pr-2">
          <div
            v-for="plan in store.userPlans"
            :key="plan.id"
            class="flex justify-between items-center p-4 border rounded-lg transition-colors shadow-sm"
            :class="
              plan.id === store.activePlanId
                ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
            "
          >
            <div>
              <div
                class="font-bold text-gray-800 dark:text-gray-100 text-lg flex items-center gap-2"
              >
                {{ plan.name }}
                <span
                  v-if="plan.id === store.activePlanId"
                  class="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200 font-medium"
                  >Active</span
                >
              </div>
              <div class="text-sm text-gray-500 dark:text-gray-400">
                Starts: {{ plan.config.startSeason }}
                {{ plan.config.startYear }} ·
                {{ plan.config.numSemesters }} Semesters
              </div>
            </div>
            <div class="flex gap-2">
              <button
                v-if="plan.id !== store.activePlanId"
                @click="store.switchPlan(plan.id)"
                class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 font-medium text-sm text-gray-700 dark:text-gray-200 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Select
              </button>
              <button
                @click="requestDeletePlan(plan.id)"
                class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50 rounded hover:bg-red-100 dark:hover:bg-red-900/40 transition font-medium text-sm flex items-center justify-center"
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
            </div>
          </div>
        </div>
      </div>

      <!-- Create New Plan -->
      <div class="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3
          class="text-sm font-semibold text-gray-500 tracking-wide uppercase mb-4"
        >
          Create New Plan
        </h3>
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Plan Name</label
              >
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="My Plan"
              />
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Course of Studies</label
              >
              <select
                v-model="form.templateId"
                class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              >
                <option disabled value="">-- Select Course --</option>
                <option v-for="t in store.templates" :key="t.id" :value="t.id">
                  {{ t.name }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Start Season</label
              >
              <select
                v-model="form.startSeason"
                class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              >
                <option value="WS">Winter</option>
                <option value="SS">Summer</option>
              </select>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >Start Year</label
              >
              <input
                v-model="form.startYear"
                type="number"
                class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                placeholder="2025"
              />
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button
            @click="submit"
            :disabled="!isValid"
            class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-semibold shadow-sm w-full md:w-auto"
          >
            Create & Select Plan
          </button>
        </div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps<{
  show: boolean;
  canCancel: boolean;
}>();

const emit = defineEmits(["close"]);
const store = useStudyPlanStore();

const form = ref({
  name: "",
  templateId: "",
  startSeason: "WS" as "WS" | "SS",
  startYear: new Date().getFullYear(),
});

const isValid = computed(
  () => form.value.name.trim().length > 0 && form.value.templateId !== "",
);

// Default the plan name to the selected course's name, unless the user has typed
// a custom name (i.e. the current name doesn't match any course name).
watch(
  () => form.value.templateId,
  (templateId) => {
    const template = store.templates.find((t) => t.id === templateId);
    if (!template) return;
    const current = form.value.name.trim();
    const isAutoFilled =
      current === "" || store.templates.some((t) => t.name === current);
    if (isAutoFilled) form.value.name = template.name;
  },
);
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
};

const submit = () => {
  store.createPlan(
    form.value.name,
    form.value.templateId,
    form.value.startSeason,
    form.value.startYear,
  );
  emit("close");
};
</script>
