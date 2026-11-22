<!-- layout: center; height: 18 -->
<script lang="ts">
  import { Button, DropdownMenu, MenuItem, MenuLabel, MenuSeparator } from "tallao";

  let last = $state("Nothing chosen yet");
  let pinned = $state(true);
</script>

<DropdownMenu label="Project actions">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Actions</Button>{/snippet}
  <MenuLabel>Project</MenuLabel>
  <MenuItem onSelect={() => (last = "Edit")}>Edit</MenuItem>
  <MenuItem onSelect={() => (last = "Duplicate")}>Duplicate</MenuItem>
  <MenuItem checked={pinned} closeOnSelect={false} onSelect={() => (pinned = !pinned)}>Pinned</MenuItem>
  <MenuItem disabled>Transfer</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={() => (last = "Delete")}>Delete</MenuItem>
</DropdownMenu>

<span style="font-size: 0.875rem; color: rgb(var(--ta-text-dim))">{last}</span>
