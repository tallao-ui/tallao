<!-- PasswordInput inside a native <form>, and a FloatingScene with content on top. -->
<script lang="ts">
  import { Field, FloatingScene, PasswordInput } from "$lib/components";

  let secret = $state("hunter2");
  let revealed = $state(false);
  let changes = $state<boolean[]>([]);
</script>

<FloatingScene tiles={["BEG READ", "GOTO", "IF"]} seed={3} data-testid="scene">
  <form data-testid="form">
    <Field label="Password">
      <PasswordInput name="password" bind:value={secret} bind:revealed autocomplete="current-password" onRevealChange={(r) => (changes = [...changes, r])} />
    </Field>
  </form>
</FloatingScene>
<span data-testid="revealed">{revealed}</span>
<span data-testid="changes">{changes.join(",")}</span>
