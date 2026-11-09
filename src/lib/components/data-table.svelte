<!--
  tallao — DataTable
  Data table built on Table: sortable columns, pagination, row selection with
  "select all" (with a partial state), loading and a visible empty row.

  The data can live in the browser (the table sorts and paginates) or in the API
  (`manual`: the table only reports through onSortChange / onPageChange and renders
  `rows` as they are, with `total` for the pages).

    <DataTable rows={contacts} rowKey="id" columns={[
      { key: "name", header: "Name", sortable: true, filter: "text" },
      { key: "team", header: "Team", filter: "select" },
      { key: "score", header: "Points", sortable: true, align: "right", filter: "range" },
    ]} pageSize={20} selectable bind:selected bind:filters>
      {#snippet cell(row, col)}{#if col.key === "name"}<a href={`/c/${row.id}`}>{row.name}</a>{:else}{row[col.key]}{/if}{/snippet}
    </DataTable>

  Accessible sorting: each sortable header is a button inside the <th>, which carries
  aria-sort; click: ascending → descending → unsorted.

  Column filters: a column with `filter` gets a control in a second header row.
  - "text": contains, ignoring case and accents (like Combobox);
  - "select": one of the column's values (or `filterOptions`), with an "All" option;
  - "range": numbers between a minimum and a maximum, both optional;
  - a snippet: your own control, given `{ column, value, set, label }`; it matches with
    `filterFn(row, value)` (without it, a snippet filter does not filter locally).
  The filters combine with AND, and with the sorting; a change from a control goes back
  to page 1. `bind:filters` holds the state ({ [key]: string | { min, max } | anything }),
  so a page can read it or keep it in the URL. With `manual` nothing is filtered here:
  `onFiltersChange` hands the state to whoever asks the API.
-->
<script lang="ts" module>
  import type { Snippet } from "svelte";

  export interface DataFilterControl<T = Record<string, unknown>> {
    column: DataColumn<T>;
    value: unknown;
    set: (value: unknown) => void;
    /** Accessible name for the control ("Filter Team"). */
    label: string;
  }

  export interface DataRange {
    min?: number | null;
    max?: number | null;
  }

  export type DataFilters = Record<string, unknown>;

  export interface DataColumn<T = Record<string, unknown>> {
    key: string;
    header: string;
    sortable?: boolean;
    align?: "left" | "center" | "right";
    /** CSS width of the column. */
    width?: string;
    /** Value to sort, filter and render by; `row[key]` by default. */
    value?: (row: T) => unknown;
    /** A filter control in the filter row. */
    filter?: "text" | "select" | "range" | Snippet<[DataFilterControl<T>]>;
    /** Options of a "select" filter; by default the distinct values of the column. */
    filterOptions?: (string | { value: string; label: string })[];
    /** Custom match (required for a snippet filter, optional for the others). */
    filterFn?: (row: T, value: unknown) => boolean;
  }

  export interface DataSort {
    key: string;
    direction: "asc" | "desc";
  }

  /** Whether a filter value filters anything: "" , null and an empty range do not. */
  export function isActiveFilter(value: unknown): boolean {
    if (value == null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "object" && ("min" in value || "max" in value)) {
      const range = value as DataRange;
      return range.min != null || range.max != null;
    }
    return true;
  }
</script>

<script lang="ts" generics="T extends Record<string, any>">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Button from "./button.svelte";
  import { normalizeText } from "./combobox.svelte";
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
    /** Name of the row for its checkbox and screen readers ("Select row: Ana"). */
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
    filters = $bindable({}),
    noMatchesText = L.noMatches,
    /** Accessible name of the table (goes in a hidden <caption>). */
    caption,
    class: className = "",
    cell,
    actions,
    onSortChange,
    onPageChange,
    onSelectionChange,
    onFiltersChange,
  }: {
    rows: T[];
    columns: DataColumn<T>[];
    /** Field or function that gives each row's unique key. */
    rowKey: keyof T | ((row: T) => string);
    rowLabel?: (row: T) => string;
    sort?: DataSort | null;
    page?: number;
    /** Rows per page; without it, there is no pagination. */
    pageSize?: number;
    /** With `manual`: how many rows the API has in total. */
    total?: number;
    manual?: boolean;
    selectable?: boolean;
    selected?: string[];
    loading?: boolean;
    emptyText?: string;
    /** Column filter values by column key (bindable). */
    filters?: DataFilters;
    /** Empty row when the filters leave no rows. */
    noMatchesText?: string;
    caption?: string;
    class?: string;
    /** Custom cell content; without it, the value as text. */
    cell?: Snippet<[T, DataColumn<T>]>;
    /** Last column with per-row actions. */
    actions?: Snippet<[T]>;
    onSortChange?: (sort: DataSort | null) => void;
    onPageChange?: (page: number) => void;
    onSelectionChange?: (selected: string[]) => void;
    /** A filter control changed (the whole state). With `manual`, send it to the API. */
    onFiltersChange?: (filters: DataFilters) => void;
  } = $props();

  const id = $props.id();
  const keyOf = (row: T) => (typeof rowKey === "function" ? rowKey(row) : String(row[rowKey]));
  const valueOf = (row: T, col: DataColumn<T>) => (col.value ? col.value(row) : row[col.key]);

  function compare(a: unknown, b: unknown) {
    if (a == null && b == null) return 0;
    if (a == null) return 1;
    if (b == null) return -1;
    if (typeof a === "number" && typeof b === "number") return a - b;
    if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
    return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: "base" });
  }

  // ——— Column filters ———
  const filterable = $derived(columns.filter((c) => c.filter));
  const anyActive = $derived(filterable.some((c) => isActiveFilter(filters[c.key])));

  function matches(row: T, col: DataColumn<T>, value: unknown): boolean {
    if (col.filterFn) return col.filterFn(row, value);
    const v = valueOf(row, col);
    if (col.filter === "text") return normalizeText(String(v ?? "")).includes(normalizeText(String(value)));
    if (col.filter === "select") return String(v ?? "") === String(value);
    if (col.filter === "range") {
      const { min, max } = value as DataRange;
      const n = typeof v === "number" ? v : Number(v);
      if (v == null || v === "" || Number.isNaN(n)) return false;
      return (min == null || n >= min) && (max == null || n <= max);
    }
    return true;
  }

  const filtered = $derived.by(() => {
    if (manual) return rows;
    const active = filterable.filter((c) => isActiveFilter(filters[c.key]));
    if (active.length === 0) return rows;
    return rows.filter((row) => active.every((c) => matches(row, c, filters[c.key])));
  });

  function setFilter(key: string, value: unknown) {
    const next = { ...filters };
    if (isActiveFilter(value)) next[key] = value;
    else delete next[key];
    filters = next;
    onFiltersChange?.(next);
    if (page !== 1) {
      page = 1;
      onPageChange?.(1);
    }
  }

  /** Empties every column filter (also the "Clear filters" button). */
  export function clearFilters() {
    filters = {};
    onFiltersChange?.({});
    if (page !== 1) {
      page = 1;
      onPageChange?.(1);
    }
  }

  type FilterOption = { value: string; label: string };
  function optionsOf(col: DataColumn<T>): FilterOption[] {
    if (col.filterOptions)
      return col.filterOptions.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
    const seen = new Set<string>();
    for (const row of rows) {
      const v = valueOf(row, col);
      if (v != null && v !== "") seen.add(String(v));
    }
    return [...seen]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }))
      .map((v) => ({ value: v, label: v }));
  }

  const filterLabel = (col: DataColumn<T>) => L.filterColumn.replace("{column}", col.header);
  const rangeOf = (col: DataColumn<T>) => (filters[col.key] ?? {}) as DataRange;
  const toNumber = (text: string) => (text.trim() === "" || Number.isNaN(Number(text)) ? null : Number(text));

  const sorted = $derived.by(() => {
    if (manual || !sort) return filtered;
    const col = columns.find((c) => c.key === sort!.key);
    if (!col) return filtered;
    const sign = sort.direction === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => sign * compare(valueOf(a, col), valueOf(b, col)));
  });

  const pageCount = $derived(
    pageSize ? Math.max(1, Math.ceil((manual ? (total ?? rows.length) : filtered.length) / pageSize)) : 1
  );
  const visible = $derived(
    !pageSize || manual ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize)
  );

  // If the data shrinks, the page does not stay out of range.
  $effect(() => {
    if (page > pageCount) page = pageCount;
  });

  function toggleSort(col: DataColumn<T>) {
    const next: DataSort | null =
      sort?.key !== col.key
        ? { key: col.key, direction: "asc" }
        : sort.direction === "asc"
          ? { key: col.key, direction: "desc" }
          : null;
    sort = next;
    onSortChange?.(next);
  }

  const ariaSort = (col: DataColumn<T>) =>
    sort?.key === col.key ? (sort.direction === "asc" ? "ascending" : "descending") : "none";

  // Selection: "all" refers to what is visible (the current page).
  const visibleKeys = $derived(visible.map(keyOf));
  const checkedVisible = $derived(visibleKeys.filter((k) => selected.includes(k)).length);
  const allChecked = $derived(visibleKeys.length > 0 && checkedVisible === visibleKeys.length);
  const partial = $derived(checkedVisible > 0 && !allChecked);

  function setSelected(next: string[]) {
    selected = next;
    onSelectionChange?.(next);
  }

  function toggleAll() {
    setSelected(allChecked ? selected.filter((k) => !visibleKeys.includes(k)) : [...new Set([...selected, ...visibleKeys])]);
  }

  function toggle(k: string) {
    setSelected(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  }

  const totalColumns = $derived(columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0));
  const styleOf = (col: DataColumn<T>) =>
    [col.width ? `width: ${col.width}` : "", col.align ? `text-align: ${col.align}` : ""].filter(Boolean).join("; ") || undefined;
