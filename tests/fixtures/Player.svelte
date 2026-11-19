<!-- A ScenePlayer with three scenes; the page shows what it gets. -->
<script lang="ts">
  import { ScenePlayer } from "$lib/components";

  let { autoplay = false }: { autoplay?: boolean } = $props();
  let time = $state(0);
  let playing = $state(false);
  let changes = $state<string[]>([]);
</script>

<ScenePlayer
  label="Tutorial"
  {autoplay}
  bind:time
  bind:playing
  onSceneChange={(s) => (changes = [...changes, s.id])}
  scenes={[
    { id: "paste", title: "Paste", duration: 4000, caption: "Paste a capture." },
    { id: "send", title: "Send", duration: 6000, caption: "Send it." },
    { id: "copy", title: "Copy", duration: 2000 },
  ]}
>
  {#snippet scene(s, progress)}<p data-testid="frame">{s.id}:{progress.toFixed(2)}</p>{/snippet}
</ScenePlayer>
<span data-testid="time">{Math.round(time)}</span>
<span data-testid="playing">{playing}</span>
<span data-testid="changes">{changes.join(",")}</span>
