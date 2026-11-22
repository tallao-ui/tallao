<!-- layout: center -->
<script lang="ts">
  import { RadarChart } from "tallao";

  const scores = [
    { area: "Speed", v2: 82, v3: 91 },
    { area: "Reliability", v2: 88, v3: 94 },
    { area: "Accessibility", v2: 70, v3: 89 },
    { area: "Docs", v2: 64, v3: 78 },
    { area: "Bundle size", v2: 75, v3: 72 },
    { area: "Theming", v2: 68, v3: 86 },
  ];
</script>

<RadarChart
  title="Kit quality by release"
  data={scores}
  axis="area"
  series={[
    { key: "v2", label: "v2.0" },
    { key: "v3", label: "v3.0" },
  ]}
  max={100}
/>
