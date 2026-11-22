<script lang="ts">
  import { Toggle } from "tallao";

  let favorites = $state(false);
  let completed = $state(true);
</script>

<Toggle bind:pressed={favorites}>Favorites only</Toggle>
<Toggle bind:pressed={completed} tone="solid">Show completed</Toggle>
<Toggle size="sm" disabled>Archived</Toggle>
<span style="font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  favorites: {favorites}, completed: {completed}
</span>
