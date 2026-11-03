<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    /** Para una fila que ocupa toda la tabla (p. ej. «sin resultados»). */
    colspan?: number;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", colspan, children }: Props = $props();
</script>

<td class={cn("ta-table-td", className)} {colspan}>
  {@render children?.()}
</td>

<style>
  .ta-table-td {
    padding: 0.75rem 1rem;
    color: rgb(var(--ta-text));
    vertical-align: middle;
  }
</style>
