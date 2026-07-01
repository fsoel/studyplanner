<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 py-10 overflow-y-auto"
  >
    <div
      class="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md my-auto transform transition-all border border-gray-200 dark:border-gray-700"
    >
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">
          {{ isEditing ? "Edit Elective" : "Add Elective" }}
        </h2>
        <button
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

      <div class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Module Name</label
          >
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
            placeholder="My New Elective"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Credits (CP)</label
          >
          <input
            v-model.number="form.cp"
            type="number"
            min="1"
            max="30"
            class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div v-if="!isEditing">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >Target Semester</label
          >
          <select
            v-model="form.semesterId"
            class="w-full px-4 py-2 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
          >
            <option
              v-for="sem in store.semesters"
              :key="sem.id"
              :value="sem.id"
            >
              {{ sem.label }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-8 flex justify-between items-center">
        <button
          v-if="isEditing"
          @click="showDeleteConfirm = true"
          class="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 transition-colors"
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
          Delete
        </button>
        <div v-else></div>
        <!-- Spacer -->

        <div class="flex gap-3">
          <button
            @click="$emit('close')"
            class="px-5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            @click="submit"
            :disabled="!isValid"
            class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
          >
            {{ isEditing ? "Save Changes" : "Add Module" }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmModal
      :show="showDeleteConfirm"
      title="Delete Module"
      :message="deleteModuleMessage"
      confirmLabel="Delete Module"
      @confirm="deleteMod"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import ConfirmModal from "./ConfirmModal.vue";

const props = defineProps<{
  show: boolean;
  moduleId?: string;
  categoryId: string; // The category we are adding to
  subCategoryId?: string | null;
}>();

const emit = defineEmits(["close"]);
const store = useStudyPlanStore();

const form = ref({
  name: "New Elective",
  cp: 6,
  semesterId: "",
});
const showDeleteConfirm = ref(false);

const isEditing = computed(() => !!props.moduleId);
const isValid = computed(
  () => form.value.name.trim().length > 0 && form.value.cp > 0,
);
const deleteModuleMessage = computed(() => {
  return `This will permanently delete "${form.value.name}" from your plan.`;
});

const syncForm = () => {
  if (!props.show) return;
  showDeleteConfirm.value = false;

  if (isEditing.value && props.moduleId && store.activePlan) {
    const mod = store.activePlan.modules.find((m) => m.id === props.moduleId);
    if (mod) {
      form.value.name = mod.name;
      form.value.cp = mod.cp;
    }
    return;
  }

  form.value.name = "New Elective";
  form.value.cp = 6;
  form.value.semesterId = store.semesters[0]?.id ?? "";
};

watch(() => [props.show, props.moduleId], syncForm, { immediate: true });

const submit = () => {
  if (isEditing.value && props.moduleId) {
    store.updateModule(props.moduleId, form.value.name, form.value.cp);
  } else {
    store.addModule(
      form.value.name,
      form.value.cp,
      props.categoryId,
      form.value.semesterId,
      props.subCategoryId,
    );
  }
  emit("close");
};

const deleteMod = () => {
  if (!props.moduleId) return;
  store.deleteModule(props.moduleId);
  showDeleteConfirm.value = false;
  emit("close");
};
</script>
