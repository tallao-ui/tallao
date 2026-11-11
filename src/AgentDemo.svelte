<!--
  tallao — the Agent screen
  A full agent run built only from the kit: what the user asked and what the model was given,
  its reasoning, the tools it called, the tasks in flight, a human approval, the streamed
  answer with its sources, and the usage. It is a composition to copy, not a component:

    rail      ContextCards · TaskList · UsageMeter · InsightCard
    thread    ChatMessage (user) → Thinking → ToolChips → ApprovalCard → StreamingText
              → Sources → RecommendationCard
    footer    PromptInput (+ TaskList capsule while a run is in flight)

  The run is simulated with timers; "Replay" plays it from the start and stops at the
  approval, as a real run would.
-->
<script lang="ts">
  import {
    ApprovalCard,
    Button,
    ChatMessage,
    ContextCards,
    Icon,
    InsightCard,
    PromptInput,
    RecommendationCard,
    Sources,
    StreamingText,
    TaskList,
    Thinking,
    ToolChips,
    UsageMeter,
    type ContextItem,
    type TaskItem,
    type ToolChipCall,
  } from "$lib/components";
  import { rise } from "$lib/motion";

  const question = "Publish the patch 1.2 notes and tell me what changed in the meta since 1.1.";
  const answer =
    "The patch 1.2 notes are live on Valhalla. Since 1.1, Kaela's pick rate fell from 18.4% to 11.2% after her dash reset was removed, " +
    "and Oskar moved up two tiers with the 10% shield buff.\n\nThe controller rework is still on the test server, so the November tier list keeps " +
    "the three controllers where they were. I left the Discord announcement as a draft for you to review.";

  const allCalls: ToolChipCall[] = [
    { id: "1", verb: "Read", target: "posts/patch-1-2.md", icon: "file" },
    { id: "2", verb: "Search", target: "pick rate by patch", icon: "search", name: "query_stats", args: { metric: "pick_rate", patches: ["1.1", "1.2"] }, result: "42 rows" },
    { id: "3", verb: "Write", target: "tier-list/november.json", icon: "edit", added: 74, removed: 41 },
    { id: "4", verb: "Publish", target: "post #42", icon: "upload", name: "publish_post", args: { id: 42, site: "valhalla", notify: false }, result: "Published at 18:40" },
  ];
  const steps = ["Read the draft of the patch notes", "Compared pick and win rates between 1.1 and 1.2", "Checked which changes reached the live server"];

  let context = $state<ContextItem[]>([
    { id: "c1", title: "patch-1-2.md", type: "file", meta: "6.1 KB" },
    { id: "c2", title: "Match stats", type: "record", meta: "1.24M rows" },
    { id: "c3", title: "Patch 1.1 notes", type: "link", meta: "valhalla.gg" },
  ]);

  // The whole run as one number: how far it got. 6 = finished (the state the page opens in).
  let stage = $state(6);
  let approval = $state<"pending" | "approved" | "rejected">("approved");
  let streamed = $state(answer);
  let prompt = $state("");
  let timers: ReturnType<typeof setTimeout>[] = [];

  const thinking = $derived(stage === 1);
  const calls = $derived(allCalls.slice(0, stage >= 4 ? 4 : stage >= 3 ? 3 : stage >= 2 ? 2 : 0).map((c, i, all) => (stage === 2 && i === all.length - 1 ? { ...c, status: "running" as const } : c)));
  const tasks = $derived<TaskItem[]>([
    { id: "t1", title: "Read the patch notes", status: stage >= 2 ? "done" : stage === 1 ? "running" : "pending", meta: stage >= 2 ? "4 s" : undefined },
    { id: "t2", title: "Compare the meta across patches", status: stage >= 3 ? "done" : stage === 2 ? "running" : "pending", done: 5, total: 8, detail: "Pick rate, win rate and ban rate for 31 characters, patches 1.1 and 1.2." },
    { id: "t3", title: "Publish the post", status: approval === "rejected" ? "failed" : stage >= 5 ? "done" : stage >= 3 ? "running" : "pending", detail: approval === "rejected" ? "Rejected by the reviewer." : "Waits for a human approval before it goes live." },
    { id: "t4", title: "Write the summary", status: stage >= 6 ? "done" : stage === 5 ? "running" : "pending" },
  ]);
  const busy = $derived(stage < 6 && approval !== "rejected");

  const later = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
  const stop = () => {
    timers.forEach(clearTimeout);
    timers = [];
  };
  $effect(() => stop);

  function replay() {
    stop();
    stage = 1;
    approval = "pending";
    streamed = "";
    later(2600, () => (stage = 2));
    later(4400, () => (stage = 3));
  }

  function approve() {
    approval = "approved";
    stage = 4;
    later(700, () => {
      stage = 5;
      const words = answer.match(/\S+\s*/g) ?? [];
      words.forEach((word, i) => later(i * 45, () => (streamed += word)));
      later(words.length * 45 + 200, () => (stage = 6));
    });
  }

  function reject() {
    stop();
    approval = "rejected";
  }
</script>

