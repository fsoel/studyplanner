<template>
  <button
    @click="$emit('update:modelValue', !modelValue)"
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="ariaLabel"
    class="relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
    :class="modelValue ? activeClass : inactiveClass"
  >
    <span
      class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform"
      :class="modelValue ? 'translate-x-5' : 'translate-x-0'"
    ></span>
  </button>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean;
    ariaLabel?: string;
    activeClass?: string;
    inactiveClass?: string;
  }>(),
  {
    ariaLabel: "Toggle option",
    activeClass: "bg-blue-600",
    inactiveClass: "bg-gray-300 dark:bg-gray-600",
  },
);

defineEmits<{ "update:modelValue": [value: boolean] }>();
</script>
