<!-- layout: center; height: 10 -->
<script lang="ts">
  import { Button, Tooltip } from "tallao";
</script>

<Tooltip text="Save changes (Ctrl+S)">
  {#snippet trigger(props)}<Button {...props}>Save</Button>{/snippet}
</Tooltip>

<Tooltip text="Archive this run" placement="bottom">
  {#snippet trigger(props)}<Button variant="outline" ariaLabel="Archive" {...props}>Archive</Button>{/snippet}
</Tooltip>
