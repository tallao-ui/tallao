<!-- A required Field around an input and a select, and one that stops being required. -->
<script lang="ts">
  import { Field, Input, Select } from "$lib/components";

  let required = $state(true);
</script>

<Field label="Server name" required><Input /></Field>
<Field label="Channel" required><Select options={[{ value: "1", label: "#general" }]} /></Field>
<Field label="Nickname" {required}><Input /></Field>
<button type="button" onclick={() => (required = false)}>Make optional</button>
