<!-- layout: center; height: 12 -->
<script lang="ts">
  import { Button, Command } from "tallao";

  let open = $state(false);
  let ran = $state("");
</script>

<Button variant="outline" onclick={() => (open = true)}>Open palette (Ctrl+K)</Button>
{#if ran}<span style="font-size: 0.875rem; color: rgb(var(--ta-text-dim))">Ran: {ran}</span>{/if}

<Command
  bind:open
  items={[
    { id: "new", label: "New project", group: "Projects", shortcut: "N", onSelect: () => (ran = "New project") },
    { id: "deploy", label: "Deploy to production", group: "Projects", keywords: ["release", "ship"], onSelect: () => (ran = "Deploy") },
    { id: "theme", label: "Toggle theme", group: "Settings", keywords: ["dark", "light"], onSelect: () => (ran = "Toggle theme") },
  ]}
/>
