<!-- layout: stack; height: 18 -->
<script lang="ts">
  import { Combobox } from "tallao";

  const tools = [
    { value: "read", label: "Read file" },
    { value: "write", label: "Write file" },
    { value: "bash", label: "Run shell command" },
    { value: "grep", label: "Search code" },
    { value: "web", label: "Fetch web page" },
    { value: "sql", label: "Query database" },
    { value: "deploy", label: "Deploy", disabled: true },
  ];
  let tool = $state<string | null>("grep");
  let allowed = $state<string[]>(["read", "grep"]);
</script>

<Combobox ariaLabel="Default tool" options={tools} bind:value={tool} placeholder="Search tools" />
<Combobox ariaLabel="Allowed tools" options={tools} multiple bind:values={allowed} placeholder="Add a tool" />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  default: {tool ?? "none"} · allowed: {allowed.join(", ") || "none"}
</p>
