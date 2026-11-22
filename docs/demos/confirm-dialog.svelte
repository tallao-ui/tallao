<!-- layout: center -->
<script lang="ts">
  import { Button, ConfirmDialog } from "tallao";

  let open = $state(false);
  let status = $state("");

  async function remove() {
    await new Promise((r) => setTimeout(r, 900));
    status = "Deleted staging-db.";
  }
</script>

<Button variant="outline" onclick={() => (open = true)}>Delete database</Button>
{#if status}<span style="font-size: 0.875rem; color: rgb(var(--ta-text-dim))">{status}</span>{/if}

<ConfirmDialog
  bind:open
  title="Delete staging-db?"
  description="Its 3 replicas and all backups go with it. This cannot be undone."
  confirmLabel="Delete"
  onConfirm={remove}
  onCancel={() => (status = "Cancelled.")}
/>
