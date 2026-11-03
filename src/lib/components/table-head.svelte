<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", children }: Props = $props();
</script>

<th class={cn("ta-table-th", className)} scope="col">
  {@render children?.()}
</th>

<style>
  .ta-table-th {
    padding: 0.625rem 1rem;
    text-align: left;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--ta-text-dim));
    white-space: nowrap;
  }
</style>
