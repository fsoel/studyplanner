<template>
  <div
    class="relative h-screen w-full bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col font-sans overflow-hidden"
  >
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center z-20 shrink-0"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-600 rounded-lg shadow-inner">
          <svg
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            ></path>
          </svg>
        </div>
        <h1
          class="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
        >
          Study Planner
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="toggleDark()"
          class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition flex items-center gap-2 font-medium text-sm"
        >
          <span v-if="isDark">☀️ Light Mode</span>
          <span v-else>🌙 Dark Mode</span>
        </button>
        <button
          v-if="isBackend && isAuthenticated"
          @click="logout()"
          class="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition flex items-center gap-2 font-medium text-sm"
        >
          Sign out
        </button>
      </div>
    </header>

    <main class="flex-1 p-6 overflow-hidden flex flex-col">
      <StudyPlanner v-if="isAuthenticated" />
      <div
        v-else-if="ready"
        class="relative flex-1 flex items-center justify-center overflow-hidden -m-6"
      >
        <AnimatedBackground :is-dark="isDark" />
        <div
          class="relative z-10 flex flex-col items-center gap-5 px-8 py-10 rounded-2xl border border-white/40 dark:border-white/10 bg-white/70 dark:bg-gray-800/60 backdrop-blur-xl shadow-2xl max-w-sm text-center ring-1 ring-black/5"
        >
          <h2 class="text-xl font-bold">Welcome to Study Planner</h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Sign in to save your study plans and access them from any device.
          </p>
          <button
            @click="login()"
            class="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
          >
            Sign in
          </button>
        </div>
      </div>
    </main>

    <transition name="fade">
      <div
        v-if="isPageLoading"
        class="absolute inset-0 z-50 flex items-center justify-center bg-gray-100/95 dark:bg-gray-900/95 backdrop-blur-sm"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="flex flex-col items-center gap-4 px-6 py-5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-gray-800/90 shadow-xl"
        >
          <div
            class="h-11 w-11 rounded-full border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 animate-spin"
          ></div>
          <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Loading your study planner...
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useDark, useToggle } from "@vueuse/core";
import { nextTick, onMounted, ref } from "vue";
import { useStudyPlanStore } from "./stores/studyPlan";
import { useAuth } from "./composables/useAuth";
import StudyPlanner from "./components/StudyPlanner.vue";
import AnimatedBackground from "./components/AnimatedBackground.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);
const store = useStudyPlanStore();
const { ready, isBackend, isAuthenticated, fetchMe, login, logout } = useAuth();
const isPageLoading = ref(true);

onMounted(async () => {
  try {
    const authed = await fetchMe();
    if (authed) {
      if (store.templates.length === 0) {
        await store.loadTemplates();
      }
      await store.hydrate();
    }
    await nextTick();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => resolve()),
    );
  } finally {
    isPageLoading.value = false;
  }
});
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
