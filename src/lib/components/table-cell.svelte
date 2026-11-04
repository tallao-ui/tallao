<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    /** Para una fila que ocupa toda la tabla (p. ej. «sin resultados»). */
    colspan?: number;
    children?: import("svelte").Snippet;
    /** Cualquier otro atributo (title, data-*, headers…) va al <td>. */
    [key: string]: unknown;
  }
  const { class: className = "", colspan, children, ...rest }: Props = $props();
</script>

<td {...rest} class={cn("ta-table-td", className)} {colspan}>
  {@render children?.()}
</td>

<style>
  .ta-table-td {
    padding: 0.75rem 1rem;
    color: rgb(var(--ta-text));
    vertical-align: middle;
  }
</style>
