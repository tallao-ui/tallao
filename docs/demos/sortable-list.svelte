<!-- layout: stack -->
<script lang="ts">
  import { SortableList } from "tallao";

  let steps = $state([
    { id: "fetch", name: "Fetch the ticket" },
    { id: "classify", name: "Classify priority" },
    { id: "draft", name: "Draft a reply" },
    { id: "review", name: "Ask for approval" },
  ]);

  function reorder(from: number, to: number) {
    const [item] = steps.splice(from, 1);
    steps.splice(to, 0, item);
  }
</script>

<SortableList items={steps} key={(s) => s.id} label={(s) => s.name} onReorder={reorder} ariaLabel="Agent flow steps">
  {#snippet row(step, i)}{i + 1}. {step.name}{/snippet}
</SortableList>
