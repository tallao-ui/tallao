<!--
  tallao — Pagination
  Navegación entre páginas: Anterior, números (con «…» cuando hay muchas) y
  Siguiente, dentro de un <nav> con nombre. La página actual lleva
  aria-current="page". `page` empieza en 1. Da `pageCount`, o `total` y `pageSize`.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();
  let {
    page = $bindable(1),
    pageCount,
    total,
    pageSize = 20,
    /** Páginas que se ven a cada lado de la actual. */
    siblings = 1,
    ariaLabel = L.pagination,
    previousLabel = L.previous,
    nextLabel = L.next,
    pageLabel = (n: number) => `${L.page} ${n}`,
    class: className = "",
    onchange,
  }: {
    page?: number;
    pageCount?: number;
    total?: number;
    pageSize?: number;
    siblings?: number;
    ariaLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    pageLabel?: (n: number) => string;
    class?: string;
    onchange?: (page: number) => void;
  } = $props();

  const paginas = $derived(Math.max(1, pageCount ?? Math.ceil((total ?? 0) / Math.max(1, pageSize))));

  /** 1 … 4 5 [6] 7 8 … 20: los extremos siempre, la actual con sus vecinas, y huecos. */
  const tramo = $derived.by(() => {
    const n = paginas;
    const desde = Math.max(2, page - siblings);
    const hasta = Math.min(n - 1, page + siblings);
    const res: (number | "…")[] = [1];
    if (desde > 2) res.push("…");
    for (let i = desde; i <= hasta; i++) res.push(i);
    if (hasta < n - 1) res.push("…");
    if (n > 1) res.push(n);
    return res;
  });

  function ir(n: number) {
    const destino = Math.min(paginas, Math.max(1, n));
    if (destino === page) return;
    page = destino;
    onchange?.(destino);
  }
</script>

<nav class={cn("ta-pagination", className)} aria-label={ariaLabel}>
  <ul>
    <li>
      <button type="button" class="ta-pagination-boton" disabled={page <= 1} onclick={() => ir(page - 1)}>
        <span aria-hidden="true">‹</span> {previousLabel}
      </button>
    </li>
    {#each tramo as t, i (`${t}-${i}`)}
      <li>
        {#if t === "…"}
          <span class="ta-pagination-hueco" aria-hidden="true">…</span>
        {:else}
          <button
            type="button"
            class="ta-pagination-boton ta-pagination-numero"
            aria-label={pageLabel(t)}
            aria-current={t === page ? "page" : undefined}
            onclick={() => ir(t)}>{t}</button
          >
        {/if}
      </li>
    {/each}
    <li>
      <button type="button" class="ta-pagination-boton" disabled={page >= paginas} onclick={() => ir(page + 1)}>
        {nextLabel} <span aria-hidden="true">›</span>
      </button>
    </li>
  </ul>
</nav>

<style>
  .ta-pagination ul {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ta-pagination-boton {
    min-width: 2rem;
    padding: 0.3rem 0.6rem;
    font: inherit;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text));
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--ta-radius);
    cursor: pointer;
  }
  .ta-pagination-boton:hover:not(:disabled) { background: rgb(var(--ta-elevated)); }
  .ta-pagination-boton:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 1px; }
  .ta-pagination-boton:disabled { opacity: 0.45; cursor: not-allowed; }

  .ta-pagination-numero[aria-current="page"] {
    color: white;
    background: rgb(var(--ta-accent));
    border-color: rgb(var(--ta-accent));
  }

  .ta-pagination-hueco {
    padding: 0 0.25rem;
    color: rgb(var(--ta-text-dim));
  }
</style>
