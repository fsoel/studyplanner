<template>
  <div
    class="pointer-events-none absolute inset-0 overflow-hidden"
    aria-hidden="true"
  >
    <!-- Slow-drifting aurora orbs -->
    <div class="orb orb-1" :class="{ 'orb-dark': isDark }"></div>
    <div class="orb orb-2" :class="{ 'orb-dark': isDark }"></div>
    <div class="orb orb-3" :class="{ 'orb-dark': isDark }"></div>

    <!-- Constellation particle field -->
    <canvas ref="canvas" class="absolute inset-0 h-full w-full"></canvas>

    <!-- Depth vignette -->
    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 dark:to-black/40"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps<{ isDark?: boolean }>();

const canvas = ref<HTMLCanvasElement | null>(null);

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

let ctx: CanvasRenderingContext2D | null = null;
let raf = 0;
let particles: P[] = [];
let w = 0;
let h = 0;
let dpr = 1;
let reduced = false;
const mouse = { x: -9999, y: -9999 };

const LINK_DIST = 130; // px between particles to draw a link
const MOUSE_DIST = 190; // px around cursor to react

const rgb = () =>
  props.isDark
    ? { dot: "147,197,253", line: "129,140,248" } // blue-300 / indigo-400
    : { dot: "79,70,229", line: "99,102,241" }; // indigo-600 / indigo-500

const rand = (min: number, max: number) => min + Math.random() * (max - min);

function seed() {
  const density = (w * h) / 15000;
  const count = Math.max(28, Math.min(110, Math.round(density)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: rand(-0.25, 0.25),
    vy: rand(-0.25, 0.25),
    r: rand(1, 2.4),
  }));
}

function resize() {
  const el = canvas.value;
  if (!el || !ctx) return;
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  w = el.clientWidth;
  h = el.clientHeight;
  el.width = Math.round(w * dpr);
  el.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  seed();
}

function draw() {
  if (!ctx) return;
  const c = rgb();
  ctx.clearRect(0, 0, w, h);

  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    // Gentle cursor attraction
    const mdx = mouse.x - p.x;
    const mdy = mouse.y - p.y;
    const md2 = mdx * mdx + mdy * mdy;
    if (md2 < MOUSE_DIST * MOUSE_DIST) {
      const md = Math.sqrt(md2) || 1;
      const pull = (1 - md / MOUSE_DIST) * 0.35;
      p.vx += (mdx / md) * pull * 0.05;
      p.vy += (mdy / md) * pull * 0.05;
    }

    // Damping + soft speed cap
    p.vx = Math.max(-0.6, Math.min(0.6, p.vx * 0.995));
    p.vy = Math.max(-0.6, Math.min(0.6, p.vy * 0.995));

    // Wrap around edges
    if (p.x < -10) p.x = w + 10;
    else if (p.x > w + 10) p.x = -10;
    if (p.y < -10) p.y = h + 10;
    else if (p.y > h + 10) p.y = -10;
  }

  // Links between nearby particles
  ctx.lineWidth = 1;
  for (let i = 0; i < particles.length; i++) {
    const a = particles[i]!;
    for (let j = i + 1; j < particles.length; j++) {
      const b = particles[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < LINK_DIST * LINK_DIST) {
        const alpha = (1 - Math.sqrt(d2) / LINK_DIST) * 0.55;
        ctx.strokeStyle = `rgba(${c.line},${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  // Links to the cursor
  for (const p of particles) {
    const dx = p.x - mouse.x;
    const dy = p.y - mouse.y;
    const d2 = dx * dx + dy * dy;
    if (d2 < MOUSE_DIST * MOUSE_DIST) {
      const alpha = (1 - Math.sqrt(d2) / MOUSE_DIST) * 0.5;
      ctx.strokeStyle = `rgba(${c.line},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(mouse.x, mouse.y);
      ctx.stroke();
    }
  }

  // Glowing dots (softer glow on dark to avoid a washed-out haze)
  const dotAlpha = props.isDark ? 0.75 : 0.9;
  ctx.shadowBlur = props.isDark ? 5 : 8;
  ctx.shadowColor = `rgba(${c.dot},${dotAlpha})`;
  ctx.fillStyle = `rgba(${c.dot},${dotAlpha})`;
  for (const p of particles) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  raf = requestAnimationFrame(draw);
}

function onPointerMove(e: PointerEvent | MouseEvent) {
  const el = canvas.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

function onPointerLeave() {
  mouse.x = -9999;
  mouse.y = -9999;
}

onMounted(() => {
  const el = canvas.value;
  if (!el) return;
  ctx = el.getContext("2d");
  reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  document.addEventListener("pointerleave", onPointerLeave);

  if (reduced) {
    // Draw a single static frame — no animation loop.
    draw();
    cancelAnimationFrame(raf);
  } else {
    raf = requestAnimationFrame(draw);
  }
});

onBeforeUnmount(() => {
  cancelAnimationFrame(raf);
  window.removeEventListener("resize", resize);
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerdown", onPointerMove);
  document.removeEventListener("pointerleave", onPointerLeave);
});
</script>

<style scoped>
.orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(72px);
  opacity: 0.5;
  will-change: transform;
}

/* Dark mode: screen blend keeps the dark areas dark (only the colored cores
   glow). Scoped to the orb elements only — never applied via a `.dark` ancestor
   selector, which would leak onto <html> and veil the whole page. */
.orb-dark {
  opacity: 0.55;
  mix-blend-mode: screen;
}

.orb-1 {
  width: 42vmax;
  height: 42vmax;
  left: -12vmax;
  top: -14vmax;
  background: radial-gradient(circle at 30% 30%, #6366f1, transparent 70%);
  animation: drift-1 26s ease-in-out infinite;
}

.orb-2 {
  width: 38vmax;
  height: 38vmax;
  right: -12vmax;
  top: 10vmax;
  background: radial-gradient(circle at 60% 40%, #a855f7, transparent 70%);
  animation: drift-2 32s ease-in-out infinite;
}

.orb-3 {
  width: 46vmax;
  height: 46vmax;
  left: 20vmax;
  bottom: -20vmax;
  background: radial-gradient(circle at 50% 50%, #0ea5e9, transparent 70%);
  animation: drift-3 30s ease-in-out infinite;
}

@keyframes drift-1 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(8vmax, 6vmax) scale(1.15);
  }
}

@keyframes drift-2 {
  0%,
  100% {
    transform: translate(0, 0) scale(1.05);
  }
  50% {
    transform: translate(-7vmax, 8vmax) scale(0.9);
  }
}

@keyframes drift-3 {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-6vmax, -8vmax) scale(1.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .orb {
    animation: none !important;
  }
}
</style>
