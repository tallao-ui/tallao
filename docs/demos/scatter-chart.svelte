<!-- layout: wide -->
<script lang="ts">
  import { ScatterChart } from "tallao";

  const accounts = [
    { x: 12, y: 3.2, label: "Acme", group: "Team" },
    { x: 34, y: 5.8, label: "Globex", group: "Team" },
    { x: 58, y: 7.1, label: "Initech", group: "Team" },
    { x: 8, y: 1.4, label: "Hooli", group: "Pro" },
    { x: 21, y: 2.6, label: "Umbrella", group: "Pro" },
    { x: 40, y: 3.9, label: "Stark", group: "Pro" },
    { x: 5, y: 0.6, label: "Wayne", group: "Free" },
    { x: 16, y: 1.1, label: "Wonka", group: "Free" },
  ];
</script>

<ScatterChart
  title="Seats vs. daily use"
  data={accounts}
  xLabel="Seats"
  yLabel="Sessions per seat per day"
  height={300}
/>
