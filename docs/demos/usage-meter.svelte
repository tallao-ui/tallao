<!-- layout: stack -->
<script lang="ts">
  import { UsageMeter } from "tallao";

  let used = $state(48200);
</script>

<UsageMeter {used} max={200000} cost="$0.38" />
<UsageMeter used={172000} max={200000} label="Context window" />
<UsageMeter used={200000} max={200000} unit="minutes" label="Voice minutes" />
<UsageMeter compact used={12} max={50} unit="runs" />

<label style="font-size: 0.875rem">
  Tokens used
  <input type="range" min="0" max="200000" step="1000" bind:value={used} />
</label>
