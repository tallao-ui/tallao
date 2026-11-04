<!--
  tallao — Input
  Campo de texto con estado de foco acorde a los tokens.
  Acepta cualquier atributo nativo de <input> vía rest props.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    value = $bindable(""),
    /** El elemento nativo (bind:ref), para enfocarlo o medirlo. */
    ref = $bindable(),
    class: className = "",
    type = "text",
    disabled = false,
    ...rest
  }: {
    value?: string;
    ref?: HTMLInputElement;
    class?: string;
    type?: string;
    disabled?: boolean;
    [key: string]: unknown;
  } = $props();
</script>

<input
  bind:this={ref}
  bind:value
  {type}
  {disabled}
  class={cn("ta-input", className)}
  {...rest}
/>

<style>
  .ta-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-input::placeholder {
    color: rgb(var(--ta-text-dim));
  }

  .ta-input:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  /* Selector de color: sin relleno de texto, alto de campo y muestra a todo el ancho. */
  .ta-input[type="color"] {
    height: 2.375rem;
    padding: 0.25rem;
    cursor: pointer;
  }
  .ta-input[type="color"]::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  .ta-input[type="color"]::-webkit-color-swatch {
    border: none;
    border-radius: var(--ta-radius-sm);
  }
  .ta-input[type="color"]::-moz-color-swatch {
    border: none;
    border-radius: var(--ta-radius-sm);
  }
</style>
