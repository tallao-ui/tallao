<script lang="ts">
  import { Icon } from "tallao";

  const names = ["check", "x", "plus", "search", "home", "user", "trash", "edit", "copy", "download", "calendar", "clock", "info", "alert", "settings", "bot", "terminal", "sparkle", "database", "shield"] as const;
</script>

{#each names as name}
  <span style="display: grid; justify-items: center; gap: 0.35rem; width: 4.5rem">
    <Icon {name} size={24} />
    <span style="font: 0.6875rem var(--ta-font-mono); opacity: 0.7">{name}</span>
  </span>
{/each}
<Icon name="sparkle" size={40} strokeWidth={1.5} label="Sparkle" />
