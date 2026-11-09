<!-- A button that opens a dialog with a field; the second dialog is nested. -->
<script lang="ts">
  import { Button, Dialog, Input } from "$lib/components";

  let { nested = false }: { nested?: boolean } = $props();
  let firstOpen = $state(false);
  let secondOpen = $state(false);
</script>

<Button onclick={() => (firstOpen = true)}>Open</Button>
<p>Outside</p>
<Dialog bind:open={firstOpen} title="Edit" closeLabel="Close dialog">
  <Input aria-label="Name" />
  {#if nested}
    <Button onclick={() => (secondOpen = true)}>Another</Button>
    <Dialog bind:open={secondOpen} title="Second"><Input aria-label="Inner" /></Dialog>
  {/if}
</Dialog>
<span data-testid="state">{firstOpen ? "open" : "closed"}/{secondOpen ? "open" : "closed"}</span>
