<!-- layout: stack -->
<script lang="ts">
  import { PromptInput } from "tallao";

  let value = $state("");
  let sent = $state<string[]>([]);
  let loading = $state(false);

  function send(text: string) {
    sent = [...sent, text];
    loading = true;
    setTimeout(() => (loading = false), 1500);
  }
</script>

<PromptInput bind:value {loading} attachments placeholder="Ask the agent to publish, compare, summarise…" onSend={send} onAttach={() => (value = "Summarise the attached file: ")} />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  Enter sends, Shift+Enter adds a line.
  {#if sent.length}Last sent: “{sent[sent.length - 1]}”{/if}
</p>
