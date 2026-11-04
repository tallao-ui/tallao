<!--
  tallao — Sidebar
  Navegación lateral de un panel: grupos con título, enlaces con icono e insignia,
  y entradas con hijos que se despliegan (botón con aria-expanded). La página
  actual (`current`, un href o un id) lleva aria-current="page", y su rama se abre
  sola. `collapsed` deja solo los iconos: los nombres siguen ahí para los lectores
  de pantalla y como `title`.
-->
<script lang="ts" module>
  import type { IconName } from "./icon.svelte";

  export interface SidebarItem {
    id: string;
    label: string;
    href?: string;
    icon?: IconName;
    badge?: string | number;
    children?: SidebarItem[];
    onclick?: () => void;
  }

  export interface SidebarGroup {
    label?: string;
    items: SidebarItem[];
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();
  let {
    groups,
    current,
    collapsed = $bindable(false),
    ariaLabel = L.navigation,
    collapseLabel = L.collapse,
    expandLabel = L.expand,
    /** Muestra el botón para plegar la barra. */
    collapsible = true,
    class: className = "",
    header,
    footer,
  }: {
    groups: SidebarGroup[];
    current?: string;
    collapsed?: boolean;
    ariaLabel?: string;
    collapseLabel?: string;
    expandLabel?: string;
    collapsible?: boolean;
    class?: string;
    header?: import("svelte").Snippet;
    footer?: import("svelte").Snippet;
  } = $props();

  const id = $props.id();
  const esActual = (it: SidebarItem) => current != null && (it.href === current || it.id === current);
  const contieneActual = (it: SidebarItem): boolean => esActual(it) || !!it.children?.some(contieneActual);

  let abiertos = $state<Record<string, boolean>>({});
  // La rama de la página actual se abre al llegar a ella (y no se cierra sola después).
  $effect(() => {
    void current;
    untrack(() => {
      for (const g of groups) for (const it of g.items) if (it.children && contieneActual(it)) abiertos[it.id] = true;
    });
  });
</script>

<nav class={cn("ta-sidebar", collapsed && "ta-sidebar--plegada", className)} aria-label={ariaLabel}>
  {#if header || collapsible}
    <div class="ta-sidebar-cabecera">
      {#if header && !collapsed}<div class="ta-sidebar-marca">{@render header()}</div>{/if}
      {#if collapsible}
        <button
          type="button"
          class="ta-sidebar-plegar"
          aria-label={collapsed ? expandLabel : collapseLabel}
          aria-expanded={!collapsed}
          onclick={() => (collapsed = !collapsed)}
        >
          <Icon name={collapsed ? "chevron-right" : "chevron-left"} />
        </button>
      {/if}
    </div>
  {/if}

  {#snippet entrada(it: SidebarItem, nivel: number)}
    {#if it.children?.length && !collapsed}
      <button
        type="button"
        class="ta-sidebar-item"
        style:--ta-sidebar-nivel={nivel}
        aria-expanded={!!abiertos[it.id]}
        aria-controls={`${id}-${it.id}`}
        onclick={() => (abiertos[it.id] = !abiertos[it.id])}
      >
        {#if it.icon}<Icon name={it.icon} />{/if}
        <span class="ta-sidebar-texto">{it.label}</span>
        <Icon name={abiertos[it.id] ? "chevron-down" : "chevron-right"} class="ta-sidebar-flecha" />
      </button>
      {#if abiertos[it.id]}
        <ul id={`${id}-${it.id}`}>
          {#each it.children as hijo (hijo.id)}<li>{@render entrada(hijo, nivel + 1)}</li>{/each}
        </ul>
      {/if}
    {:else if it.href}
      <a
        href={it.href}
        class="ta-sidebar-item"
        style:--ta-sidebar-nivel={nivel}
        aria-current={esActual(it) ? "page" : undefined}
        title={collapsed ? it.label : undefined}
        onclick={it.onclick}
      >
        {#if it.icon}<Icon name={it.icon} />{/if}
        <span class="ta-sidebar-texto">{it.label}</span>
        {#if it.badge != null}<span class="ta-sidebar-insignia">{it.badge}</span>{/if}
      </a>
    {:else}
      <button
        type="button"
        class="ta-sidebar-item"
        style:--ta-sidebar-nivel={nivel}
        aria-current={esActual(it) ? "page" : undefined}
        title={collapsed ? it.label : undefined}
        onclick={it.onclick}
      >
        {#if it.icon}<Icon name={it.icon} />{/if}
        <span class="ta-sidebar-texto">{it.label}</span>
        {#if it.badge != null}<span class="ta-sidebar-insignia">{it.badge}</span>{/if}
      </button>
    {/if}
  {/snippet}

  <div class="ta-sidebar-cuerpo">
    {#each groups as g, gi (gi)}
      <div class="ta-sidebar-grupo">
        {#if g.label}<div class="ta-sidebar-titulo" id={`${id}-g${gi}`}>{g.label}</div>{/if}
        <ul aria-labelledby={g.label ? `${id}-g${gi}` : undefined}>
          {#each g.items as it (it.id)}<li>{@render entrada(it, 0)}</li>{/each}
        </ul>
      </div>
    {/each}
  </div>

  {#if footer}<div class="ta-sidebar-pie">{@render footer()}</div>{/if}
</nav>

<style>
  .ta-sidebar {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 15rem;
    height: 100%;
    padding: 0.5rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface) / 0.5);
    border-right: 1px solid rgb(var(--ta-border));
    transition: width 0.15s;
  }
  .ta-sidebar--plegada { width: 3.25rem; }

  .ta-sidebar-cabecera { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; min-height: 2rem; }
  .ta-sidebar-marca { min-width: 0; font-weight: 600; }
  .ta-sidebar-plegar {
    display: flex;
    padding: 0.375rem;
    margin-left: auto;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-sidebar-plegar:hover { color: rgb(var(--ta-text)); background: rgb(var(--ta-elevated)); }

  .ta-sidebar-cuerpo { flex: 1; min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }

  .ta-sidebar ul { display: flex; flex-direction: column; gap: 1px; margin: 0; padding: 0; list-style: none; }

  .ta-sidebar-titulo {
    margin: 0 0 0.25rem;
    padding: 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }
  .ta-sidebar--plegada .ta-sidebar-titulo,
  .ta-sidebar--plegada .ta-sidebar-texto,
  .ta-sidebar--plegada .ta-sidebar-insignia {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .ta-sidebar-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.5rem 0.4rem calc(0.5rem + var(--ta-sidebar-nivel, 0) * 1rem);
    font: inherit;
    font-size: 0.875rem;
    text-align: left;
    text-decoration: none;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius);
    cursor: pointer;
  }
  .ta-sidebar-item:hover { color: rgb(var(--ta-text)); background: rgb(var(--ta-elevated) / 0.6); }
  .ta-sidebar-item:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: -2px; }
  .ta-sidebar-item[aria-current="page"] { color: rgb(var(--ta-text)); background: rgb(var(--ta-accent) / 0.15); font-weight: 500; }
  .ta-sidebar--plegada .ta-sidebar-item { justify-content: center; padding: 0.5rem; }

  .ta-sidebar-texto { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ta-sidebar-insignia {
    padding: 0 0.4rem;
    font-size: 0.6875rem;
    line-height: 1.25rem;
    border-radius: 9999px;
    background: rgb(var(--ta-elevated));
  }
  .ta-sidebar :global(.ta-sidebar-flecha) { opacity: 0.6; }

  .ta-sidebar-pie { border-top: 1px solid rgb(var(--ta-border)); padding-top: 0.5rem; }

  @media (prefers-reduced-motion: reduce) {
    .ta-sidebar { transition: none; }
  }
</style>
