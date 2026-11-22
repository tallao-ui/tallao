<!-- layout: stack -->
<script lang="ts">
  import { PasswordInput } from "tallao";

  let value = $state("");
  let revealed = $state(false);
</script>

<label for="api-pass" style="font-size: 0.875rem">Service password</label>
<PasswordInput id="api-pass" bind:value bind:revealed autocomplete="new-password" placeholder="At least 12 characters" />
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">
  {value.length} characters · {revealed ? "visible" : "hidden"}
</p>
