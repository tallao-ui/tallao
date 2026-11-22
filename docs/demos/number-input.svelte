<!-- layout: stack -->
<script lang="ts">
  import { NumberInput } from "tallao";

  let seats = $state<number | null>(5);
  let price = $state<number | null>(12.5);
  let discount = $state<number | null>(140);
</script>

<label for="seats" style="font-size: 0.875rem">Seats</label>
<NumberInput id="seats" bind:value={seats} min={1} max={50} stepper />
<label for="price" style="font-size: 0.875rem">Price per seat</label>
<NumberInput id="price" bind:value={price} min={0} step={0.5} width="auto" />
<label for="discount" style="font-size: 0.875rem">Discount (%)</label>
<NumberInput id="discount" bind:value={discount} min={0} max={100} clamp={false} />
<p style="margin: 0; font-size: 0.8125rem; opacity: 0.7">
  {seats ?? 0} seats x {price ?? 0} = {(seats ?? 0) * (price ?? 0)}
  {#if discount !== null && discount > 100}<br />Discount must be at most 100.{/if}
</p>
