<!--
  tallao — RollingCounter
  A number whose digits roll, each on its own wheel, to the new value: a live count of
  players, a score, a price.

    <RollingCounter value={online} label="Players online" />
    <RollingCounter value={1249.5} format={{ style: "currency", currency: "EUR" }} locale="es" />

  - Each digit is a column of 0–9 moved with a transform; when `value` changes only the
    wheels that change turn, the ones on the right a touch later. Separators, signs and
    units from the number format stay still. Digits keep their place from the right, so
    going from 999 to 1,000 adds a wheel on the left instead of reshuffling.
  - The server renders the final value (each wheel already at its digit): no script is
    needed to read it, and there is no count-up on load.
  - Screen readers get the formatted number as plain text (the wheels are `aria-hidden`); it
    is not a live region: wrap it in one yourself if every change should be announced.
  - Tabular figures, so the width does not jitter. Reduced motion: the wheels jump.
  (BigNumber counts up once when it scrolls into view; this one follows a value that keeps
  changing.)
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    value: number;
    /** What the number is, read before it ("Players online"). */
    label?: string;
    locale?: string;
    /** Options for `Intl.NumberFormat` (grouping, decimals, currency…). */
    format?: Intl.NumberFormatOptions;
    size?: "sm" | "md" | "lg";
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const { value, label, locale, format = { maximumFractionDigits: 0 }, size = "md", class: className = "", ...rest }: Props = $props();

  const text = $derived(new Intl.NumberFormat(locale, format).format(Number.isFinite(value) ? value : 0));
  // Keyed from the right: the units wheel is always the same element.
  const cells = $derived([...text].map((char, i, all) => ({ char, key: all.length - i, digit: /\d/.test(char) ? Number(char) : null })));
  const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
</script>

<span {...rest} class={cn("ta-roll", `ta-roll--${size}`, className)}>
  <span class="ta-roll-text">{label ? label + ": " : ""}{text}</span>
  <span class="ta-roll-wheels" aria-hidden="true">
    {#each cells as cell (cell.key)}
      {#if cell.digit === null}
        <span class="ta-roll-static">{cell.char}</span>
      {:else}
        <span class="ta-roll-digit">
          <span class="ta-roll-strip" style:transform={`translateY(${-cell.digit * 10}%)`} style:transition-delay={`${Math.min(cell.key - 1, 6) * 25}ms`}>
            {#each DIGITS as d (d)}<span>{d}</span>{/each}
          </span>
        </span>
      {/if}
    {/each}
  </span>
</span>

<style>
  .ta-roll {
    position: relative;
    display: inline-flex;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1.1;
    color: rgb(var(--ta-text));
  }
  .ta-roll--sm { font-size: 1rem; }
  .ta-roll--md { font-size: 1.75rem; letter-spacing: -0.01em; }
  .ta-roll--lg { font-size: 3rem; letter-spacing: -0.02em; }

  .ta-roll-wheels { display: inline-flex; }
  .ta-roll-digit { display: inline-block; height: 1.1em; overflow: hidden; }
  .ta-roll-strip {
    display: flex;
    flex-direction: column;
    transition: transform calc(var(--ta-duration-slow, 240ms) * 2.5) var(--ta-ease-spring, cubic-bezier(0.16, 1, 0.3, 1));
    will-change: transform;
  }
  .ta-roll-strip > span { display: block; height: 1.1em; text-align: center; }
  .ta-roll-static { display: inline-block; height: 1.1em; }

  .ta-roll-text {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-roll-strip { transition: none; }
  }
</style>
