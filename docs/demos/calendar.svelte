<!-- layout: stack -->
<script lang="ts">
  import { Calendar } from "tallao";

  let value = $state<string | null>(null);
</script>

<Calendar bind:value min="2026-01-01" max="2026-12-31" isDisabled={(iso) => new Date(iso + "T00:00").getDay() % 6 === 0} />
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">
  {value ? `Deploy window: ${value}` : "Pick a weekday for the deploy window"}
</p>
