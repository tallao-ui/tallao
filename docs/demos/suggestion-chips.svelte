<!-- layout: stack -->
<script lang="ts">
  import { SuggestionChips } from "tallao";

  let asked = $state<string[]>([]);
</script>

<SuggestionChips
  suggestions={["Summarize the patch 1.2 changes", "Which characters lost pick rate?", "Draft the Discord announcement", "Compare with patch 1.1"]}
  onSelect={(s) => (asked = [...asked, s])}
/>
<p style="margin: 0; font-size: 0.875rem; color: rgb(var(--ta-text-dim))">
  {asked.length ? `Asked: ${asked.join(" · ")}` : "Pick a suggestion: it is used once and disappears."}
</p>
