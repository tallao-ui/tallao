<!-- layout: stack -->
<script lang="ts">
  import { ApprovalCard } from "tallao";

  let status = $state<"pending" | "approved" | "rejected">("pending");
</script>

<ApprovalCard
  requester="Publisher agent"
  title="Publish “Patch 1.2 notes” on Valhalla"
  description="The post goes live now and the home page is rebuilt."
  changes={[
    { field: "status", label: "Status", before: "In review", after: "Published" },
    { field: "published_at", label: "Published at", before: null, after: "2026-11-03 18:40" },
  ]}
  risk="Visible to every visitor. It can be unpublished, but feeds may already have it."
  riskLevel="medium"
  {status}
  outcome={status === "approved" ? "Approved by Ana · just now" : status === "rejected" ? "Rejected by Ana · the post stays in review" : undefined}
  onApprove={() => {
    status = "approved";
  }}
  onReject={() => {
    status = "rejected";
  }}
  onEdit={() => {}}
/>
