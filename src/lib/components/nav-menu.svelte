<!--
  tallao — NavMenu
  A disclosure menu for a site header: a trigger that opens a panel of grouped links, each
  with an icon, a label, a one-line description and an optional badge. It is a list of links,
  not an ARIA `menu` (no menu roles, no arrow-key model: Tab moves through the links).

    <NavMenu label="Games" groups={[
      { label: "Gacha", items: [{ label: "Genshin", href: "/genshin", description: "Tier list and builds", icon: "bot" }] },
      { label: "Soon", items: [{ label: "Aion 2", description: "Wiki in progress", soon: true }] },
    ]} />

  Built on <details>/<summary>, not on the Popover API:
  - it works with no JavaScript in every browser: the sites render their header on the server
    and do not hydrate it;
  - the panel is positioned against the trigger by plain CSS. A popover lives in the top layer
    and anchoring it without JavaScript needs CSS anchor positioning, which not every browser
    has yet (without it the panel would sit in the middle of the screen);
  - while closed, the panel is not rendered at all, so it can never widen the page.
  What JavaScript adds once hydrated: Escape closes and gives the focus back to the trigger, a
  click outside closes, and a panel that would overflow the viewport flips to the end edge.
  Without JavaScript, close it with the trigger, and use `align="end"` for a menu at the right
  end of a header. `name` makes several menus exclusive (opening one closes the others), also
  without JavaScript. It opens on click or tap only, never on hover.

  Icons: `icon` on an item is a kit icon name or a snippet; the `icon` prop draws every item's
  icon with your own icon component, and `item` replaces a whole entry. Snippets cannot come
  from Astro, so wrap NavMenu in a small Svelte component of your own that passes them.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { IconName } from "./icon.svelte";

  export interface NavMenuItem {
    label: string;
    href?: string;
    /** One line under the label. */
    description?: string;
    /** A kit icon by name, or your own drawing as a snippet. */
    icon?: IconName | Snippet;
    badge?: string | number;
    /** Not available yet: shown dimmed, with no link, and a "Coming soon" tag. */
    soon?: boolean;
    /** Marks the entry for the current page (aria-current="page"). */
    current?: boolean;
  }

  export interface NavMenuGroup {
    label?: string;
    items: NavMenuItem[];
  }
</script>

<script lang="ts">
  import { pushLayer } from "$lib/internal/layers";
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();

  interface Props {
    /** Text of the trigger. */
    label: string;
    groups: NavMenuGroup[];
    open?: boolean;
    /** Columns of groups in the panel; "auto" uses one per group, up to 3. */
    columns?: 1 | 2 | 3 | "auto";
    /** Edge of the trigger the panel lines up with. With JavaScript, "start" flips to "end" if it would overflow. */
    align?: "start" | "end";
    /** Same `name` on several menus: opening one closes the others (native, no JavaScript). */
    name?: string;
    /** Text of the tag on `soon` entries. */
    soonLabel?: string;
    /** Your own trigger content (the chevron is added after it). */
    trigger?: Snippet;
    /** Draws every item's icon with your own icon set. */
    icon?: Snippet<[NavMenuItem]>;
    /** Replaces a whole entry's content (inside the link). */
    item?: Snippet<[NavMenuItem]>;
    class?: string;
    panelClass?: string;
    [key: string]: unknown;
  }

  let {
    label,
    groups,
    open = $bindable(false),
    columns = "auto",
    align = "start",
    name,
    soonLabel = L.comingSoon,
    trigger,
    icon,
    item,
    class: className = "",
    panelClass = "",
    ...rest
  }: Props = $props();

  const id = $props.id();
  let details: HTMLDetailsElement | undefined = $state();
  let summary: HTMLElement | undefined = $state();
  let panel: HTMLElement | undefined = $state();
  let flipped = $state(false);

  const cols = $derived(columns === "auto" ? Math.min(3, Math.max(1, groups.length)) : columns);
  const edge = $derived(align === "end" || flipped ? "end" : "start");

  // Escape and a click outside close it (through the kit's layer stack, so a menu inside a
  // dialog does not close the dialog too).
  $effect(() => {
    if (!open || !details) return;
    const el = details;
    return pushLayer({
      inside: () => [el],
      dismiss: (reason) => {
        open = false;
        if (reason === "escape") summary?.focus();
      },
    });
  });

  // Keep the panel inside the viewport: flip to the end edge when the start would overflow.
  // On a phone neither edge may fit (a 22rem panel under a trigger in the middle of a 375px
  // screen): then it also slides sideways until it is 8px inside the viewport.
  $effect(() => {
    if (!open || !panel || !details) {
      flipped = false;
      return;
    }
    const p = panel;
    p.style.translate = "";
    const trigger = details.getBoundingClientRect();
    const width = p.offsetWidth;
    const viewport = document.documentElement.clientWidth || window.innerWidth;
    const endLeft = trigger.right - width;
    const flip = align !== "end" && trigger.left + width > viewport - 8;
    flipped = flip;
    const left = align === "end" || flip ? endLeft : trigger.left;
    const dx = left < 8 ? 8 - left : left + width > viewport - 8 ? viewport - 8 - (left + width) : 0;
    p.style.translate = dx ? `${Math.round(dx)}px 0` : "";
  });
</script>

