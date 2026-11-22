<!-- layout: stack -->
<script lang="ts">
  import { TagInput } from "tallao";

  let tools = $state(["search", "browser"]);
  let emails = $state<string[]>([]);
</script>

<label for="tools" style="font-size: 0.875rem">Allowed tools</label>
<TagInput id="tools" bind:values={tools} placeholder="Type a tool and press Enter" maxItems={6} />

<label for="notify" style="font-size: 0.875rem">Notify (emails only)</label>
<TagInput id="notify" bind:values={emails} placeholder="name@example.com" pattern="[^@\s]+@[^@\s]+\.[a-z]+" patternMessage="Not a valid email" />

<p style="font: 0.75rem var(--ta-font-mono); color: rgb(var(--ta-text-dim))">
  tools: {JSON.stringify(tools)} · notify: {JSON.stringify(emails)}
</p>
