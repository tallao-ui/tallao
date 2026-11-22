<!-- layout: stack -->
<script lang="ts">
  import { Alert } from "tallao";

  let dismissed = $state(false);
</script>

<Alert title="Heads up">A new version of the kit is available.</Alert>
<Alert variant="success" title="Saved">Your changes are live.</Alert>
<Alert variant="warning" title="Almost there">The token expires in two days.</Alert>
{#if !dismissed}
  <Alert variant="error" title="Could not save" onDismiss={() => (dismissed = true)}>
    The API answered with a 503. Try again in a moment.
  </Alert>
{/if}
