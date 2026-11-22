<!-- layout: stack -->
<script lang="ts">
  import { Field, Input, Select, Textarea } from "tallao";

  let email = $state("ana@example");
  let plan = $state("team");
  let bio = $state("");

  const error = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? undefined : "Enter a valid e-mail, like ana@example.com.");
</script>

<Field label="E-mail" required {error}>
  <Input type="email" bind:value={email} />
</Field>
<Field label="Plan">
  <Select
    bind:value={plan}
    options={[
      { value: "free", label: "Free" },
      { value: "team", label: "Team" },
      { value: "enterprise", label: "Enterprise" },
    ]}
  />
</Field>
<Field label="About you" error={bio.length > 80 ? "Keep it under 80 characters." : undefined}>
  <Textarea bind:value={bio} rows={2} />
</Field>
