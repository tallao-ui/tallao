<!-- layout: stack -->
<script lang="ts">
  import { CohortGrid } from "tallao";
</script>

<CohortGrid
  title="Cohort retention"
  sizeLabel="Customers"
  locale="en"
  periods={["M0", "M1", "M2", "M3", "M4", "M5"]}
  cohorts={[
    { label: "Jul 2026", size: 486, values: [100, 64, 52, 47, 44, 41] },
    { label: "Aug 2026", size: 512, values: [100, 61, 50, 45, 42] },
    { label: "Sep 2026", size: 468, values: [100, 66, 54, 48] },
    { label: "Oct 2026", size: 541, values: [100, 63, 51] },
    { label: "Nov 2026", size: 1126, values: [100, 58] },
    { label: "Dec 2026", size: 624, values: [100] },
  ]}
/>
