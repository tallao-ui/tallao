<!-- StatusBar with every kind of item: a link, a verdict, a live dot, a figure, a far end. -->
<script lang="ts">
  import { StatusBar } from "$lib/components";
</script>

<StatusBar
  data-testid="bar"
  items={[
    { id: "api", label: "API", status: "ok", live: true, href: "/health" },
    { id: "db", label: "Database", value: "1 ms", status: "ok" },
    { id: "queue", label: "Queue", value: "3 waiting", status: "warn", statusLabel: "Backing up" },
    { id: "cache", label: "Cache", status: "down", title: "Valkey does not answer" },
    { id: "sync", label: "Synced", value: "12:04" },
  ]}
>
  {#snippet end()}<span data-testid="env">production · 0.9.0</span>{/snippet}
</StatusBar>
