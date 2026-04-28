<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 px-4 py-10"
  >
    <div
      class="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="mb-5 flex items-start gap-4">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
            ></path>
          </svg>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            {{ title }}
          </h2>
          <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {{ message }}
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button
          @click="$emit('cancel')"
          class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {{ cancelLabel }}
        </button>
        <button
          @click="$emit('confirm')"
          class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
        >
          {{ confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    show: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }>(),
  {
    confirmLabel: "Delete",
    cancelLabel: "Cancel",
  },
);

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>
