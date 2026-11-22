<!-- layout: wide -->
<script lang="ts">
  import { ChartCard, LineChart, ToggleGroup } from "tallao";

  const data = [
    { month: "Jun", signups: 2210, paid: 310 },
    { month: "Jul", signups: 2480, paid: 355 },
    { month: "Aug", signups: 2390, paid: 372 },
    { month: "Sep", signups: 2760, paid: 410 },
    { month: "Oct", signups: 2740, paid: 436 },
    { month: "Nov", signups: 3120, paid: 498 },
  ];
  let key = $state("signups");
</script>

<ChartCard title="Growth by month" description="New accounts, and how many upgraded." source="Billing database" note="November is partial (to the 20th).">
  {#snippet toolbar()}
    <ToggleGroup ariaLabel="Measure" variant="segmented" required bind:value={key} options={[{ value: "signups", label: "Sign-ups" }, { value: "paid", label: "Paid" }]} />
  {/snippet}
  <LineChart title="Growth by month" hideTitle {data} x="month" series={[{ key, label: key === "paid" ? "Paid" : "Sign-ups" }]} area height={260} locale="en" />
</ChartCard>
