<!-- layout: stack -->
<script lang="ts">
  import { ToggleGroup } from "tallao";

  let range = $state("weekly");
  let status = $state<string[]>(["failed"]);
</script>

<ToggleGroup
  label="Time range"
  variant="segmented"
  bind:value={range}
  required
  options={[
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ]}
/>
<ToggleGroup
  label="Run status"
  type="multiple"
  bind:values={status}
  options={[
    { value: "ok", label: "Succeeded", count: 128 },
    { value: "failed", label: "Failed", count: 7 },
    { value: "running", label: "Running", count: 3 },
  ]}
/>
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  {range} · {status.join(", ") || "no status"}
</p>
