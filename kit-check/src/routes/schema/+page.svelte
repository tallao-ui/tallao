<!--
  SchemaForm as the <form> of a SvelteKit action, with use:enhance passed as an
  attachment, and a CodeEditor inside. Without JavaScript it submits all the same.
-->
<script lang="ts">
  import { enhance } from "$app/forms";
  import { fromAction } from "svelte/attachments";
  import { SchemaForm, type JsonSchema } from "tallao";
  import { CodeEditor } from "tallao/code";

  let { form } = $props();

  const schema: JsonSchema = {
    type: "object",
    required: ["title"],
    properties: {
      title: { type: "string", title: "Title", minLength: 3, default: "Hello" },
      status: {
        type: "string",
        title: "Status",
        default: "live",
        oneOf: [
          { const: "draft", title: "Draft" },
          { const: "live", title: "Published" },
        ],
      },
      level: { type: "integer", title: "Level", default: 3 },
      publish: { type: "string", title: "Publish on", format: "date", default: "2026-11-04" },
      active: { type: "boolean", title: "Active", default: true },
      tags: { type: "array", title: "Tags", default: ["guide", "event"], items: { enum: ["guide", "patch", "event"] } },
    },
  };
</script>

<h1>Schema</h1>
<SchemaForm {schema} name="post" method="POST" submitLabel="Send" {@attach fromAction(enhance)}>
  <CodeEditor name="body" value="# Notes" language="markdown" />
</SchemaForm>

{#if form?.received}<pre data-testid="received">{JSON.stringify(form.received)}</pre>{/if}
