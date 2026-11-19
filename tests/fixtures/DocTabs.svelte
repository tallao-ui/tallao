<!-- DocumentTabs owned by the page: closing removes the tab, adding appends one. -->
<script lang="ts">
  import { DocumentTabs } from "$lib/components";
  import type { DocumentTab } from "$lib/components";

  let items: DocumentTab[] = $state([
    { id: "a", label: "Release notes" },
    { id: "b", label: "A very long conversation title that gets cut with an ellipsis", title: "A very long conversation title that gets cut with an ellipsis (full)", busy: true },
    { id: "c", label: "Draft", dirty: true },
    { id: "d", label: "Pinned", closable: false },
  ]);
  let value = $state("a");
  let closed: string[] = $state([]);
  let n = 0;
</script>

<DocumentTabs
  {items}
  bind:value
  ariaLabel="Open documents"
  onclose={(id) => {
    closed.push(id);
    items = items.filter((t) => t.id !== id);
  }}
  onadd={() => items.push({ id: `n${++n}`, label: `New ${n}` })}
/>
<span data-testid="value">{value}</span>
<span data-testid="closed">{closed.join(",")}</span>
