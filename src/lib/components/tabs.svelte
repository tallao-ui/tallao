<!--
  tallao — Tabs
  Pestañas accesibles (tablist/tab/tabpanel) con flechas, Inicio y Fin.
  El contenido lo pinta el padre: `children` recibe el id de la pestaña activa.
-->
<script lang="ts" module>
  export interface TabItem {
    id: string;
    label: string;
    /** Contador junto a la etiqueta (p. ej. pendientes). */
    count?: number;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    items,
    value = $bindable(items[0]?.id ?? ""),
    ariaLabel,
    class: className = "",
    onchange,
    children,
  }: {
    items: TabItem[];
    value?: string;
    ariaLabel?: string;
    class?: string;
    onchange?: (id: string) => void;
    children?: import("svelte").Snippet<[string]>;
  } = $props();

  // Varias pestañas en la misma página no deben chocar en sus ids.
  const prefijo = `ta-tabs-${Math.random().toString(36).slice(2, 8)}`;
  let lista: HTMLElement | undefined = $state();

  function elegir(id: string, enfocar = false) {
    if (id !== value) {
      value = id;
      onchange?.(id);
    }
    if (enfocar) lista?.querySelector<HTMLElement>(`[data-tab="${id}"]`)?.focus();
  }

  function tecla(e: KeyboardEvent) {
    const i = items.findIndex((t) => t.id === value);
    const destino =
      e.key === "ArrowRight" ? (i + 1) % items.length
      : e.key === "ArrowLeft" ? (i - 1 + items.length) % items.length
      : e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : -1;
    if (destino < 0) return;
    e.preventDefault();
    elegir(items[destino].id, true);
  }
</script>

<div class={cn("ta-tabs", className)}>
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div class="ta-tabs-lista" role="tablist" aria-label={ariaLabel} bind:this={lista} onkeydown={tecla}>
    {#each items as t (t.id)}
      <button
        type="button"
        role="tab"
        id={`${prefijo}-${t.id}`}
        data-tab={t.id}
        aria-selected={t.id === value}
        aria-controls={`${prefijo}-panel`}
        tabindex={t.id === value ? 0 : -1}
        class="ta-tab"
        onclick={() => elegir(t.id)}
      >
        {t.label}
        {#if t.count !== undefined}
          <span class="ta-tab-contador">{t.count}</span>
        {/if}
      </button>
    {/each}
  </div>
  <div
    class="ta-tabs-panel"
    role="tabpanel"
    id={`${prefijo}-panel`}
    aria-labelledby={`${prefijo}-${value}`}
    tabindex="-1"
  >
    {@render children?.(value)}
  </div>
</div>

<style>
  .ta-tabs-lista {
    display: flex;
    gap: 0.25rem;
    overflow-x: auto;
    overflow-y: hidden;
    /* Línea base como sombra interior y no como borde: así el subrayado de la
       pestaña activa la pisa sin margen negativo, que hacía salir una barra vertical. */
    box-shadow: inset 0 -1px 0 rgb(var(--ta-border));
  }

  .ta-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 0.85rem;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    cursor: pointer;
    transition: color 0.15s, border-color 0.15s;
  }

  .ta-tab:hover {
    color: rgb(var(--ta-text));
  }

  .ta-tab[aria-selected="true"] {
    color: rgb(var(--ta-text));
    border-bottom-color: rgb(var(--ta-accent));
  }

  .ta-tab:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px rgb(var(--ta-accent) / 0.6);
    border-radius: var(--ta-radius-sm);
  }

  .ta-tab-contador {
    min-width: 1.25rem;
    padding: 0 0.35rem;
    font-size: 0.6875rem;
    line-height: 1.25rem;
    text-align: center;
    border-radius: 9999px;
    background: rgb(var(--ta-accent) / 0.15);
    color: rgb(var(--ta-accent-hover));
  }

  .ta-tabs-panel {
    padding-top: 1rem;
    outline: none;
  }
</style>
