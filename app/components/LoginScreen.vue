<template>
  <div class="relative flex-1 flex items-center justify-center overflow-hidden -m-6">
    <AnimatedBackground :is-dark="isDark" :accent-color="accentColor" />
    <div class="relative z-10 flex flex-col items-center gap-5 px-8 py-10 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl max-w-sm text-center ring-1 ring-black/5">
      <h2 class="text-xl font-bold">Welcome to Study Planner</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300">
        Sign in to save your study plans and access them from any device.
      </p>
      <button
        @click="$emit('login')"
        class="accent-bg accent-shadow px-5 py-2.5 rounded-lg text-white font-semibold transition"
      >
        Sign in
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import AnimatedBackground from "./AnimatedBackground.vue";

defineProps<{ isDark: boolean; accentColor: string }>();
defineEmits<{ login: [] }>();
</script>
