<!-- layout: center -->
<script lang="ts">
  import { BigNumber } from "tallao";
</script>

<BigNumber value={1284500} label="Requests served today" locale="en" />
<BigNumber value={99.97} unit="%" label="Uptime, last 90 days" size="xl" format={(n) => n.toFixed(2)} />
<BigNumber value={48200} prefix="$" label="Monthly revenue" size="md" align="center" locale="en" />
<BigNumber value="3rd" label="Region rank" animate={false} />
