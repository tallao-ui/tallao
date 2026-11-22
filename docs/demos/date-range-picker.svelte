<!-- layout: stack; height: 26 -->
<script lang="ts">
  import { DateRangePicker, type DateRange } from "tallao";

  let range = $state<DateRange>({ start: null, end: null });
</script>

<span style="font-size: 0.875rem">Report period</span>
<DateRangePicker bind:value={range} ariaLabel="Report period" />
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">
  {range.start && range.end ? `${range.start} to ${range.end}` : "Choose a start and an end"}
</p>
