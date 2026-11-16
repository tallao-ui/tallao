<!-- SortableList with its own data: the test reads the order from the page. -->
<script lang="ts">
  import { SortableList } from "$lib/components";

  let steps = $state(["Reply", "Give coins", "Post panel"]);

  function onReorder(from: number, to: number) {
    const next = [...steps];
    next.splice(to, 0, next.splice(from, 1)[0]);
    steps = next;
  }
</script>

<SortableList ariaLabel="Steps" items={steps} key={(s) => s} label={(s) => s} {onReorder}>
  {#snippet row(s, i)}<span>{i + 1}. {s}</span>{/snippet}
</SortableList>
<p data-testid="order">{steps.join(",")}</p>
