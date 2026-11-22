<!-- layout: stack -->
<script lang="ts">
  import { TreeView } from "tallao";

  let selected = $state<string | null>("cmd-ping");
  let expanded = $state<string[]>(["commands"]);
  const items = [
    {
      id: "commands",
      label: "Commands",
      badge: "2",
      children: [
        { id: "cmd-ping", label: "/ping" },
        { id: "cmd-booth", label: "/booth", children: [{ id: "sub-set", label: "set" }, { id: "sub-score", label: "score" }] },
      ],
    },
    { id: "panels", label: "Panels", badge: "live", badgeTone: "success" as const, children: [{ id: "panel-booth", label: "booth", description: "5 rows" }] },
    { id: "modals", label: "Modals", children: [{ id: "modal-edit", label: "edit" }] },
  ];
</script>

<TreeView {items} bind:selected bind:expanded ariaLabel="Blueprint outline" />
<p style="margin: 0; color: rgb(var(--ta-text-dim))">Selected: {selected ?? "none"}</p>
