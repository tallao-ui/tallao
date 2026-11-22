<!-- layout: stack -->
<script lang="ts">
  import { ToolChips, type ToolChipCall } from "tallao";

  const calls: ToolChipCall[] = [
    { id: "1", verb: "Read", target: "posts/patch-1-2.md", icon: "file" },
    { id: "2", verb: "Search", target: "pick rate by patch", icon: "search", name: "query_stats", args: { metric: "pick_rate", patches: ["1.1", "1.2"] }, result: "42 rows" },
    { id: "3", verb: "Write", target: "tier-list/november.json", icon: "edit", added: 74, removed: 41 },
    { id: "4", verb: "Run", target: "pnpm test", icon: "terminal", status: "running" },
    { id: "5", verb: "Publish", target: "post #42", icon: "upload", status: "failed", name: "publish_post", args: { id: 42 }, result: "503 from the API" },
  ];
</script>

<ToolChips {calls} messages={2} />
