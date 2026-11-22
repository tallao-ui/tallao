<!-- layout: center; height: 16 -->
<script lang="ts">
  import { ContextMenu, MenuItem, MenuLabel, MenuSeparator } from "tallao";

  let last = $state("Right-click the file");
</script>

<ContextMenu label="File actions">
  {#snippet target(props)}
    <div
      {...props}
      style="display: grid; place-items: center; gap: 0.25rem; width: 18rem; height: 7rem; border: 1px dashed rgb(var(--ta-border)); border-radius: 0.75rem; color: rgb(var(--ta-text-dim)); font-size: 0.875rem"
    >
      <strong style="color: rgb(var(--ta-text))">report-q3.pdf</strong>
      {last}
    </div>
  {/snippet}
  <MenuLabel>File</MenuLabel>
  <MenuItem onSelect={() => (last = "Opened")}>Open</MenuItem>
  <MenuItem onSelect={() => (last = "Renamed")}>Rename</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={() => (last = "Moved to trash")}>Move to trash</MenuItem>
</ContextMenu>
