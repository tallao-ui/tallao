<!-- The agent-run components: Thinking, StreamingText, ToolChips, TaskList, ApprovalCard, ContextCards,
     RecommendationCard and InsightCard. -->
<script lang="ts">
  import {
    ApprovalCard,
    ContextCards,
    InsightCard,
    RecommendationCard,
    StreamingText,
    TaskList,
    Thinking,
    ToolChips,
    type ContextItem,
  } from "$lib/components";

  let {
    running = false,
    text = "First sentence. Second",
    streaming = false,
    stream,
    onDone,
    status = "pending",
    onApprove,
    onReject,
    onEdit,
    onAction,
    onDismiss,
  }: {
    running?: boolean;
    text?: string;
    streaming?: boolean;
    stream?: AsyncIterable<string>;
    onDone?: (text: string) => void;
    status?: "pending" | "approved" | "rejected" | "expired";
    onApprove?: () => void | Promise<void>;
    onReject?: () => void | Promise<void>;
    onEdit?: () => void;
    onAction?: () => void | Promise<void>;
    onDismiss?: () => void;
  } = $props();

  let context = $state<ContextItem[]>([
    { id: "1", title: "brief.md", type: "file", meta: "4.2 KB" },
    { id: "2", title: "Post #42", type: "record", meta: "posts", href: "/posts/42" },
    { id: "3", title: "Patch notes", type: "link", excerpt: "Dash reset removed." },
  ]);
  let expanded = $state<string[]>([]);
</script>

<Thinking {running} summary="Reading the brief" seconds={12} steps={["Read the brief", "Compared three sources"]} data-testid="thinking">
  It weighed the two options.
</Thinking>
<Thinking seconds={75} data-testid="thinking-plain" />

<StreamingText {text} {streaming} data-testid="stream" />
{#if stream}<StreamingText {stream} {onDone} data-testid="stream-iterable" />{/if}

<ToolChips
  messages={2}
  calls={[
    { id: "1", verb: "Read", target: "brief.md", icon: "file" },
    { id: "2", verb: "Write", target: "Schedule.tsx", icon: "edit", added: 74, removed: 41 },
    { id: "3", verb: "Run", target: "pnpm test", icon: "terminal", status: "running" },
    { id: "4", verb: "Publish", target: "post #42", name: "publish_post", args: { id: 42 }, result: "Published" },
    { id: "5", verb: "Notify", target: "Discord", status: "failed" },
  ]}
/>
<ToolChips collapsible={false} ariaLabel="Edits" calls={[{ id: "a", verb: "Edit", target: "a.ts" }]} />

<TaskList
  bind:expanded
  tasks={[
    { id: "a", title: "Collect match data", status: "done", meta: "12 s" },
    { id: "b", title: "Recompute tier list", status: "running", done: 3, total: 8, detail: "Fire, Water and Grass are done." },
    { id: "c", title: "Write the summary" },
    { id: "d", title: "Post to Discord", status: "failed", detail: "The webhook answered 401." },
  ]}
/>
<output data-testid="expanded">{expanded.join(",")}</output>
<TaskList
  variant="capsule"
  label="Capsule tasks"
  tasks={[
    { id: "a", title: "Collect match data", status: "done" },
    { id: "b", title: "Recompute tier list", status: "running" },
    { id: "c", title: "Write the summary" },
  ]}
/>

<ApprovalCard
  data-testid="approval"
  requester="Publisher agent"
  title="Publish “Patch 1.2 notes”"
  description="The post goes live now."
  changes={[{ field: "status", label: "Status", before: "In review", after: "Published" }]}
  tool="publish_post"
  args={{ id: 42, notify: true }}
  risk="Visible to every visitor."
  riskLevel="high"
  {status}
  outcome={status === "approved" ? "Approved by Ana" : undefined}
  {onApprove}
  {onReject}
  {onEdit}
>
  <label>Note <input name="note" /></label>
</ApprovalCard>

<ContextCards items={context} onRemove={(item) => (context = context.filter((c) => c.id !== item.id))} />
<ContextCards label="Read only" layout="stack" items={[{ id: "x", title: "notes.txt", type: "text" }]} />

<RecommendationCard
  title="Feature the patch notes"
  description="It is the most read post of the week."
  reasons={["9,810 views in 7 days", "No featured post since Monday"]}
  confidence="high"
  actionLabel="Feature it"
  {onAction}
  secondaryLabel="Alternatives"
  onSecondary={() => {}}
  {onDismiss}
/>

<InsightCard
  title="Kaela's pick rate doubled"
  label="Pick rate"
  value={18.4}
  unit="%"
  delta={9.1}
  deltaLabel="vs patch 1.0"
  goodWhen="up"
  trend={[9, 9.3, 14.2, 18.4]}
  text="The dash reset made her the default opener."
  actionLabel="Open the matchup table"
  actionHref="/meta/kaela"
  locale="en"
/>
