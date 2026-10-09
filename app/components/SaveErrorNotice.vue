<template>
  <div
    class="fixed inset-x-3 bottom-4 z-50 mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-red-200 bg-white p-4 shadow-xl dark:border-red-900/70 dark:bg-gray-800"
    role="alert"
    @click.stop
  >
    <svg
      class="h-5 w-5 shrink-0 text-red-600 dark:text-red-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 9v3.75m0 3h.008M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
      />
    </svg>

    <div class="min-w-0 flex-1">
      <p class="text-sm font-bold text-gray-900 dark:text-gray-100">Changes not saved</p>
      <p class="mt-0.5 text-xs text-gray-600 dark:text-gray-300">{{ message }}</p>
    </div>

    <button
      type="button"
      class="shrink-0 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      @click="$emit('retry')"
    >
      Retry
    </button>
    <button
      type="button"
      class="shrink-0 rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
      aria-label="Dismiss save error"
      @click="$emit('dismiss')"
    >
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6 12 12M6 18 18 6" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{ message: string }>();

defineEmits<{
  retry: [];
  dismiss: [];
}>();
</script>
