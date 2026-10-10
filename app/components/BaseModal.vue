<template>
  <Teleport to="body">
    <div
      v-if="show"
      :class="[
        'fixed inset-0 z-[70] flex min-h-full overflow-y-auto bg-gray-950/50 backdrop-blur-sm',
        placementClasses[placement],
      ]"
      @click.self="handleBackdropClick"
    >
      <section
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-label="titleId ? undefined : ariaLabel"
        :class="[
          'relative max-h-[calc(100dvh-2rem)] w-full border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:max-h-[calc(100dvh-4rem)]',
          placementPanelClasses[placement],
          sizeClasses[size],
          windowClass,
        ]"
        :style="windowStyle"
      >
        <button
          v-if="showClose"
          type="button"
          :aria-label="closeLabel"
          class="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
          @click="close"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6 12 12M6 18 18 6" />
          </svg>
        </button>

        <slot />
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    show: boolean;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    placement?: "center" | "bottom";
    windowClass?: string;
    windowStyle?: Record<string, string>;
    titleId?: string;
    ariaLabel?: string;
    closeLabel?: string;
    showClose?: boolean;
    closeOnBackdrop?: boolean;
  }>(),
  {
    size: "md",
    placement: "center",
    windowClass: "",
    windowStyle: undefined,
    titleId: undefined,
    ariaLabel: "Dialog",
    closeLabel: "Close dialog",
    showClose: true,
    closeOnBackdrop: true,
  },
);

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-3xl",
  full: "max-w-5xl",
} as const;

const placementClasses = {
  center: "items-center justify-center px-4 py-4 sm:py-8",
  bottom: "items-end justify-center",
} as const;

const placementPanelClasses = {
  center: "my-auto rounded-2xl",
  bottom: "my-0 rounded-t-2xl rounded-b-none",
} as const;

const emit = defineEmits<{ close: [] }>();

function close(): void {
  emit("close");
}

function handleBackdropClick(): void {
  if (props.closeOnBackdrop) close();
}
</script>
