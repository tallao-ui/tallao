<script lang="ts">
  import { PromptInput, type PromptMention } from "$lib/components";

  let { onSend }: { onSend?: (text: string) => void } = $props();

  let value = $state("");
  let picked = $state<string[]>([]);
  const mentions = [
    {
      trigger: "#",
      label: "Channels",
      items: [
        { id: "c1", label: "general", hint: "Text channel" },
        { id: "c2", label: "mod-log", hint: "Text channel · Staff" },
        { id: "c3", label: "welcome" },
      ],
    },
    { trigger: "@", label: "Roles", items: [{ id: "r1", label: "Mod", color: "#f5e94b" }, { id: "r2", label: "Member" }] },
  ];
</script>

<PromptInput bind:value {mentions} ariaLabel="Message" {onSend} onMention={(t: string, item: PromptMention) => (picked = [...picked, `${t}${item.id}`])} />
<output data-testid="value">{value}</output>
<output data-testid="picked">{picked.join(",")}</output>
