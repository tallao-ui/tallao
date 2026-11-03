<!-- Fija los textos del kit con setLabels y monta componentes que los usan. -->
<script lang="ts">
  import { Alert, ConfirmDialog, PromptInput, ToolCallCard } from "$lib/components";
  import { setLabels, type Labels } from "$lib/i18n";
  import { untrack } from "svelte";

  let { labels, abierto = false }: { labels?: Partial<Labels>; abierto?: boolean } = $props();
  // Los textos se fijan una vez, al montar, como en una aplicación real.
  const inicial = untrack(() => labels);
  if (inicial) setLabels(inicial);
</script>

<Alert onDismiss={() => {}}>Aviso</Alert>
<PromptInput attachments />
<ToolCallCard name="publish_post" onApprove={() => {}} onReject={() => {}} />
<ToolCallCard name="build" status="failed" labels={{ failed: "Roto" }} />
<ConfirmDialog open={abierto} title="¿Seguro?" onConfirm={() => {}} />
