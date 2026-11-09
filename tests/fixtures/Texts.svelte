<!-- Sets the kit's texts with setLabels and mounts components that use them. -->
<script lang="ts">
  import { Alert, ConfirmDialog, PromptInput, ToolCallCard } from "$lib/components";
  import { setLabels, type Labels } from "$lib/i18n";
  import { untrack } from "svelte";

  let { labels, open = false }: { labels?: Partial<Labels>; open?: boolean } = $props();
  // The texts are set once, on mount, as in a real application.
  const initial = untrack(() => labels);
  if (initial) setLabels(initial);
</script>

<Alert onDismiss={() => {}}>Notice</Alert>
<PromptInput attachments />
<ToolCallCard name="publish_post" onApprove={() => {}} onReject={() => {}} />
<ToolCallCard name="build" status="failed" labels={{ failed: "Broken" }} />
<ConfirmDialog {open} title="Are you sure?" onConfirm={() => {}} />
