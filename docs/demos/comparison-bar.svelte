<!-- layout: stack -->
<script lang="ts">
  import { ComparisonBar } from "tallao";
</script>

<ComparisonBar title="Revenue by platform" showShare left={{ label: "Web", value: 31800 }} right={{ label: "Mobile", value: 16400 }} format={(n) => `$${n.toLocaleString("en")}`} />
<ComparisonBar title="Sign-ups: this month vs last" showShare left={{ label: "November", value: 3120 }} right={{ label: "October", value: 2740 }} locale="en" />
