<!-- A ChatThread with a few messages; `more` adds one. -->
<script lang="ts">
  import { ChatMessage, ChatThread } from "$lib/components";

  let messages = $state(["Hello", "Hi, how can I help?"]);
  let follow = $state(true);
</script>

<ChatThread label="Conversation" bind:follow style="height: 100px">
  {#each messages as m, i (i)}<ChatMessage role={i % 2 ? "assistant" : "user"} content={m} />{/each}
</ChatThread>
<button type="button" onclick={() => (messages = [...messages, `Message ${messages.length + 1}`])}>more</button>
<span data-testid="follow">{follow}</span>
