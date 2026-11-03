<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", children }: Props = $props();
</script>

<thead class={cn("ta-table-head", className)}>
  {@render children?.()}
</thead>

<style>
  .ta-table-head {
    background: rgb(var(--ta-elevated) / 0.4);
  }
</style>
