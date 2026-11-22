<!-- layout: center -->
<script lang="ts">
  import { Gauge } from "tallao";
</script>

<Gauge label="Uptime this month" value={99.2} min={90} max={100} format={(n) => `${n}%`} tone="success" />
<Gauge label="Monthly revenue" value={42000} max={60000} target={50000} targetLabel="Goal" format={(n) => `$${n / 1000}k`} />
<Gauge label="Error budget used" variant="ring" value={78} max={100} tone="warning" size={140} format={(n) => `${n}%`} />
