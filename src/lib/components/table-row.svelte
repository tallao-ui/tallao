<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
    /** Cualquier otro atributo (title, data-*, eventos) va al <tr>. */
    [key: string]: unknown;
  }
  const { class: className = "", children, ...rest }: Props = $props();
</script>

<tr {...rest} class={cn("ta-table-row", className)}>
  {@render children?.()}
</tr>

<style>
  .ta-table-row {
    border-bottom: 1px solid rgb(var(--ta-border));
    transition: background-color 0.15s;
  }
  .ta-table-row:last-child {
    border-bottom: none;
  }
  .ta-table-row:hover {
    background: rgb(var(--ta-elevated) / 0.35);
  }
</style>
