<!-- layout: wide -->
<script lang="ts">
  import { SankeyChart } from "tallao";

  const links = [
    { source: "Organic", target: "Signed up", value: 480 },
    { source: "Paid", target: "Signed up", value: 220 },
    { source: "Referral", target: "Signed up", value: 160 },
    { source: "Signed up", target: "Activated", value: 560 },
    { source: "Signed up", target: "Churned early", value: 300 },
    { source: "Activated", target: "Pro", value: 340 },
    { source: "Activated", target: "Team", value: 120 },
    { source: "Activated", target: "Stayed free", value: 100 },
  ];
</script>

<SankeyChart title="From channel to plan" {links} unit="users" height={320} />
