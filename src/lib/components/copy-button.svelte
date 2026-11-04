<!--
  CopyButton: un texto que se copia al portapapeles con un clic.

  Para URLs, claves o comandos que alguien pega en otro sitio. Muestra el texto (o `label`) en
  monoespaciada y, al copiar, avisa con `copiedLabel` en una región `aria-live` durante
  `resetAfter` ms. Sin API de portapapeles (contexto no seguro) no hace nada y no lo finge.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    /** Lo que se copia. */
    text: string;
    /** Lo que se ve; por defecto, el propio texto. */
    label?: string;
    /** Nombre accesible y título del botón. */
    copyLabel?: string;
    /** Aviso tras copiar. */
    copiedLabel?: string;
    /** Cuánto dura el aviso, en ms. */
    resetAfter?: number;
    disabled?: boolean;
    class?: string;
    onCopy?: (text: string) => void;
  }

  const {
    text,
    label,
    copyLabel = "Copy",
    copiedLabel = "Copied",
    resetAfter = 1500,
    disabled = false,
    class: className = "",
    onCopy,
  }: Props = $props();

  let copiado = $state(false);
  let temporizador: ReturnType<typeof setTimeout> | undefined;

  // Si el componente se desmonta con el aviso puesto, el temporizador no queda vivo.
  $effect(() => () => clearTimeout(temporizador));

  async function copiar() {
    if (disabled || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return;
    }
    copiado = true;
    onCopy?.(text);
    clearTimeout(temporizador);
    temporizador = setTimeout(() => (copiado = false), resetAfter);
  }
</script>

<button
  type="button"
  class={cn("ta-copy", copiado && "ta-copy--hecho", className)}
  title={copyLabel}
  aria-label={`${copyLabel}: ${label ?? text}`}
  {disabled}
  onclick={copiar}
>
  <span class="ta-copy-texto">{label ?? text}</span>
  <span class="ta-copy-estado" aria-live="polite">{copiado ? copiedLabel : ""}</span>
</button>

<style>
  .ta-copy {
    display: inline-flex;
    align-items: center;
    max-width: 100%;
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-family: var(--ta-font-mono);
    font-size: 0.75rem;
    text-align: left;
    color: rgb(var(--ta-text-dim));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }

  .ta-copy:hover:not(:disabled) {
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-accent));
  }

  .ta-copy:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.6);
    outline-offset: 2px;
  }

  .ta-copy:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-copy-texto {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .ta-copy-estado {
    flex-shrink: 0;
    font-family: var(--ta-font-sans);
    color: rgb(var(--ta-success));
  }

  /* La región viva sigue en el DOM aunque esté vacía: si apareciera de golpe, no se anunciaría. */
  .ta-copy-estado:not(:empty) {
    margin-left: 0.5rem;
  }

  .ta-copy--hecho {
    border-color: rgb(var(--ta-success) / 0.5);
  }
</style>
