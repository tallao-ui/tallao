<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", children }: Props = $props();
</script>

<tbody class={cn("ta-table-body", className)}>
  {@render children?.()}
</tbody>

<style>
  .ta-table-body {
    background: rgb(var(--ta-bg) / 0.3);
  }
</style>
