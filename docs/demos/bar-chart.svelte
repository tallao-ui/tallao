<!-- layout: wide -->
<script lang="ts">
  import { BarChart } from "tallao";

  const revenue = [
    { month: "Jul", pro: 18200, team: 24600 },
    { month: "Aug", pro: 20100, team: 27900 },
    { month: "Sep", pro: 22800, team: 31400 },
    { month: "Oct", pro: 24300, team: 35200 },
    { month: "Nov", pro: 27100, team: 38800 },
  ];
  const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
</script>

<BarChart
  title="Monthly recurring revenue by plan"
  data={revenue}
  x="month"
  series={[
    { key: "pro", label: "Pro" },
    { key: "team", label: "Team" },
  ]}
  stacked
  format={usd}
  height={280}
/>
