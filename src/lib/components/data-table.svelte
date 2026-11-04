<!--
  tallao — DataTable
  Tabla de datos sobre Table: columnas que se ordenan, paginación, selección de
  filas con «seleccionar todo» (con estado parcial), carga y fila vacía visible.

  Los datos pueden estar en el navegador (ordena y pagina la tabla) o en la API
  (`manual`: la tabla solo avisa con onSortChange / onPageChange y pinta `rows`
  tal cual, con `total` para las páginas).

    <DataTable rows={contactos} rowKey="id" columns={[
      { key: "name", header: "Nombre", sortable: true },
      { key: "score", header: "Puntos", sortable: true, align: "right" },
    ]} pageSize={20} selectable bind:selected>
      {#snippet cell(row, col)}{#if col.key === "name"}<a href={`/c/${row.id}`}>{row.name}</a>{:else}{row[col.key]}{/if}{/snippet}
    </DataTable>

  Orden accesible: cada cabecera ordenable es un botón dentro del <th>, que lleva
  aria-sort; clic: ascendente → descendente → sin orden.
-->
<script lang="ts" module>
  export interface DataColumn<T = Record<string, unknown>> {
    key: string;
    header: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    /** Ancho CSS de la columna. */
    width?: string;
    /** Valor para ordenar y pintar; por defecto `row[key]`. */
    value?: (row: T) => unknown;
  }

  export interface DataSort {
    key: string;
    direction: "asc" | "desc";
  }
</script>

<script lang="ts" generics="T extends Record<string, any>">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Pagination from "./pagination.svelte";
  import Skeleton from "./skeleton.svelte";
  import Table from "./table.svelte";
  import TableBody from "./table-body.svelte";
  import TableCell from "./table-cell.svelte";
  import TableHead from "./table-head.svelte";
  import TableHeader from "./table-header.svelte";
  import TableRow from "./table-row.svelte";

  const L = useLabels();
  let {
    rows,
    columns,
    rowKey,
    /** Nombre de la fila para su casilla y lectores («Seleccionar fila: Ana»). */
    rowLabel,
    sort = $bindable(null),
    page = $bindable(1),
    pageSize,
    total,
    manual = false,
    selectable = false,
    selected = $bindable([]),
    loading = false,
    emptyText = L.noResults,
    /** Nombre accesible de la tabla (va en un <caption> oculto). */
    caption,
    class: className = "",
    cell,
    actions,
    onSortChange,
    onPageChange,
    onSelectionChange,
  }: {
    rows: T[];
    columns: DataColumn<T>[];
    /** Campo o función que da la clave única de cada fila. */
    rowKey: keyof T | ((row: T) => string);
    rowLabel?: (row: T) => string;
    sort?: DataSort | null;
    page?: number;
    /** Filas por página; sin él, no hay paginación. */
    pageSize?: number;
    /** Con `manual`: cuántas filas hay en total en la API. */
    total?: number;
    manual?: boolean;
    selectable?: boolean;
    selected?: string[];
    loading?: boolean;
    emptyText?: string;
    caption?: string;
    class?: string;
    /** Contenido propio de una celda; sin él, el valor como texto. */
    cell?: Snippet<[T, DataColumn<T>]>;
    /** Última columna con acciones por fila. */
    actions?: Snippet<[T]>;
    onSortChange?: (sort: DataSort | null) => void;
    onPageChange?: (page: number) => void;
    onSelectionChange?: (selected: string[]) => void;
  } = $props();

  const id = $props.id();
  const claveDe = (row: T) => (typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]));
  const valorDe = (row: T, col: DataColumn<T>) => (col.value ? col.value(row) : row[col.key]);

  function comparar(a: unknown, b: unknown) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
  }

  const ordenadas = $derived.by(() => {
    if (manual || !sort) return rows;
    const col = columns.find((c) => c.key === sort!.key);
    if (!col) return rows;
    const signo = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => signo * comparar(valorDe(a, col), valorDe(b, col)));
  });

  const paginas = $derived(
    pageSize ? Math.max(1, Math.ceil((manual ? (total ?? rows.length) : rows.length) / pageSize)) : 1
  );
  const visibles = $derived(
    !pageSize || manual ? ordenadas : ordenadas.slice((page - 1) * pageSize, page * pageSize)
  );

  // Si los datos encogen, la página no se queda fuera del rango.
  $effect(() => {
    if (page > paginas) page = paginas;
  });

  function ordenar(col: DataColumn<T>) {
    const siguiente: DataSort | null =
      sort?.key !== col.key
        ? { key: col.key, direction: "asc" }
        : sort.direction === "asc"
          ? { key: col.key, direction: "desc" }
          : null;
    sort = siguiente;
    onSortChange?.(siguiente);
  }

  const ariaSort = (col: DataColumn<T>) =>
    sort?.key === col.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  // Selección: «todo» se refiere a lo que se ve (la página actual).
  const clavesVisibles = $derived(visibles.map(claveDe));
  const marcadasVisibles = $derived(clavesVisibles.filter((k) => selected.includes(k)).length);
  const todas = $derived(clavesVisibles.length > 0 && marcadasVisibles === clavesVisibles.length);
  const parcial = $derived(marcadasVisibles > 0 && !todas);

  function poner(nuevas: string[]) {
    selected = nuevas;
    onSelectionChange?.(nuevas);
  }

  function alternarTodas() {
    poner(todas ? selected.filter((k) => !clavesVisibles.includes(k)) : [...new Set([...selected, ...clavesVisibles])]);
  }

  function alternar(k: string) {
    poner(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  }

  const columnasTotales = $derived(columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0));
  const estilo = (col: DataColumn<T>) =>
    [col.width ? `width: ${col.width}` : "", col.align ? `text-align: ${col.align}` : ""].filter(Boolean).join("; ") || undefined;
