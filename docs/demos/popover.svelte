<!-- layout: center; height: 18 -->
<script lang="ts">
  import { Button, Popover, Switch } from "tallao";

  let errorsOnly = $state(true);
  let live = $state(false);
</script>

<Popover title="Log filters">
  {#snippet trigger(props)}<Button variant="outline" {...props}>Filters</Button>{/snippet}
  <div style="display: grid; gap: 0.75rem; font-size: 0.875rem">
    <Switch bind:checked={errorsOnly} label="Errors only" />
    <Switch bind:checked={live} label="Live tail" />
  </div>
</Popover>
