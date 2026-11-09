<!-- Slider, SearchInput, Toggle and ToggleGroup together; the state is read from the tests. -->
<script lang="ts">
  import { SearchInput, Slider, Toggle, ToggleGroup } from "$lib/components";

  let level = $state(30);
  let search = $state("");
  let favourites = $state(false);
  let rarity = $state("all");
  let types = $state<string[]>(["fire"]);
  let released = $state<number | null>(null);
</script>

<form data-testid="form">
  <Slider
    label="Level"
    bind:value={level}
    min={1}
    max={60}
    name="level"
    valueText={(v) => `Lv. ${v}`}
    marks={[{ value: 1, label: "1" }, { value: 30, label: "30" }, { value: 60, label: "60" }]}
    onchange={(v) => (released = v)}
  />
  <Slider ariaLabel="Volume" value={5} max={10} />
  <SearchInput bind:value={search} placeholder="Search species…" />
  <SearchInput value="" ariaLabel="Filter pairs" placeholder="Type…" />
  <Toggle bind:pressed={favourites}>Favourites only</Toggle>
  <ToggleGroup
    label="Rarity"
    bind:value={rarity}
    required
    name="rarity"
    options={[
      { value: "all", label: "All" },
      { value: "rare", label: "Rare", count: 12 },
      { value: "epic", label: "Epic", disabled: true },
    ]}
  />
  <ToggleGroup label="Types" type="multiple" bind:values={types} name="type" options={[{ value: "fire", label: "Fire" }, { value: "water", label: "Water" }]} />
</form>
<span data-testid="state">{JSON.stringify({ level, search, favourites, rarity, types, released })}</span>
