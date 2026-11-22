<!-- layout: stack -->
<script lang="ts">
  import { Sparkline } from "tallao";

  const signups = [112, 124, 119, 138, 151, 147, 166, 172, 181, 176, 194, 208];
  const latency = [240, 232, 251, 228, 219, 224, 207, 198, 203, 190];
</script>

<p>Sign-ups per week <Sparkline label="Weekly sign-ups" data={signups} area /></p>
<p>Checkout latency (ms) <Sparkline label="p95 checkout latency" data={latency} color="rgb(var(--ta-warning))" format={(n) => `${n} ms`} /></p>
<p>Daily orders <Sparkline label="Daily orders" variant="bar" data={[34, 41, 38, 52, 47, 60, 55]} width={120} height={32} /></p>
