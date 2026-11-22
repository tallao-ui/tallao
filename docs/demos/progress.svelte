<!-- layout: stack -->
<script lang="ts">
  import { Progress } from "tallao";
</script>

<Progress label="Uploading" value={64} showValue />
<Progress label="Indexing" value={null} />
<Progress label="Tests passed" value={100} variant="success" showValue />
<Progress label="Disk space" value={92} variant="warning" valueText="92% used" showValue />
<Progress label="Failed jobs" value={30} variant="error" />
