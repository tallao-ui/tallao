<!-- layout: center -->
<script lang="ts">
  import { DonutChart } from "tallao";

  const channels = [
    { label: "Organic search", value: 4820 },
    { label: "Direct", value: 3150 },
    { label: "Referral", value: 1740 },
    { label: "Social", value: 1260 },
    { label: "Paid", value: 980 },
  ];
</script>

<DonutChart
  title="Signups by channel"
  data={channels}
  centerLabel="Signups"
  centerValue="11,950"
  legend="right"
/>
