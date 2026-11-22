<!-- layout: center -->
<script lang="ts">
  import { Button, Sheet } from "tallao";

  let open = $state(false);
  let side = $state<"left" | "right" | "bottom">("right");

  function show(s: typeof side) {
    side = s;
    open = true;
  }
</script>

<Button onclick={() => show("right")}>Run details</Button>
<Button variant="outline" onclick={() => show("left")}>Left</Button>
<Button variant="outline" onclick={() => show("bottom")}>Bottom</Button>

<Sheet bind:open {side} title="Run #1842" description="Finished 4 minutes ago">
  <p style="margin: 0; font-size: 0.875rem; color: rgb(var(--ta-text-dim))">
    12 tool calls, 3 retries, 18,240 tokens. The agent updated 4 files and opened a pull request.
  </p>
  {#snippet footer()}
    <Button onclick={() => (open = false)}>Done</Button>
  {/snippet}
</Sheet>
