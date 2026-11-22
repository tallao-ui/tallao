<!-- layout: stack -->
<script lang="ts">
  import { SegmentedBar } from "tallao";
</script>

<SegmentedBar
  title="Revenue by channel"
  totalLabel="gross volume"
  locale="en"
  format={(n) => `$${n.toLocaleString("en")}`}
  segments={[
    { label: "Online payments", value: 26800, delta: 21.6 },
    { label: "Subscriptions", value: 16400, delta: 6.8 },
    { label: "In-store sales", value: 12200, delta: -11.9 },
  ]}
/>
