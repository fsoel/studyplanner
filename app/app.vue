<template>
  <div
    @click="accountMenuOpen = false"
    class="relative h-screen w-full bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-200 flex flex-col font-sans overflow-hidden"
  >
    <AppHeader
      v-model:account-menu-open="accountMenuOpen"
      :is-authenticated="isAuthenticated"
      :is-backend="isBackend"
      :is-dark="isDark"
      :theme-mode="themeMode"
      :account-label="accountLabel"
      :account-initial="accountInitial"
      :user-email="user?.email"
      @cycle-theme="cycleTheme"
      @open-settings="openSettings"
      @logout="logout"
    />

    <main class="flex-1 p-3 lg:p-6 overflow-hidden flex flex-col">
      <template v-if="isAuthenticated">
        <PlannerMobile v-if="isMobile" />
        <StudyPlanner v-else />
      </template>
      <LoginScreen v-else-if="ready" :is-dark="isDark" @login="login" />
    </main>

    <SettingsModal
      v-model="settingsOpen"
      :release-version="releaseVersion"
      :theme-mode="themeMode"
      @set-theme="setTheme"
    />
    <LoadingOverlay :visible="isPageLoading" />
  </div>
</template>

<script setup lang="ts">
import { useColorMode, useMediaQuery } from "@vueuse/core";
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { useStudyPlanStore } from "./stores/studyPlan";
import { useAuth } from "./composables/useAuth";
import AppHeader from "./components/AppHeader.vue";
import LoadingOverlay from "./components/LoadingOverlay.vue";
import LoginScreen from "./components/LoginScreen.vue";
import PlannerMobile from "./components/PlannerMobile.vue";
import SettingsModal from "./components/SettingsModal.vue";
import StudyPlanner from "./components/StudyPlanner.vue";

const colorMode = useColorMode({
  modes: {
    light: "",
    dark: "dark",
    oled: "dark oled",
  },
});
const isDark = ref(false);
let themeObserver: MutationObserver | undefined;

function syncThemeState(): void {
  isDark.value = document.documentElement.classList.contains("dark");
}

const themeMode = computed(() => {
  if (colorMode.value === "oled") return "oled";
  return colorMode.value === "dark" ? "dark" : "light";
});

function setTheme(value: string): void {
  if (value === "light" || value === "dark" || value === "oled") colorMode.value = value;
}

function cycleTheme(): void {
  const nextTheme = themeMode.value === "light"
    ? "dark"
    : themeMode.value === "dark"
      ? "oled"
      : "light";
  setTheme(nextTheme);
}

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
  syncThemeState();
  themeObserver = new MutationObserver(syncThemeState);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

  try {
    const authed = await fetchMe();
    if (authed) {
      if (store.templates.length === 0) await store.loadTemplates();
      await store.hydrate();
    }
    await nextTick();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  } finally {
    isPageLoading.value = false;
  }
});

onBeforeUnmount(() => themeObserver?.disconnect());
</script>

<style>
/* Lights out keeps large neutral surfaces at true black for OLED displays. */
html.oled,
html.oled body {
  background-color: #000;
  color-scheme: dark;
}

html.oled [class~="dark:bg-gray-900"],
html.oled [class~="dark:bg-gray-900/10"],
html.oled [class~="dark:bg-gray-900/40"],
html.oled [class~="dark:bg-gray-900/50"],
html.oled [class~="dark:bg-gray-900/95"],
html.oled [class~="dark:bg-gray-800"],
html.oled [class~="dark:bg-gray-800/20"],
html.oled [class~="dark:bg-gray-800/30"],
html.oled [class~="dark:bg-gray-800/50"],
html.oled [class~="dark:bg-gray-800/60"],
html.oled [class~="dark:bg-gray-800/90"],
html.oled [class~="dark:bg-gray-700"],
html.oled [class~="dark:bg-gray-700/50"],
html.oled [class~="dark:bg-gray-600"] {
  background-color: #000 !important;
}

/* Sticky table cells use a dark gradient as a visual edge; keep that edge black too. */
html.oled [class~="dark:after:from-gray-800"]::after {
  --tw-gradient-from: #000 var(--tw-gradient-from-position);
  --tw-gradient-to: rgb(0 0 0 / 0) var(--tw-gradient-to-position);
}

html.oled .current-semester-highlight {
  background-color: #161616 !important;
}
</style>