</script>

<div class={cn("ta-datatable", className)} aria-busy={loading || undefined}>
  <Table>
    {#if caption}<caption class="ta-hidden">{caption}</caption>{/if}
    <TableHeader>
      <TableRow>
        {#if selectable}
          <TableHead class="ta-datatable-check">
            <input
              type="checkbox"
              class="ta-datatable-checkbox"
              aria-label={L.selectAll}
              checked={allChecked}
              disabled={visibleKeys.length === 0}
              {@attach (el: HTMLInputElement) => {
                el.indeterminate = partial;
              }}
              onchange={toggleAll}
            />
          </TableHead>
        {/if}
        {#each columns as col (col.key)}
          <TableHead aria-sort={col.sortable ? ariaSort(col) : undefined} style={styleOf(col)}>
            {#if col.sortable}
              <button type="button" class="ta-datatable-sort" onclick={() => toggleSort(col)}>
                {col.header}
                <span class="ta-datatable-arrow" aria-hidden="true">
                  {sort?.key === col.key ? (sort.direction === "asc" ? "▲" : "▼") : "↕"}
                </span>
              </button>
            {:else}
              {col.header}
            {/if}
          </TableHead>
        {/each}
        {#if actions}<TableHead><span class="ta-hidden">{L.actions}</span></TableHead>{/if}
      </TableRow>
      {#if filterable.length}
        <TableRow class="ta-datatable-filters">
          {#if selectable}<TableCell></TableCell>{/if}
          {#each columns as col (col.key)}
            {@const custom = typeof col.filter === "function" ? col.filter : null}
            <TableCell class="ta-datatable-filter">
              {#if custom}
                {@render custom({ column: col, value: filters[col.key], set: (v) => setFilter(col.key, v), label: filterLabel(col) })}
              {:else if col.filter === "text"}
                <input
                  type="search"
                  class="ta-datatable-field"
                  aria-label={filterLabel(col)}
                  value={typeof filters[col.key] === "string" ? (filters[col.key] as string) : ""}
                  oninput={(e) => setFilter(col.key, e.currentTarget.value)}
                />
              {:else if col.filter === "select"}
                <select
                  class="ta-datatable-field"
                  aria-label={filterLabel(col)}
                  value={filters[col.key] == null ? "" : String(filters[col.key])}
                  onchange={(e) => setFilter(col.key, e.currentTarget.value)}
                >
                  <option value="">{L.allValues}</option>
                  {#each optionsOf(col) as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
                </select>
              {:else if col.filter === "range"}
                <div class="ta-datatable-range">
                  <input
                    type="number"
                    inputmode="decimal"
                    class="ta-datatable-field"
                    aria-label={`${filterLabel(col)}: ${L.minimum}`}
                    placeholder={L.minimum}
                    value={rangeOf(col).min ?? ""}
                    oninput={(e) => setFilter(col.key, { ...rangeOf(col), min: toNumber(e.currentTarget.value) })}
                  />
                  <input
                    type="number"
                    inputmode="decimal"
                    class="ta-datatable-field"
                    aria-label={`${filterLabel(col)}: ${L.maximum}`}
                    placeholder={L.maximum}
                    value={rangeOf(col).max ?? ""}
                    oninput={(e) => setFilter(col.key, { ...rangeOf(col), max: toNumber(e.currentTarget.value) })}
                  />
                </div>
              {/if}
            </TableCell>
          {/each}
          {#if actions}<TableCell></TableCell>{/if}
        </TableRow>
      {/if}
    </TableHeader>
    <TableBody>
      {#if loading && visible.length === 0}
        {#each Array.from({ length: Math.min(pageSize ?? 5, 5) }) as _, i (i)}
          <TableRow>
            <TableCell colspan={totalColumns}><Skeleton height="1rem" /></TableCell>
          </TableRow>
        {/each}
      {:else}
        {#each visible as row (keyOf(row))}
          {@const k = keyOf(row)}
          <TableRow data-selected={selected.includes(k) || undefined}>
            {#if selectable}
              <TableCell class="ta-datatable-check">
                <input
                  type="checkbox"
                  class="ta-datatable-checkbox"
                  aria-label={`${L.selectRow}: ${rowLabel ? rowLabel(row) : k}`}
                  checked={selected.includes(k)}
                  onchange={() => toggle(k)}
                />
              </TableCell>
            {/if}
            {#each columns as col (col.key)}
              <TableCell style={col.align ? `text-align: ${col.align}` : undefined}>
                {#if cell}{@render cell(row, col)}{:else}{valueOf(row, col) ?? "—"}{/if}
              </TableCell>
            {/each}
            {#if actions}<TableCell class="ta-datatable-actions">{@render actions(row)}</TableCell>{/if}
          </TableRow>
        {:else}
          <TableRow>
            <TableCell colspan={totalColumns}><span class="ta-datatable-empty">{anyActive ? noMatchesText : emptyText}</span></TableCell>
          </TableRow>
        {/each}
      {/if}
    </TableBody>
  </Table>

  {#if (pageSize && pageCount > 1) || anyActive}
    <div class="ta-datatable-footer">
      {#if anyActive}
        <Button variant="ghost" size="sm" class="ta-datatable-clear" onclick={clearFilters}>{L.clearFilters}</Button>
      {/if}
      {#if pageSize && pageCount > 1}
        <Pagination bind:page {pageCount} onchange={(p) => onPageChange?.(p)} ariaLabel={caption ? `${L.pagination}: ${caption}` : undefined} />
      {/if}
    </div>
  {/if}
  <span class="ta-hidden" aria-live="polite" id={`${id}-status`}>{loading ? L.loading : ""}</span>
</div>

<style>
  .ta-datatable { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }

  .ta-datatable :global(.ta-datatable-check) { width: 2.5rem; }

  .ta-datatable-checkbox {
    width: 1rem;
    height: 1rem;
    margin: 0;
    accent-color: rgb(var(--ta-accent));
    cursor: pointer;
  }
  .ta-datatable-checkbox:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

  .ta-datatable-sort {
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
  .ta-datatable-sort:hover { color: rgb(var(--ta-text)); }
  .ta-datatable-sort:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; border-radius: var(--ta-radius-sm); }

  .ta-datatable-arrow { font-size: 0.625rem; opacity: 0.7; }

  .ta-datatable :global(tr[data-selected]) { background: rgb(var(--ta-accent) / 0.08); }

  .ta-datatable :global(.ta-datatable-actions) { text-align: right; white-space: nowrap; }

  .ta-datatable-empty { color: rgb(var(--ta-text-dim)); }

  .ta-datatable-footer { display: flex; align-items: center; justify-content: flex-end; gap: 0.75rem; flex-wrap: wrap; }
  .ta-datatable-footer :global(.ta-datatable-clear) { margin-right: auto; }

  /* Filter row: the controls sit under their headers, on the header background. */
  .ta-datatable :global(.ta-datatable-filters td) {
    padding-top: 0.25rem;
    padding-bottom: 0.5rem;
    background: rgb(var(--ta-surface));
    vertical-align: top;
  }
  .ta-datatable-range { display: flex; gap: 0.25rem; }
  .ta-datatable-field {
    width: 100%;
    min-width: 4rem;
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    outline: none;
  }
  .ta-datatable-field::placeholder { color: rgb(var(--ta-text-dim)); }
  .ta-datatable-field:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  @media (pointer: coarse) {
    .ta-datatable-field { font-size: 1rem; min-height: 2.75rem; }
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
</style>
