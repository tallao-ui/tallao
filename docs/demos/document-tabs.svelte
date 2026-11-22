<!-- layout: wide -->
<script lang="ts">
  import { DocumentTabs, type DocumentTab } from "tallao";

  let tabs = $state<DocumentTab[]>([
    { id: "notes", label: "Release notes.md" },
    { id: "chat", label: "Refactor the billing module", busy: true },
    { id: "draft", label: "Untitled draft", dirty: true },
    { id: "readme", label: "README.md", closable: false },
  ]);
  let value = $state("notes");
  let count = 0;
</script>

<DocumentTabs
  ariaLabel="Open documents"
  items={tabs}
  bind:value
  onclose={(id) => (tabs = tabs.filter((t) => t.id !== id))}
  onadd={() => {
    const id = `new-${++count}`;
    tabs = [...tabs, { id, label: `Untitled ${count}` }];
    value = id;
  }}
/>
<p style="color: rgb(var(--ta-text-dim))">Active: {value || "none"} · {tabs.length} open</p>
