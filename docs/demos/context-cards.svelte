<!-- layout: stack -->
<script lang="ts">
  import { ContextCards, type ContextItem } from "tallao";

  let items = $state<ContextItem[]>([
    { id: "c1", title: "patch-1-2.md", type: "file", meta: "6.1 KB", excerpt: "Kaela: removed the dash reset on takedown." },
    { id: "c2", title: "Match stats", type: "record", meta: "1.24M rows" },
    { id: "c3", title: "Patch 1.1 notes", type: "link", meta: "valhalla.gg", href: "https://valhalla.gg/news/patch-1-1" },
  ]);
</script>

<ContextCards label="What the agent was given" {items} onRemove={(item) => (items = items.filter((c) => c.id !== item.id))} />
<ContextCards layout="stack" {items} onRemove={(item) => (items = items.filter((c) => c.id !== item.id))} />
