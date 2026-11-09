<!-- InputOTP and the DataTable filter row: used by the dom and SSR tests. -->
<script lang="ts">
  import { DataTable, InputOTP, type DataFilters } from "$lib/components";

  let {
    oncomplete,
    onFiltersChange,
    onPageChange,
    manual = false,
    initialFilters = {},
  }: {
    oncomplete?: (value: string) => void;
    onFiltersChange?: (filters: DataFilters) => void;
    onPageChange?: (page: number) => void;
    manual?: boolean;
    initialFilters?: DataFilters;
  } = $props();

  let code = $state("");
  let letters = $state("");
  // svelte-ignore state_referenced_locally
  let filters = $state<DataFilters>(initialFilters);
  let page = $state(1);

  const players = [
    { id: "p1", name: "Ángel", team: "Red", points: 40 },
    { id: "p2", name: "Bea", team: "Blue", points: 12 },
    { id: "p3", name: "Ciro", team: "Red", points: 25 },
    { id: "p4", name: "Dani", team: "Green", points: 8 },
    { id: "p5", name: "Eva", team: "Blue", points: 33 },
    { id: "p6", name: "Angela", team: "Green", points: 19 },
  ];
</script>

<form data-testid="form">
  <InputOTP bind:value={code} name="code" groupSize={3} {oncomplete} />
  <span data-testid="code">{code}</span>
  <InputOTP bind:value={letters} length={4} pattern="alphanumeric" label="Backup code" invalid />
</form>

<DataTable
  caption="Players"
  rows={players}
  rowKey="id"
  columns={[
    { key: "name", header: "Name", sortable: true, filter: "text" },
    { key: "team", header: "Team", filter: "select" },
    { key: "points", header: "Points", sortable: true, align: "right", filter: "range" },
  ]}
  pageSize={2}
  bind:filters
  bind:page
  {manual}
  total={manual ? 6 : undefined}
  {onFiltersChange}
  {onPageChange}
/>
<span data-testid="filters">{JSON.stringify(filters)}</span>
<span data-testid="table-page">{page}</span>

<DataTable
  caption="Custom"
  rows={players}
  rowKey="id"
  columns={[
    { key: "name", header: "Name" },
    {
      key: "points",
      header: "Points",
      filter: highOnly,
      filterFn: (row, value) => (value ? row.points >= 30 : true),
    },
  ]}
/>

{#snippet highOnly({ value, set, label }: { value: unknown; set: (v: unknown) => void; label: string })}
  <label><input type="checkbox" checked={!!value} aria-label={label} onchange={(e) => set(e.currentTarget.checked || null)} /> 30+</label>
{/snippet}
