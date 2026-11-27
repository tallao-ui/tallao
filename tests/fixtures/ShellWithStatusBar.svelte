<!-- AppShell with a StatusBar in its footer. -->
<script lang="ts">
  import { AppShell, StatusBar } from "$lib/components";
</script>

<AppShell height="20rem">
  <p>Content</p>
  {#snippet footer()}
    <StatusBar items={[{ id: "api", label: "API", status: "ok" }]} />
  {/snippet}
</AppShell>
