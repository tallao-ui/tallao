<!--
  tallao — GlassPanel
  A pane of liquid glass over whatever is behind it (an image, a 3D scene, a gradient): a tinted,
  saturated blur, a light inner edge, and a specular rim whose brightest point follows the pointer.
  With `liquid`, Chromium also bends what is behind through an SVG displacement; other browsers keep
  the frosted glass (an unsupported backdrop-filter value is dropped and the class's one stays).

    <GlassPanel class="chip">Agente IA</GlassPanel>
    <GlassPanel as="section" liquid tint="rgb(13 14 29 / 0.55)" aria-labelledby="t">…</GlassPanel>

  - Purely presentational: it adds no role. Give it `as`, ARIA and the rest like any element.
  - The rim follows the pointer anywhere on the page (one passive listener, at most once a frame);
    `follow={false}` leaves it at the top left.
  - Tokens: `--ta-glass-tint` (the colour over the blur; `tint` sets it), `--ta-glass-blur`.
  - Needs something behind it to look like glass: on a flat background it reads as a tinted card.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { cn } from "$lib/utils";

  interface Props {
    /** The element to render (div, section, li, aside…). */
    as?: string;
    /** Bends what is behind through an SVG displacement (Chromium; elsewhere frosted glass). */
    liquid?: boolean;
    /** How far the liquid displacement bends, in pixels. */
    strength?: number;
    /** The rim's highlight follows the pointer. */
    follow?: boolean;
    /** Any CSS colour laid over the blur (sets --ta-glass-tint). */
    tint?: string;
    class?: string;
    children?: Snippet;
    /** Any other attribute goes to the element. */
    [key: string]: unknown;
  }

  let { as = "div", liquid = false, strength = 24, follow = true, tint, class: className = "", children, ...rest }: Props = $props();

  const uid = $props.id();
  const filterId = `${uid}-liquid`;
  let el = $state<HTMLElement>();

  $effect(() => {
    if (!follow || !el) return;
    const node = el;
    let frame = 0;
    let x = 0;
    let y = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = node.getBoundingClientRect();
        if (!r.width || !r.height) return;
        node.style.setProperty("--mx", `${((x - r.left) / r.width) * 100}%`);
        node.style.setProperty("--my", `${((y - r.top) / r.height) * 100}%`);
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      if (frame) cancelAnimationFrame(frame);
    };
  });
</script>

<svelte:element
  this={as}
  bind:this={el}
  {...rest}
  class={cn("ta-glass", liquid && "ta-glass--liquid", className)}
  style:--ta-glass-tint={tint}
  style:backdrop-filter={liquid ? `url(#${filterId}) blur(5px) saturate(1.7) brightness(1.06)` : undefined}
>
  {#if liquid}
    <svg class="ta-glass-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.01" numOctaves="2" seed="11" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="2.5" result="soft" />
        <feDisplacementMap in="SourceGraphic" in2="soft" scale={strength} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  {/if}
  {@render children?.()}
</svelte:element>

<style>
  .ta-glass {
    position: relative;
    background:
      radial-gradient(120% 90% at var(--mx, 30%) var(--my, 0%), rgb(255 255 255 / 0.13), transparent 55%),
      linear-gradient(var(--ta-glass-tint, rgb(var(--ta-surface) / 0.4)), var(--ta-glass-tint, rgb(var(--ta-surface) / 0.4)));
    border: 1px solid rgb(255 255 255 / 0.08);
    border-radius: var(--ta-radius-lg);
    -webkit-backdrop-filter: blur(var(--ta-glass-blur, 14px)) saturate(1.7) brightness(1.06);
    backdrop-filter: blur(var(--ta-glass-blur, 14px)) saturate(1.7) brightness(1.06);
    box-shadow:
      inset 0 1px 0 rgb(255 255 255 / 0.3),
      inset 0 -1px 0 rgb(255 255 255 / 0.05),
      inset 0 0 24px rgb(255 255 255 / 0.04),
      0 18px 50px -20px rgb(0 0 0 / 0.6);
  }

  /* The specular rim: a 1px gradient border, brightest where the pointer is. */
  .ta-glass::before {
    content: "";
    position: absolute;
    inset: -1px;
    padding: 1px;
    border-radius: inherit;
    background: radial-gradient(70% 110% at var(--mx, 25%) var(--my, 0%), rgb(255 255 255 / 0.85), rgb(255 255 255 / 0.12) 45%, rgb(255 255 255 / 0.04) 70%, rgb(255 255 255 / 0.28));
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  .ta-glass-defs {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
  }

  /* Without a blur to show through, a solid surface keeps text readable. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .ta-glass {
      background: rgb(var(--ta-surface));
    }
  }
</style>
