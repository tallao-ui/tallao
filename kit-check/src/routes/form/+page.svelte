<!--
  tallao's controls inside a <form method="POST"> with use:enhance. Without JavaScript
  it submits all the same: the values go in hidden inputs that are already in the server HTML.
-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button, Combobox, DatePicker, KeyValueEditor, Switch } from "tallao";

  let { form } = $props();
</script>

<h1>Form</h1>
<form method="POST" use:enhance>
  <Switch name="alerts" checked label="Alerts" />
  <Combobox name="country" value="pe" ariaLabel="Country" options={[{ value: "es", label: "Spain" }, { value: "pe", label: "Peru" }]} />
  <Combobox
    name="tags"
    multiple
    values={["bug", "ux"]}
    ariaLabel="Tags"
    options={[{ value: "bug", label: "Bug" }, { value: "ux", label: "UX" }]}
  />
  <DatePicker name="date" value="2026-11-03" ariaLabel="Date" />
  <KeyValueEditor name="stats" entries={[{ key: "hp", value: "100" }]} keyLabel="Stat" valueLabel="Value" />
  <Button type="submit">Send</Button>
</form>

{#if form?.received}<pre data-testid="received">{JSON.stringify(form.received)}</pre>{/if}
