<!-- layout: stack -->
<script lang="ts">
  import { ToolCallCard } from "tallao";

  let status = $state<"pending" | "executing" | "executed" | "rejected">("pending");

  function approve() {
    status = "executing";
    setTimeout(() => (status = "executed"), 1200);
  }
</script>

<ToolCallCard
  name="publish_post"
  args={{ id: 42, site: "valhalla", notify: false }}
  {status}
  result={status === "executed" ? "Published at 18:40" : undefined}
  onApprove={approve}
  onReject={() => (status = "rejected")}
/>
<ToolCallCard name="query_stats" args={{ metric: "pick_rate" }} status="executed" result="42 rows" />
<ToolCallCard name="send_email" args={{ to: "team@valhalla.gg" }} status="failed" result="SMTP timeout" />
