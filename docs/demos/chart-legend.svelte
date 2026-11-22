<!-- layout: stack -->
<script lang="ts">
  import { ChartLegend } from "tallao";

  const plans = [
    { label: "Free", value: "8,420 · 61%" },
    { label: "Pro", value: "4,110 · 30%" },
    { label: "Team", value: "980 · 7%" },
    { label: "Enterprise", value: "310 · 2%" },
  ];
</script>

<ChartLegend items={plans} aria-label="Accounts per plan" />
<ChartLegend items={plans} orientation="vertical" aria-label="Accounts per plan, with figures" />
<ChartLegend marker="line" items={[{ label: "Visits" }, { label: "Sign-ups" }, { label: "Paid" }]} aria-label="Funnel series" />
