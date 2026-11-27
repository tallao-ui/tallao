<script lang="ts">
  import { Field, Input } from "$lib/components";

  let value = $state("");
  let bad = $state(false);
</script>

<Field label="Budget" hint="Empty: no budget." error={bad ? "Too high." : undefined}>
  <Input bind:value />
</Field>
<button type="button" onclick={() => (bad = !bad)}>Toggle error</button>
