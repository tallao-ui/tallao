<script lang="ts">
  import { Field, Input } from "$lib/components";

  let value = $state("12ab");
  const error = $derived(/^\d{15,20}$/.test(value) ? undefined : "A Discord id is 15 to 20 digits.");
</script>

<Field label="Member id" {error}>
  <Input bind:value />
</Field>
<button type="button" onclick={() => (value = "444444444444444444")}>Fix it</button>
