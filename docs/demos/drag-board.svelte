<!-- layout: wide -->
<script lang="ts">
  import { DragBoard, DragItem, DropZone } from "tallao";

  let selected = $state<string | null>(null);
  let columns = $state([
    { id: "todo", name: "To do", cards: ["Write changelog", "Fix focus ring"] },
    { id: "doing", name: "In progress", cards: ["Review PR #214"] },
    { id: "done", name: "Done", cards: ["Ship v2.3"] },
  ]);

  function move(card: string, to: string) {
    columns = columns.map((c) => ({
      ...c,
      cards: [...c.cards.filter((x) => x !== card), ...(c.id === to ? [card] : [])],
    }));
  }
</script>

<DragBoard bind:selected onMove={move}>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem">
    {#each columns as col (col.id)}
      <DropZone id={col.id} label={col.name}>
        {#each col.cards as card (card)}
          <DragItem id={card} label={card} zone={col.id}>{card}</DragItem>
        {/each}
      </DropZone>
    {/each}
  </div>
</DragBoard>
