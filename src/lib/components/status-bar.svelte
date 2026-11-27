<!--
  tallao — StatusBar
  A thin bar of live readings at the edge of an app (API, database, queue, last sync,
  environment), like an editor's status bar: each item is a label, an optional figure and an
  optional verdict.
  - A verdict (`ok`, `warn`, `down`, `unknown`) has its own glyph (check, triangle, cross,
    dash) and its word for screen readers (the labels' `statusOk`…, or the item's
    `statusLabel`), never colour alone. `live` adds a pulsing dot for something that is
    being watched right now; it stays still under reduced motion.
  - An item with `href` is a link; the rest are text. The bar is a labelled region (`ariaLabel`)
    with a list inside. It does not announce every refresh: the page decides what is worth an
    `aria-live` message.
  - It never wraps: on a narrow screen the items scroll sideways. `end` is a snippet drawn at
    the far end (the environment, a version).
  - The bar sits where it is put; `position: sticky; bottom: 0` or `fixed` is the page's call.
    It draws on the floating level (`--ta-float*`), so it is glass where the app turns it on.
  Plain JSON: `{ "items": [{ "id": "db", "label": "Database", "value": "1 ms", "status": "ok" }] }`.
-->
<script lang="ts" module>
  export interface StatusBarItem {
    id: string;
    label: string;
    /** A figure after the label ("1 ms", "3 waiting", "12:04"). */
    value?: string | number;
    status?: "ok" | "warn" | "down" | "unknown";
    /** Replaces the verdict's word for screen readers ("Running"). */
    statusLabel?: string;
    /** A pulsing dot: watched live. */
    live?: boolean;
    href?: string;
    /** A longer explanation, as the item's tooltip (`title`). */
    title?: string;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();

  interface Props {
    items: StatusBarItem[];
    /** The region's name; by default the labels' `statusBar`. */
    ariaLabel?: string;
    /** Drawn at the far end of the bar. */
    end?: Snippet;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const { items, ariaLabel, end, class: className = "", ...rest }: Props = $props();

  const GLYPH = { ok: "check", warn: "alert", down: "x", unknown: "minus" } as const;
  const word = (item: StatusBarItem) =>
    item.status
      ? (item.statusLabel ??
        { ok: L.statusOk, warn: L.statusWarn, down: L.statusDown, unknown: L.statusUnknown }[item.status])
      : undefined;
</script>

<section {...rest} class={cn("ta-statusbar", className)} aria-label={ariaLabel ?? L.statusBar}>
  <ul class="ta-statusbar-list">
    {#each items as item (item.id)}
      {@const verdict = word(item)}
      <li class="ta-statusbar-item" data-status={item.status} data-id={item.id}>
        <svelte:element
          this={item.href ? "a" : "span"}
          href={item.href}
          title={item.title}
          class={cn("ta-statusbar-entry", item.status && `ta-statusbar-entry--${item.status}`)}
        >
          {#if item.live}<span class="ta-statusbar-live" aria-hidden="true"></span>{/if}
          {#if item.status}
            <span class="ta-statusbar-glyph" aria-hidden="true"><Icon name={GLYPH[item.status]} size={12} /></span>
          {/if}
          <span class="ta-statusbar-label">{item.label}</span>
          {#if item.value !== undefined && item.value !== ""}
            <span class="ta-statusbar-value">{item.value}</span>
          {/if}
          {#if verdict}<span class="ta-statusbar-sr">{verdict}</span>{/if}
        </svelte:element>
      </li>
    {/each}
  </ul>
  {#if end}<div class="ta-statusbar-end">{@render end()}</div>{/if}
</section>

<style>
  .ta-statusbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 2rem;
    padding: 0 0.75rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
    background: rgb(var(--ta-float, var(--ta-surface)) / var(--ta-float-alpha, 1));
    -webkit-backdrop-filter: blur(var(--ta-float-blur, 0px));
    backdrop-filter: blur(var(--ta-float-blur, 0px));
    border-top: 1px solid rgb(var(--ta-float-edge, var(--ta-border)) / var(--ta-float-edge-alpha, 1));
  }
  .ta-statusbar-list {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.25rem 1rem;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;
    white-space: nowrap;
  }
  .ta-statusbar-item {
    flex-shrink: 0;
  }
  .ta-statusbar-entry {
    --ta-statusbar-tone: var(--ta-text-dim);
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.25rem 0;
    color: inherit;
    text-decoration: none;
    border-radius: var(--ta-radius-sm);
  }
  .ta-statusbar-entry--ok { --ta-statusbar-tone: var(--ta-success); }
  .ta-statusbar-entry--warn { --ta-statusbar-tone: var(--ta-warning); }
  .ta-statusbar-entry--down { --ta-statusbar-tone: var(--ta-danger); }
  a.ta-statusbar-entry:hover .ta-statusbar-label {
    color: rgb(var(--ta-text));
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  a.ta-statusbar-entry:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.7);
    outline-offset: 2px;
  }
  .ta-statusbar-glyph {
    display: inline-flex;
    color: rgb(var(--ta-statusbar-tone));
  }
  .ta-statusbar-entry--warn .ta-statusbar-label,
  .ta-statusbar-entry--down .ta-statusbar-label {
    color: rgb(var(--ta-statusbar-tone));
    font-weight: 600;
  }
  .ta-statusbar-value {
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text));
  }
  .ta-statusbar-live {
    position: relative;
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 999px;
    background: rgb(var(--ta-statusbar-tone));
  }
  .ta-statusbar-live::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: inherit;
    animation: ta-statusbar-pulse 1.6s var(--ta-ease-out, ease-out) infinite;
  }
  @keyframes ta-statusbar-pulse {
    from { transform: scale(1); opacity: 0.6; }
    to { transform: scale(2.6); opacity: 0; }
  }
  .ta-statusbar-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .ta-statusbar-end {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.75rem;
  }

  @media (pointer: coarse) {
    a.ta-statusbar-entry {
      min-height: 44px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-statusbar-live::after {
      animation: none;
      display: none;
    }
  }
</style>
