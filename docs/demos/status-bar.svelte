<!-- layout: wide -->
<script lang="ts">
  import { StatusBar } from "tallao";
</script>

<StatusBar
  items={[
    { id: "api", label: "API", status: "ok", live: true, href: "#api" },
    { id: "db", label: "Database", value: "1 ms", status: "ok" },
    { id: "queue", label: "Queue", value: "3 waiting", status: "warn" },
    { id: "sync", label: "Synced", value: "12:04" },
  ]}
>
  {#snippet end()}<span>production · 0.9.0</span>{/snippet}
</StatusBar>
