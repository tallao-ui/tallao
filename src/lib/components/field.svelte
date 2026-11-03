<!--
  tallao — Field
  Etiqueta + control + error. El <label> envuelve el control, así que la
  asociación es implícita y no hace falta inventar ids.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    label: string;
    /** Mensaje de error bajo el control; también marca el campo. */
    error?: string;
    required?: boolean;
    class?: string;
    children: import("svelte").Snippet;
  }

  const { label, error, required = false, class: className = "", children }: Props = $props();
</script>

<label class={cn("ta-field", error && "ta-field--error", className)}>
  <span class="ta-field-etiqueta">
    {label}{#if required}<span class="ta-field-obligatorio" aria-hidden="true"> *</span>{/if}
  </span>
  {@render children()}
  {#if error}
    <span class="ta-field-error" role="alert">{error}</span>
  {/if}
</label>

<style>
  .ta-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .ta-field-etiqueta {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(var(--ta-text-dim));
  }

  .ta-field-obligatorio {
    color: rgb(var(--ta-danger));
  }

  .ta-field-error {
    font-size: 0.75rem;
    color: rgb(var(--ta-danger));
  }

  .ta-field--error :global(input),
  .ta-field--error :global(select),
  .ta-field--error :global(textarea) {
    border-color: rgb(var(--ta-danger) / 0.6);
  }
</style>
