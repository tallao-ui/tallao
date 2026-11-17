<!--
  tallao — FloatingScene
  A decorative 3D backdrop: frosted glass tiles floating at different depths behind the
  content, for a sign-in screen or a hero. The content goes on top, unchanged.

    <FloatingScene tiles={["BEG READ", "GOTO", "IF"]} class="page">
      <form>…</form>
    </FloatingScene>

  - Decorative only: the scene layer is `aria-hidden` and takes no pointer events, so focus,
    clicks and the reading order belong to the content.
  - The layout is computed from `seed` (a small deterministic generator, no Math.random), so
    the server and the browser draw the same tiles in the same places.
  - Depth: each tile sits on one of four layers (`perspective` on the scene, translateZ on the
    tile, smaller and blurrier further back). With `parallax`, moving the pointer over the
    page tilts the layers by different amounts; the motion is one CSS custom property per
    axis, written once per animation frame.
  - `drift` adds a slow float (10–14 s). It is off by default: continuous decorative motion
    distracts, so turn it on only where nothing needs reading next to it.
  - Reduced motion (the system setting or `data-tallao-motion="reduce"`): no parallax and no
    drift, the tiles stay still in their final places.
  - The glass is the tokens: `--ta-accent` and `--ta-accent-2` tint it, `--ta-text` draws its
    edge, so it follows the light and dark themes.
