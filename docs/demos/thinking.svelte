<!-- layout: stack -->
<script lang="ts">
  import { Button, Thinking } from "tallao";

  let running = $state(true);
</script>

<Button size="sm" variant="outline" onclick={() => (running = !running)}>{running ? "Finish" : "Run again"}</Button>

<Thinking {running} summary="Comparing pick rates across patches" steps={["Read the draft of the patch notes", "Compared pick and win rates between 1.1 and 1.2"]}>
  Publishing is visible to everyone, so it needs an approval first. The meta question only needs the stats table.
</Thinking>

<Thinking seconds={12} steps={["Read the brief", "Compared three sources"]} />
