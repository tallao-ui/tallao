<!-- layout: wide -->
<script lang="ts">
  import { Badge, Progress, ScenePlayer, Stat, type PlayerScene } from "tallao";

  const scenes: PlayerScene[] = [
    { id: "ask", title: "The question", duration: 4000, caption: "Ana asks what changed in the meta since patch 1.1." },
    { id: "run", title: "The run", duration: 5000, caption: "The agent reads the notes and compares pick rates." },
    { id: "answer", title: "The answer", duration: 4000, caption: "Kaela fell from 18.4% to 11.2% after the dash change." },
  ];
</script>

<ScenePlayer {scenes} label="Patch 1.2 replay">
  {#snippet scene(s, progress)}
    <div style="display: grid; place-content: center; gap: 1rem; min-height: 14rem; padding: 1.5rem; text-align: center">
      <div><Badge>{s.title}</Badge></div>
      {#if s.id === "ask"}
        <p style="margin: 0; font-size: 1.125rem">Publish the notes and tell me what changed.</p>
      {:else if s.id === "run"}
        <Progress value={Math.round(progress * 100)} label="Comparing patches" />
      {:else}
        <Stat label="Kaela pick rate" value={`${(18.4 - 7.2 * progress).toFixed(1)}%`} />
      {/if}
    </div>
  {/snippet}
</ScenePlayer>
