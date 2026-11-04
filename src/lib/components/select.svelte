<!--
  tallao — Select
  Lista desplegable nativa con los tokens del kit. Las opciones van por prop
  (`options`) o como hijos <option>/<optgroup>; se pueden mezclar.
-->
<script lang="ts" module>
  export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    value = $bindable(""),
    /** El elemento nativo (bind:ref), para enfocarlo o medirlo. */
    ref = $bindable(),
    options = [],
    placeholder,
    size = "md",
    class: className = "",
    disabled = false,
    children,
    ...rest
  }: {
    value?: string;
    ref?: HTMLSelectElement;
    options?: SelectOption[];
    /** Primera opción vacía (valor ""). */
    placeholder?: string;
    size?: "sm" | "md";
    class?: string;
    disabled?: boolean;
    children?: import("svelte").Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<select bind:this={ref} bind:value {disabled} class={cn("ta-select", `ta-select--${size}`, className)} {...rest}>
  {#if placeholder !== undefined}
    <option value="">{placeholder}</option>
  {/if}
  {#each options as o (o.value)}
    <option value={o.value} disabled={o.disabled}>{o.label}</option>
  {/each}
  {@render children?.()}
</select>

<style>
  .ta-select {
    width: 100%;
    /* En una celda de tabla estrecha no se encoge hasta dejar solo la flecha. */
    min-width: 7rem;
    font-family: inherit;
    color: rgb(var(--ta-text));
    background-color: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
    cursor: pointer;
    appearance: none;
    /* Flecha propia: la nativa no sigue el tema. */
    background-image: linear-gradient(45deg, transparent 50%, rgb(var(--ta-text-dim)) 50%),
      linear-gradient(135deg, rgb(var(--ta-text-dim)) 50%, transparent 50%);
    background-position:
      calc(100% - 1rem) 50%,
      calc(100% - 0.7rem) 50%;
    background-size: 0.3rem 0.3rem;
    background-repeat: no-repeat;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-select--md { padding: 0.5rem 2rem 0.5rem 0.75rem; font-size: 0.875rem; }
  .ta-select--sm { padding: 0.3rem 1.75rem 0.3rem 0.5rem; font-size: 0.75rem; }

  .ta-select:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-select :global(option) {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
  }
</style>
