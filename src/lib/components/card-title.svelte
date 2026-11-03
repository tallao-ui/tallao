<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", children }: Props = $props();
</script>

<h3 class={cn("ta-card-title", className)}>
  {@render children?.()}
</h3>

<style>
  .ta-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: rgb(var(--ta-text));
  }
</style>
