<!-- layout: wide -->
<script lang="ts">
  import { CalendarHeatmap } from "tallao";

  const start = Date.UTC(2026, 5, 1);
  const data = Array.from({ length: 182 }, (_, i) => {
    const date = new Date(start + i * 86400000);
    const weekday = date.getUTCDay();
    const busy = weekday === 0 || weekday === 6 ? 0 : 2 + ((i * 7) % 11);
    return { date: date.toISOString().slice(0, 10), value: busy };
  });
</script>

<CalendarHeatmap title="Deploys per day" {data} start="2026-06-01" end="2026-11-30" unit="deploys" weekStartsOn={1} />
