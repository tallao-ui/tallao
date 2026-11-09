<!-- Frameless, icon-only ToggleGroup with one colour per option (the facet bar of the dexes). -->
<script lang="ts">
  import { ToggleGroup } from "$lib/components";

  let types = $state<string[]>([]);
  let form = $state("");
</script>

<ToggleGroup
  label="Type"
  type="multiple"
  variant="bare"
  bind:values={types}
  options={[
    { value: "fire", label: "Fire", ariaLabel: "Fire", title: "Fire", color: "#e4572e" },
    { value: "water", label: "Water", ariaLabel: "Water", title: "Water", color: "#3a86ff", class: "facet-water" },
    { value: "grass", label: "Grass", ariaLabel: "Grass", title: "Grass", style: "--ta-toggle-accent: #2a9d8f" },
    { value: "ice", label: "Ice", ariaLabel: "Ice", title: "Ice", disabled: true },
  ]}
>
  {#snippet item(o, pressed)}
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" data-active={pressed}><circle cx="12" cy="12" r="10" fill={o.color ?? "currentColor"} /></svg>
  {/snippet}
</ToggleGroup>

<ToggleGroup
  ariaLabel="Form"
  tone="solid"
  bind:value={form}
  dimOthers
  options={[
    { value: "base", label: "Base", color: "#8338ec" },
    { value: "alpha", label: "Alpha", title: "Alpha form" },
  ]}
/>
<span data-testid="state">{JSON.stringify({ types, form })}</span>
