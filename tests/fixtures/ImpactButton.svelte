<!-- Kit Buttons with the impact attachment: one per flavour, and two disabled ones. -->
<script lang="ts">
  import { Button } from "$lib/components";
  import { impact } from "$lib/motion";
</script>

<Button {@attach impact()}>Confirm</Button>
<Button variant="secondary" {@attach impact({ flavor: "nordic" })}>Skál</Button>
<Button disabled {@attach impact()}>Locked</Button>
<Button disabled href="/gone" {@attach impact()}>Gone</Button>
