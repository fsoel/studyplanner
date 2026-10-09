<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-40 flex items-center justify-center bg-gray-950/50 p-4 backdrop-blur-sm"
    @click.self="close"
  >
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      class="flex h-[min(600px,calc(100vh-2rem))] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800 sm:flex-row"
    >
      <aside class="hidden w-52 shrink-0 border-r border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50 sm:block">
        <p class="px-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Settings</p>
        <nav class="mt-3 max-h-40 overflow-y-auto sm:max-h-none sm:overflow-visible" aria-label="Settings sections">
          <button
            type="button"
            :aria-current="settingsSection === 'appearance' ? 'page' : undefined"
            @click="settingsSection = 'appearance'"
            class="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition"
            :class="sectionClass('appearance')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
            </svg>
            Appearance
          </button>
          <button
            type="button"
            :aria-current="settingsSection === 'about' ? 'page' : undefined"
            @click="settingsSection = 'about'"
            class="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition"
            :class="sectionClass('about')"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            About
          </button>
        </nav>
      </aside>

      <div v-if="settingsMobileView === 'list'" class="flex min-h-0 flex-1 flex-col bg-gray-50 dark:bg-gray-900/50 sm:hidden">
        <div class="border-b border-gray-200 px-5 py-4 dark:border-gray-700">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Settings</p>
          <h2 class="mt-1 text-xl font-bold">Settings</h2>
        </div>
        <nav class="overflow-y-auto p-3" aria-label="Settings sections">
          <button type="button" @click="openSection('appearance')" class="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100">
            <span class="flex items-center gap-3">
              <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
              </svg>
              Appearance
            </span>
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
            </svg>
          </button>
          <button type="button" @click="openSection('about')" class="mt-2 flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 shadow-sm dark:bg-gray-800 dark:text-gray-100">
            <span class="flex items-center gap-3">
              <svg class="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              About
            </span>
            <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m9 5 7 7-7 7" />
            </svg>
          </button>
        </nav>
      </div>

      <div
        v-if="settingsMobileView === 'detail'"
        class="min-w-0 flex-1 overflow-y-auto sm:block"
        @touchstart="onTouchStart"
        @touchend="onTouchEnd"
      >
        <button type="button" @click="settingsMobileView = 'list'" class="accent-text flex items-center gap-1 px-5 pt-4 text-sm font-semibold sm:hidden">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 18-6-6 6-6" />
          </svg>
          Settings
        </button>
        <div class="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-700 sm:px-7">
          <div>
            <p class="accent-text text-xs font-semibold uppercase tracking-wide">
              {{ settingsSection === 'about' ? 'About' : 'Appearance' }}
            </p>
            <h2 id="settings-title" class="mt-1 text-xl font-bold">
              {{ settingsSection === 'about' ? 'Study Planner' : 'Appearance' }}
            </h2>
          </div>
          <button @click="close" type="button" aria-label="Close settings" class="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-100">
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 6 12 12M6 18 18 6" />
            </svg>
          </button>
        </div>

        <div v-if="settingsSection === 'about'" class="p-5 sm:p-7">
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

        <div v-else class="p-5 sm:p-7">
          <div class="max-w-xl">
            <label for="theme-select" class="block text-sm font-semibold text-gray-900 dark:text-gray-100">Theme</label>
            <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Choose the appearance used throughout Study Planner.
            </p>
            <select
              id="theme-select"
              :value="themeMode"
              @change="handleThemeChange"
              class="accent-focus mt-5 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-800 outline-none transition dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="oled">Lights out</option>
            </select>

            <label for="accent-select" class="mt-6 block text-sm font-semibold text-gray-900 dark:text-gray-100">Accent color</label>
            <p class="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Choose the color used for primary actions, highlights, and progress indicators.
            </p>
            <div class="relative mt-5">
              <span class="accent-bg pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full" aria-hidden="true"></span>
              <select
                id="accent-select"
                :value="accentColor"
                @change="handleAccentChange"
                class="accent-focus w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-3 text-sm font-medium capitalize text-gray-800 outline-none transition dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="blue">Blue</option>
                <option value="green">Green</option>
                <option value="pink">Pink</option>
                <option value="purple">Purple</option>
                <option value="yellow">Yellow</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMediaQuery } from "@vueuse/core";
import { ref, watch } from "vue";
import type { AccentColor } from "../types";

const props = defineProps<{
  modelValue: boolean;
  releaseVersion: string;
  themeMode: string;
  accentColor: AccentColor;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "set-theme": [value: string];
  "set-accent": [value: string];
}>();

const isMobile = useMediaQuery("(max-width: 767px)");
const settingsSection = ref<"about" | "appearance">("about");
const settingsMobileView = ref<"list" | "detail">("detail");
const touchStartX = ref<number | null>(null);

function close(): void {
  emit("update:modelValue", false);
}

function sectionClass(section: "about" | "appearance"): string {
  return settingsSection.value === section
    ? "accent-soft accent-soft-text"
    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800";
}

function openSection(section: "about" | "appearance"): void {
  settingsSection.value = section;
  settingsMobileView.value = "detail";
}

function handleThemeChange(event: Event): void {
  emit("set-theme", (event.target as HTMLSelectElement).value);
}

function handleAccentChange(event: Event): void {
  emit("set-accent", (event.target as HTMLSelectElement).value);
}

function onTouchStart(event: TouchEvent): void {
  touchStartX.value = event.changedTouches[0]?.clientX ?? null;
}

function onTouchEnd(event: TouchEvent): void {
  const startX = touchStartX.value;
  touchStartX.value = null;
  const endX = event.changedTouches[0]?.clientX;
  if (isMobile.value && startX !== null && endX !== undefined && endX - startX > 60) {
    settingsMobileView.value = "list";
  }
}

watch(isMobile, (mobile) => {
  if (props.modelValue) settingsMobileView.value = mobile ? "list" : "detail";
});

watch(() => props.modelValue, (open) => {
  if (open) settingsMobileView.value = isMobile.value ? "list" : "detail";
});
</script>

