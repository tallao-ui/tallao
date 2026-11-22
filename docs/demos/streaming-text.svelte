<!-- layout: stack -->
<script lang="ts">
  import { Button, StreamingText } from "tallao";

  const answer =
    "The patch 1.2 notes are live on Valhalla. Since 1.1, Kaela's pick rate fell from 18.4% to 11.2%, and Oskar moved up two tiers with the shield buff.";

  let text = $state(answer);
  let streaming = $state(false);

  function replay() {
    text = "";
    streaming = true;
    const words = answer.match(/\S+\s*/g) ?? [];
    words.forEach((word, i) => setTimeout(() => (text += word), i * 60));
    setTimeout(() => (streaming = false), words.length * 60 + 200);
  }
</script>

<Button size="sm" variant="outline" disabled={streaming} onclick={replay}>Replay</Button>
<StreamingText {text} {streaming} />
