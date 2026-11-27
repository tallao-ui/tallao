<!--
  tallao — StatusTile
  One thing being watched (a service, a queue, a database) and its verdict, for a wall of
  health tiles: an icon, the name, the verdict in words and an optional figure ("1 ms",
  "3 / 20").
  - Four verdicts: `ok`, `warn`, `down`, `unknown`. Each one differs by a glyph (check, warning
    triangle, cross, dash) and by its word, not only by colour; the word comes from the labels
    (`statusOk`…) and `statusLabel` replaces it.
  - With `href` the whole tile is one link, named by its text (label, verdict, figure); without
    it, a plain block. Nothing else to operate, so it renders the same on the server.
  - `icon` is a snippet for the thing's own drawing (an `<Icon>` or any SVG); without it the
    verdict's glyph is the only image.
  - `span` is the number of columns it takes inside a DashboardGrid.
  Plain JSON: `{ "label": "Database", "status": "ok", "value": "1 ms" }`.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();

  type Status = "ok" | "warn" | "down" | "unknown";

  interface Props {
    /** What is being watched ("Database", "Job queue"). */
    label: string;
    status: Status;
    /** A figure next to the verdict ("1 ms", "3 / 20", 0). */
    value?: string | number;
    /** One line under it ("Nothing waiting"). */
    description?: string;
    /** Replaces the verdict's word ("Running", "Paused"). */
    statusLabel?: string;
    /** Makes the whole tile a link to the detail. */
    href?: string;
    /** The thing's own icon. */
    icon?: Snippet;
    /** Columns it takes inside a DashboardGrid (`"full"`: the whole row). */
    span?: 1 | 2 | 3 | 4 | "full";
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    label,
    status,
    value,
    description,
    statusLabel,
    href,
    icon,
    span,
    class: className = "",
    ...rest
  }: Props = $props();

  const GLYPH = { ok: "check", warn: "alert", down: "x", unknown: "minus" } as const;
  const word = $derived(
    statusLabel ??
      { ok: L.statusOk, warn: L.statusWarn, down: L.statusDown, unknown: L.statusUnknown }[status]
  );
</script>

<svelte:element
  this={href ? "a" : "div"}
  {...rest}
  {href}
  class={cn("ta-status-tile", `ta-status-tile--${status}`, className)}
  data-ta-span={span}
  data-status={status}
>
  {#if icon}
    <span class="ta-status-tile-icon" aria-hidden="true">{@render icon()}</span>
  {/if}
  <span class="ta-status-tile-label">{label}</span>
  <span class="ta-status-tile-verdict">
    <span class="ta-status-tile-glyph"><Icon name={GLYPH[status]} size={16} /></span>
    <span class="ta-status-tile-word">{word}</span>
    {#if value !== undefined && value !== ""}
      <span class="ta-status-tile-value">{value}</span>
    {/if}
  </span>
  {#if description}
    <span class="ta-status-tile-description">{description}</span>
  {/if}
</svelte:element>

<style>
  .ta-status-tile {
    --ta-status-tone: var(--ta-text-dim);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
    padding: 1rem;
    color: rgb(var(--ta-text));
    text-decoration: none;
    background: rgb(var(--ta-surface) / 0.5);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    transition:
      border-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out),
      background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-status-tile--ok { --ta-status-tone: var(--ta-success); }
  .ta-status-tile--warn { --ta-status-tone: var(--ta-warning); }
  .ta-status-tile--down { --ta-status-tone: var(--ta-danger); }

  /* A problem is seen from across the room: the border takes the verdict's colour. */
  .ta-status-tile--warn,
  .ta-status-tile--down {
    border-color: rgb(var(--ta-status-tone) / 0.55);
    background: rgb(var(--ta-status-tone) / 0.06);
  }

  a.ta-status-tile:hover {
    border-color: rgb(var(--ta-accent) / 0.5);
  }
  a.ta-status-tile:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.7);
    outline-offset: 2px;
  }

  .ta-status-tile-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    color: rgb(var(--ta-status-tone));
    border: 1px solid rgb(var(--ta-status-tone) / 0.45);
    border-radius: var(--ta-radius);
  }

  .ta-status-tile-label {
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
    overflow-wrap: anywhere;
  }

  .ta-status-tile-verdict {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem 0.5rem;
  }
  .ta-status-tile-glyph {
    display: inline-flex;
    color: rgb(var(--ta-status-tone));
  }
  .ta-status-tile-word {
    font-size: 1.25rem;
    font-weight: 700;
    color: rgb(var(--ta-status-tone));
  }
  .ta-status-tile--unknown .ta-status-tile-word {
    color: rgb(var(--ta-text-dim));
  }
  .ta-status-tile-value {
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text-dim));
  }

  .ta-status-tile-description {
    font-size: 0.8125rem;
    color: rgb(var(--ta-text-dim));
  }

  @media (pointer: coarse) {
    a.ta-status-tile {
      min-height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-status-tile {
      transition: none;
    }
  }
</style>
