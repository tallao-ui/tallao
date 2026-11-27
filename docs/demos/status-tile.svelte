<!-- layout: wide -->
<script lang="ts">
  import { Icon, StatusTile } from "tallao";
</script>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: 1rem">
  <StatusTile label="Database" status="ok" value="1 ms" href="#database">
    {#snippet icon()}<Icon name="settings" size={20} />{/snippet}
  </StatusTile>
  <StatusTile label="Cache" status="warn" value="840 ms" description="Answering slowly" />
  <StatusTile label="Job queue" status="down" description="The worker stopped" />
  <StatusTile label="Storage" status="unknown" />
</div>
