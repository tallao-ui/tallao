<script lang="ts">
  import { ThemeToggle, type Theme } from "tallao";

  let theme = $state<Theme>("dark");
</script>

<ThemeToggle bind:theme transition="circle" />
<ThemeToggle variant="outline" transition="ink" storageKey={null} />
<span style="color: rgb(var(--ta-text-dim))">The page is {theme}.</span>
