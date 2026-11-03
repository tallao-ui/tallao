<!--
  tallao — RadioGroup
  Elegir una opción entre pocas, todas a la vista. Son <input type="radio">
  nativos dentro de un <fieldset> con su <legend>: el navegador ya da las
  flechas entre opciones, un solo Tab para el grupo y el anuncio correcto.
-->
<script lang="ts" module>
  export interface RadioOption {
    value: string;
    label: string;
    /** Línea de detalle bajo la etiqueta. */
    description?: string;
    disabled?: boolean;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    options,
    value = $bindable(""),
    legend,
    /** Oculta la leyenda a la vista (sigue siendo el nombre del grupo para un lector). */
    hideLegend = false,
    orientation = "vertical",
    name,
    disabled = false,
    required = false,
    class: className = "",
    onchange,
  }: {
    options: RadioOption[];
    value?: string;
    legend: string;
    hideLegend?: boolean;
    orientation?: "vertical" | "horizontal";
    name?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    onchange?: (value: string) => void;
  } = $props();

  const id = $props.id();
  const grupo = $derived(name ?? `ta-radio-${id}`);
</script>

<fieldset class={cn("ta-radio", `ta-radio--${orientation}`, className)} {disabled}>
  <legend class="ta-radio-leyenda" class:ta-oculto={hideLegend}>{legend}</legend>
  {#each options as o (o.value)}
    <div class="ta-radio-opcion" class:ta-radio-opcion--off={o.disabled || disabled}>
      <!-- El detalle va fuera de la etiqueta: si no, se suma al nombre de la opción. -->
      <input
        id={`${id}-${o.value}`}
        type="radio"
        name={grupo}
        value={o.value}
        bind:group={value}
        disabled={o.disabled}
        {required}
        aria-describedby={o.description ? `${id}-${o.value}-detalle` : undefined}
        onchange={() => onchange?.(o.value)}
      />
      <span class="ta-radio-texto">
        <label for={`${id}-${o.value}`}>{o.label}</label>
        {#if o.description}<span class="ta-radio-detalle" id={`${id}-${o.value}-detalle`}>{o.description}</span>{/if}
      </span>
    </div>
  {/each}
</fieldset>

<style>
  .ta-radio {
    display: flex;
    gap: 0.5rem 1.25rem;
    margin: 0;
    padding: 0;
    border: none;
    min-width: 0;
  }

  .ta-radio--vertical { flex-direction: column; }
  .ta-radio--horizontal { flex-direction: row; flex-wrap: wrap; }

  .ta-radio-leyenda {
    padding: 0;
    margin-bottom: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(var(--ta-text-dim));
  }

  /* Visualmente oculta, accesible para lectores de pantalla. */
  .ta-oculto {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .ta-radio-opcion {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
  }

  .ta-radio-opcion label,
  .ta-radio-opcion input {
    cursor: pointer;
  }

  .ta-radio-opcion input {
    width: 1rem;
    height: 1rem;
    margin: 0.125rem 0 0;
    accent-color: rgb(var(--ta-accent));
  }

  .ta-radio-opcion input:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.6);
    outline-offset: 2px;
  }

  .ta-radio-texto {
    display: flex;
    flex-direction: column;
  }

  .ta-radio-detalle {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-radio-opcion--off {
    opacity: 0.5;
  }
  .ta-radio-opcion--off label,
  .ta-radio-opcion--off input {
    cursor: not-allowed;
  }
</style>
