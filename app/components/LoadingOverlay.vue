<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="flex flex-col items-center gap-4 px-6 py-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 shadow-xl">
        <div class="h-11 w-11 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
        <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
          Loading your study planner...
        </p>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
