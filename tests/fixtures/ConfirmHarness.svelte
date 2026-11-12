<!-- A confirmation with no content of its own, and one with a note in its body. -->
<script lang="ts">
  import { Button, ConfirmDialog } from "$lib/components";

  let plain = $state(false);
  let withNote = $state(false);
</script>

<Button onclick={() => (plain = true)}>Ask</Button>
<Button onclick={() => (withNote = true)}>Ask with a note</Button>
<ConfirmDialog bind:open={plain} title="Delete it?" description="This cannot be undone." onConfirm={() => {}} />
<ConfirmDialog bind:open={withNote} title="Publish it?" onConfirm={() => {}}>
  <p>Readers see it at once.</p>
</ConfirmDialog>
