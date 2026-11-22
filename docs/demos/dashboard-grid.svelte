<!-- layout: wide -->
<script lang="ts">
  import { BigNumber, DashboardGrid, DashboardItem, Gauge, KpiCard, Sparkline } from "tallao";
</script>

<DashboardGrid columns={4}>
  <KpiCard label="Revenue" value={48200} format={(n) => `$${n.toLocaleString("en")}`} delta={6.4} deltaFormat={(n) => `+${n}%`} trend={[39, 41, 40, 44, 45, 47, 48.2]} />
  <KpiCard label="Sign-ups" value={3120} delta={212} deltaLabel="vs last week" locale="en" />
  <DashboardItem span={2}>
    <BigNumber value={99.97} unit="%" label="Uptime, last 90 days" format={(n) => n.toFixed(2)} />
  </DashboardItem>
  <DashboardItem span={3}>
    <Sparkline label="Requests per minute" data={[820, 910, 880, 1040, 990, 1120, 1210, 1180]} width={480} height={70} area />
  </DashboardItem>
  <DashboardItem>
    <Gauge label="Error budget left" value={62} format={(n) => `${n}%`} tone="success" />
  </DashboardItem>
</DashboardGrid>
