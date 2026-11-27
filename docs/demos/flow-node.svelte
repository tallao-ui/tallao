<!-- layout: stack -->
<script lang="ts">
  import { Button, FlowNode, Icon, SortableList, type FlowNodeStatus } from "tallao";

  let steps = $state([
    { id: "cooldown", name: "Cooldown", summary: "Once every 24 hours", icon: "clock" as const, color: "rgb(var(--ta-series-3))" },
    { id: "coins", name: "Give coins", summary: "100 coins to the member", icon: "coin" as const, color: "rgb(var(--ta-series-4))" },
    { id: "reply", name: "Reply", summary: "+100 coins, @nova. You have 1,350 now.", icon: "message" as const, color: "rgb(var(--ta-series-1))" },
  ]);
  let picked = $state(1);
  let run = $state<FlowNodeStatus[]>(["done", "running", "pending"]);

  function reorder(from: number, to: number) {
    const next = [...steps];
    next.splice(to, 0, next.splice(from, 1)[0]);
    steps = next;
  }
</script>

<SortableList variant="bare" items={steps} key={(s) => s.id} label={(s) => s.name} onReorder={reorder} ariaLabel="Steps of /daily">
  {#snippet row(step, i)}
    <FlowNode index={i + 1} label={step.name} description={step.summary} status={run[i]} color={step.color} selected={picked === i} onclick={() => (picked = i)}>
      {#snippet icon()}<Icon name={step.icon} />{/snippet}
    </FlowNode>
  {/snippet}
</SortableList>
<Button variant="outline" size="sm" onclick={() => (run = ["done", "done", "stopped"])}>Finish the run</Button>
