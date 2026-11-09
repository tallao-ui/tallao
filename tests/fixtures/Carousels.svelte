<!-- Carousel and CompareSlider; the state is read from the tests. -->
<script lang="ts">
  import { Carousel, CompareSlider } from "$lib/components";

  let { autoplay = false, noItems = false }: { autoplay?: boolean; noItems?: boolean } = $props();

  const games = [
    { id: "aniimo", name: "Aniimo" },
    { id: "d4", name: "Diablo IV" },
    { id: "er", name: "Elden Ring" },
  ];
  let position = $state(50);
  let released = $state<number | null>(null);
</script>

<Carousel label="Games" items={noItems ? [] : games} key={(g) => g.id} {autoplay} interval={1000}>
  {#snippet slide(g, i)}<a href={`#${g.id}`}>{i + 1}. {g.name}</a>{/snippet}
  {#snippet empty()}<p>No games.</p>{/snippet}
</Carousel>
<CompareSlider
  bind:value={position}
  beforeSrc="/before.png"
  afterSrc="/after.png"
  beforeLabel="Before"
  afterLabel="After"
  label="Compare the map"
  valueText={(v) => `${Math.round(v)} % before`}
  onchange={(v) => (released = v)}
/>
<span data-testid="state">{JSON.stringify({ position, released })}</span>
