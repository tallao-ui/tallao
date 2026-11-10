<!--
  tallao — BottomNav
  A mobile tab bar fixed to the bottom of the screen: up to five destinations with an icon
  and an always-visible label, above the safe area (the iPhone home indicator).

    <BottomNav current="/news" hideAbove={767} items={[
      { id: "home", label: "Home", href: "/", icon: "home" },
      { id: "news", label: "News", href: "/news", icon: "info", badge: 3 },
      { id: "me", label: "Profile", href: "/me", icon: "user" },
    ]} />

  - It is a <nav> of links: it works rendered on the server with no hydration. An item without
    `href` is a button for `onclick` (that one needs JavaScript).
  - The current item (`current` matching an id or href, or `current: true` on the item) gets
    aria-current="page" and the accent colour, with a pill behind its icon.
  - `hideAbove` (px): shown only up to that viewport width, so a desktop layout is untouched.
  - `action`: a raised central button (for "new post", "scan"…), placed between the two
    halves of the items. Put a link or button with an accessible name in it.
  - The page must not hide behind it: by default a spacer of the same height stays in the
    flow where the component is (`spacer={false}` to drop it), or pad the page yourself with
    `padding-bottom: calc(var(--ta-bottom-nav-height) + env(safe-area-inset-bottom))`.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { IconName } from "./icon.svelte";

  export interface BottomNavItem {
    id: string;
    label: string;
    href?: string;
    /** A kit icon by name, or your own drawing as a snippet. */
    icon?: IconName | Snippet;
    /** A count or short text on the icon ("3", "new"). */
    badge?: string | number;
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
    items: BottomNavItem[];
    /** Id or href of the current page. */
    current?: string;
    /** Accessible name of the <nav>. */
    ariaLabel?: string;
    /** Only shown when the viewport is at most this wide, in px (e.g. 767). */
    hideAbove?: number;
    /** Keeps a spacer of the bar's height in the flow, so the page's end stays visible. */
    spacer?: boolean;
    /** A raised central action (a link or button with its own name). */
    action?: Snippet;
    /** Draws every item's icon (your own icon set); gets the item and whether it is current. */
    icon?: Snippet<[BottomNavItem, boolean]>;
    class?: string;
    [key: string]: unknown;
  }

  const {
    items,
    current,
    ariaLabel = L.navigation,
    hideAbove,
    spacer = true,
    action,
    icon,
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();

  $effect(() => {
    if (items.length > 5) {
      console.warn(`tallao: BottomNav works best with at most 5 items (got ${items.length}); move the rest elsewhere.`);
    }
  });

  const isCurrent = (it: BottomNavItem) =>
    !!it.current || (current != null && (it.id === current || (it.href != null && it.href === current)));

  const half = $derived(Math.ceil(items.length / 2));
  const start = $derived(action ? items.slice(0, half) : items);
  const end = $derived(action ? items.slice(half) : []);

  // A media query with the consumer's breakpoint, scoped to this instance (numbers only), and
  // --ta-bottom-nav-offset on the page while the bar is shown, so a Toaster stacks above it.
  const offset = `html { --ta-bottom-nav-offset: calc(var(--ta-bottom-nav-height, 3.75rem) + env(safe-area-inset-bottom, 0px)); }`;
  const breakpoint = $derived(
    hideAbove != null && Number.isFinite(Number(hideAbove))
      ? `<style>@media (min-width: ${Math.floor(Number(hideAbove)) + 1}px) { [data-ta-bottom-nav="${id}"] { display: none !important; } } @media (max-width: ${Math.floor(Number(hideAbove))}px) { ${offset} }</style>`
      : `<style>${offset}</style>`
  );
</script>

{#snippet entry(it: BottomNavItem)}
  {@const on = isCurrent(it)}
  {@const custom = typeof it.icon === "function" ? it.icon : null}
  {#snippet inner()}
    <span class="ta-bottom-nav-icon" aria-hidden="true">
      {#if custom}{@render custom()}{:else if icon}{@render icon(it, on)}{:else if typeof it.icon === "string"}<Icon name={it.icon} size={22} />{/if}
      {#if it.badge != null && it.badge !== ""}<span class="ta-bottom-nav-badge">{it.badge}</span>{/if}
    </span>
    <span class="ta-bottom-nav-label">{it.label}{#if it.badge != null && it.badge !== ""}<span class="ta-hidden">{` (${it.badge})`}</span>{/if}</span>
  {/snippet}
  <li class="ta-bottom-nav-li">
    {#if it.href}
      <a href={it.href} class="ta-bottom-nav-item" aria-current={on ? "page" : undefined} onclick={it.onclick}>{@render inner()}</a>
    {:else}
      <button type="button" class="ta-bottom-nav-item" aria-current={on ? "page" : undefined} onclick={it.onclick}>{@render inner()}</button>
    {/if}
  </li>
{/snippet}

{#if breakpoint}{@html breakpoint}{/if}
<nav
  {...rest}
  data-ta-bottom-nav={id}
  aria-label={ariaLabel}
  class={cn("ta-bottom-nav", action && "ta-bottom-nav--action", className)}
>
  <ul class="ta-bottom-nav-list">
    {#each start as it (it.id)}{@render entry(it)}{/each}
    {#if action}<li class="ta-bottom-nav-li ta-bottom-nav-action">{@render action()}</li>{/if}
    {#each end as it (it.id)}{@render entry(it)}{/each}
  </ul>
</nav>
{#if spacer}<div class="ta-bottom-nav-spacer" data-ta-bottom-nav={id} aria-hidden="true"></div>{/if}

<style>
  .ta-bottom-nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 40;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: rgb(var(--ta-surface) / 0.96);
    border-top: 1px solid rgb(var(--ta-border));
    backdrop-filter: blur(8px);
  }

  .ta-bottom-nav-list {
    display: flex;
    align-items: stretch;
    justify-content: space-around;
    height: var(--ta-bottom-nav-height, 3.75rem);
    max-width: 40rem;
    margin: 0 auto;
    padding: 0;
    list-style: none;
  }

  .ta-bottom-nav-li {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
  }

  .ta-bottom-nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.125rem;
    min-width: 2.75rem;
    min-height: 2.75rem;
    padding: 0.25rem 0.125rem;
    font: inherit;
    font-size: 0.6875rem;
    font-weight: 500;
    line-height: 1.2;
    color: rgb(var(--ta-text-dim));
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  .ta-bottom-nav-item:hover { color: rgb(var(--ta-text)); }
  .ta-bottom-nav-item:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: -4px; border-radius: var(--ta-radius); }

  .ta-bottom-nav-icon {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.25rem;
    height: 1.75rem;
    border-radius: 9999px;
    transition: background-color 0.2s;
  }

  .ta-bottom-nav-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Current: icon and label in the accent colour, with a pill behind the icon. */
  .ta-bottom-nav-item[aria-current="page"] { color: rgb(var(--ta-accent-hover)); font-weight: 600; }
  .ta-bottom-nav-item[aria-current="page"] .ta-bottom-nav-icon { background: rgb(var(--ta-accent) / 0.18); }

  .ta-bottom-nav-badge {
    position: absolute;
    top: -0.125rem;
    left: calc(50% + 0.375rem);
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.25rem;
    font-size: 0.625rem;
    font-weight: 700;
    line-height: 1rem;
    text-align: center;
    color: rgb(var(--ta-on-accent-2, 255 255 255));
    background: rgb(var(--ta-accent-2-dim, var(--ta-accent-2)));
    border-radius: 9999px;
  }

  /* The raised central action: whatever link or button the snippet puts there. */
  .ta-bottom-nav-action {
    flex: 0 0 auto;
    align-items: flex-start;
    justify-content: center;
    padding: 0 0.25rem;
  }
  .ta-bottom-nav-action > :global(a),
  .ta-bottom-nav-action > :global(button) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3.5rem;
    height: 3.5rem;
    margin-top: -1.25rem;
    color: rgb(var(--ta-on-accent));
    text-decoration: none;
    background: var(--ta-accent-fill, color-mix(in srgb, rgb(var(--ta-accent)) 88%, black));
    border: 4px solid rgb(var(--ta-bg));
    border-radius: 9999px;
    box-shadow: 0 6px 16px -6px rgb(var(--ta-accent) / 0.6);
    cursor: pointer;
  }
  .ta-bottom-nav-action > :global(a:focus-visible),
  .ta-bottom-nav-action > :global(button:focus-visible) { outline: 2px solid rgb(var(--ta-accent-hover)); outline-offset: 2px; }

  .ta-bottom-nav-spacer {
    height: calc(var(--ta-bottom-nav-height, 3.75rem) + env(safe-area-inset-bottom, 0px));
  }

  .ta-hidden {
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

  @media (pointer: coarse) {
    .ta-bottom-nav-item { min-width: 2.75rem; min-height: 2.75rem; font-size: 0.75rem; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-bottom-nav-icon { transition: none; }
  }
</style>
