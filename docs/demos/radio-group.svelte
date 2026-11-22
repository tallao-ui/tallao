<!-- layout: stack -->
<script lang="ts">
  import { RadioGroup } from "tallao";

  let mode = $state("ask");
</script>

<RadioGroup
  legend="Permission mode"
  bind:value={mode}
  options={[
    { value: "ask", label: "Ask every time", description: "The agent pauses before each tool call." },
    { value: "edits", label: "Allow edits", description: "File changes run, shell commands ask." },
    { value: "plan", label: "Plan only", description: "Nothing is executed." },
    { value: "bypass", label: "Bypass", description: "Disabled by your workspace.", disabled: true },
  ]}
/>
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">Selected: {mode}</p>
