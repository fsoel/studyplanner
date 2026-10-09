<template>
  <header
    class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-800 px-4 py-3 lg:px-6 lg:py-4 flex justify-between items-center z-20 shrink-0"
  >
    <div class="flex items-center gap-3">
      <div class="p-2 bg-blue-600 rounded-lg shadow-inner">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          ></path>
        </svg>
      </div>
      <h1 class="text-xl sm:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
        Study Planner
      </h1>
    </div>

    <div class="relative">
      <button
        v-if="isAuthenticated"
        @click.stop="$emit('update:accountMenuOpen', !accountMenuOpen)"
        type="button"
        aria-haspopup="menu"
        :aria-expanded="accountMenuOpen"
        aria-label="Open account menu"
        class="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-100 px-2.5 py-2 text-gray-700 transition hover:bg-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
      >
        <span class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {{ accountInitial }}
        </span>
        <span class="hidden max-w-32 truncate text-sm font-semibold sm:inline">{{ accountLabel }}</span>
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <button
        v-else
        @click="$emit('toggle-dark')"
        type="button"
        role="switch"
        :aria-checked="isDark"
        :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
        class="rounded-xl border border-gray-200 bg-gray-100 p-2.5 text-gray-700 transition hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
      >
        <svg v-if="isDark" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" />
        </svg>
      </button>

      <div
        v-if="isAuthenticated && accountMenuOpen"
        @click.stop
        role="menu"
        class="absolute right-0 top-full z-50 mt-2 w-72 origin-top-right rounded-2xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
      >
        <div class="border-b border-gray-100 px-3 py-3 dark:border-gray-700">
          <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Account</p>
          <p class="mt-1 truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{{ accountLabel }}</p>
          <p v-if="userEmail" class="truncate text-xs text-gray-500 dark:text-gray-400">{{ userEmail }}</p>
        </div>

        <button
          @click="$emit('open-settings')"
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
          @click="$emit('logout')"
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
</template>

<script setup lang="ts">
defineProps<{
  isAuthenticated: boolean;
  isBackend: boolean;
  isDark: boolean;
  accountMenuOpen: boolean;
  accountLabel: string;
  accountInitial: string;
  userEmail?: string;
}>();

defineEmits<{
  "update:accountMenuOpen": [value: boolean];
  "toggle-dark": [];
  "open-settings": [];
  logout: [];
}>();
</script>
