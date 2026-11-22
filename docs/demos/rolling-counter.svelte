<!-- layout: center -->
<script lang="ts">
  import { Button, RollingCounter } from "tallao";

  let online = $state(2481);
</script>

<RollingCounter label="Users online" value={online} size="lg" locale="en" />
<RollingCounter label="Revenue today" value={online * 12} format={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} locale="en" />
<Button variant="outline" onclick={() => (online += 40 + Math.floor(Math.random() * 400))}>Simulate traffic</Button>
