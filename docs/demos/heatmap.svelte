<!-- layout: wide -->
<script lang="ts">
  import { Heatmap } from "tallao";

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const slots = ["00-06", "06-12", "12-18", "18-24"];
  const base = [4, 38, 52, 30];
  const data = days.flatMap((day, d) =>
    slots.map((slot, s) => ({
      x: slot,
      y: day,
      value: Math.round(base[s] * (d > 4 ? 0.45 : 1) + ((d * 7 + s * 5) % 9)),
    })),
  );
</script>

<Heatmap title="Support tickets by weekday and time" {data} xs={slots} ys={days} showValues />
