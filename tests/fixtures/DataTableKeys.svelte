<!-- DataTable with row keys: links, selection, open and edit callbacks, a filter field, a button per row. -->
<script lang="ts">
  import { DataTable } from "$lib/components";

  let {
    keyboard = true,
    onRowOpen,
    onRowEdit,
    selected = $bindable([]),
  }: {
    keyboard?: boolean | "page";
    onRowOpen?: (row: { id: string; name: string }) => void;
    onRowEdit?: (row: { id: string; name: string }) => void;
    selected?: string[];
  } = $props();

  const rows = [
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
    { id: "c", name: "Gamma" },
  ];
</script>

<input aria-label="Search" data-testid="outside" />
<button type="button" data-testid="outside-button">New</button>
<DataTable
  {rows}
  rowKey="id"
  caption="People"
  columns={[{ key: "name", header: "Name", sortable: true, filter: "text" }]}
  selectable
  bind:selected
  rowHref={(row) => `#${row.id}`}
  {keyboard}
  {onRowOpen}
  {onRowEdit}
>
  {#snippet rowActions(row)}
    <button type="button" aria-label={`Actions: ${row.name}`}>⋯</button>
  {/snippet}
</DataTable>
