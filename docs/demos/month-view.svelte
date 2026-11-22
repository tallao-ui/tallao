<!-- layout: wide -->
<script lang="ts">
  import { Badge, MonthView } from "tallao";

  let month = $state("2026-11-01");

  const events: Record<string, string> = {
    "2026-11-05": "Design review",
    "2026-11-12": "Release 2.4",
    "2026-11-19": "Team offsite",
    "2026-11-26": "Retro",
  };
</script>

<MonthView bind:month locale="en" weekStartsOn={0}>
  {#snippet day({ date })}
    {#if events[date]}<Badge>{events[date]}</Badge>{/if}
  {/snippet}
</MonthView>
