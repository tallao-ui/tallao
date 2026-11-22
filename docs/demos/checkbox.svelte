<!-- layout: stack -->
<script lang="ts">
  import { Checkbox } from "tallao";

  let tests = $state(true);
  let notify = $state(false);
  let selected = $state(false);
</script>

<Checkbox bind:checked={tests} label="Run the tests before deploying" />
<Checkbox bind:checked={notify}>Notify the team on Slack</Checkbox>
<Checkbox checked disabled label="Sign the build (required)" />
<Checkbox bind:checked={selected} ariaLabel="Select run 1042" />
<p style="margin: 0; font-size: 0.8125rem; opacity: 0.7">
  Tests {tests ? "on" : "off"}, notifications {notify ? "on" : "off"}, run 1042 {selected ? "selected" : "not selected"}.
</p>
