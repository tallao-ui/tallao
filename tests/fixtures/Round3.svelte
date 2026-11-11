<!-- CardStack, CalendarHeatmap, DateRangePicker, SankeyChart, the range date filter, the drawn Checkbox,
     Badge tones and the exit transitions: dom and SSR tests. -->
<script lang="ts">
  import {
    Badge,
    CalendarHeatmap,
    CardStack,
    Checkbox,
    DataTable,
    DateRangePicker,
    FilterBar,
    Popover,
    Button,
    SankeyChart,
    type DateRange,
    type FilterValues,
  } from "$lib/components";

  let {
    rows = [
      { id: "a", name: "Ana" },
      { id: "b", name: "Bea" },
      { id: "c", name: "Ciro" },
    ],
    loop = false,
    onRange,
  }: { rows?: { id: string; name: string }[]; loop?: boolean; onRange?: (value: DateRange) => void } = $props();

  let index = $state(0);
  let range = $state<DateRange>({ start: "2026-11-03", end: null });
  let query = $state<FilterValues>({});
  let agreed = $state(false);
</script>

<CardStack items={["Ember Rush", "Tidewall", "Root Engine"]} bind:index label="Featured decks" {loop}>
  {#snippet card(item, i)}<article data-testid={`card-${i}`}><h3>{item}</h3><button type="button">Open {item}</button></article>{/snippet}
</CardStack>
<output data-testid="index">{index}</output>

<CalendarHeatmap
  title="Matches played"
  unit="matches"
  locale="en"
  data={[
    { date: "2026-10-28", value: 2 },
    { date: "2026-11-02", value: 8 },
    { date: "2026-11-03", value: 4 },
    { date: "2026-11-10", value: 0 },
  ]}
/>
<CalendarHeatmap title="No activity" data={[]} />

<form data-testid="form">
  <DateRangePicker bind:value={range} name="period" locale="en" onchange={onRange} presets={[{ label: "Last 7 days", days: 7 }, { label: "Season 3", start: "2026-09-01", end: "2026-11-30" }]} />
</form>
<output data-testid="range">{range.start ?? ""}|{range.end ?? ""}</output>

<FilterBar bind:value={query} search={false} filters={[{ key: "period", label: "Period", type: "date", range: true }]} />
<output data-testid="query">{JSON.stringify(query)}</output>

<SankeyChart
  title="Where players go"
  unit="players"
  locale="en"
  nodes={[{ id: "signup", label: "Signed up" }]}
  links={[
    { source: "signup", target: "Tutorial", value: 720 },
    { source: "signup", target: "Left", value: 280 },
    { source: "Tutorial", target: "Ranked", value: 410 },
    { source: "Tutorial", target: "Left", value: 310 },
    { source: "Ranked", target: "signup", value: 5 },
  ]}
/>
<SankeyChart title="No flows" links={[]} />

<Checkbox label="Agree" bind:checked={agreed} name="agree" />
<output data-testid="agreed">{agreed}</output>
<Badge variant="success">Published</Badge>

<Popover title="Panel">
  {#snippet trigger(props)}<Button {...props}>Open panel</Button>{/snippet}
  <p>Panel content</p>
</Popover>

<DataTable caption="People" {rows} rowKey="id" columns={[{ key: "name", header: "Name" }]} />
