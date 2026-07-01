<template>
  <div
    v-if="show"
    class="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 px-4 py-10"
    @click.self="$emit('close')"
  >
    <div
      class="w-full max-w-2xl rounded-xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- Header -->
      <div class="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">
            Progress Overview
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Cumulative credit points by semester — your plan vs. the recommended
            schedule.
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
          aria-label="Close"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <!-- Summary stats -->
      <div class="mb-4 grid grid-cols-3 gap-3">
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
        >
          <div class="text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Passed
          </div>
          <div class="text-lg font-black text-green-600 dark:text-green-400">
            {{ stats.passed }}
            <span class="text-xs font-semibold text-gray-400">CP</span>
          </div>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
        >
          <div class="text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Planned
          </div>
          <div class="text-lg font-black text-blue-600 dark:text-blue-400">
            {{ stats.planned }}
            <span class="text-xs font-semibold text-gray-400">CP</span>
          </div>
        </div>
        <div
          class="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900/50"
        >
          <div class="text-[10px] font-bold uppercase tracking-wide text-gray-400">
            Required
          </div>
          <div class="text-lg font-black text-gray-700 dark:text-gray-200">
            {{ stats.required }}
            <span class="text-xs font-semibold text-gray-400">CP</span>
          </div>
        </div>
      </div>

      <!-- Chart -->
      <div
        class="rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900/40"
      >
        <svg :viewBox="`0 0 ${chart.W} ${chart.H}`" class="h-auto w-full">
          <!-- horizontal gridlines + y labels -->
          <g v-for="t in chart.yTicks" :key="`y-${t.cp}`">
            <line
              :x1="chart.padL"
              :x2="chart.W - chart.padR"
              :y1="t.y"
              :y2="t.y"
              class="stroke-gray-200 dark:stroke-gray-700"
              stroke-width="1"
            />
            <text
              :x="chart.padL - 8"
              :y="t.y + 3"
              text-anchor="end"
              class="fill-gray-400 text-[9px]"
            >
              {{ t.cp }}
            </text>
          </g>

          <!-- target (required CP) line -->
          <line
            v-if="chart.targetY !== null"
            :x1="chart.padL"
            :x2="chart.W - chart.padR"
            :y1="chart.targetY"
            :y2="chart.targetY"
            stroke="#f59e0b"
            stroke-dasharray="4 4"
            stroke-width="1"
            opacity="0.7"
          />

          <!-- x labels (semester numbers) -->
          <text
            v-for="t in chart.xTicks"
            :key="`x-${t.i}`"
            :x="t.x"
            :y="chart.xAxisY + 16"
            text-anchor="middle"
            class="fill-gray-400 text-[9px]"
          >
            {{ t.label }}
          </text>
          <text
            :x="chart.padL + (chart.W - chart.padL - chart.padR) / 2"
            :y="chart.H - 2"
            text-anchor="middle"
            class="fill-gray-400 text-[9px] font-semibold uppercase tracking-wide"
          >
            Semester
          </text>

          <!-- data lines -->
          <polyline
            v-if="hasRecommendation"
            :points="chart.recommended"
            fill="none"
            stroke="#9ca3af"
            stroke-width="2"
            stroke-dasharray="5 4"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            :points="chart.planned"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
          <polyline
            :points="chart.passed"
            fill="none"
            stroke="#22c55e"
            stroke-width="2.5"
            stroke-linejoin="round"
            stroke-linecap="round"
          />
        </svg>
      </div>

      <!-- Legend -->
      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
        <span v-if="hasRecommendation" class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#9ca3af" stroke-width="2.5" stroke-dasharray="5 4" /></svg>
          Recommended
        </span>
        <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#3b82f6" stroke-width="3" /></svg>
          Your plan (placed)
        </span>
        <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#22c55e" stroke-width="3" /></svg>
          Passed
        </span>
        <span class="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <svg width="22" height="8"><line x1="0" y1="4" x2="22" y2="4" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4 4" /></svg>
          Required
        </span>
      </div>

      <p
        v-if="!hasRecommendation"
        class="mt-3 text-xs text-gray-400"
      >
        This plan has no course template, so no recommended schedule is available.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useStudyPlanStore } from "../stores/studyPlan";

defineProps<{ show: boolean }>();
defineEmits<{ close: [] }>();

const store = useStudyPlanStore();

const semNum = (id: string | null | undefined): number | null => {
  if (!id) return null;
  const n = parseInt(id.split("-")[1] ?? "", 10);
  return Number.isFinite(n) ? n : null;
};

const hasRecommendation = computed(
  () => (store.activeTemplate?.modules.length ?? 0) > 0,
);

const semesterCount = computed(() => {
  let max = store.semesters.length;
  for (const m of store.activeTemplate?.modules ?? []) {
    const n = semNum(m.semesterId);
    if (n && n > max) max = n;
  }
  return Math.max(max, 1);
});

// Per-semester CP rolled up into cumulative curves.
const series = computed(() => {
  const count = semesterCount.value;
  const recommended = new Array(count + 1).fill(0);
  const planned = new Array(count + 1).fill(0);
  const passed = new Array(count + 1).fill(0);

  for (const m of store.activeTemplate?.modules ?? []) {
    const n = semNum(m.semesterId);
    if (n && n >= 1 && n <= count) recommended[n] += m.cp;
  }
  for (const m of store.effectiveModules) {
    const n = semNum(m.semesterId);
    if (n && n >= 1 && n <= count) {
      planned[n] += m.cp;
      if (m.isPassed) passed[n] += m.cp;
    }
  }
  for (let i = 1; i <= count; i++) {
    recommended[i] += recommended[i - 1];
    planned[i] += planned[i - 1];
    passed[i] += passed[i - 1];
  }
  return { recommended, planned, passed };
});

const stats = computed(() => {
  const s = series.value;
  const count = semesterCount.value;
  return {
    passed: s.passed[count],
    planned: s.planned[count],
    required: store.totalRequiredCp,
  };
});

const chart = computed(() => {
  const count = semesterCount.value;
  const s = series.value;
  const W = 680;
  const H = 340;
  const padL = 40;
  const padR = 16;
  const padT = 12;
  const padB = 40;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const rawMax = Math.max(
    1,
    store.totalRequiredCp,
    ...s.recommended,
    ...s.planned,
    ...s.passed,
  );
  const maxY = Math.ceil(rawMax / 30) * 30;

  const xFor = (i: number) => padL + (i / count) * plotW;
  const yFor = (cp: number) => padT + plotH - (cp / maxY) * plotH;
  const line = (arr: number[]) =>
    arr.map((cp, i) => `${xFor(i).toFixed(1)},${yFor(cp).toFixed(1)}`).join(" ");

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((f) => {
    const cp = Math.round(maxY * f);
    return { cp, y: yFor(cp) };
  });
  // Thin x labels when there are many semesters, but always show the last one.
  const step = count > 14 ? 2 : 1;
  const xTicks = [];
  for (let i = 1; i <= count; i++) {
    if (i % step === 0 || i === count) {
      xTicks.push({ i, x: xFor(i), label: String(i) });
    }
  }

  return {
    W,
    H,
    padL,
    padR,
    padT,
    xAxisY: padT + plotH,
    maxY,
    recommended: line(s.recommended),
    planned: line(s.planned),
    passed: line(s.passed),
    yTicks,
    xTicks,
    targetY: store.totalRequiredCp <= maxY ? yFor(store.totalRequiredCp) : null,
  };
});
</script>
