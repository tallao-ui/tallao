<!-- layout: center; height: 16 -->
<script lang="ts">
  import { SavedViews, type FilterValues, type SavedView } from "tallao";

  let views = $state<SavedView<FilterValues>[]>([
    { name: "Drafts", query: { status: "Draft" } },
    { name: "Featured and published", query: { status: "Published", featured: true } },
  ]);
  let current = $state<string | null>(null);
  const query: FilterValues = { status: "In review" };
</script>

<SavedViews
  {views}
  bind:current
  {query}
  onSave={(v) => (views = [...views.filter((x) => x.name !== v.name), v])}
  onRename={(v, name) => (views = views.map((x) => (x.name === v.name ? { ...x, name } : x)))}
  onDelete={(v) => (views = views.filter((x) => x.name !== v.name))}
/>
<span style="font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">Active: {current ?? "none"}</span>
