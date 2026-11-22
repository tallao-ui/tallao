<!-- layout: stack -->
<script lang="ts">
  import { Button, Checkbox, SelectionBar } from "tallao";

  let files = $state([
    { id: "a", name: "report-q3.pdf", checked: true },
    { id: "b", name: "logo.svg", checked: false },
    { id: "c", name: "notes.md", checked: false },
  ]);
  const selected = $derived(files.filter((f) => f.checked).length);
</script>

<SelectionBar
  total={files.length}
  {selected}
  ariaLabel="File selection"
  onToggleAll={(checked) => (files = files.map((f) => ({ ...f, checked })))}
>
  {#snippet actions()}
    <Button size="sm" variant="outline" onclick={() => (files = files.filter((f) => !f.checked))}>Delete</Button>
  {/snippet}
</SelectionBar>

{#each files as file (file.id)}
  <Checkbox bind:checked={file.checked} label={file.name} />
{/each}
