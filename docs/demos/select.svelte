<!-- layout: stack -->
<script lang="ts">
  import { Label, Select } from "tallao";

  const models = [
    { value: "small", label: "Small (fast)" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large (best quality)" },
    { value: "legacy", label: "Legacy", disabled: true },
  ];
  let model = $state("medium");
  let env = $state("");
</script>

<div>
  <Label for="model">Model</Label>
  <Select id="model" bind:value={model} options={models} />
  <p style="margin: 0.35rem 0 0; font-size: 0.8125rem; opacity: 0.7">Selected: {model}</p>
</div>
<div>
  <Label for="env">Environment</Label>
  <Select id="env" bind:value={env} placeholder="Choose one">
    <option value="staging">Staging</option>
    <option value="production">Production</option>
  </Select>
</div>
