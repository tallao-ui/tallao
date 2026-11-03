<!--
  tallao — PromptInput
  Caja de entrada para conversar con un modelo: Enter envía, Shift+Enter
  salta de línea, estado de carga, botón de adjuntos opcional.
-->
<script lang="ts">
  import { cn } from "$lib/utils";
  import Button from "./button.svelte";

  interface Props {
    /** Texto actual del prompt (bindable). */
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    /** Muestra el botón de adjuntos y emite onAttach. */
    conAdjuntos?: boolean;
    /** Envía al pulsar Enter (Shift+Enter = nueva línea). Por defecto true. */
    enviarConEnter?: boolean;
    onSend?: (texto: string) => void;
    onAttach?: () => void;
    class?: string;
  }

  let {
    value = $bindable(""),
    placeholder = "Escribe un mensaje…",
    disabled = false,
    loading = false,
    conAdjuntos = false,
    enviarConEnter = true,
    onSend,
    onAttach,
    class: className = "",
  }: Props = $props();

  const puedeEnviar = $derived(value.trim().length > 0 && !disabled && !loading);

  function enviar() {
    if (!puedeEnviar) return;
    onSend?.(value.trim());
    value = "";
  }

  function tecla(e: KeyboardEvent) {
    if (enviarConEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  }
</script>

<form
  class={cn("ta-prompt", className)}
  onsubmit={(e) => { e.preventDefault(); enviar(); }}
>
  {#if conAdjuntos}
    <button
      type="button"
      class="ta-prompt-adjunto"
      onclick={onAttach}
      disabled={disabled || loading}
      aria-label="Adjuntar archivo"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
    </button>
  {/if}

  <textarea
    bind:value
    {placeholder}
    disabled={disabled || loading}
    rows="1"
    class="ta-prompt-texto"
    aria-label={placeholder}
    onkeydown={tecla}
  ></textarea>

  <Button
    type="submit"
    variant="primary"
    size="icon"
    loading={loading}
    disabled={!puedeEnviar}
    ariaLabel="Enviar mensaje"
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
  </Button>
</form>

<style>
  .ta-prompt {
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-prompt:focus-within {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-prompt-texto {
    flex: 1;
    min-width: 0;
    padding: 0.375rem 0.5rem;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgb(var(--ta-text));
    max-height: 10rem;
    field-sizing: content;
  }

  .ta-prompt-texto::placeholder {
    color: rgb(var(--ta-text-dim));
  }

  .ta-prompt-adjunto {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: none;
    border: none;
    border-radius: var(--ta-radius);
    color: rgb(var(--ta-text-dim));
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
  }
  .ta-prompt-adjunto:hover:not(:disabled) {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated));
  }
  .ta-prompt-adjunto:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
