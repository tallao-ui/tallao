<!--
  tallao — Table
  Contenedor de tabla con borde redondeado y scroll horizontal seguro.
-->
<script lang="ts">
  import { cn } from "$lib/utils";
  interface Props {
    class?: string;
    children?: import("svelte").Snippet;
  }
  const { class: className = "", children }: Props = $props();
</script>

<div class="ta-table-contenedor">
  <table class={cn("ta-table", className)}>
    {@render children?.()}
  </table>
</div>

<style>
  .ta-table-contenedor {
    width: 100%;
    overflow-x: auto;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
  }

  .ta-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
</style>
