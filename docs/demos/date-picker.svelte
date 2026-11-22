<!-- layout: stack; height: 24 -->
<script lang="ts">
  import { DatePicker } from "tallao";

  let due = $state<string | null>("2026-12-01");
</script>

<span style="font-size: 0.875rem">Release date</span>
<DatePicker bind:value={due} ariaLabel="Release date" min="2026-11-01" />
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">Releasing on {due ?? "no date yet"}</p>
