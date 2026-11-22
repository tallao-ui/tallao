<!-- layout: stack -->
<script lang="ts">
  import { Button, ChatMessage, ChatThread } from "tallao";

  type Role = "user" | "assistant";
  let messages = $state<{ id: number; role: Role; text: string }[]>([
    { id: 1, role: "user", text: "Publish the patch 1.2 notes." },
    { id: 2, role: "assistant", text: "Done. The post is live on Valhalla." },
    { id: 3, role: "user", text: "And the Discord announcement?" },
    { id: 4, role: "assistant", text: "It is saved as a draft for you to review." },
  ]);
  let follow = $state(true);

  const add = () => {
    const role: Role = messages.length % 2 ? "assistant" : "user";
    messages = [...messages, { id: messages.length + 1, role, text: "Another message to scroll past." }];
  };
</script>

<ChatThread bind:follow label="Publisher conversation" style="height: 14rem; padding: 0.5rem">
  <div style="display: flex; flex-direction: column; gap: 0.75rem">
    {#each messages as m (m.id)}
      <ChatMessage role={m.role} content={m.text} />
    {/each}
  </div>
</ChatThread>
<div style="display: flex; align-items: center; gap: 0.75rem">
  <Button size="sm" variant="outline" onclick={add}>Add a message</Button>
  <span style="font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">{follow ? "Following the latest" : "Scrolled up"}</span>
</div>
