<!-- StatusTile in its four verdicts, as a link and as a block (StatusTilesEs: the same under setLabels(es)). -->
<script lang="ts">
  import { DashboardGrid, Icon, StatusTile } from "$lib/components";
</script>

<DashboardGrid columns={4}>
  <StatusTile label="Database" status="ok" value="1 ms" href="/health/db" data-testid="ok">
    {#snippet icon()}<Icon name="settings" size={20} />{/snippet}
  </StatusTile>
  <StatusTile label="Cache" status="warn" description="Answering slowly" data-testid="warn" />
  <StatusTile label="Job queue" status="down" value={0} data-testid="down" />
  <StatusTile label="Storage" status="unknown" data-testid="unknown" />
  <StatusTile label="Worker" status="ok" statusLabel="Running" span={2} data-testid="custom" />
</DashboardGrid>
