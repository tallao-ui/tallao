<!-- layout: stack -->
<script lang="ts">
  import { InsightCard } from "tallao";
</script>

<InsightCard
  title="Kaela's pick rate fell by a third"
  label="Pick rate"
  value={11.2}
  unit="%"
  delta={-7.2}
  deltaLabel="vs patch 1.1"
  goodWhen="none"
  trend={[17.6, 18.4, 18.1, 14.0, 12.1, 11.2]}
  text="The dash reset on takedown was removed in 1.2."
  tone="warning"
  locale="en"
  actionLabel="See the characters"
  onAction={() => {}}
/>
<InsightCard title="Checkout conversion is up" label="Conversion" value={3.8} unit="%" delta={0.6} goodWhen="up" tone="positive" trend={[3.1, 3.2, 3.3, 3.6, 3.8]} locale="en" />
