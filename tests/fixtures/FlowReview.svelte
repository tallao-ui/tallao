<!-- An edit under review on a flow (FlowNode change), and a replayed run (TaskList skipped, stopped, current). -->
<script lang="ts">
  import { FlowNode, TaskList, type FlowNodeChange, type TaskItem } from "$lib/components";

  let { current = "b" }: { current?: string } = $props();

  const nodes: Array<{ label: string; change?: FlowNodeChange }> = [
    { label: "Cooldown" },
    { label: "Give coins", change: "changed" },
    { label: "Reply", change: "added" },
    { label: "Old reply", change: "removed" },
  ];
  const run: TaskItem[] = [
    { id: "a", title: "Cooldown", status: "done" },
    { id: "b", title: "Give coins", status: "skipped", detail: "balance < 100" },
    { id: "c", title: "Stop", status: "stopped" },
    { id: "d", title: "Reply", status: "pending" },
  ];
</script>

<ol aria-label="Review">
  {#each nodes as n (n.label)}
    <li><FlowNode label={n.label} change={n.change} changeLabel={n.change === "added" ? "New" : undefined} /></li>
  {/each}
</ol>
<TaskList tasks={run} {current} label="Run" />
