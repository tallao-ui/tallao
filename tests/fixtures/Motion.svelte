<!-- tallao/motion in use, plus RadarChart and RollingCounter: dom and SSR tests. -->
<script lang="ts">
  import { RadarChart, RollingCounter, Tabs } from "$lib/components";
  import { collapse, press, rise, rollNumber, shimmer, stagger } from "$lib/motion";

  let { open = true, total = 10, value = 1249 }: { open?: boolean; total?: number; value?: number } = $props();
  let tab = $state("a");
</script>

{#if open}<p data-testid="panel" transition:collapse>Panel</p>{/if}
<ul>
  {#each ["One", "Two"] as item, i (item)}<li in:rise={stagger(i)}>{item}</li>{/each}
</ul>
<button type="button" data-testid="press" {@attach press()}>Press</button>
<div data-testid="shimmer" {@attach shimmer()}></div>
<span data-testid="total" {@attach rollNumber(total)}>{total}</span>

<Tabs ariaLabel="Sliding" panels={false} bind:value={tab} items={[{ id: "a", label: "One" }, { id: "b", label: "Two" }]} />
<Tabs ariaLabel="Pills" variant="pills" panels={false} items={[{ id: "a", label: "One" }]} />

<RadarChart
  title="Kaela against Oskar"
  axis="stat"
  max={100}
  locale="en"
  data={[
    { stat: "Damage", kaela: 92, oskar: 55 },
    { stat: "Mobility", kaela: 88, oskar: 40 },
    { stat: "Defence", kaela: 35, oskar: 90 },
    { stat: "Control", kaela: 50, oskar: null },
  ]}
  series={[{ key: "kaela", label: "Kaela" }, { key: "oskar", label: "Oskar" }]}
/>
<RadarChart title="Too few" axis="stat" data={[{ stat: "A", v: 1 }, { stat: "B", v: 2 }]} series={[{ key: "v", label: "V" }]} />

<RollingCounter {value} label="Players online" locale="en" data-testid="counter" />