{#snippet entryIcon(it: NavMenuItem)}
  {@const custom = typeof it.icon === "function" ? it.icon : null}
  {#if custom || icon || it.icon}
    <span class="ta-navmenu-icon" aria-hidden="true">
      {#if custom}{@render custom()}{:else if icon}{@render icon(it)}{:else if typeof it.icon === "string"}<Icon name={it.icon} size={18} />{/if}
    </span>
  {/if}
{/snippet}

{#snippet entryBody(it: NavMenuItem)}
  {#if item}
    {@render item(it)}
  {:else}
    {@render entryIcon(it)}
    <span class="ta-navmenu-text">
      <span class="ta-navmenu-label">
        {it.label}
        {#if it.soon}<span class="ta-navmenu-tag">{soonLabel}</span>{:else if it.badge != null && it.badge !== ""}<span class="ta-navmenu-tag ta-navmenu-tag--badge">{it.badge}</span>{/if}
      </span>
      {#if it.description}<span class="ta-navmenu-description">{it.description}</span>{/if}
    </span>
  {/if}
{/snippet}

<details
  {...rest}
  bind:this={details}
  bind:open
  {name}
  class={cn("ta-navmenu", className)}
>
  <summary bind:this={summary} class="ta-navmenu-trigger">
    {#if trigger}{@render trigger()}{:else}{label}{/if}
    <Icon name="chevron-down" size={14} class="ta-navmenu-chevron" />
  </summary>
  <div
    bind:this={panel}
    class={cn("ta-navmenu-panel", `ta-navmenu-panel--${edge}`, panelClass)}
    style:--ta-navmenu-columns={cols}
  >
    {#each groups as g, gi (gi)}
      <div class="ta-navmenu-group">
        {#if g.label}<p class="ta-navmenu-title" id={`${id}-g${gi}`}>{g.label}</p>{/if}
        <ul aria-labelledby={g.label ? `${id}-g${gi}` : undefined}>
          {#each g.items as it, ii (ii)}
            <li>
              {#if it.soon || !it.href}
                <span class={cn("ta-navmenu-link", it.soon && "ta-navmenu-link--soon")} aria-disabled={it.soon ? "true" : undefined}>
                  {@render entryBody(it)}
                </span>
              {:else}
                <a href={it.href} class="ta-navmenu-link" aria-current={it.current ? "page" : undefined}>
                  {@render entryBody(it)}
                </a>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</details>

<style>
  .ta-navmenu {
    position: relative;
    display: inline-block;
  }

  .ta-navmenu-trigger {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.625rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(var(--ta-text));
    border-radius: var(--ta-radius);
    cursor: pointer;
    list-style: none;
    user-select: none;
  }
  .ta-navmenu-trigger::-webkit-details-marker { display: none; }
  .ta-navmenu-trigger::marker { content: ""; }
  .ta-navmenu-trigger:hover { background: rgb(var(--ta-elevated) / 0.6); }
  .ta-navmenu-trigger:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-navmenu[open] > .ta-navmenu-trigger { background: rgb(var(--ta-elevated)); }
  .ta-navmenu :global(.ta-navmenu-chevron) { opacity: 0.7; transition: transform 0.15s; }
  .ta-navmenu[open] :global(.ta-navmenu-chevron) { transform: rotate(180deg); }

  .ta-navmenu-panel {
    position: absolute;
    top: calc(100% + 0.375rem);
    z-index: 50;
    display: grid;
    grid-template-columns: repeat(var(--ta-navmenu-columns, 1), minmax(13rem, 1fr));
    gap: 0.75rem 1rem;
    width: max-content;
    max-width: min(calc(100vw - 1rem), 54rem);
    padding: 0.75rem;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.55);
    animation: ta-navmenu-enter 0.12s ease-out;
  }
  .ta-navmenu-panel--start { left: 0; }
  .ta-navmenu-panel--end { right: 0; }

  @keyframes ta-navmenu-enter {
    from { opacity: 0; transform: translateY(-4px); }
  }

  .ta-navmenu-title {
    margin: 0 0 0.25rem;
    padding: 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }

  .ta-navmenu ul { display: flex; flex-direction: column; gap: 1px; margin: 0; padding: 0; list-style: none; }

  .ta-navmenu-link {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.5rem;
    color: rgb(var(--ta-text));
    text-decoration: none;
    border-radius: var(--ta-radius);
  }
  a.ta-navmenu-link:hover { background: rgb(var(--ta-elevated) / 0.7); }
  a.ta-navmenu-link:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: -2px; }
  a.ta-navmenu-link[aria-current="page"] { background: rgb(var(--ta-accent) / 0.12); }
  .ta-navmenu-link--soon { opacity: 0.55; cursor: default; }

  .ta-navmenu-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    color: rgb(var(--ta-accent-hover));
    background: rgb(var(--ta-accent) / 0.1);
    border-radius: var(--ta-radius);
  }

  .ta-navmenu-text { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
  .ta-navmenu-label { display: flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; font-weight: 500; }
  .ta-navmenu-description {
    max-width: 18rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-navmenu-tag {
    padding: 0 0.375rem;
    font-size: 0.625rem;
    font-weight: 600;
    line-height: 1.125rem;
    color: rgb(var(--ta-text-dim));
    background: rgb(var(--ta-elevated));
    border-radius: 9999px;
    white-space: nowrap;
  }
  .ta-navmenu-tag--badge { color: rgb(var(--ta-accent-hover)); background: rgb(var(--ta-accent) / 0.15); }

  /* Narrow screens: one column, as wide as the screen allows. */
  @media (max-width: 640px) {
    .ta-navmenu-panel { grid-template-columns: minmax(0, 1fr); width: min(calc(100vw - 1rem), 22rem); }
  }

  @media (pointer: coarse) {
    .ta-navmenu-trigger { min-height: 2.75rem; font-size: 1rem; }
    .ta-navmenu-link { min-height: 2.75rem; align-items: center; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-navmenu-panel { animation: none; }
    .ta-navmenu :global(.ta-navmenu-chevron) { transition: none; }
  }
</style>
