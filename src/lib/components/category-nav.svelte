<!--
  tallao — CategoryNav
  The categories of a catalogue, one open at a time: a vertical rail of links with an icon and a
  count, which becomes a row of chips that scrolls sideways on narrow screens.

    <CategoryNav current="levels" items={[
      { id: "welcome", label: "Welcome and roles", href: "?g=welcome", icon: "user", count: "3/7" },
      { id: "levels", label: "Levels and economy", href: "?g=levels", icon: "coin", count: "2/7", lit: true },
    ]} />

  - It is a named <nav> of links: the open category lives in the address, so Back, links and new
    tabs work, and it renders on the server with no hydration. An item without `href` is a button
    for `onclick`.
  - The open one (`current` matching an id or href, or `current: true`) gets aria-current="page".
    `current={null}` marks none (while a search spans every category, say).
  - `count` is any short text ("12", "3/7"); `lit` paints it in the accent (something is on).
  - `chipsBelow` (px, default 900): at that width or less the rail is a row of chips, and the open
    chip is scrolled into view. `0` keeps the rail always.
  - Every link is at least 44px tall. Give links `data-sveltekit-noscroll` and the like through
    `linkProps`.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { IconName } from "./icon.svelte";

  export interface CategoryNavItem {
    id: string;
    label: string;
    href?: string;
    /** A kit icon by name, or your own drawing as a snippet. */
    icon?: IconName | Snippet;
    /** A short count shown at the end ("12", "3/7"). */
    count?: string | number;
    /** Paints the count in the accent. */
    lit?: boolean;
    current?: boolean;
    onclick?: (event: MouseEvent) => void;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();

  interface Props {
    items: CategoryNavItem[];
    /** Id or href of the open category; null marks none. */
    current?: string | null;
    /** Accessible name of the <nav>. */
    ariaLabel?: string;
    /** At this viewport width (px) or less, a row of chips; 0 = always a rail. */
    chipsBelow?: number;
    /** Extra attributes for every link (data-sveltekit-noscroll…). */
    linkProps?: Record<string, unknown>;
    class?: string;
    [key: string]: unknown;
  }

  const {
    items,
    current,
    ariaLabel = L.categories,
    chipsBelow = 900,
    linkProps = {},
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  let nav = $state<HTMLElement>();

  const isCurrent = (it: CategoryNavItem) =>
    current !== null && (!!it.current || (current != null && (it.id === current || (it.href != null && it.href === current))));

  // The chips' media query with the consumer's breakpoint, scoped to this instance (numbers only).
  const width = $derived(Math.floor(Number(chipsBelow)));
  const chips = $derived(
    Number.isFinite(width) && width > 0
      ? `<style>@media (max-width: ${width}px) { [data-ta-category-nav="${id}"] .ta-category-nav-list { display: flex; gap: 0.5rem; width: max-content; } [data-ta-category-nav="${id}"] { overflow-x: auto; margin: 0 -0.25rem; padding: 0 0.25rem 0.25rem; } [data-ta-category-nav="${id}"] .ta-category-nav-item { border-color: rgb(var(--ta-border)); border-radius: 9999px; } }</style>`
      : ""
  );

  // In the chips row, keep the open one in sight when it changes (no effect on the vertical rail).
  const open = $derived(items.find(isCurrent)?.id);
  $effect(() => {
    void open;
    const el = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !nav || nav.scrollWidth <= nav.clientWidth) return;
    const a = el.getBoundingClientRect();
    const b = nav.getBoundingClientRect();
    if (a.left < b.left || a.right > b.right) nav.scrollBy({ left: a.left - b.left - (b.width - a.width) / 2 });
  });
</script>

{#snippet inner(it: CategoryNavItem)}
  {@const custom = typeof it.icon === "function" ? it.icon : null}
  {#if it.icon}
    <span class="ta-category-nav-icon" aria-hidden="true">
      {#if custom}{@render custom()}{:else if typeof it.icon === "string"}<Icon name={it.icon} size={17} />{/if}
    </span>
  {/if}
  <span class="ta-category-nav-label">{it.label}</span>
  {#if it.count != null && it.count !== ""}
    <span class="ta-category-nav-count" class:ta-category-nav-count--lit={it.lit}>{it.count}</span>
  {/if}
{/snippet}

{#if chips}{@html chips}{/if}
<nav {...rest} bind:this={nav} data-ta-category-nav={id} aria-label={ariaLabel} class={cn("ta-category-nav", className)}>
  <ul class="ta-category-nav-list">
    {#each items as it (it.id)}
      {@const on = isCurrent(it)}
      <li>
        {#if it.href}
          <a {...linkProps} href={it.href} class="ta-category-nav-item" aria-current={on ? "page" : undefined} onclick={it.onclick}>{@render inner(it)}</a>
        {:else}
          <button type="button" class="ta-category-nav-item" aria-current={on ? "page" : undefined} onclick={it.onclick}>{@render inner(it)}</button>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<style>
  .ta-category-nav-list {
    display: grid;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ta-category-nav-item {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    width: 100%;
    min-height: 2.75rem;
    padding: 0.375rem 0.75rem;
    font: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    text-align: start;
    white-space: nowrap;
    color: rgb(var(--ta-text-dim));
    text-decoration: none;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--ta-radius);
    cursor: pointer;
    transition:
      background-color 0.15s,
      color 0.15s,
      border-color 0.15s;
  }
  .ta-category-nav-item:hover {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
  }
  .ta-category-nav-item:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }
  .ta-category-nav-item[aria-current="page"] {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-accent) / 0.1);
    border-color: rgb(var(--ta-accent) / 0.4);
  }

  .ta-category-nav-icon {
    display: inline-flex;
    flex: none;
    color: rgb(var(--ta-accent));
  }
  .ta-category-nav-label {
    flex: 1;
    min-width: 0;
  }
  .ta-category-nav-count {
    flex: none;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text-dim));
  }
  .ta-category-nav-count--lit {
    color: rgb(var(--ta-accent));
  }

  /* Every target stays 44px on touch screens, also as chips (the base rule already is; kept here
     so a smaller override of min-height in a theme cannot shrink it under a finger). */
  @media (pointer: coarse) {
    .ta-category-nav-item {
      min-height: 2.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-category-nav-item {
      transition: none;
    }
  }
</style>
