<!--
  tallao — Combobox
  Campo de texto con lista de opciones que se filtra al escribir (patrón
  combobox de la WAI-ARIA 1.2, con aria-activedescendant: el foco no sale del
  campo). Para listas largas donde un <select> se queda corto.
    - ↓ abre la lista o baja; ↑ sube; Enter elige la opción activa.
    - Escape cierra la lista; con la lista cerrada, borra el texto escrito.
    - El filtro ignora mayúsculas y acentos ("cancion" encuentra "Canción").
  `value` es el valor elegido (o null); el texto del campo es solo la búsqueda.
-->
<script lang="ts" module>
  export interface ComboboxOption {
    value: string;
    label: string;
    disabled?: boolean;
  }

  /** Minúsculas y sin acentos, para comparar. */
  export const normalizar = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { pushLayer } from "$lib/internal/layers";
  import { anchor } from "$lib/internal/position";

  interface Props {
    options: ComboboxOption[];
    value?: string | null;
    placeholder?: string;
    /** Nombre accesible si no va dentro de un Field. */
    ariaLabel?: string;
    /** Texto de la lista cuando nada coincide. */
    emptyText?: string;
    disabled?: boolean;
    /** Filtro propio; por defecto, «contiene» sin mayúsculas ni acentos. */
    filter?: (option: ComboboxOption, query: string) => boolean;
    class?: string;
    onValueChange?: (value: string | null) => void;
  }

  const L = useLabels();
  let {
    options,
    value = $bindable(null),
    placeholder,
    ariaLabel,
    emptyText = L.noResults,
    disabled = false,
    filter = (o, q) => normalizar(o.label).includes(normalizar(q)),
    class: className = "",
    onValueChange,
  }: Props = $props();

  const id = $props.id();
  let campo: HTMLInputElement | undefined = $state();
  let lista: HTMLElement | undefined = $state();
  let abierta = $state(false);
  let activa = $state(-1);
  // Lo escrito; cuando no se está escribiendo, el campo muestra la opción elegida.
  let texto = $state("");
  let escribiendo = $state(false);

  const elegida = $derived(options.find((o) => o.value === value) ?? null);
  const visibles = $derived(escribiendo && texto ? options.filter((o) => filter(o, texto)) : options);

  // Si el valor cambia desde fuera, el campo lo refleja.
  $effect(() => {
    if (!escribiendo) texto = elegida?.label ?? "";
  });

  function abrir() {
    if (disabled) return;
    abierta = true;
    const i = visibles.findIndex((o) => o.value === value);
    activa = i >= 0 ? i : siguiente(-1, 1);
  }

  function cerrar() {
    abierta = false;
    activa = -1;
    escribiendo = false;
    texto = elegida?.label ?? "";
  }

  function elegir(o: ComboboxOption) {
    if (o.disabled) return;
    value = o.value;
    onValueChange?.(o.value);
    escribiendo = false;
    texto = o.label;
    abierta = false;
    activa = -1;
  }

  /** La siguiente opción no desactivada en la dirección `paso`, dando la vuelta. */
  function siguiente(desde: number, paso: 1 | -1) {
    const n = visibles.length;
    for (let k = 1; k <= n; k++) {
      const i = (desde + paso * k + n * 2) % n;
      if (!visibles[i].disabled) return i;
    }
    return -1;
  }

  function tecla(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!abierta) return abrir();
      activa = siguiente(activa, e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      if (abierta && activa >= 0) {
        e.preventDefault();
        elegir(visibles[activa]);
      }
    } else if (e.key === "Escape" && !abierta && texto) {
      // Con la lista abierta, Escape lo atiende la pila de capas (la cierra).
      e.preventDefault();
      texto = "";
      escribiendo = true;
    }
  }

  function alEscribir() {
    escribiendo = true;
    abierta = true;
    activa = siguiente(-1, 1);
  }

  // La opción activa se ve aunque la lista tenga scroll.
  $effect(() => {
    if (abierta && activa >= 0) lista?.querySelector(`[data-indice="${activa}"]`)?.scrollIntoView?.({ block: "nearest" });
  });

  $effect(() => {
    const l = lista;
    const c = campo;
    if (!abierta || !l || !c) return;
    const soltar = anchor(c, l, { matchWidth: true, gap: 4 });
    const quitar = pushLayer({ inside: () => [l, c], dismiss: cerrar });
    return () => {
      quitar();
      soltar();
    };
  });
</script>

<div class={cn("ta-combobox", className)}>
  <input
    bind:this={campo}
    bind:value={texto}
    type="text"
    role="combobox"
    autocomplete="off"
    aria-autocomplete="list"
    aria-expanded={abierta}
    aria-controls={`${id}-lista`}
    aria-activedescendant={abierta && activa >= 0 ? `${id}-op-${activa}` : undefined}
    aria-label={ariaLabel}
    {placeholder}
    {disabled}
    class="ta-combobox-campo"
    oninput={alEscribir}
    onkeydown={tecla}
    onclick={() => (abierta ? null : abrir())}
  />
  <svg class="ta-combobox-flecha" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>

  {#if abierta}
    <ul bind:this={lista} id={`${id}-lista`} role="listbox" aria-label={ariaLabel} popover="manual" class="ta-combobox-lista">
      {#each visibles as o, i (o.value)}
        <!-- El ratón elige sin quitar el foco al campo (mousedown con preventDefault). -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id={`${id}-op-${i}`}
          data-indice={i}
          role="option"
          aria-selected={o.value === value}
          aria-disabled={o.disabled ? "true" : undefined}
          class="ta-combobox-opcion"
          class:ta-combobox-opcion--activa={i === activa}
          onmousedown={(e) => e.preventDefault()}
          onpointermove={() => !o.disabled && (activa = i)}
          onclick={() => elegir(o)}
        >
          {o.label}
        </li>
      {:else}
        <li class="ta-combobox-vacio" role="presentation">{emptyText}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .ta-combobox {
    position: relative;
    width: 100%;
  }

  .ta-combobox-campo {
    width: 100%;
    padding: 0.5rem 2rem 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-combobox-campo:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-combobox-campo:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-combobox-flecha {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: rgb(var(--ta-text-dim));
    pointer-events: none;
  }

  .ta-combobox-lista {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: 50;
    max-height: 16rem;
    overflow-y: auto;
    padding: 0.25rem;
    list-style: none;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45);
    font: inherit;
  }

  .ta-combobox-opcion {
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }

  .ta-combobox-opcion--activa {
    background: rgb(var(--ta-elevated));
  }

  .ta-combobox-opcion[aria-selected="true"] {
    font-weight: 600;
    color: rgb(var(--ta-accent-hover));
  }

  .ta-combobox-opcion[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-combobox-vacio {
    padding: 0.5rem 0.6rem;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
  }
</style>
