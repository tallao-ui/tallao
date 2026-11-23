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

  // Money in and money out in one chart: negatives grow down from zero, and the total is the net.
  const cash = [
    { month: "Jul", inflow: 42000, outflow: -31000 },
    { month: "Aug", inflow: 38000, outflow: -41000 },
    { month: "Sep", inflow: 51000, outflow: -36000 },
    { month: "Oct", inflow: 47000, outflow: -52000 },
    { month: "Nov", inflow: 58000, outflow: -39000 },
  ];
  const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US")}`;
</script>

<div style="display: grid; gap: 2rem;">
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

  <BarChart
    title="Cash in and out"
    data={cash}
    x="month"
    series={[
      { key: "inflow", label: "In" },
      { key: "outflow", label: "Out" },
    ]}
    stacked
    format={usd}
    height={280}
  />
</div>
