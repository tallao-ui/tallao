<!-- layout: stack -->
<script lang="ts">
  import { Rating } from "tallao";

  let score = $state(4);
  let hover = $state<number | null>(null);
</script>

<Rating label="How was the agent's answer?" bind:value={score} onhover={(n) => (hover = n)} />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  {hover ?? score} of 5
</p>
<Rating label="Average rating of this course" value={4} readonly size="sm" />
