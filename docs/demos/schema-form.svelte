<!-- layout: stack -->
<script lang="ts">
  import { SchemaForm, type JsonSchema } from "tallao";

  const schema: JsonSchema = {
    type: "object",
    required: ["name", "model"],
    properties: {
      name: { type: "string", title: "Agent name", minLength: 3, default: "release-bot" },
      model: { type: "string", title: "Model", enum: ["fast", "balanced", "deep"], default: "balanced" },
      temperature: { type: "number", title: "Temperature", minimum: 0, maximum: 1, default: 0.3, description: "0 is deterministic, 1 is creative." },
      tools: { type: "array", title: "Tools", items: { type: "string", enum: ["search", "browser", "shell"] } },
      autoApprove: { type: "boolean", title: "Approve tool calls automatically" },
    },
  };

  let saved = $state("");
</script>

<SchemaForm {schema} submitLabel="Save agent" onsubmit={(v) => (saved = JSON.stringify(v))} />
<p style="font: 0.75rem var(--ta-font-mono); color: rgb(var(--ta-text-dim)); word-break: break-all">
  {saved || "Submit to see the validated value"}
</p>