<div class="agent">
  <aside class="agent-rail" aria-label="Run details">
    <section>
      <h4 class="agent-h">Context</h4>
      <ContextCards layout="stack" items={context} onRemove={(item) => (context = context.filter((c) => c.id !== item.id))} />
    </section>
    <section>
      <h4 class="agent-h">Tasks</h4>
      <TaskList {tasks} />
    </section>
    <section>
      <UsageMeter used={stage >= 6 ? 48200 : 12000 + stage * 6000} max={200000} cost={stage >= 6 ? "$0.38" : undefined} />
    </section>
    {#if stage >= 6}
      <section in:rise>
        <InsightCard
          level={4}
          title="Kaela's pick rate fell by a third"
          label="Pick rate"
          value={11.2}
          unit="%"
          delta={-7.2}
          deltaLabel="vs patch 1.1"
          trend={[17.6, 18.4, 18.1, 14.0, 12.1, 11.2]}
          text="The dash reset on takedown was removed in 1.2."
          tone="warning"
          locale="en"
        />
      </section>
    {/if}
  </aside>

  <div class="agent-main">
    <header class="agent-top">
      <span class="agent-title"><Icon name="bot" size={16} />Publisher agent</span>
      <Button variant="ghost" size="sm" onclick={replay}><Icon name="refresh" size={14} />Replay</Button>
    </header>

    <div class="agent-thread">
      <ChatMessage role="user" author="Ana" content={question} />

      <div class="agent-turn">
        <Thinking running={thinking} summary="Comparing pick rates across patches" seconds={stage >= 2 ? 9 : undefined} {steps}>
          The notes are ready to publish, but publishing is visible to everyone, so it needs an approval first. The meta question only needs the stats table.
        </Thinking>

        {#if calls.length}
          <div in:rise><ToolChips {calls} messages={stage >= 6 ? 2 : 1} /></div>
        {/if}

        {#if stage >= 3}
          <div in:rise>
            <ApprovalCard
              level={4}
              requester="Publisher agent"
              title="Publish “Patch 1.2 notes” on Valhalla"
              description="The post goes live now and the home page is rebuilt."
              changes={[
                { field: "status", label: "Status", before: "In review", after: "Published" },
                { field: "published_at", label: "Published at", before: null, after: "2026-11-03 18:40" },
              ]}
              risk="Visible to every visitor. It can be unpublished, but feeds may already have it."
              riskLevel="medium"
              status={approval}
              outcome={approval === "approved" ? "Approved by Ana · just now" : approval === "rejected" ? "Rejected by Ana · the post stays in review" : undefined}
              onApprove={approve}
              onReject={reject}
              onEdit={() => {}}
            />
          </div>
        {/if}

        {#if stage >= 5}
          <div class="agent-answer" in:rise>
            <StreamingText text={streamed} streaming={stage === 5} />
          </div>
        {/if}

        {#if stage >= 6}
          <div in:rise={{ delay: 80 }}>
            <Sources
              compact
              sources={[
                { url: "https://valhalla.gg/news/patch-1-2", title: "Patch 1.2 notes" },
                { url: "https://stats.valhalla.gg/meta/pick-rates", title: "Pick rates by patch" },
                { url: "https://esports.example.com/autumn-open", title: "Autumn Open finals" },
              ]}
            />
          </div>
          <div in:rise={{ delay: 160 }}>
            <RecommendationCard
              level={4}
              title="Send the Discord announcement now"
              description="The draft is ready and the patch notes are live."
              reasons={["Announcements within an hour of a patch get twice the clicks", "The #news channel has had no post in 6 days"]}
              confidence="medium"
              actionLabel="Review the draft"
              onAction={() => {}}
              secondaryLabel="Not now"
              onSecondary={() => {}}
            />
          </div>
        {/if}
      </div>
    </div>

    <footer class="agent-prompt">
      {#if busy}<div class="agent-capsule"><TaskList variant="capsule" label="Tasks of this run" {tasks} /></div>{/if}
      <PromptInput bind:value={prompt} loading={busy && approval !== "pending"} placeholder="Ask for a follow-up…" attachments onSend={replay} />
    </footer>
  </div>
</div>

<style>
  .agent {
    display: grid;
    grid-template-columns: 17.5rem minmax(0, 1fr);
    min-height: 40rem;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
    background: rgb(var(--ta-bg));
  }

  .agent-rail {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
    padding: 1rem;
    background: rgb(var(--ta-surface) / 0.4);
    border-right: 1px solid rgb(var(--ta-border));
  }
  .agent-h {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }

  .agent-main { display: flex; flex-direction: column; min-width: 0; }
  .agent-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid rgb(var(--ta-border));
  }
  .agent-title { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 600; }

  .agent-thread {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
    max-width: 46rem;
    margin: 0 auto;
    padding: 1.25rem 1rem;
  }
  .agent-turn { display: flex; flex-direction: column; gap: 0.75rem; min-width: 0; }
  .agent-answer { font-size: 0.9375rem; }

  .agent-prompt {
    position: sticky;
    bottom: 0;
    width: 100%;
    max-width: 46rem;
    margin: 0 auto;
    padding: 0.5rem 1rem 1rem;
    background: linear-gradient(transparent, rgb(var(--ta-bg)) 1.25rem);
  }
  .agent-capsule { margin-bottom: 0.5rem; }

  @media (max-width: 860px) {
    .agent { grid-template-columns: minmax(0, 1fr); }
    .agent-rail { order: 2; border-right: none; border-top: 1px solid rgb(var(--ta-border)); }
  }
</style>