</script>

<div class={cn("ta-datatable", className)} aria-busy={loading || undefined}>
  <Table>
    {#if caption}<caption class="ta-oculto">{caption}</caption>{/if}
    <TableHeader>
      <TableRow>
        {#if selectable}
          <TableHead class="ta-datatable-check">
            <input
              type="checkbox"
              class="ta-datatable-casilla"
              aria-label={L.selectAll}
              checked={todas}
              disabled={clavesVisibles.length === 0}
              {@attach (el: HTMLInputElement) => {
                el.indeterminate = parcial;
              }}
              onchange={alternarTodas}
            />
          </TableHead>
        {/if}
        {#each columns as col (col.key)}
          <TableHead aria-sort={col.sortable ? ariaSort(col) : undefined} style={estilo(col)}>
            {#if col.sortable}
              <button type="button" class="ta-datatable-orden" onclick={() => ordenar(col)}>
                {col.header}
                <span class="ta-datatable-flecha" aria-hidden="true">
                  {sort?.key === col.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                </span>
              </button>
            {:else}
              {col.header}
            {/if}
          </TableHead>
        {/each}
        {#if actions}<TableHead><span class="ta-oculto">{L.actions}</span></TableHead>{/if}
      </TableRow>
    </TableHeader>
    <TableBody>
      {#if loading && visibles.length === 0}
        {#each Array.from({ length: Math.min(pageSize ?? 5, 5) }) as _, i (i)}
          <TableRow>
            <TableCell colspan={columnasTotales}><Skeleton height="1rem" /></TableCell>
          </TableRow>
        {/each}
      {:else}
        {#each visibles as row (claveDe(row))}
          {@const k = claveDe(row)}
          <TableRow data-selected={selected.includes(k) || undefined}>
            {#if selectable}
              <TableCell class="ta-datatable-check">
                <input
                  type="checkbox"
                  class="ta-datatable-casilla"
                  aria-label={`${L.selectRow}: ${rowLabel ? rowLabel(row) : k}`}
                  checked={selected.includes(k)}
                  onchange={() => alternar(k)}
                />
              </TableCell>
            {/if}
            {#each columns as col (col.key)}
              <TableCell style={col.align ? `text-align: ${col.align}` : undefined}>
                {#if cell}{@render cell(row, col)}{:else}{valorDe(row, col) ?? "—"}{/if}
              </TableCell>
            {/each}
            {#if actions}<TableCell class="ta-datatable-acciones">{@render actions(row)}</TableCell>{/if}
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={columnasTotales}><span class="ta-datatable-vacio">{emptyText}</span></TableCell>
          </TableRow>
        {/each}
      {/if}
    </TableBody>
  </Table>

  {#if pageSize && paginas > 1}
    <div class="ta-datatable-pie">
      <Pagination bind:page pageCount={paginas} onchange={(p) => onPageChange?.(p)} ariaLabel={caption ? `${L.pagination}: ${caption}` : undefined} />
    </div>
  {/if}
  <span class="ta-oculto" aria-live="polite" id={`${id}-estado`}>{loading ? L.loading : ""}</span>
</div>

<style>
  .ta-datatable { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }

  .ta-datatable :global(.ta-datatable-check) { width: 2.5rem; }

  .ta-datatable-casilla {
    width: 1rem;
    height: 1rem;
    margin: 0;
    accent-color: rgb(var(--ta-accent));
    cursor: pointer;
  }
  .ta-datatable-casilla:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

  .ta-datatable-orden {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0;
    font: inherit;
    letter-spacing: inherit;
    text-transform: inherit;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
  }
  .ta-datatable-orden:hover { color: rgb(var(--ta-text)); }
  .ta-datatable-orden:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; border-radius: var(--ta-radius-sm); }

  .ta-datatable-flecha { font-size: 0.625rem; opacity: 0.7; }

  .ta-datatable :global(tr[data-selected]) { background: rgb(var(--ta-accent) / 0.08); }

  .ta-datatable :global(.ta-datatable-acciones) { text-align: right; white-space: nowrap; }

  .ta-datatable-vacio { color: rgb(var(--ta-text-dim)); }

  .ta-datatable-pie { display: flex; justify-content: flex-end; }

  .ta-oculto {
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
</style>
