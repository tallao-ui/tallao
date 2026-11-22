<!-- layout: wide -->
<script lang="ts">
  import { Terminal } from "tallao";
</script>

<Terminal
  title="support-agent · ~/shop"
  lines={[
    { kind: "comment", text: "Find the late orders and draft the apology emails" },
    { kind: "command", text: "orders list --status late" },
    { text: "#1042  Ana Ruiz     3 days late" },
    { text: "#1047  Leo Marín    1 day late" },
    { kind: "info", text: "2 customers to contact" },
    { kind: "command", text: "mail draft --template delay --to 1042,1047" },
    { kind: "success", text: "2 drafts saved, waiting for your approval" },
  ]}
/>
