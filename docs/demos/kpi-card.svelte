<!-- layout: wide -->
<script lang="ts">
  import { KpiCard } from "tallao";
</script>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: 1rem">
  <KpiCard label="Monthly revenue" value={48200} format={(n) => `$${n.toLocaleString("en")}`} delta={6.4} deltaFormat={(n) => `${n > 0 ? "+" : ""}${n}%`} deltaLabel="vs last month" trend={[39, 41, 40, 44, 45, 47, 48.2]} target={60000} targetLabel="Q4 goal" />
  <KpiCard label="Sign-ups" value={3120} delta={212} deltaLabel="vs last week" trend={[410, 460, 480, 450, 520, 540, 560]} locale="en" />
  <KpiCard label="p95 latency" value={184} unit="ms" delta={-12} deltaLabel="vs last release" goodWhen="down" trend={[240, 230, 221, 210, 205, 196, 184]} />
  <KpiCard label="Plan" value="Pro" delta={null} />
</div>
