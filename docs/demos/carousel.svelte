<!-- layout: wide -->
<script lang="ts">
  import { Carousel } from "tallao";

  const releases = [
    { version: "0.9.0", note: "SplitPane and CardStack" },
    { version: "0.8.0", note: "Heatmap and Sankey charts" },
    { version: "0.7.0", note: "Touch targets everywhere" },
    { version: "0.6.0", note: "DatePicker and ranges" },
    { version: "0.5.0", note: "Motion library" },
  ];
</script>

<Carousel items={releases} label="Releases" slideWidth="14rem" key={(r) => r.version}>
  {#snippet slide(r)}
    <div style="padding: 1rem; border: 1px solid rgb(var(--ta-border)); border-radius: 0.5rem">
      <strong>v{r.version}</strong>
      <p style="margin: 0.25rem 0 0; color: rgb(var(--ta-text-dim))">{r.note}</p>
    </div>
  {/snippet}
</Carousel>
