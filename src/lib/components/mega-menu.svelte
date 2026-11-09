<!--
  tallao — MegaMenu
  A header trigger that opens a wide bento panel: a featured tile (art, title, one line
  and a call to action) next to columns of grouped links with an icon, a label and a
  one-line description, and an optional footer link ("View all →"). It is a list of
  links, not an ARIA `menu` (Tab moves through the links).

    <MegaMenu label="Games"
      featured={{ title: "Elden Ring", href: "/elden-ring/", image: "/er.jpg", cta: "Open hub",
                  description: "Guides, bosses and the interactive map" }}
      groups={[
        { label: "Valhalla", items: [{ label: "Elden Ring", href: "/elden-ring/", description: "Wiki + guides" }] },
        { label: "Cardback", items: [{ label: "Marvel Snap", href: "/snap/", soon: false }] },
      ]}
      foot={{ label: "All games", href: "/games" }} />

  Same contract as NavMenu, and built the same way on <details>/<summary>:
  - it works with no JavaScript: the sites render their header on the server and do not
    hydrate it;
  - `name` makes several menus exclusive natively; it opens on click or tap, never on hover.
  What JavaScript adds once hydrated: Escape closes and returns the focus, a click outside
  closes, and a panel that would overflow the viewport flips to the end edge or shrinks to
  the screen. On narrow screens the panel becomes full-width and the featured tile stacks
  on top.

  Icons: same rules as NavMenu (`icon` on an item is a kit icon name or a snippet; the
  `icon` prop draws every item's icon; `item` replaces a whole entry).
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  import type { NavMenuGroup, NavMenuItem } from "./nav-menu.svelte";

  export interface MegaMenuFeatured {
    title: string;
    href: string;
    /** Big art behind the tile; without it, an accent halo. */
    image?: string;
    description?: string;
    /** The call to action at the bottom ("Open hub"). */
    cta?: string;
    /** Opens in another tab (a sister site on another origin). */
    external?: boolean;
  }

  export interface MegaMenuFoot {
    label: string;
    href: string;
    external?: boolean;
  }

  export type { NavMenuGroup, NavMenuItem };
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
    /** The big tile of the bento; without it the panel is plain columns. */
    featured?: MegaMenuFeatured;
    /** The closing row of the panel ("View all →"). */
    foot?: MegaMenuFoot;
    open?: boolean;
    /** Columns of groups next to the featured tile; "auto" uses one per group, up to 3. */
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
    featured,
    foot,
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
  /** Cuánto hay que mover a la izquierda un panel end que se sale por la izquierda */
  let desplaza = $state(0);

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

  // Keep the panel inside the viewport: flip to the end edge when the start would overflow,
  // and an end-aligned panel that grows past the LEFT edge shifts left instead.
  $effect(() => {
    if (!open || !panel || !details) {
      flipped = false;
      desplaza = 0;
      return;
    }
    const rect = details.getBoundingClientRect();
    if (align === "end") {
      desplaza = Math.max(0, panel.offsetWidth - (rect.right - 8));
      flipped = false;
      return;
    }
    desplaza = 0;
    const left = rect.left;
    flipped = left + panel.offsetWidth > window.innerWidth - 8;
  });
</script>

{#snippet entryIcon(it: NavMenuItem)}
  {@const custom = typeof it.icon === "function" ? it.icon : null}
  {#if custom || icon || it.icon}
    <span class="ta-megamenu-icon" aria-hidden="true">
      {#if custom}{@render custom()}{:else if icon}{@render icon(it)}{:else if typeof it.icon === "string"}<Icon name={it.icon} size={18} />{/if}
    </span>
  {/if}
{/snippet}

{#snippet entryBody(it: NavMenuItem)}
  {#if item}
    {@render item(it)}
  {:else}
    {@render entryIcon(it)}
    <span class="ta-megamenu-text">
      <span class="ta-megamenu-label">
        {it.label}
        {#if it.soon}<span class="ta-megamenu-tag">{soonLabel}</span>{:else if it.badge != null && it.badge !== ""}<span class="ta-megamenu-tag ta-megamenu-tag--badge">{it.badge}</span>{/if}
      </span>
      {#if it.description}<span class="ta-megamenu-description">{it.description}</span>{/if}
    </span>
  {/if}
{/snippet}

<details
  {...rest}
  bind:this={details}
  bind:open
  {name}
  class={cn("ta-megamenu", className)}
>
  <summary bind:this={summary} class="ta-megamenu-trigger">
    {#if trigger}{@render trigger()}{:else}{label}{/if}
    <Icon name="chevron-down" size={14} class="ta-megamenu-chevron" />
  </summary>
  <div
    bind:this={panel}
    class={cn("ta-megamenu-panel", `ta-megamenu-panel--${edge}`, featured && "ta-megamenu-panel--bento", panelClass)}
    style:--ta-megamenu-columns={cols}
    style:margin-right={desplaza > 0 ? `-${desplaza}px` : undefined}
  >
    {#if featured}
      <a
        href={featured.href}
        target={featured.external ? "_blank" : undefined}
        rel={featured.external ? "noopener noreferrer" : undefined}
        class="ta-megamenu-featured"
      >
        {#if featured.image}
          <img src={featured.image} alt="" loading="lazy" class="ta-megamenu-featured-art" />
        {:else}
          <span class="ta-megamenu-featured-halo" aria-hidden="true"></span>
        {/if}
        <span class="ta-megamenu-featured-veil" aria-hidden="true"></span>
        <span class="ta-megamenu-featured-body">
          <span class="ta-megamenu-featured-title">{featured.title}</span>
          {#if featured.description}<span class="ta-megamenu-featured-description">{featured.description}</span>{/if}
          {#if featured.cta}
            <span class="ta-megamenu-featured-cta">
              {featured.cta}
              <Icon name={featured.external ? "external" : "arrow-right"} size={14} />
            </span>
          {/if}
        </span>
      </a>
    {/if}

    <div class="ta-megamenu-groups">
      {#each groups as g, gi (gi)}
        <div class="ta-megamenu-group">
          {#if g.label}<p class="ta-megamenu-title" id={`${id}-g${gi}`}>{g.label}</p>{/if}
          <ul aria-labelledby={g.label ? `${id}-g${gi}` : undefined}>
            {#each g.items as it, ii (ii)}
              <li>
                {#if it.soon || !it.href}
                  <span class={cn("ta-megamenu-link", it.soon && "ta-megamenu-link--soon")} aria-disabled={it.soon ? "true" : undefined}>
                    {@render entryBody(it)}
                  </span>
                {:else}
                  <a href={it.href} class="ta-megamenu-link" aria-current={it.current ? "page" : undefined}>
                    {@render entryBody(it)}
                  </a>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    {#if foot}
      <a
        href={foot.href}
        target={foot.external ? "_blank" : undefined}
        rel={foot.external ? "noopener noreferrer" : undefined}
        class="ta-megamenu-foot"
      >
        {foot.label}
        <Icon name={foot.external ? "external" : "arrow-right"} size={14} />
      </a>
    {/if}
  </div>
</details>

<style>
  .ta-megamenu {
    position: relative;
    display: inline-block;
  }

  .ta-megamenu-trigger {
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
  .ta-megamenu-trigger::-webkit-details-marker { display: none; }
  .ta-megamenu-trigger::marker { content: ""; }
  @media (pointer: coarse) {
    .ta-megamenu-trigger { min-height: 2.75rem; }
    .ta-megamenu-foot { min-height: 2.75rem; }
  }
  .ta-megamenu-trigger:hover { background: rgb(var(--ta-elevated) / 0.6); }
  .ta-megamenu-trigger:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-megamenu[open] > .ta-megamenu-trigger { background: rgb(var(--ta-elevated)); }
  .ta-megamenu :global(.ta-megamenu-chevron) { opacity: 0.7; transition: transform 0.15s; }
  .ta-megamenu[open] :global(.ta-megamenu-chevron) { transform: rotate(180deg); }

  .ta-megamenu-panel {
    position: absolute;
    top: calc(100% + 0.375rem);
    z-index: 50;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: max-content;
    max-width: min(calc(100vw - 1rem), 62rem);
    padding: 0.75rem;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.55);
  }
  .ta-megamenu-panel--start { left: 0; }
  .ta-megamenu-panel--end { right: 0; }

  .ta-megamenu-groups {
    display: grid;
    grid-template-columns: repeat(var(--ta-megamenu-columns, 1), minmax(13rem, 1fr));
    gap: 0.75rem 1rem;
  }
  /* Bento: the featured tile fills the first column track, the groups the rest */
  .ta-megamenu-panel--bento {
    display: grid;
    grid-template-columns: minmax(16rem, 22rem) 1fr;
    align-items: stretch;
  }
  .ta-megamenu-panel--bento .ta-megamenu-foot {
    grid-column: 1 / -1;
  }

  .ta-megamenu-featured {
    position: relative;
    display: flex;
    align-items: flex-end;
    min-height: 15rem;
    overflow: hidden;
    border-radius: var(--ta-radius);
    border: 1px solid rgb(var(--ta-border));
    isolation: isolate;
  }
  .ta-megamenu-featured-art {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
    z-index: -2;
  }
  .ta-megamenu-featured:hover .ta-megamenu-featured-art { transform: scale(1.04); }
  .ta-megamenu-featured-halo {
    position: absolute;
    inset: 0;
    z-index: -2;
    background: radial-gradient(ellipse 90% 70% at 50% 35%, rgb(var(--ta-accent) / 0.25), transparent 72%);
  }
  .ta-megamenu-featured-veil {
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.15) 60%, transparent);
  }
  .ta-megamenu-featured-body {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1rem;
  }
  .ta-megamenu-featured-title {
    font-weight: 700;
    font-size: 1.05rem;
    color: #fff;
    text-shadow: 0 2px 10px rgb(0 0 0 / 0.6);
  }
  .ta-megamenu-featured-description {
    font-size: 0.8rem;
    color: rgb(255 255 255 / 0.72);
  }
  .ta-megamenu-featured-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    margin-top: 0.35rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: rgb(var(--ta-accent));
  }

  .ta-megamenu-title {
    padding: 0.25rem 0.625rem;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: rgb(var(--ta-muted));
  }
  .ta-megamenu-group ul {
    display: flex;
    flex-direction: column;
    gap: 1px;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .ta-megamenu-link {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    padding: 0.45rem 0.625rem;
    border-radius: var(--ta-radius);
    color: rgb(var(--ta-text));
    text-decoration: none;
  }
  a.ta-megamenu-link:hover { background: rgb(var(--ta-elevated)); }
  a.ta-megamenu-link:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: -2px; }
  .ta-megamenu-link--soon { opacity: 0.55; }

  .ta-megamenu-icon {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    flex-shrink: 0;
    border-radius: var(--ta-radius);
    background: rgb(var(--ta-elevated));
    color: rgb(var(--ta-muted));
    overflow: hidden;
  }
  .ta-megamenu-icon :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .ta-megamenu-text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .ta-megamenu-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ta-megamenu-tag {
    flex-shrink: 0;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    background: rgb(var(--ta-elevated));
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: rgb(var(--ta-muted));
  }
  .ta-megamenu-tag--badge {
    background: rgb(var(--ta-accent) / 0.15);
    color: rgb(var(--ta-accent));
  }
  .ta-megamenu-description {
    font-size: 0.75rem;
    color: rgb(var(--ta-muted));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .ta-megamenu-foot {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    padding: 0.55rem;
    border-top: 1px solid rgb(var(--ta-border));
    font-size: 0.85rem;
    font-weight: 600;
    color: rgb(var(--ta-accent));
    border-radius: 0 0 var(--ta-radius) var(--ta-radius);
  }
  .ta-megamenu-foot:hover { background: rgb(var(--ta-elevated) / 0.5); }

  /* Narrow screens: the panel goes full-width and the tile stacks on top */
  @media (max-width: 640px) {
    .ta-megamenu-panel {
      position: fixed;
      left: 0.5rem;
      right: 0.5rem;
      top: auto;
      width: auto;
      max-width: none;
      max-height: 70vh;
      overflow-y: auto;
    }
    .ta-megamenu-panel--bento {
      grid-template-columns: 1fr;
    }
    .ta-megamenu-featured { min-height: 9rem; }
    .ta-megamenu-groups { grid-template-columns: 1fr; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-megamenu-featured-art { transition: none; }
  }
</style>
