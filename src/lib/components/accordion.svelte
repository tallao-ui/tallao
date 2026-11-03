<!--
  tallao — Accordion
  Secciones plegables sobre <details>/<summary> nativos: teclado, lector de
  pantalla, búsqueda del navegador (Ctrl+F abre la sección que contiene el
  texto) y SSR sin JavaScript. Con `single`, abrir una cierra las demás
  (atributo `name` compartido, «exclusive accordion» del navegador).

    <Accordion single items={[{ id: "a", title: "¿Qué es?", content: texto }]} />
  o con contenido propio:
    <Accordion items={items}>{#snippet item(it)}…{/snippet}</Accordion>
-->
<script lang="ts" module>
  export interface AccordionItem {
    id: string;
    title: string;
    /** Texto de la sección; para contenido propio, el snippet `item`. */
    content?: string;
    open?: boolean;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  const {
    items,
    single = false,
    class: className = "",
    item,
  }: {
    items: AccordionItem[];
    single?: boolean;
    class?: string;
    item?: import("svelte").Snippet<[AccordionItem]>;
  } = $props();

  const id = $props.id();
</script>

<div class={cn("ta-accordion", className)}>
  {#each items as it (it.id)}
    <details
      class="ta-accordion-seccion"
      name={single ? `ta-accordion-${id}` : undefined}
      open={it.open}
      aria-disabled={it.disabled ? "true" : undefined}
      ontoggle={(e) => {
        // Una sección desactivada no se abre (details no tiene `disabled`).
        if (it.disabled && (e.currentTarget as HTMLDetailsElement).open) (e.currentTarget as HTMLDetailsElement).open = false;
      }}
    >
      <summary class="ta-accordion-titulo" tabindex={it.disabled ? -1 : undefined}>
        <span>{it.title}</span>
        <svg class="ta-accordion-flecha" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
      </summary>
      <div class="ta-accordion-contenido">
        {#if item}{@render item(it)}{:else}{it.content}{/if}
      </div>
    </details>
  {/each}
</div>

<style>
  .ta-accordion {
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
  }

  .ta-accordion-seccion + .ta-accordion-seccion {
    border-top: 1px solid rgb(var(--ta-border));
  }

  .ta-accordion-titulo {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(var(--ta-text));
    cursor: pointer;
    list-style: none;
  }
  .ta-accordion-titulo::-webkit-details-marker { display: none; }
  .ta-accordion-titulo:hover { background: rgb(var(--ta-elevated) / 0.4); }
  .ta-accordion-titulo:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: -2px; }

  .ta-accordion-flecha {
    flex-shrink: 0;
    color: rgb(var(--ta-text-dim));
    transition: transform 0.15s;
  }
  details[open] > .ta-accordion-titulo .ta-accordion-flecha { transform: rotate(180deg); }

  .ta-accordion-contenido {
    padding: 0 1rem 0.875rem;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
  }

  details[aria-disabled="true"] > .ta-accordion-titulo {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-accordion-flecha { transition: none; }
  }
</style>
