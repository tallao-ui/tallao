<!-- FlowNode: a pickable flow with run states, a plain block, and actions beside the body. -->
<script lang="ts">
  import { Button, FlowNode, Icon, type FlowNodeStatus } from "$lib/components";

  let { statuses = ["done", "running", "pending"] as FlowNodeStatus[] }: { statuses?: FlowNodeStatus[] } = $props();

  const steps = ["Cooldown", "Give coins", "Reply"];
  let picked = $state<number | null>(null);
  let removed = $state("");
</script>

<ol aria-label="Flow">
  {#each steps as step, i (step)}
    <li>
      <FlowNode index={i + 1} label={step} description={`Step ${i + 1}`} status={statuses[i]} selected={picked === i} onclick={() => (picked = i)} color="rgb(var(--ta-series-3))">
        {#snippet icon()}<Icon name="branch" />{/snippet}
        {#if i === 1}<span>Only if balance ≥ 5000</span>{/if}
        {#snippet actions()}<Button variant="ghost" size="icon" ariaLabel={`Remove ${step}`} onclick={() => (removed = step)}>×</Button>{/snippet}
      </FlowNode>
    </li>
  {/each}
</ol>
<FlowNode label="Read only" status="stopped" statusLabel="Stopped here" data-testid="block" />
<p data-testid="picked">{picked ?? ""}</p>
<p data-testid="removed">{removed}</p>
