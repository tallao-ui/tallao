<!-- layout: stack -->
<script lang="ts">
  import { Label, Textarea } from "tallao";

  let notes = $state("Rolled back the 2.4 deploy after the checkout latency alert.");
  let query = $state("SELECT id, status\nFROM runs\nWHERE status = 'failed';");
</script>

<div>
  <Label for="notes">Incident notes</Label>
  <Textarea id="notes" bind:value={notes} rows={3} />
  <p style="margin: 0.35rem 0 0; font-size: 0.8125rem; opacity: 0.7">{notes.length} characters</p>
</div>
<div>
  <Label for="query">Query</Label>
  <Textarea id="query" mono bind:value={query} rows={4} />
</div>
