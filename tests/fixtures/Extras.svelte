<!-- NumberInput, Rating and the new options of Select, Tabs, ToggleGroup, Dialog and Slider. -->
<script lang="ts">
  import { Dialog, NumberInput, Rating, Select, Slider, Tabs, ToggleGroup } from "$lib/components";

  let quantity = $state<number | null>(3);
  let rating = $state(0);
  let mode = $state("a");
  let dialogOpen = $state(false);
  // A value the parent only accepts up to 50.
  let cap = $state(20);
</script>

<form data-testid="form">
  <NumberInput bind:value={quantity} min={1} max={5} stepper ariaLabel="Quantity" name="quantity" />
  <Rating bind:value={rating} label="What did you think?" name="rating" />
  <Rating value={4} label="Average rating" readonly />
</form>
<Select width="auto" options={[{ value: "x", label: "Ex" }]} aria-label="Short" />
<Tabs
  variant="pills"
  tabClass="my-tab"
  items={[
    { id: "a", label: "Tree" },
    { id: "b", label: "Team" },
  ]}
  ariaLabel="Views"
>
  {#snippet tab(t, active)}<span data-testid={`tab-${t.id}`}>{t.label}{active ? " ✓" : ""}</span>{/snippet}
  {#snippet end()}<button type="button">Reset</button>{/snippet}
  {#snippet children(id)}<p>Panel {id}</p>{/snippet}
</Tabs>
<ToggleGroup
  ariaLabel="Mode"
  variant="segmented"
  tone="solid"
  itemClass="my-button"
  bind:value={mode}
  options={[
    { value: "a", label: "One" },
    { value: "b", label: "Two" },
  ]}
/>
<button type="button" onclick={() => (dialogOpen = true)}>Open</button>
<Dialog bind:open={dialogOpen} ariaLabel="Certificate" showCloseAlone bare><p>Certificate</p></Dialog>
<Slider ariaLabel="Cap" value={cap} max={100} onchange={(v) => (cap = Math.min(50, v))} />
<span data-testid="state">{JSON.stringify({ quantity, rating, mode, cap })}</span>
