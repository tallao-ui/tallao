<!-- layout: stack -->
<script lang="ts">
  import { PromptInput } from "tallao";

  let value = $state("");
  let sent = $state<string[]>([]);
  let loading = $state(false);

  const mentions = [
    {
      trigger: "#",
      label: "Channels",
      items: [
        { id: "c1", label: "general", hint: "Text channel" },
        { id: "c2", label: "announcements", hint: "Announcement channel" },
        { id: "c3", label: "mod-log", hint: "Text channel · Staff" },
      ],
    },
    {
      trigger: "@",
      label: "Roles",
      items: [
        { id: "r1", label: "Moderator", color: "#f5a524" },
        { id: "r2", label: "Member", color: "#22c3e6" },
      ],
    },
  ];

  function send(text: string) {
    sent = [...sent, text];
    loading = true;
    setTimeout(() => (loading = false), 1500);
  }
</script>

<PromptInput bind:value {loading} {mentions} attachments placeholder="Ask the agent… # for a channel, @ for a role" onSend={send} onAttach={() => (value = "Summarise the attached file: ")} />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  Enter sends, Shift+Enter adds a line. Type # or @ to mention.
  {#if sent.length}Last sent: “{sent[sent.length - 1]}”{/if}
</p>
