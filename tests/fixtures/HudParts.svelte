<script lang="ts">
  import { Card, ShortcutList, SyncStatus } from "$lib/components";

  let {
    status = "ready",
    updatedAt = null,
    live = false,
    onRefresh,
  }: {
    status?: "loading" | "syncing" | "ready" | "error";
    updatedAt?: number | Date | null;
    live?: boolean | string;
    onRefresh?: () => unknown;
  } = $props();
</script>

<SyncStatus {status} {updatedAt} {live} {onRefresh} refreshKey="R" data-testid="sync" />
<ShortcutList
  shortcuts={[
    { keys: ["R"], label: "Refresh" },
    { keys: ["Mod", "S"], label: "Save draft" },
    { keys: ["J", "K"], label: "Next / previous row", alternatives: true, group: "Rows" },
    { keys: ["Enter"], label: "Open the row", group: "Rows" },
  ]}
/>
<Card tone="live"><p>On air</p></Card>
<Card><p>Plain</p></Card>
