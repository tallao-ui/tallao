<!--
  SchemaForm como el <form> de una acción de SvelteKit, con use:enhance pasado como
  adjunto, y un CodeEditor dentro. Sin JavaScript se envía igual.
-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { fromAction } from "svelte/attachments";
  import { SchemaForm, type JsonSchema } from "tallao";
  import { CodeEditor } from "tallao/code";

  let { form } = $props();

  const esquema: JsonSchema = {
    type: "object",
    required: ["titulo"],
    properties: {
      titulo: { type: "string", title: "Título", minLength: 3, default: "Hola" },
      estado: {
        type: "string",
        title: "Estado",
        default: "live",
        oneOf: [
          { const: "draft", title: "Borrador" },
          { const: "live", title: "Publicado" },
        ],
      },
      nivel: { type: "integer", title: "Nivel", default: 3 },
      publicar: { type: "string", title: "Publicar el", format: "date", default: "2026-11-04" },
      activo: { type: "boolean", title: "Activo", default: true },
      etiquetas: { type: "array", title: "Etiquetas", default: ["guia", "evento"], items: { enum: ["guia", "parche", "evento"] } },
    },
  };
</script>

<h1>Esquema</h1>
<SchemaForm schema={esquema} name="post" method="POST" submitLabel="Enviar" {@attach fromAction(enhance)}>
  <CodeEditor name="cuerpo" value="# Notas" language="markdown" />
</SchemaForm>

{#if form?.recibido}<pre data-testid="recibido">{JSON.stringify(form.recibido)}</pre>{/if}
