<!-- layout: wide; height: 16 -->
<script lang="ts">
  import { FilterBar, FilterChip, filtersToQuery, type FilterDef, type FilterValues } from "tallao";

  const filters: FilterDef[] = [
    { key: "status", label: "Status", type: "select", options: ["Draft", "In review", "Published"] },
    { key: "featured", label: "Featured", type: "boolean" },
    { key: "author", label: "Author", type: "text", placeholder: "Name contains…", hidden: true },
    { key: "since", label: "Updated since", type: "date", hidden: true },
  ];
  let value = $state<FilterValues>({ status: "Published" });
  let team = $state<string | boolean | null>(null);
</script>

<div style="display: flex; flex-direction: column; gap: 1rem">
  <FilterBar {filters} bind:value searchPlaceholder="Search posts…" />
  <code style="font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">?{filtersToQuery(value)}</code>

  <div style="display: flex; align-items: center; gap: 0.5rem">
    <span style="font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">A chip on its own:</span>
    <FilterChip label="Team" type="select" options={["Content", "Design", "Support"]} bind:value={team} />
  </div>
</div>
