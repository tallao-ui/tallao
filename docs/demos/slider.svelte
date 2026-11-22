<!-- layout: stack -->
<script lang="ts">
  import { Slider } from "tallao";

  let temperature = $state(0.7);
  let steps = $state(12);
</script>

<Slider label="Temperature" bind:value={temperature} min={0} max={2} step={0.1} />
<Slider
  label="Max tool calls"
  bind:value={steps}
  min={1}
  max={30}
  valueText={(v) => `${v} calls`}
  marks={[{ value: 1, label: "1" }, { value: 15, label: "15" }, { value: 30, label: "30" }]}
/>
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  temperature={temperature}, steps={steps}
</p>
