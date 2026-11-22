<!-- layout: stack -->
<script lang="ts">
  import { KeyValueEditor, type KeyValueEntry } from "tallao";

  let env = $state<KeyValueEntry[]>([
    { key: "MODEL", value: "claude-sonnet" },
    { key: "MAX_STEPS", value: "12" },
  ]);
</script>

<KeyValueEditor bind:entries={env} keyLabel="Variable" valueLabel="Value" keyPlaceholder="NAME" valuePlaceholder="value" addLabel="Add variable" />
<p style="font: 0.75rem var(--ta-font-mono); color: rgb(var(--ta-text-dim))">
  {env.map((e) => `${e.key}=${e.value}`).join(" · ") || "no variables"}
</p>
