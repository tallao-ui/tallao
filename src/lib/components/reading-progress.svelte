<!--
  tallao — ReadingProgress
  A thin bar that fills as the reader moves down a page or an article. It is decoration: a bar
  tied to the scroll position is not announced (`aria-hidden`), since the scroll bar and the
  reader's own position already say the same.

    <header style="position: sticky; top: 0">
      …
      <ReadingProgress position="absolute" target={article} />
    </header>
    <article bind:this={article}>…</article>

  - Without `target` (`<ReadingProgress />`, at the top of the viewport) it follows the whole
    page with CSS alone (a scroll-driven animation on `scroll(root)`): no JavaScript, nothing to
    hydrate. Browsers without scroll-driven animations do not show it.
  - With `target` it measures only that element, so the bar is full when the end of the article
    reaches the bottom of the viewport, whatever comes after it (comments, a footer). It listens
    to `scroll` and `resize` (passive) and updates once per animation frame.
  - `position="fixed"` (default) sits at the top of the viewport; `position="absolute"` sits on
    the bottom edge of its positioned parent, such as a sticky header.
  - It fills from the start edge: left to right, right to left in a right-to-left page.
  - On the server nothing touches `window`; the measured bar starts empty and fills on hydration.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    /** The element to measure; without it the bar follows the whole page (CSS only). */
    target?: HTMLElement | null;
    /** `fixed`: top of the viewport. `absolute`: bottom edge of the positioned parent (a sticky header). */
    position?: "fixed" | "absolute";
    class?: string;
    /** Any other attribute goes to the root `<div>`. */
    [key: string]: unknown;
  }

  const { target = null, position = "fixed", class: className = "", ...rest }: Props = $props();

  /** 0 to 1: how much of the target has been read. */
  let progress = $state(0);

  const clamp = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

  $effect(() => {
    const el = target;
    if (!el) return;
    let frame = 0;
    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const room = rect.height - window.innerHeight;
      // Shorter than the viewport: read as soon as its top is on screen.
      progress = room <= 0 ? (rect.top <= 0 ? 1 : 0) : clamp(-rect.top / room);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  });
</script>

<div
  {...rest}
  class={cn("ta-reading-progress", `ta-reading-progress--${position}`, target ? "ta-reading-progress--target" : "ta-reading-progress--page", className)}
  aria-hidden="true"
>
  <div class="ta-reading-progress-bar" style:transform={target ? `scaleX(${progress})` : undefined}></div>
</div>

<style>
  .ta-reading-progress {
    inset-inline: 0;
    height: 3px;
    pointer-events: none;
    z-index: 1;
  }
  .ta-reading-progress--fixed {
    position: fixed;
    top: 0;
    z-index: 50;
  }
  .ta-reading-progress--absolute {
    position: absolute;
    bottom: 0;
  }

  .ta-reading-progress-bar {
    height: 100%;
    background: linear-gradient(to right, rgb(var(--ta-accent)), rgb(var(--ta-accent-2)));
    transform: scaleX(0);
    transform-origin: left;
  }
  .ta-reading-progress-bar:dir(rtl) {
    background: linear-gradient(to left, rgb(var(--ta-accent)), rgb(var(--ta-accent-2)));
    transform-origin: right;
  }

  /* The whole page, with CSS alone: only where scroll-driven animations exist. */
  .ta-reading-progress--page {
    display: none;
  }
  @supports (animation-timeline: scroll()) {
    .ta-reading-progress--page {
      display: block;
    }
    .ta-reading-progress--page .ta-reading-progress-bar {
      animation: ta-reading-progress-fill linear both;
    }
    /* `animation-timeline` lives in its own rule, with a more specific selector, on purpose.
       In the same rule as the `animation` shorthand, minifiers (lightningcss) fold both into
       `animation: … scroll(root)`, a shorthand browsers reject whole: the bar never moves. And
       the shorthand resets the timeline to `auto`, so this rule must win by specificity, not
       by order. */
    .ta-reading-progress.ta-reading-progress--page .ta-reading-progress-bar {
      animation-timeline: scroll(root);
    }
  }

  @keyframes ta-reading-progress-fill {
    from { transform: scaleX(0); }
    to { transform: scaleX(1); }
  }

  /* No prefers-reduced-motion rule: the bar moves only while the reader scrolls, by as much as the
     page itself moves, and never on its own. */
</style>
