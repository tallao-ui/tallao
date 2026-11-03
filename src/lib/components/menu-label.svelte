<!-- tallao — MenuLabel: rótulo de un grupo de opciones dentro de un DropdownMenu (no se puede elegir). -->
<script lang="ts">
  const { children }: { children: import("svelte").Snippet } = $props();
</script>

<div role="presentation" class="ta-menu-rotulo">{@render children()}</div>

<style>
  .ta-menu-rotulo {
    padding: 0.35rem 0.6rem 0.2rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }
</style>
