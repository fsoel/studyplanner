<template>
  <div
    class="p-2 xl:p-3 border rounded-lg shadow-sm text-sm mb-2 transition-all hover:shadow-md relative group/card"
    :class="cardClasses"
    @click="store.togglePassed(module.id)"
    :title="
      store.isFutureSemester(module.semesterId)
        ? 'Cannot pass future modules'
        : store.isPastSemester(module.semesterId)
          ? 'Past module (Finalized)'
          : 'Click to toggle pass status'
    "
  >
    <div class="flex justify-between items-start">
      <span
        class="font-semibold leading-tight pr-4 cursor-grab active:cursor-grabbing grow min-w-0 [overflow-wrap:anywhere]"
        :class="{ 'opacity-70': store.isPastSemester(module.semesterId) }"
        >{{ module.name }}</span
      >
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          v-if="module.isElective"
          @click.stop="$emit('edit', module.id)"
          class="opacity-0 group-hover/card:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 p-1 rounded transition-all"
          title="Edit Elective"
        >
          <svg
            class="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            ></path>
          </svg>
        </button>
        <span
          class="text-xs font-bold leading-none bg-white/80 dark:bg-black/20 px-2 py-1 rounded-full whitespace-nowrap cursor-grab active:cursor-grabbing"
          >{{ module.cp }} CP</span
        >
      </div>
    </div>
    <div
      v-if="module.isPassed"
      class="text-xs mt-2 font-medium opacity-80 flex items-center gap-1 cursor-grab active:cursor-grabbing"
    >
      <svg
        class="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        ></path>
      </svg>
      Passed
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";
import type { Module, Category } from "../types";

defineEmits(["edit"]);
const props = defineProps<{
  module: Module;
  category: Category;
}>();

const store = useStudyPlanStore();

const cardClasses = computed(() => {
  const isFuture = store.isFutureSemester(props.module.semesterId);
  const isPast = store.isPastSemester(props.module.semesterId);

  if (props.module.isPassed) {
    let passedBase =
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 cursor-pointer";
    if (isPast) passedBase += " opacity-70";
    return passedBase;
  }

  let base =
    props.category.color ||
    "bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200";

  if (isPast) {
    base += " opacity-70 cursor-pointer";
  } else if (isFuture) {
    base += " cursor-not-allowed";
  } else {
    base += " cursor-pointer hover:scale-[1.02] shadow-sm";
  }

  return base;
});
</script>
