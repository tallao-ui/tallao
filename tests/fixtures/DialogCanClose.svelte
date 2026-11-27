<!-- A dialog that asks before closing: `allow` decides. -->
<script lang="ts">
  import { Button, Dialog, Input } from "$lib/components";

  let { allow = false }: { allow?: boolean } = $props();
  let open = $state(false);
  let asked = $state(0);
</script>

<Button onclick={() => (open = true)}>Open</Button>
<Dialog
  bind:open
  title="Edit"
  closeLabel="Close dialog"
  canClose={async () => {
    asked += 1;
    console.trace("ASK");
    return allow;
  }}
>
  <Input aria-label="Name" />
</Dialog>
<span data-testid="state">{open ? "open" : "closed"}/{asked}</span>
