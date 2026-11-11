<!-- The BI components together: charts, KPI pieces, infographic pieces and the dashboard layout. -->
<script lang="ts">
  import {
    BarChart,
    BarList,
    BigNumber,
    ChartCard,
    ChartLegend,
    ComparisonBar,
    DashboardGrid,
    DashboardItem,
    DonutChart,
    Funnel,
    Gauge,
    Heatmap,
    IconArray,
    KpiCard,
    LineChart,
    ScatterChart,
    Sparkline,
    Timeline,
  } from "$lib/components";

  import { setLabels, type Labels } from "$lib/i18n";
  import { untrack } from "svelte";

  let { empty = false, labels }: { empty?: boolean; labels?: Partial<Labels> } = $props();
  // The texts are set once, on mount, as in a real application.
  const initial = untrack(() => labels);
  if (initial) setLabels(initial);

  const roles = [
    { patch: "1.0", dps: 50, support: 30, tank: 20 },
    { patch: "1.1", dps: 55, support: 25, tank: 20 },
    { patch: "1.2", dps: 60, support: 28, tank: null },
  ];
  const roleSeries = [
    { key: "dps", label: "DPS" },
    { key: "support", label: "Support" },
    { key: "tank", label: "Tank" },
  ];
  const elements = [
    { label: "Fire", value: 40 },
    { label: "Water", value: 30 },
    { label: "Grass", value: 20 },
    { label: "Rock", value: 10 },
    { label: "Void", value: 0 },
  ];
  const picks = [
    { x: 18, y: 54, label: "Kaela", group: "Fire" },
    { x: 6, y: 47, label: "Moss", group: "Grass" },
    { x: 12, y: 51, label: "Tide", group: "Water" },
  ];
  const matchups = [
    { x: "Fire", y: "Fire", value: 50 },
    { x: "Water", y: "Fire", value: 38 },
    { x: "Fire", y: "Water", value: 62 },
  ];
  const steps = [
    { label: "Visited", value: 1000 },
    { label: "Signed up", value: 400 },
    { label: "Played", value: 100 },
  ];
  const ranking = [
    { label: "Kaela", value: 18, href: "/kaela", note: "Fire" },
    { label: "Tide", value: 12 },
    { label: "Moss", value: 6 },
  ];
  const events = [
    { date: "2026-11-03", title: "Patch 1.2", description: "Fire rebalance", tag: "Patch", tone: "accent" as const, href: "/patch" },
    { date: "Season 3", title: "Ladder reset", current: true },
  ];
  const pct = (n: number) => `${n}%`;
</script>

<DashboardGrid data-testid="grid">
  <KpiCard label="Win rate" value={52.4} unit="%" delta={1.8} deltaLabel="vs last patch" trend={[49, 50, 52.4]} target={55} span={2} locale="en" data-testid="kpi" />
  <KpiCard label="Ban rate" value={31} delta={4} goodWhen="down" locale="en" data-testid="kpi-bad" />
  <KpiCard label="Players" value="1.2M" delta={0} locale="en" data-testid="kpi-flat" />
  <ChartCard title="Role share" description="By patch" note="Ranked only" source="Match API" sourceHref="/source" span="full" data-testid="card">
    {#snippet toolbar()}<button type="button">Patch</button>{/snippet}
    <BarChart title="Role share by patch" hideTitle data={empty ? [] : roles} x="patch" xLabel="Patch" series={roleSeries} stacked locale="en" />
  </ChartCard>
  <DashboardItem span={2} data-testid="item">
    <BigNumber value={1240000} unit="matches" label="analysed this patch" locale="en" />
  </DashboardItem>
</DashboardGrid>

<BarChart title="Roles across" data={roles} x="patch" series={roleSeries} orientation="horizontal" locale="en" />
<LineChart title="Stacked roles" data={empty ? [] : roles} x="patch" series={roleSeries} stacked locale="en" />
<LineChart title="Win rate trend" data={[{ d: "Mon", w: 49 }, { d: "Tue", w: 52 }]} x="d" series={[{ key: "w", label: "Win rate" }]} domain={[45, 55]} format={pct} />

<DonutChart title="Picks by element" data={empty ? [] : elements} locale="en" />
<DonutChart title="Many slices" data={Array.from({ length: 10 }, (_, i) => ({ label: `S${i + 1}`, value: 10 }))} maxSlices={4} innerRadius={0} legend="bottom" locale="en" />
<ScatterChart title="Pick rate against win rate" data={empty ? [] : picks} xLabel="Pick rate" yLabel="Win rate" yRef={50} showLabels format={pct} />
<Heatmap title="Matchups" data={empty ? [] : matchups} cornerLabel="Attacker" format={pct} />
<Funnel title="New players" data={empty ? [] : steps} locale="en" />
<BarList title="Most picked" data={empty ? [] : ranking} ranked format={pct} />
<BarList ariaLabel="Unranked" data={ranking} limit={2} />

<p>Trend <Sparkline data={[12, 9, 11, 18]} label="Pick rate" locale="en" /> <Sparkline data={[3]} label="Too short" variant="bar" /></p>
<Gauge value={52.4} label="Win rate" target={55} format={pct} />
<Gauge value={120} max={100} label="Completion" variant="ring" tone="success" />
<IconArray value={7} total={10} label="players pick a Fire lead" />
<IconArray value={3} total={5} label="wins" shape="person" showSummary={false} />
<Timeline items={empty ? [] : events} ariaLabel="Season" locale="en" />
<ComparisonBar title="Side win rate" left={{ label: "Blue side", value: 5230 }} right={{ label: "Red side", value: 4770 }} locale="en" />
<ChartLegend items={[{ label: "Fire", value: "40%" }, { label: "Water", color: "teal" }]} aria-label="Elements" />
