<!-- Two kit Buttons with the impact attachment, one per flavour. -->
<script lang="ts">
  import { Button } from "$lib/components";
  import { impact } from "$lib/motion";
</script>

<Button {@attach impact()}>Confirm</Button>
<Button variant="secondary" {@attach impact({ flavor: "nordic" })}>Skál</Button>
