<template>
  <div
    v-if="module"
    class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-md rounded-t-2xl border-t border-gray-200 bg-white p-4 pb-8 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      :style="dragStyle"
      @touchstart.passive="onTouchStart"
      @touchmove="onTouchMove"
      @touchend.passive="onTouchEnd"
    >
      <div class="mx-auto mb-3 h-1.5 w-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>

      <div class="mb-3 flex items-baseline justify-between gap-3 px-1">
        <h3 class="min-w-0 flex-1 truncate text-base font-bold text-gray-900 dark:text-white">
          {{ module.name }}
        </h3>
        <span class="shrink-0 text-sm font-bold text-blue-600 dark:text-blue-400">
          {{ module.cp }} CP
        </span>
      </div>

      <!-- Main actions -->
      <div v-if="view === 'main'" class="flex flex-col gap-1">
        <button
          v-if="module.isPassed"
          class="sheet-btn"
          @click="$emit('togglePass')"
        >
          <span class="text-amber-500">↺</span> Mark as not passed
        </button>
        <button
          v-else
          class="sheet-btn disabled:opacity-40"
          :disabled="!canPass"
          @click="$emit('togglePass')"
        >
          <span class="text-green-500">✓</span>
          {{ canPass ? "Mark as passed" : "Can't pass a future semester" }}
        </button>

        <button class="sheet-btn" @click="view = 'move'">
          <span class="text-blue-500">↔</span> Move to semester…
        </button>

        <template v-if="module.isElective">
          <button class="sheet-btn" @click="$emit('edit')">
            <span class="text-gray-400">✎</span> Edit
          </button>
          <button class="sheet-btn text-red-600 dark:text-red-400" @click="$emit('delete')">
            <span>🗑</span> Delete
          </button>
        </template>

        <button
          class="mt-2 w-full rounded-lg py-3 text-center font-semibold text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
          @click="$emit('close')"
        >
          Cancel
        </button>
      </div>

      <!-- Move submenu -->
      <div v-else class="flex flex-col gap-1">
        <button
          class="mb-1 flex items-center gap-2 px-1 text-sm font-semibold text-gray-500 dark:text-gray-400"
          @click="view = 'main'"
        >
          ‹ Back
        </button>
        <div class="max-h-[50vh] overflow-y-auto">
          <button
            v-for="sem in semesters"
            :key="sem.id"
            class="sheet-btn justify-between disabled:opacity-40"
            :disabled="sem.id === currentSemesterId"
            @click="$emit('move', sem.id)"
          >
            <span>{{ sem.label }}</span>
            <span
              v-if="sem.id === currentSemesterId"
              class="text-xs font-semibold text-gray-400"
              >current</span
            >
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Module } from "../types";

const props = defineProps<{
  module: Module | null;
  semesters: { id: string; label: string }[];
  currentSemesterId: string | null;
  canPass: boolean;
}>();

const emit = defineEmits<{
  close: [];
  togglePass: [];
  move: [semesterId: string];
  edit: [];
  delete: [];
}>();

const view = ref<"main" | "move">("main");

// Reset to the main screen whenever a new module's sheet opens.
watch(
  () => props.module?.id,
  () => {
    view.value = "main";
    dragY.value = 0;
  },
);

// --- Swipe down to dismiss ---
const dragY = ref(0);
let startY = 0;
let dragging = false;

const dragStyle = computed(() =>
  dragY.value > 0
    ? { transform: `translateY(${dragY.value}px)`, transition: "none" }
    : {},
);

const onTouchStart = (e: TouchEvent) => {
  const t = e.changedTouches[0];
  if (!t) return;
  startY = t.clientY;
  dragging = true;
};
const onTouchMove = (e: TouchEvent) => {
  if (!dragging) return;
  const t = e.changedTouches[0];
  if (!t) return;
  const dy = t.clientY - startY;
  if (dy > 0) {
    dragY.value = dy;
    // Prevent the page from scrolling while we drag the sheet.
    e.preventDefault();
  }
};
const onTouchEnd = () => {
  dragging = false;
  if (dragY.value > 100) {
    emit("close");
  }
  dragY.value = 0;
};
</script>

<style scoped>
.sheet-btn {
  @apply flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700;
}
</style>
