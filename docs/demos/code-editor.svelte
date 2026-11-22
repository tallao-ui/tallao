<!-- layout: stack -->
<script lang="ts">
  import { CodeEditor } from "tallao/code";

  let config = $state(`{\n  "agent": "release-bot",\n  "model": "balanced",\n  "tools": ["search", "browser"]\n}`);
  const valid = $derived.by(() => {
    try {
      JSON.parse(config);
      return true;
    } catch {
      return false;
    }
  });
</script>

<CodeEditor bind:value={config} language="json" ariaLabel="Agent configuration" minHeight="9rem" />
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">{valid ? "Valid JSON" : "Invalid JSON"} · {config.length} characters</p>