-->
<script lang="ts" module>
  export interface SceneTile {
    /** 0–100: horizontal position, as a percentage of the scene. */
    x: number;
    /** 0–100: vertical position. */
    y: number;
    /** Layer 0 (nearest) to 3 (furthest). */
    layer: number;
    /** Side length in rem. */
    size: number;
    rotateX: number;
    rotateY: number;
    rotateZ: number;
    label?: string;
  }

  /** Mulberry32: a tiny deterministic generator, the same on the server and in the browser. */
  function generator(seed: number) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /** Places `count` tiles around the edges, leaving the middle third mostly free for content. */
  export function layoutScene(count: number, seed: number, labels: string[] = []): SceneTile[] {
    const rand = generator(seed);
    const tiles: SceneTile[] = [];
    for (let i = 0; i < count; i++) {
      // Alternate sides so the tiles frame the content instead of covering it.
      const side = i % 2 === 0 ? 0 : 1;
      const x = side === 0 ? 2 + rand() * 30 : 68 + rand() * 30;
      const y = 4 + ((i / Math.max(1, count - 1)) * 82 + rand() * 10) % 92;
      const layer = Math.floor(rand() * 4);
      tiles.push({
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        layer,
        size: Math.round((6.5 - layer * 1.1 + rand() * 1.5) * 10) / 10,
        rotateX: Math.round(rand() * 40 - 20),
        rotateY: Math.round(rand() * 50 - 25),
        rotateZ: Math.round(rand() * 24 - 12),
        label: labels.length ? labels[i % labels.length] : undefined,
      });
    }
    return tiles;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";

  interface Props {
    /** Short texts drawn on the tiles (a keyword, an icon character). Repeated if there are more tiles. */
    tiles?: string[];
    /** How many tiles (default: the number of `tiles`, or 8). */
    count?: number;
    /** Changes the layout; the same seed always gives the same scene. */
    seed?: number;
    /** Tilt the layers with the pointer. */
    parallax?: boolean;
    /** A slow continuous float. Off by default. */
    drift?: boolean;
    /** A soft light under the scene, in the accent colour. */
    glow?: boolean;
    class?: string;
    /** The content, drawn above the scene. */
    children?: Snippet;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    tiles: labels = [],
    count,
    seed = 7,
    parallax = true,
    drift = false,
    glow = true,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  const layout = $derived(layoutScene(count ?? (labels.length || 8), seed, labels));

  let root = $state<HTMLElement>();
  let still = $state(true);

  $effect(() => {
    still = prefersReducedMotion();
    if (!parallax || still || !root) return;
    const el = root;
    let frame = 0;
    let px = 0;
    let py = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px = ((e.clientX - r.left) / Math.max(1, r.width)) * 2 - 1;
      py = ((e.clientY - r.top) / Math.max(1, r.height)) * 2 - 1;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        el.style.setProperty("--ta-scene-x", px.toFixed(3));
        el.style.setProperty("--ta-scene-y", py.toFixed(3));
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  });
</script>

<div bind:this={root} class={cn("ta-scene", className)} class:ta-scene--drift={drift && !still} {...rest}>
  <div class="ta-scene-stage" aria-hidden="true">
    {#if glow}<div class="ta-scene-glow"></div>{/if}
    {#each layout as t, i (i)}
      <div
        class="ta-scene-tile"
        data-layer={t.layer}
        style:left="{t.x}%"
        style:top="{t.y}%"
        style:--ta-tile-size="{t.size}rem"
        style:--ta-tile-rx="{t.rotateX}deg"
        style:--ta-tile-ry="{t.rotateY}deg"
        style:--ta-tile-rz="{t.rotateZ}deg"
        style:--ta-tile-depth={t.layer}
        style:--ta-tile-delay="{-(i * 1.7)}s"
      >
        {#if t.label}<span class="ta-scene-label">{t.label}</span>{/if}
      </div>
    {/each}
  </div>
  {#if children}<div class="ta-scene-content">{@render children()}</div>{/if}
</div>

<style>
  .ta-scene {
    --ta-scene-x: 0;
    --ta-scene-y: 0;
    position: relative;
    isolation: isolate;
    overflow: hidden;
  }

  .ta-scene-stage {
    position: absolute;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    perspective: 1000px;
    perspective-origin: 50% 40%;
    transform-style: preserve-3d;
  }

  .ta-scene-glow {
    position: absolute;
    inset: auto -10% -35% -10%;
    height: 70%;
    background:
      radial-gradient(ellipse 45% 55% at 30% 60%, rgb(var(--ta-accent) / 0.35), transparent 70%),
      radial-gradient(ellipse 40% 50% at 75% 40%, rgb(var(--ta-accent-2) / 0.22), transparent 70%);
    filter: blur(40px);
  }

  .ta-scene-tile {
    --ta-tile-z: calc(var(--ta-tile-depth) * -140px);
    --ta-tile-shift: calc((4 - var(--ta-tile-depth)) * 7px);
    position: absolute;
    display: grid;
    place-items: center;
    width: var(--ta-tile-size);
    aspect-ratio: 1;
    border-radius: calc(var(--ta-tile-size) * 0.22);
    background: linear-gradient(140deg, rgb(var(--ta-accent) / 0.32), rgb(var(--ta-accent-2) / 0.1) 60%, rgb(var(--ta-text) / 0.04));
    border: 1px solid rgb(var(--ta-text) / 0.18);
    box-shadow:
      inset 0 1px 0 rgb(var(--ta-text) / 0.22),
      0 24px 48px -18px rgb(var(--ta-accent) / 0.55);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    opacity: calc(1 - var(--ta-tile-depth) * 0.16);
    filter: blur(calc(var(--ta-tile-depth) * 0.6px));
    transform:
      translate3d(
        calc(var(--ta-scene-x) * var(--ta-tile-shift) * -1),
        calc(var(--ta-scene-y) * var(--ta-tile-shift) * -1),
        var(--ta-tile-z)
      )
      rotateX(calc(var(--ta-tile-rx) + var(--ta-scene-y) * -6deg))
      rotateY(calc(var(--ta-tile-ry) + var(--ta-scene-x) * 8deg))
      rotateZ(var(--ta-tile-rz));
    transition: transform var(--ta-duration-slow, 240ms) var(--ta-ease-out, ease-out);
  }

  .ta-scene-label {
    font-family: var(--ta-font-mono, ui-monospace, monospace);
    font-size: calc(var(--ta-tile-size) * 0.14);
    font-weight: 600;
    letter-spacing: 0.02em;
    color: rgb(var(--ta-text) / 0.8);
    white-space: nowrap;
    text-shadow: 0 0 12px rgb(var(--ta-accent) / 0.6);
  }

  .ta-scene--drift .ta-scene-tile {
    animation: ta-scene-drift calc(10s + var(--ta-tile-depth) * 1.3s) var(--ta-ease-in-out, ease-in-out) infinite alternate;
    animation-delay: var(--ta-tile-delay);
  }

  @keyframes ta-scene-drift {
    to {
      translate: 0 -14px;
    }
  }

  .ta-scene-content {
    position: relative;
    z-index: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-scene-tile {
      transition: none;
      animation: none !important;
    }
  }
  :global([data-tallao-motion="reduce"]) .ta-scene-tile {
    transition: none;
    animation: none !important;
  }
</style>
