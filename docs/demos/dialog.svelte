<!-- layout: center -->
<script lang="ts">
  import { Button, Dialog } from "tallao";

  let open = $state(false);
</script>

<Button onclick={() => (open = true)}>Rename project</Button>

<Dialog bind:open title="Rename project" description="Shown in the sidebar and in shared links.">
  <label for="project-name" style="display: grid; gap: 0.375rem; font-size: 0.875rem">
    Project name
    <input id="project-name" value="Nightly evals" style="padding: 0.5rem; border-radius: 0.5rem; border: 1px solid rgb(var(--ta-border)); background: rgb(var(--ta-surface)); color: rgb(var(--ta-text))" />
  </label>
  {#snippet footer()}
    <Button variant="ghost" onclick={() => (open = false)}>Cancel</Button>
    <Button onclick={() => (open = false)}>Save</Button>
  {/snippet}
</Dialog>
