<!--
  tallao — SelectionBar
  Barra de selección para acciones en lote sobre una lista: casilla de «todo»
  (con estado intermedio cuando solo hay parte marcada), cuántos van marcados y
  las acciones, que solo aparecen con algo marcado: un botón que no puede hacer
  nada estorba más que ayuda. Las casillas de cada fila las pone quien llama.
  El contador se anuncia (aria-live) para quien no ve la lista.
-->
<script lang="ts">
  import type { Snippet } from "svelte";

  import { cn } from "$lib/utils";

  interface Props {
    /** Cuántos elementos se pueden marcar (los de la lista visible). */
    total: number;
    /** Cuántos van marcados. */
    selected: number;
    /** La casilla de «todo»: `true` marca todos, `false` los desmarca. */
    onToggleAll: (checked: boolean) => void;
    selectAllLabel?: string;
    /** Texto del contador. */
    countLabel?: (selected: number) => string;
    /** Nombre del grupo para lectores de pantalla. */
    ariaLabel?: string;
    class?: string;
    /** Las acciones en lote; se pintan solo con algo marcado. */
    actions?: Snippet;
  }

  const {
    total,
    selected,
    onToggleAll,
    selectAllLabel = "Select all",
    countLabel = (n: number) => `${n} selected`,
    ariaLabel = "Selection",
    class: className = "",
    actions,
  }: Props = $props();

  const todos = $derived(total > 0 && selected >= total);
  const parcial = $derived(selected > 0 && selected < total);
</script>

<div
  class={cn("ta-selection-bar", selected > 0 && "ta-selection-bar--activa", className)}
  role="group"
  aria-label={ariaLabel}
>
  <label class={cn("ta-selection-bar-todo", total === 0 && "ta-selection-bar-todo--off")}>
    <input
      type="checkbox"
      checked={todos}
      indeterminate={parcial}
      disabled={total === 0}
      aria-label={selectAllLabel}
      onchange={(e) => onToggleAll((e.currentTarget as HTMLInputElement).checked)}
    />
    <span class="ta-selection-bar-cuenta" aria-live="polite">{countLabel(selected)}</span>
  </label>
  {#if selected > 0 && actions}
    <div class="ta-selection-bar-acciones">{@render actions()}</div>
  {/if}
</div>

<style>
  .ta-selection-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem 0.75rem;
    flex-wrap: wrap;
    min-height: 2.5rem;
    padding: 0.375rem 0.75rem;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    background: rgb(var(--ta-surface));
    transition: border-color 0.15s;
  }

  .ta-selection-bar--activa {
    border-color: rgb(var(--ta-accent) / 0.6);
    background: rgb(var(--ta-accent) / 0.06);
  }

  .ta-selection-bar-todo {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
    cursor: pointer;
    user-select: none;
  }

  .ta-selection-bar-todo input {
    width: 1rem;
    height: 1rem;
    margin: 0;
    accent-color: rgb(var(--ta-accent));
    cursor: inherit;
  }

  .ta-selection-bar-todo input:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.6);
    outline-offset: 2px;
  }

  .ta-selection-bar-todo--off {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-selection-bar-acciones {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    flex-wrap: wrap;
  }
</style>
