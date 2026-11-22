<!-- layout: stack -->
<script lang="ts">
  import { Switch } from "tallao";

  let autoApprove = $state(false);
  let notify = $state(true);
</script>

<Switch bind:checked={autoApprove} label="Auto-approve read-only tools" />
<Switch bind:checked={notify} size="sm" label="Notify me when the run finishes" />
<Switch checked disabled label="Audit log (managed by your admin)" />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  Auto-approve is {autoApprove ? "on" : "off"}, notifications are {notify ? "on" : "off"}.
</p>
