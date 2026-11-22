<!-- layout: stack -->
<script lang="ts">
  import { Funnel } from "tallao";

  const steps = [
    { label: "Visited pricing", value: 12400 },
    { label: "Started trial", value: 3720 },
    { label: "Invited a teammate", value: 1860 },
    { label: "Connected a data source", value: 1190 },
    { label: "Upgraded to paid", value: 410 },
  ];
</script>

<Funnel title="Trial to paid conversion" data={steps} />
