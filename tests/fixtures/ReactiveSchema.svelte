<!-- A schema held in $state (as a page that loads it from an API does): its defaults are proxies. -->
<script lang="ts">
  import { SchemaForm, type JsonSchema } from "$lib/components";

  const schema = $state<JsonSchema>({
    type: "object",
    properties: {
      roles: { type: "array", title: "Roles", default: ["123456789012345678"], items: { type: "string" } },
      size: { type: "integer", title: "Size", default: 2 },
    },
  });
  let value = $state<Record<string, unknown>>({});
</script>

<SchemaForm {schema} bind:value />
<output data-testid="value">{JSON.stringify(value)}</output>
