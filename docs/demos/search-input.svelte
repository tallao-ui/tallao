<!-- layout: stack -->
<script lang="ts">
  import { SearchInput } from "tallao";

  const runs = ["Nightly build", "Deploy 2.4", "Backfill users", "Rotate keys", "Deploy 2.5"];
  let query = $state("deploy");
  const hits = $derived(runs.filter((r) => r.toLowerCase().includes(query.trim().toLowerCase())));
</script>

<SearchInput bind:value={query} ariaLabel="Search runs" placeholder="Search runs" />
<p style="margin: 0; font-size: 0.8125rem; opacity: 0.7">
  {hits.length} of {runs.length}: {hits.join(", ") || "no matches"}
</p>
<SearchInput size="sm" ariaLabel="Search docs" placeholder="Small, press Escape to clear" />
