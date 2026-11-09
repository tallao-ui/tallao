<!--
  tallao — Carousel
  A row of cards that scrolls horizontally with scroll-snap (games, streamers,
  news). Follows the WAI-ARIA APG "carousel" pattern:
  - the region has aria-roledescription "carousel" and a name (`label`); each slide is
    a group with aria-roledescription "slide" and "3 of 8" as its name;
  - Previous / Next scroll by one card and are disabled at the ends (if the
    focused button is disabled, focus moves to the other one);
  - with focus inside, ← and → move between cards, Home and End go to the ends;
  - `autoplay` advances every `interval` ms and returns to the start at the end. It pauses
    on hover, with focus inside or when the tab is hidden, does not start if the viewer
    asked for reduced motion, and a button stops and resumes it (WCAG 2.2.2).
  Slides come from `items` + the `slide` snippet (like DataTable rows).
  Touch and the wheel scroll the track like any scroll: there is no custom dragging.
-->
<script lang="ts" generics="T">
  import type { Snippet } from "svelte";
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import Icon from "./icon.svelte";

  const L = useLabels();
  let {
    items,
    slide,
    key,
    label = L.carousel,
    slideLabel = (n: number, total: number) => L.slideOf.replace("{n}", String(n)).replace("{total}", String(total)),
    slideWidth = "260px",
    gap = "1rem",
    autoplay = false,
    interval = 5000,
    rotationControl = true,
    previousLabel = L.previous,
    nextLabel = L.next,
    class: className = "",
    slideClass = "",
    empty,
  }: {
    items: T[];
    /** Content of each slide. */
    slide: Snippet<[T, number]>;
    /** Stable key of each item (defaults to its position). */
    key?: (item: T, index: number) => string | number;
    /** Name of the region (the screen reader hears it). */
    label?: string;
    /** Name of each slide ("3 of 8"). */
    slideLabel?: (n: number, total: number) => string;
    /** Width of each card (any CSS length; "100%" = one per view). */
    slideWidth?: string;
    /** Gap between cards. */
    gap?: string;
    autoplay?: boolean;
    /** Milliseconds between automatic steps. */
    interval?: number;
    /** With `autoplay`, the button that stops and resumes it. */
    rotationControl?: boolean;
    previousLabel?: string;
    nextLabel?: string;
    class?: string;
    /** Classes of each slide. */
    slideClass?: string;
    /** What shows when there are no items. */
    empty?: Snippet;
  } = $props();

  const id = $props.id();
  let root: HTMLElement | undefined = $state();
  let track: HTMLElement | undefined = $state();
  let prevButton: HTMLButtonElement | undefined = $state();
  let nextButton: HTMLButtonElement | undefined = $state();

  // Before measuring (on the server) we assume there is more to the right.
  let atStart = $state(true);
  let atEnd = $state(false);
  const total = $derived(items.length);

  let reducedMotion = $state(false);
  let hovered = $state(false);
  let focusWithin = $state(false);
  let pageHidden = $state(false);
  let stopped = $state(false);
  const canRotate = $derived(autoplay && !reducedMotion && total > 1);
  const rotating = $derived(canRotate && !stopped && !hovered && !focusWithin && !pageHidden);

  function measure() {
    if (!track) return;
    const left = Math.abs(track.scrollLeft);
    const start = left <= 1;
    const end = left + track.clientWidth >= track.scrollWidth - 1;
    // The button about to be disabled cannot keep focus: it moves to the other one.
    const active = document.activeElement;
    if (end && !start && active === nextButton) prevButton?.focus({ preventScroll: true });
    else if (start && !end && active === prevButton) nextButton?.focus({ preventScroll: true });
    atStart = start;
    atEnd = end;
  }

  const scrollBehavior = (): ScrollBehavior => (reducedMotion ? "auto" : "smooth");

  /** One card plus the gap. */
  function step() {
    if (!track) return 0;
    const first = track.querySelector<HTMLElement>(".ta-carousel-slide");
    const gapPx = parseFloat(getComputedStyle(track).columnGap) || 0;
    return (first?.offsetWidth || track.clientWidth) + gapPx;
  }

  function scrollTrack(options: { left: number; relative: boolean }) {
    if (!track) return;
    const target = { left: options.left, behavior: scrollBehavior() };
    if (options.relative) {
      if (typeof track.scrollBy === "function") track.scrollBy(target);
      else track.scrollLeft += options.left;
    } else if (typeof track.scrollTo === "function") track.scrollTo(target);
    else track.scrollLeft = options.left;
  }

  const move = (dir: 1 | -1) => scrollTrack({ left: dir * step(), relative: true });
  const toStart = () => scrollTrack({ left: 0, relative: false });
  const toEnd = () => scrollTrack({ left: track?.scrollWidth ?? 0, relative: false });

  function advance() {
    if (atEnd) toStart();
    else move(1);
  }

  function onKey(e: KeyboardEvent) {
    // A control inside (a slider, a field) already used the key.
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest("input, textarea, select, [contenteditable]:not([contenteditable='false'])")) return;
    if (e.key === "ArrowLeft") move(-1);
    else if (e.key === "ArrowRight") move(1);
    else if (e.key === "Home") toStart();
    else if (e.key === "End") toEnd();
    else return;
    e.preventDefault();
  }

  function onFocusOut(e: FocusEvent) {
    if (!root?.contains(e.relatedTarget as Node | null)) focusWithin = false;
  }

  // Measure on mount, on resize and when the slides change.
  $effect(() => {
    void items.length;
    if (!track) return;
    untrack(measure);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(track);
    return () => ro.disconnect();
  });

  $effect(() => {
    const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (!mq) return;
    reducedMotion = mq.matches;
    const onChange = (e: MediaQueryListEvent) => (reducedMotion = e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  });

  $effect(() => {
    const update = () => (pageHidden = document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  });

  $effect(() => {
    if (!rotating) return;
    const t = setInterval(advance, interval);
    return () => clearInterval(t);
  });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
  bind:this={root}
  class={cn("ta-carousel", className)}
  aria-roledescription={L.carouselRole}
  aria-label={label}
  style:--ta-carousel-slide={slideWidth}
  style:--ta-carousel-gap={gap}
  onkeydown={onKey}
  onpointerenter={(e) => {
    if (e.pointerType !== "touch") hovered = true;
  }}
  onpointerleave={() => (hovered = false)}
  onfocusin={() => (focusWithin = true)}
  onfocusout={onFocusOut}
>
  {#if total === 0}
    {#if empty}<div class="ta-carousel-empty">{@render empty()}</div>{/if}
  {:else}
    {#if canRotate && rotationControl}
      <button
        type="button"
        class="ta-carousel-button ta-carousel-rotation"
        aria-label={stopped ? L.startRotation : L.stopRotation}
        aria-controls={`${id}-track`}
        onclick={() => (stopped = !stopped)}
      >
        <Icon size={14}>
          {#if stopped}<path d="M8 5.5l11 6.5-11 6.5z" />{:else}<path d="M9 5.5v13M15 5.5v13" />{/if}
        </Icon>
      </button>
    {/if}
    <button
      bind:this={prevButton}
      type="button"
      class="ta-carousel-button ta-carousel-prev"
      aria-label={previousLabel}
      aria-controls={`${id}-track`}
      disabled={atStart}
      onclick={() => move(-1)}
    ><Icon name="chevron-left" size={18} /></button>
    <button
      bind:this={nextButton}
      type="button"
      class="ta-carousel-button ta-carousel-next"
      aria-label={nextLabel}
      aria-controls={`${id}-track`}
      disabled={atEnd || total < 2}
      onclick={() => move(1)}
    ><Icon name="chevron-right" size={18} /></button>
    <div bind:this={track} id={`${id}-track`} class="ta-carousel-track" onscroll={measure}>
      {#each items as item, i (key ? key(item, i) : i)}
        <div
          class={cn("ta-carousel-slide", slideClass)}
          role="group"
          aria-roledescription={L.slideRole}
          aria-label={slideLabel(i + 1, total)}
        >
          {@render slide(item, i)}
        </div>
      {/each}
    </div>
  {/if}
</section>

<style>
  .ta-carousel { position: relative; width: 100%; min-width: 0; }

  .ta-carousel-track {
    display: flex;
    gap: var(--ta-carousel-gap, 1rem);
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    padding: 0.5rem 0;
    -webkit-overflow-scrolling: touch;
  }
  .ta-carousel-track::-webkit-scrollbar { display: none; }
  @media (prefers-reduced-motion: no-preference) {
    .ta-carousel-track { scroll-behavior: smooth; }
  }

  .ta-carousel-slide {
    flex: 0 0 min(var(--ta-carousel-slide, 260px), 100%);
    min-width: 0;
    scroll-snap-align: start;
  }

  /* The buttons sit on top of the track, at the edges (`--ta-carousel-nav-offset` moves them). */
  .ta-carousel-button {
    position: absolute;
    top: 50%;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface) / 0.85);
    border: 1px solid rgb(var(--ta-border));
    border-radius: 999px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.3);
    backdrop-filter: blur(8px);
    cursor: pointer;
    transform: translateY(-50%);
    transition: background-color 0.15s, border-color 0.15s, opacity 0.15s;
  }
  .ta-carousel-prev { left: var(--ta-carousel-nav-offset, 0.5rem); }
  .ta-carousel-next { right: var(--ta-carousel-nav-offset, 0.5rem); }
  .ta-carousel-rotation { top: 1rem; right: var(--ta-carousel-nav-offset, 0.5rem); width: 1.75rem; height: 1.75rem; transform: none; }
  .ta-carousel-button:hover:not(:disabled) { background: rgb(var(--ta-elevated)); border-color: rgb(var(--ta-muted)); }
  .ta-carousel-button:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-carousel-button:disabled { opacity: 0.35; cursor: not-allowed; }

  .ta-carousel-empty { padding: 2rem 1rem; text-align: center; font-size: 0.875rem; color: rgb(var(--ta-text-dim)); }

  /* On touch screens: 44px for the finger. */
  @media (pointer: coarse) {
    .ta-carousel-button { width: 2.75rem; height: 2.75rem; }
    .ta-carousel-rotation { width: 2.75rem; height: 2.75rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ta-carousel-button { transition: none; }
  }
</style>
