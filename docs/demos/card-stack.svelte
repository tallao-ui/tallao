<!-- layout: stack; height: 16 -->
<script lang="ts">
  import { CardStack } from "tallao";

  let index = $state(0);
  const tips = [
    { title: "Shortcuts", body: "Press Ctrl+K to open the command palette." },
    { title: "Saved views", body: "Pin a filter set and reuse it next week." },
    { title: "Approvals", body: "Review tool calls before an agent runs them." },
  ];
</script>

<CardStack items={tips} bind:index loop label="Tips">
  {#snippet card(tip)}
    <div style="padding: 1rem">
      <strong>{tip.title}</strong>
      <p style="margin: 0.25rem 0 0; color: rgb(var(--ta-text-dim))">{tip.body}</p>
    </div>
  {/snippet}
</CardStack>
<p style="color: rgb(var(--ta-text-dim))">Showing card {index + 1} of {tips.length}</p>
