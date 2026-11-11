<!--
  tallao — CardStack
  A deck of cards looked at one by one: the top card is flicked away (or sent back) to show
  the next, with the following ones peeking behind it. For a hand of game cards, a queue of
  suggestions to accept or skip, an onboarding.

    <CardStack items={cards} bind:index label="Featured decks">
      {#snippet card(deck)}<DeckCard {deck} />{/snippet}
    </CardStack>

  - Pointer: drag the top card sideways and let go past a quarter of its width (or flick it)
    to go to the next one; it follows the finger, tilts a little and flies off. Vertical
    scrolling of the page is untouched (`touch-action: pan-y`).
  - Keyboard: Previous and Next buttons (disabled at the ends unless `loop`), and ← → Home End
    anywhere inside the stack. Buttons and keys do the same as a flick. When a button
    disables itself at an end, the focus moves to the other one.
  - It is a group named `label`; the position ("2 of 5") is visible text in a polite live
    region, so each change is announced. Only the top card is exposed: the ones behind are
    `inert` and hidden from screen readers until their turn.
  - `index` is bindable; `onchange` gets the new index. The stack is as tall as the tallest
    card it is drawing. Without JavaScript it shows the first card; the buttons need it.
  - Reduced motion: the card changes at once, with no flight and no tilt.
-->
<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  import { tick } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { getActiveElement } from "$lib/internal/focus";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  interface Props {
    items: T[];
    /** Position of the top card (bindable). */
    index?: number;
    /** After the last card comes the first. */
    loop?: boolean;
    /** How many cards show behind the top one. */
    peek?: number;
    /** Accessible name of the stack. */
    label?: string;
    previousLabel?: string;
    nextLabel?: string;
    class?: string;
    onchange?: (index: number) => void;
    /** Draws one card; gets the item and its index. */
    card: Snippet<[T, number]>;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const L = useLabels();
  let {
    items,
    index = $bindable(0),
    loop = false,
    peek = 2,
    label = L.cards,
    previousLabel = L.previous,
    nextLabel = L.next,
    class: className = "",
    onchange,
    card,
    ...rest
  }: Props = $props();

  const count = $derived(items.length);
  const current = $derived(count ? Math.min(Math.max(0, index), count - 1) : 0);
  const canPrevious = $derived(count > 1 && (loop || current > 0));
  const canNext = $derived(count > 1 && (loop || current < count - 1));
  // The cards drawn: the top one and the next `peek`, from back to front.
  const layers = $derived(
    Array.from({ length: Math.min(peek + 1, count) }, (_, depth) => {
      const i = current + depth;
      return i < count ? { i, depth } : loop ? { i: i % count, depth } : null;
    })
      .filter((layer): layer is { i: number; depth: number } => layer !== null)
      .reverse()
  );

  let root: HTMLElement | undefined = $state();
  let drag = $state(0);
  let dragging = $state(false);
  let flying = $state<-1 | 0 | 1>(0);
  let startX = 0;
  let startTime = 0;
  let width = 1;

  function go(next: number) {
    const target = loop ? (next + count) % count : Math.min(Math.max(0, next), count - 1);
    if (target === current) return;
    index = target;
    onchange?.(target);
    // At an end the button just pressed is disabled: the focus moves to the other one, so the
    // keys keep working instead of the focus falling out of the stack.
    tick().then(() => {
      const focused = getActiveElement();
      if (focused instanceof HTMLButtonElement && focused.disabled && root?.contains(focused)) {
        root.querySelector<HTMLElement>(".ta-cardstack-button:not(:disabled)")?.focus();
      }
    });
  }

  /** Sends the top card away in a direction, then shows the next. */
  function advance(direction: -1 | 1) {
    if (!canNext || flying) return;
    if (prefersReducedMotion()) {
      go(current + 1);
      return;
    }
    flying = direction;
    setTimeout(() => {
      flying = 0;
      drag = 0;
      go(current + 1);
    }, 180);
  }

  function onpointerdown(event: PointerEvent) {
    if (flying || !canNext || (event.target as HTMLElement).closest("a, button, input, select, textarea")) return;
    dragging = true;
    startX = event.clientX;
    startTime = event.timeStamp;
    width = (event.currentTarget as HTMLElement).offsetWidth || 1;
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
  }
  function onpointermove(event: PointerEvent) {
    if (dragging) drag = event.clientX - startX;
  }
  function onpointerup(event: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    const speed = Math.abs(drag) / Math.max(1, event.timeStamp - startTime);
    if (Math.abs(drag) > width / 4 || (Math.abs(drag) > 24 && speed > 0.5)) advance(drag < 0 ? -1 : 1);
    else drag = 0;
  }

  function onkeydown(event: KeyboardEvent) {
    if ((event.target as HTMLElement).closest("input, select, textarea, [contenteditable='true']")) return;
    if (event.key === "ArrowRight") advance(1);
    else if (event.key === "ArrowLeft") go(current - 1);
    else if (event.key === "Home") go(0);
    else if (event.key === "End") go(count - 1);
    else return;
    event.preventDefault();
  }

  const topStyle = $derived(
    flying
      ? `transform: translateX(${flying * 130}%) rotate(${flying * 14}deg); opacity: 0;`
      : drag
        ? `transform: translateX(${drag}px) rotate(${(drag / width) * 10}deg);`
        : ""
  );
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div {...rest} bind:this={root} class={cn("ta-cardstack", className)} role="group" aria-label={label} {onkeydown}>
  <div class="ta-cardstack-deck">
    {#each layers as layer (layer.i)}
      {@const top = layer.depth === 0}
      <div
        class={cn("ta-cardstack-card", top && "ta-cardstack-card--top", top && dragging && "ta-cardstack-card--dragging")}
        style={top ? topStyle : undefined}
        style:--ta-cardstack-depth={layer.depth}
        inert={!top}
        aria-hidden={top ? undefined : "true"}
        onpointerdown={top ? onpointerdown : undefined}
        onpointermove={top ? onpointermove : undefined}
        onpointerup={top ? onpointerup : undefined}
        onpointercancel={top ? onpointerup : undefined}
      >
        {@render card(items[layer.i], layer.i)}
      </div>
    {/each}
  </div>
  <div class="ta-cardstack-bar">
    <button type="button" class="ta-cardstack-button" aria-label={previousLabel} disabled={!canPrevious} onclick={() => go(current - 1)}>
      <Icon name="chevron-left" size={16} />
    </button>
    <span class="ta-cardstack-position" aria-live="polite">{count ? L.slideOf.replace("{n}", String(current + 1)).replace("{total}", String(count)) : ""}</span>
    <button type="button" class="ta-cardstack-button" aria-label={nextLabel} disabled={!canNext} onclick={() => advance(1)}>
      <Icon name="chevron-right" size={16} />
    </button>
  </div>
</div>

<style>
  .ta-cardstack { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; min-width: 0; }

  /* Every card in the same grid cell: the deck is as tall as its tallest card. */
  .ta-cardstack-deck { display: grid; width: 100%; padding-bottom: 1rem; }
  /* Each layer has an opaque plate in the page colour (`--ta-cardstack-bg` to change it), so a
     card with a translucent background does not show the next one's text through it. */
  .ta-cardstack-card {
    grid-area: 1 / 1;
    min-width: 0;
    background: var(--ta-cardstack-bg, rgb(var(--ta-bg)));
    border-radius: var(--ta-radius-lg);
    transform-origin: 50% 100%;
    transform: translateY(calc(var(--ta-cardstack-depth, 0) * 0.5rem)) scale(calc(1 - var(--ta-cardstack-depth, 0) * 0.04));
    opacity: calc(1 - var(--ta-cardstack-depth, 0) * 0.25);
    transition:
      transform var(--ta-duration-base, 180ms) var(--ta-ease-out, ease-out),
      opacity var(--ta-duration-base, 180ms) ease-out;
  }
  .ta-cardstack-card--top { position: relative; z-index: 1; cursor: grab; touch-action: pan-y; user-select: none; }
  .ta-cardstack-card--dragging { cursor: grabbing; transition: none; }

  .ta-cardstack-bar { display: flex; align-items: center; gap: 0.75rem; }
  .ta-cardstack-position { min-width: 3.5rem; font-size: 0.8125rem; text-align: center; font-variant-numeric: tabular-nums; color: rgb(var(--ta-text-dim)); }
  .ta-cardstack-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: 50%;
    cursor: pointer;
    transition: background-color var(--ta-duration-fast, 120ms);
  }
  .ta-cardstack-button:hover:not(:disabled) { background: rgb(var(--ta-elevated)); }
  .ta-cardstack-button:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-cardstack-button:disabled { opacity: 0.4; cursor: not-allowed; }

  @media (pointer: coarse) {
    .ta-cardstack-button { width: 2.75rem; height: 2.75rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-cardstack-card { transition: none; }
  }
</style>
