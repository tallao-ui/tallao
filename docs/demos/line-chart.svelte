<!-- layout: wide -->
<script lang="ts">
  import { LineChart } from "tallao";

  const latency = [
    { hour: "00:00", p50: 82, p95: 210, p99: 340 },
    { hour: "04:00", p50: 76, p95: 190, p99: 300 },
    { hour: "08:00", p50: 94, p95: 260, p99: 480 },
    { hour: "12:00", p50: 121, p95: 330, p99: 610 },
    { hour: "16:00", p50: 134, p95: 372, p99: 690 },
    { hour: "20:00", p50: 102, p95: 280, p99: 520 },
  ];

  // This month against the last one: `compare` draws the previous period dashed, behind.
  const signups = [
    { week: "W1", now: 420, before: 380 },
    { week: "W2", now: 510, before: 440 },
    { week: "W3", now: 480, before: 530 },
    { week: "W4", now: 640, before: 560 },
  ];
</script>

<div style="display: grid; gap: 2rem;">
  <LineChart
    title="API latency (ms)"
    data={latency}
    x="hour"
    series={[
      { key: "p50", label: "p50" },
      { key: "p95", label: "p95" },
      { key: "p99", label: "p99" },
    ]}
    format={(n) => `${n} ms`}
    height={280}
  />

  <LineChart
    title="Sign-ups this month"
    data={signups}
    x="week"
    series={[{ key: "now", label: "This month" }]}
    compare={{ key: "before", label: "Last month" }}
    area
    height={240}
  />
</div>
