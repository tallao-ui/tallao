<!--
  tallao — CompareSlider
  Two images stacked (before / after) with a draggable divider. The whole box
  is the control: role="slider" with the value as a percentage (0 = all "after",
  100 = all "before"), arrows in steps of `step`, PageUp/PageDown by 10, Home and End.
  - Dragging captures the pointer on the box, not on what was pressed: the target is often
    the handle icon (no pointer events) and Chrome released the capture on the first step.
  - The images are not draggable (`draggable="false"` and `dragstart` cancelled): a native
    drag of the image ended with `pointercancel` and killed the capture after one step.
    `pointercancel` and losing the capture end the drag.
  - `oninput` on every step; `onchange` on release and with each key (the final value).
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();
  let {
    value = $bindable(50),
    beforeSrc,
    afterSrc,
    beforeLabel = L.before,
    afterLabel = L.after,
    beforeAlt,
    afterAlt,
    showLabels = true,
    label = L.compareSlider,
    valueText,
    step = 2,
    aspectRatio = "16 / 9",
    loading = "lazy",
    class: className = "",
    oninput,
    onchange,
  }: {
    /** Divider position, 0–100 (how much of the "before" image shows). */
    value?: number;
    beforeSrc: string;
    afterSrc: string;
    /** Labels over each image (also their alt text when there is no `*Alt`). */
    beforeLabel?: string;
    afterLabel?: string;
    beforeAlt?: string;
    afterAlt?: string;
    showLabels?: boolean;
    /** Accessible name of the control. */
    label?: string;
    /** How the value is read out (aria-valuetext). */
    valueText?: (value: number) => string;
    /** How far each arrow moves it. */
    step?: number;
    /** Box proportions (CSS aspect-ratio). */
    aspectRatio?: string;
    loading?: "lazy" | "eager";
    class?: string;
    oninput?: (value: number) => void;
    onchange?: (value: number) => void;
  } = $props();

  let box: HTMLElement | undefined = $state();
  let dragging = $state(false);
  const pos = $derived(Math.min(100, Math.max(0, Number.isFinite(value) ? value : 50)));

  function setValue(v: number) {
    const n = Math.round(Math.min(100, Math.max(0, v)) * 10) / 10;
    if (n === value) return false;
    value = n;
    oninput?.(n);
    return true;
  }

  function fromClientX(clientX: number) {
    if (!box) return;
    const r = box.getBoundingClientRect();
    if (r.width > 0) setValue(((clientX - r.left) / r.width) * 100);
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) return;
    dragging = true;
    box?.setPointerCapture?.(e.pointerId);
    fromClientX(e.clientX);
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging) fromClientX(e.clientX);
  }

  function endDrag(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    if (box?.hasPointerCapture?.(e.pointerId)) box.releasePointerCapture(e.pointerId);
    onchange?.(value);
  }

  function onKey(e: KeyboardEvent) {
    let n: number;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") n = pos - step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") n = pos + step;
    else if (e.key === "PageDown") n = pos - 10;
    else if (e.key === "PageUp") n = pos + 10;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = 100;
    else return;
    e.preventDefault();
    if (setValue(n)) onchange?.(value);
  }
</script>

<div
  bind:this={box}
  class={cn("ta-compare", dragging && "ta-compare--dragging", className)}
  style:aspect-ratio={aspectRatio}
  style:--ta-compare-pos={`${pos}%`}
  role="slider"
  tabindex="0"
  aria-label={label}
  aria-valuenow={Math.round(pos)}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-valuetext={valueText ? valueText(pos) : undefined}
  aria-orientation="horizontal"
  onkeydown={onKey}
  onpointerdown={onPointerDown}
  onpointermove={onPointerMove}
  onpointerup={endDrag}
  onpointercancel={endDrag}
  onlostpointercapture={endDrag}
  ondragstart={(e) => e.preventDefault()}
>
  <div class="ta-compare-layer">
    <img src={afterSrc} alt={afterAlt ?? afterLabel} {loading} draggable="false" />
    {#if showLabels && afterLabel}<span class="ta-compare-label ta-compare-label--after">{afterLabel}</span>{/if}
  </div>
  <div class="ta-compare-layer ta-compare-layer--before">
    <img src={beforeSrc} alt={beforeAlt ?? beforeLabel} {loading} draggable="false" />
    {#if showLabels && beforeLabel}<span class="ta-compare-label ta-compare-label--before">{beforeLabel}</span>{/if}
  </div>
  <div class="ta-compare-divider" aria-hidden="true">
    <span class="ta-compare-handle">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M7 4L3 10L7 16M13 4L17 10L13 16" />
      </svg>
    </span>
  </div>
</div>

<style>
  .ta-compare {
    position: relative;
    width: 100%;
    overflow: hidden;
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    cursor: ew-resize;
    user-select: none;
    -webkit-user-select: none;
    touch-action: pan-y; /* horizontal dragging is ours; vertically, the page scrolls */
    outline: none;
  }
  .ta-compare:focus-visible { box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.6); }

  .ta-compare-layer { position: absolute; inset: 0; }
  .ta-compare-layer--before { clip-path: inset(0 calc(100% - var(--ta-compare-pos)) 0 0); }
  .ta-compare-layer img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    pointer-events: none;
    -webkit-user-drag: none;
  }

  .ta-compare-label {
    position: absolute;
    bottom: 0.75rem;
    padding: 0.25rem 0.625rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface) / 0.8);
    border: 1px solid rgb(var(--ta-border));
    border-radius: 999px;
    backdrop-filter: blur(8px);
    pointer-events: none;
  }
  .ta-compare-label--before { left: 0.75rem; }
  .ta-compare-label--after { right: 0.75rem; }

  .ta-compare-divider {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--ta-compare-pos);
    z-index: 1;
    width: 2px;
    background: rgb(255 255 255 / 0.85);
    box-shadow: 0 0 8px rgb(0 0 0 / 0.4);
    transform: translateX(-50%);
    pointer-events: none;
  }
  .ta-compare-handle {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    color: rgb(255 255 255);
    background: rgb(0 0 0 / 0.65);
    border: 2px solid rgb(255 255 255 / 0.7);
    border-radius: 50%;
    box-shadow: 0 2px 12px rgb(0 0 0 / 0.5);
    backdrop-filter: blur(8px);
    transform: translate(-50%, -50%);
    transition: border-color 0.15s, transform 0.15s;
  }
  .ta-compare:hover .ta-compare-handle,
  .ta-compare:focus-visible .ta-compare-handle {
    border-color: rgb(var(--ta-accent));
    transform: translate(-50%, -50%) scale(1.08);
  }

  /* On touch screens: a 44px handle for the finger. */
  @media (pointer: coarse) {
    .ta-compare-handle { width: 2.75rem; height: 2.75rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ta-compare-handle { transition: none; }
    .ta-compare:hover .ta-compare-handle,
    .ta-compare:focus-visible .ta-compare-handle { transform: translate(-50%, -50%); }
  }
</style>
