<!--
  tallao — Switch
  Interruptor de encendido y apagado (role="switch", WAI-ARIA APG): un botón
  que anuncia «activado» o «desactivado». Para un ajuste que se aplica al
  momento; para algo que se envía con un formulario, Checkbox.
  Sin `label` ni hijos, pasa `ariaLabel`.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    checked = $bindable(false),
    label,
    ariaLabel,
    disabled = false,
    size = "md",
    name,
    value = "on",
    class: className = "",
    onchange,
    children,
  }: {
    checked?: boolean;
    label?: string;
    ariaLabel?: string;
    disabled?: boolean;
    size?: "sm" | "md";
    /** Nombre en un formulario: encendido envía `name=value`, apagado no envía nada (como un checkbox). */
    name?: string;
    value?: string;
    class?: string;
    onchange?: (checked: boolean) => void;
    children?: import("svelte").Snippet;
  } = $props();

  const id = $props.id();

  function alternar() {
    if (disabled) return;
    checked = !checked;
    onchange?.(checked);
  }
</script>

<span class={cn("ta-switch", `ta-switch--${size}`, disabled && "ta-switch--off", className)}>
  {#if name && checked}<input type="hidden" {name} {value} />{/if}
  <button
    type="button"
    role="switch"
    id={`${id}-switch`}
    aria-checked={checked}
    aria-label={label || children ? undefined : ariaLabel}
    aria-labelledby={label || children ? `${id}-label` : undefined}
    {disabled}
    class="ta-switch-pista"
    onclick={alternar}
  >
    <span class="ta-switch-bola" aria-hidden="true"></span>
  </button>
  {#if label || children}
    <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
    <span class="ta-switch-etiqueta" id={`${id}-label`} onclick={alternar}>
      {label}{@render children?.()}
    </span>
  {/if}
</span>

<style>
  .ta-switch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
  }

  .ta-switch-pista {
    position: relative;
    flex-shrink: 0;
    padding: 0;
    border: 1px solid rgb(var(--ta-border));
    border-radius: 9999px;
    background: rgb(var(--ta-muted));
    cursor: pointer;
    transition: background-color 0.15s, border-color 0.15s;
  }

  .ta-switch--md .ta-switch-pista { width: 2.25rem; height: 1.25rem; }
  .ta-switch--sm .ta-switch-pista { width: 1.75rem; height: 1rem; }

  .ta-switch-pista[aria-checked="true"] {
    background: rgb(var(--ta-accent));
    border-color: rgb(var(--ta-accent));
  }

  .ta-switch-pista:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.6);
    outline-offset: 2px;
  }

  .ta-switch-bola {
    position: absolute;
    top: 50%;
    left: 0.125rem;
    border-radius: 9999px;
    background: white;
    box-shadow: 0 1px 2px rgb(0 0 0 / 0.3);
    transform: translateY(-50%);
    transition: transform 0.15s;
  }

  .ta-switch--md .ta-switch-bola { width: 0.875rem; height: 0.875rem; }
  .ta-switch--sm .ta-switch-bola { width: 0.625rem; height: 0.625rem; }

  .ta-switch--md .ta-switch-pista[aria-checked="true"] .ta-switch-bola { transform: translate(1rem, -50%); }
  .ta-switch--sm .ta-switch-pista[aria-checked="true"] .ta-switch-bola { transform: translate(0.75rem, -50%); }

  .ta-switch-etiqueta {
    cursor: pointer;
    user-select: none;
  }

  .ta-switch--off {
    opacity: 0.5;
  }
  .ta-switch--off .ta-switch-pista,
  .ta-switch--off .ta-switch-etiqueta {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-switch-pista,
    .ta-switch-bola { transition: none; }
  }
</style>
