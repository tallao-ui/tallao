<!-- layout: stack -->
<script lang="ts">
  import { Tabs } from "tallao";

  let section = $state("members");
  let style = $state("overview");
</script>

<Tabs
  bind:value={section}
  ariaLabel="Project sections"
  items={[
    { id: "members", label: "Members", count: 4 },
    { id: "intakes", label: "Intakes", count: 2 },
    { id: "cost", label: "Cost" },
  ]}
>
  {#snippet children(id)}
    <p style="color: rgb(var(--ta-text-dim))">Showing the <strong>{id}</strong> panel.</p>
  {/snippet}
</Tabs>

<Tabs
  variant="pills"
  bind:value={style}
  ariaLabel="Report view"
  items={[{ id: "overview", label: "Overview" }, { id: "activity", label: "Activity" }, { id: "settings", label: "Settings" }]}
>
  {#snippet children(id)}
    <p style="color: rgb(var(--ta-text-dim))">Selected: {id}</p>
  {/snippet}
</Tabs>
