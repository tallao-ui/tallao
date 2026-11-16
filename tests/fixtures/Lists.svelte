<!-- TagInput, TreeView and SchemaForm's lists together; the tests watch the callbacks. -->
<script lang="ts">
  import { SchemaForm, TagInput, TreeView, type JsonSchema, type TreeNode } from "$lib/components";

  let {
    onSubmit = (_v: Record<string, unknown>) => {},
    onSelect = (_id: string) => {},
  }: { onSubmit?: (v: Record<string, unknown>) => void; onSelect?: (id: string) => void } = $props();

  let ids = $state<string[]>(["123456789012345678"]);
  let selected = $state<string | null>(null);
  let expanded = $state<string[]>([]);
  let data = $state<Record<string, unknown>>({});

  const tree: TreeNode[] = [
    {
      id: "commands",
      label: "Commands",
      badge: "2",
      children: [
        { id: "cmd-ping", label: "ping", description: "/ping" },
        {
          id: "cmd-booth",
          label: "booth",
          children: [
            { id: "sub-set", label: "set" },
            { id: "sub-score", label: "score" },
          ],
        },
      ],
    },
    { id: "modals", label: "Modals", children: [{ id: "modal-edit", label: "edit" }] },
    { id: "panels", label: "Panels", disabled: true },
  ];

  const schema: JsonSchema = {
    type: "object",
    required: ["roleIds"],
    properties: {
      roleIds: { type: "array", title: "Roles", minItems: 1, maxItems: 3, items: { type: "string", pattern: "\\d{15,20}" } },
      sizes: { type: "array", title: "Sizes", items: { type: "integer" } },
      rules: {
        type: "array",
        title: "Rules",
        maxItems: 2,
        items: {
          type: "object",
          required: ["event"],
          properties: {
            event: { type: "string", title: "Event", minLength: 3 },
            loud: { type: "boolean", title: "Loud" },
          },
        },
      },
    },
  };
</script>

<section aria-label="Tags">
  <label for="ids">Role ids</label>
  <TagInput id="ids" bind:values={ids} pattern={"\\d{15,20}"} patternMessage="Not a Discord id" maxItems={3} name="roles" />
  <output data-testid="ids">{ids.join(",")}</output>
</section>

<section aria-label="Outline">
  <TreeView items={tree} bind:selected bind:expanded ariaLabel="Blueprint" onselect={(id) => onSelect(id)} />
  <output data-testid="selected">{selected ?? ""}</output>
  <output data-testid="expanded">{expanded.join(",")}</output>
</section>

<SchemaForm {schema} bind:value={data} onsubmit={onSubmit} />
