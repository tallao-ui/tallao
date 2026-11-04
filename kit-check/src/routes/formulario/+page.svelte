<!--
  Los controles de tallao dentro de un <form method="POST"> con use:enhance. Sin JavaScript
  se envía igual: los valores van en inputs ocultos que ya salen en el HTML del servidor.
-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { Button, Combobox, DatePicker, KeyValueEditor, Switch } from "tallao";

  let { form } = $props();
</script>

<h1>Formulario</h1>
<form method="POST" use:enhance>
  <Switch name="avisos" checked label="Avisos" />
  <Combobox name="pais" value="pe" ariaLabel="País" options={[{ value: "es", label: "España" }, { value: "pe", label: "Perú" }]} />
  <Combobox
    name="etiquetas"
    multiple
    values={["bug", "ux"]}
    ariaLabel="Etiquetas"
    options={[{ value: "bug", label: "Bug" }, { value: "ux", label: "UX" }]}
  />
  <DatePicker name="fecha" value="2026-11-03" ariaLabel="Fecha" />
  <KeyValueEditor name="stats" entries={[{ key: "hp", value: "100" }]} keyLabel="Stat" valueLabel="Valor" />
  <Button type="submit">Enviar</Button>
</form>

{#if form?.recibido}<pre data-testid="recibido">{JSON.stringify(form.recibido)}</pre>{/if}
