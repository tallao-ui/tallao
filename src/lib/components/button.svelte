<!--
  tallao — Button
  Extraído del admin de Kitsuden y desacoplado de Tailwind.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
    size?: "sm" | "md" | "lg" | "icon";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    class?: string;
    href?: string;
    /** Nombre accesible: imprescindible en un botón que solo lleva icono. */
    ariaLabel?: string;
    title?: string;
    children?: import("svelte").Snippet;
    onclick?: (e: MouseEvent) => void;
    /** Cualquier otro atributo (aria-*, data-*, eventos) y adjuntos ({@attach}) van al elemento:
        así un Popover, un Menu o un Tooltip pueden usar el botón como disparador. */
    [key: string | symbol]: unknown;
  }

  const {
    variant = "primary",
    size = "md",
    type = "button",
    disabled = false,
    loading = false,
    class: className = "",
    href,
    ariaLabel,
    title,
    children,
    onclick,
    ...rest
  }: Props = $props();
</script>

{#snippet cuerpo()}
  {#if loading}
    <span class="ta-spinner" aria-hidden="true"></span>
  {/if}
  {@render children?.()}
{/snippet}

{#if href}
  <!-- Un enlace desactivado pierde el href (deja de navegar y de recibir Tab),
       como recomienda la APG: role="link" + aria-disabled lo sigue anunciando. -->
  <a
    {...rest}
    href={disabled || loading ? undefined : href}
    role={disabled || loading ? "link" : undefined}
    class={cn("ta-btn", `ta-btn--${variant}`, `ta-btn--${size}`, className)}
    aria-disabled={disabled || loading ? "true" : undefined}
    aria-busy={loading || undefined}
    aria-label={ariaLabel}
    {title}
    onclick={disabled || loading ? undefined : onclick}
  >
    {@render cuerpo()}
  </a>
{:else}
  <button
    {...rest}
    {type}
    class={cn("ta-btn", `ta-btn--${variant}`, `ta-btn--${size}`, className)}
    disabled={disabled || loading}
    {onclick}
    aria-label={ariaLabel}
    {title}
    aria-busy={loading || undefined}
  >
    {@render cuerpo()}
  </button>
{/if}

<style>
  .ta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-family: inherit;
    font-weight: 500;
    border-radius: var(--ta-radius);
    border: 1px solid transparent;
    cursor: pointer;
    text-decoration: none;
    transition:
      background-color 0.2s,
      color 0.2s,
      border-color 0.2s,
      opacity 0.2s;
    outline: none;
  }

  .ta-btn:focus-visible {
    box-shadow: 0 0 0 2px rgb(var(--ta-bg)), 0 0 0 4px rgb(var(--ta-accent) / 0.6);
  }

  .ta-btn:disabled,
  .ta-btn[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* — Tamaños — */
  .ta-btn--sm { padding: 0.375rem 0.75rem; font-size: 0.75rem; gap: 0.375rem; }
  .ta-btn--md { padding: 0.5rem 1rem; font-size: 0.875rem; }
  .ta-btn--lg { padding: 0.75rem 1.5rem; font-size: 1rem; }
  .ta-btn--icon { padding: 0.5rem; }

  /* — Variantes — */
  .ta-btn--primary {
    background: rgb(var(--ta-accent));
    color: white;
  }
  .ta-btn--primary:hover:not(:disabled) {
    background: rgb(var(--ta-accent-hover));
  }
  .ta-btn--primary:active:not(:disabled) {
    background: rgb(var(--ta-accent-dim));
  }

  .ta-btn--secondary {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-border));
  }
  .ta-btn--secondary:hover:not(:disabled) {
    background: rgb(var(--ta-elevated));
  }

  .ta-btn--danger {
    background: rgb(var(--ta-danger));
    color: white;
  }
  .ta-btn--danger:hover:not(:disabled) {
    background: rgb(var(--ta-accent-2));
  }

  .ta-btn--ghost {
    background: transparent;
    color: rgb(var(--ta-text-dim));
  }
  .ta-btn--ghost:hover:not(:disabled) {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated) / 0.5);
  }

  .ta-btn--outline {
    background: transparent;
    border-color: rgb(var(--ta-muted));
    color: rgb(var(--ta-text));
  }
  .ta-btn--outline:hover:not(:disabled) {
    background: rgb(var(--ta-elevated));
  }

  .ta-spinner {
    width: 1em;
    height: 1em;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: ta-girar 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes ta-girar {
    to { transform: rotate(360deg); }
  }
</style>
