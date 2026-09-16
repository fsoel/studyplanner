<template>
  <div
    @click="accountMenuOpen = false"
    class="relative h-screen w-full bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col font-sans overflow-hidden"
  >
    <header
      class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center z-20 shrink-0"
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
          class="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
        >
          Study Planner
        </h1>
      </div>
      <div class="relative">
        <button
          @click.stop="accountMenuOpen = !accountMenuOpen"
          type="button"
          aria-haspopup="menu"
          :aria-expanded="accountMenuOpen"
          aria-label="Open account menu"
          class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-2 text-gray-700 transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
        >
          <span
            class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
          >
            {{ accountInitial }}
          </span>
          <span class="hidden max-w-32 truncate text-sm font-semibold sm:inline">
            {{ accountLabel }}
          </span>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
          </svg>
        </button>

        <div
          v-if="accountMenuOpen"
          @click.stop
          role="menu"
          class="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="border-b border-gray-100 px-3 py-3 dark:border-gray-700">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Account
            </p>
            <p class="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
              {{ accountLabel }}
            </p>
            <p v-if="user?.email" class="truncate text-xs text-gray-500 dark:text-gray-400">
              {{ user.email }}
            </p>
          </div>

          <div class="flex items-center justify-between px-3 py-3">
            <div class="flex items-center gap-2">
              <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
              </svg>
              <span class="text-sm font-medium">Dark mode</span>
            </div>
            <button
              @click="toggleDark()"
              type="button"
              role="switch"
              :aria-checked="isDark"
              :aria-label="isDark ? 'Disable dark mode' : 'Enable dark mode'"
              class="relative h-6 w-11 rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              :class="isDark ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'"
            >
              <span
                class="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform"
                :class="isDark ? 'translate-x-5' : 'translate-x-0'"
              ></span>
            </button>
          </div>

          <button
            @click="openSettings"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317a1.724 1.724 0 0 1 3.35 0 1.724 1.724 0 0 0 2.573 1.066 1.724 1.724 0 0 1 2.898 2.898 1.724 1.724 0 0 0 1.066 2.573 1.724 1.724 0 0 1 0 3.35 1.724 1.724 0 0 0-1.066 2.573 1.724 1.724 0 0 1-2.898 2.898 1.724 1.724 0 0 0-2.573 1.066 1.724 1.724 0 0 1-3.35 0 1.724 1.724 0 0 0-2.573-1.066 1.724 1.724 0 0 1-2.898-2.898 1.724 1.724 0 0 0-1.066-2.573 1.724 1.724 0 0 1 0-3.35 1.724 1.724 0 0 0 1.066-2.573 1.724 1.724 0 0 1 2.898-2.898 1.724 1.724 0 0 0 2.573 1.066Z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            Settings
          </button>

          <button
            v-if="isBackend && isAuthenticated"
            @click="logout()"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0-4-4m4 4H7m6 4v1a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </div>
    </header>

    <main class="flex-1 p-3 lg:p-6 overflow-hidden flex flex-col">
      <template v-if="isAuthenticated">
        <PlannerMobile v-if="isMobile" />
        <StudyPlanner v-else />
      </template>
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

    <div
      v-if="settingsOpen"
      class="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
      @click.self="settingsOpen = false"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        class="flex max-h-[min(640px,calc(100vh-2rem))] w-full max-w-3xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
      >
        <aside class="w-44 shrink-0 border-r border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/50 sm:w-52 sm:p-4">
          <p class="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Settings
          </p>
          <nav class="mt-3" aria-label="Settings sections">
            <button
              type="button"
              aria-current="page"
              class="flex w-full items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-left text-sm font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              About
            </button>
          </nav>
        </aside>

        <div class="min-w-0 flex-1 overflow-y-auto">
          <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700 sm:px-7">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">About</p>
              <h2 id="settings-title" class="mt-1 text-xl font-bold">Study Planner</h2>
            </div>
            <button
              @click="settingsOpen = false"
              type="button"
              aria-label="Close settings"
              class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6 12 12M6 18 18 6" />
              </svg>
            </button>
          </div>

          <div class="p-5 sm:p-7">
            <div class="flex items-start justify-between gap-4">
              <p class="max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                Study Planner helps you organize your modules, semesters, and progress in one place.
                Your plans stay available across devices when you are signed in.
              </p>
              <span class="shrink-0 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                v{{ releaseVersion }}
              </span>
            </div>
            <dl class="mt-6 border-t border-gray-100 pt-4 text-sm dark:border-gray-700">
              <div class="flex items-center justify-between gap-4">
                <dt class="text-gray-500 dark:text-gray-400">Current release</dt>
                <dd class="font-semibold">{{ releaseVersion }}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </div>

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
import { useDark, useToggle, useMediaQuery } from "@vueuse/core";
import { computed, nextTick, onMounted, ref } from "vue";
import { useStudyPlanStore } from "./stores/studyPlan";
import { useAuth } from "./composables/useAuth";
import StudyPlanner from "./components/StudyPlanner.vue";
import PlannerMobile from "./components/PlannerMobile.vue";
import AnimatedBackground from "./components/AnimatedBackground.vue";

const isDark = useDark();
const toggleDark = useToggle(isDark);
// Phones (portrait) get the dedicated mobile view; tablets keep the (denser) grid.
const isMobile = useMediaQuery("(max-width: 767px)");
const store = useStudyPlanStore();
const { ready, user, isBackend, isAuthenticated, fetchMe, login, logout } = useAuth();
const runtimeConfig = useRuntimeConfig();
const releaseVersion = runtimeConfig.public.releaseVersion;
const isPageLoading = ref(true);
const accountMenuOpen = ref(false);
const settingsOpen = ref(false);
const accountLabel = computed(() => {
  if (user.value?.name) return user.value.name;
  if (user.value?.email) return user.value.email;
  if (!isBackend) return "Local mode";
  return isAuthenticated.value ? "Signed in" : "Account";
});
const accountInitial = computed(() => accountLabel.value.trim().charAt(0).toUpperCase() || "A");

function openSettings(): void {
  accountMenuOpen.value = false;
  settingsOpen.value = true;
}

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
