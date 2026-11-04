<!--
  tallao — DatePicker
  Campo de fecha: se escribe (ISO «YYYY-MM-DD») o se elige en un Calendar que se abre
  junto al campo. El calendario es un panel no modal: Escape o un clic fuera lo
  cierran y el foco vuelve al botón. Con `name`, un input oculto envía el valor en
  un formulario nativo. Una fecha escrita que no existe deja el campo marcado
  (aria-invalid) y no cambia el valor.
-->
<script lang="ts">
  import { tick } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { parseISO, type ISODate } from "$lib/internal/dates";
  import { devolverFoco } from "$lib/internal/focus";
  import { pushLayer } from "$lib/internal/layers";
  import { anchor } from "$lib/internal/position";

  import Calendar from "./calendar.svelte";

  const L = useLabels();
  let {
    value = $bindable(null),
    min,
    max,
    locale,
    weekStartsOn = 1,
    isDisabled,
    name,
    required = false,
    disabled = false,
    placeholder = "YYYY-MM-DD",
    ariaLabel,
    buttonLabel = L.chooseDate,
    class: className = "",
    onchange,
  }: {
    value?: ISODate | null;
    min?: ISODate;
    max?: ISODate;
    locale?: string;
    weekStartsOn?: number;
    isDisabled?: (iso: ISODate) => boolean;
    name?: string;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    /** Nombre accesible del campo si no va dentro de un Field. */
    ariaLabel?: string;
    buttonLabel?: string;
    class?: string;
    onchange?: (value: ISODate | null) => void;
  } = $props();

  const id = $props.id();
  let caja: HTMLElement | undefined = $state();
  let boton: HTMLButtonElement | undefined = $state();
  let panel: HTMLElement | undefined = $state();
  let abierto = $state(false);
  let texto = $state("");
  let invalido = $state(false);

  // El texto sigue al valor cuando cambia desde fuera (o al elegir en el calendario).
  $effect(() => {
    texto = value ?? "";
    invalido = false;
  });

  const fueraDeRango = (iso: ISODate) => (min != null && iso < min) || (max != null && iso > max) || !!isDisabled?.(iso);

  function poner(iso: ISODate | null) {
    value = iso;
    onchange?.(iso);
  }

  function alSalir() {
    const t = texto.trim();
    if (t === "") {
      invalido = false;
      if (value !== null) poner(null);
      return;
    }
    const ok = parseISO(t) && !fueraDeRango(t);
    invalido = !ok;
    if (ok && t !== value) poner(t);
  }

  async function elegido(iso: ISODate) {
    poner(iso);
    abierto = false;
    await tick();
    boton?.focus();
  }

  $effect(() => {
    const p = panel;
    const c = caja;
    if (!abierto || !p || !c) return;
    const soltar = anchor(c, p, { placement: "bottom-start", gap: 4 });
    const quitar = pushLayer({
      inside: () => [p, boton],
      dismiss: (motivo) => {
        abierto = false;
        if (motivo === "escape") devolverFoco(boton ?? null);
      },
    });
    // El foco entra al día elegido (o a hoy).
    tick().then(() => p.querySelector<HTMLElement>('.ta-calendar-dia[tabindex="0"]')?.focus());
    return () => {
      quitar();
      soltar();
    };
  });
</script>

<div class={cn("ta-datepicker", className)} bind:this={caja}>
  {#if name}<input type="hidden" {name} value={value ?? ""} />{/if}
  <input
    type="text"
    inputmode="numeric"
    class="ta-datepicker-campo"
    bind:value={texto}
    {placeholder}
    {disabled}
    aria-label={ariaLabel}
    aria-invalid={invalido || undefined}
    aria-required={required || undefined}
    onblur={alSalir}
    onkeydown={(e) => {
      if (e.key === "Enter") alSalir();
      if (e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        abierto = true;
      }
    }}
  />
  <button
    type="button"
    class="ta-datepicker-boton"
    bind:this={boton}
    aria-label={buttonLabel}
    aria-haspopup="dialog"
    aria-expanded={abierto}
    aria-controls={abierto ? `${id}-panel` : undefined}
    {disabled}
    onclick={() => (abierto = !abierto)}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
  </button>

  {#if abierto}
    <div bind:this={panel} id={`${id}-panel`} role="dialog" aria-label={buttonLabel} popover="manual" class="ta-datepicker-panel">
      <Calendar {value} {min} {max} {locale} {weekStartsOn} {isDisabled} onselect={elegido} />
    </div>
  {/if}
</div>

<style>
  .ta-datepicker {
    position: relative;
    display: flex;
    width: 100%;
  }

  .ta-datepicker-campo {
    flex: 1;
    min-width: 0;
    padding: 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-right: none;
    border-radius: var(--ta-radius) 0 0 var(--ta-radius);
    outline: none;
  }
  .ta-datepicker-campo:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }
  .ta-datepicker-campo[aria-invalid="true"] { border-color: rgb(var(--ta-danger) / 0.7); }

  .ta-datepicker-boton {
    display: flex;
    align-items: center;
    padding: 0 0.625rem;
    color: rgb(var(--ta-text-dim));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: 0 var(--ta-radius) var(--ta-radius) 0;
    cursor: pointer;
  }
  .ta-datepicker-boton:hover:not(:disabled) { color: rgb(var(--ta-text)); }
  .ta-datepicker-boton:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-datepicker-boton:disabled, .ta-datepicker-campo:disabled { opacity: 0.5; cursor: not-allowed; }

  .ta-datepicker-panel {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: 50;
    padding: 0;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45);
    font: inherit;
    overflow: visible;
  }
</style>
