<!--
  tallao — Combobox
  Campo de texto con lista de opciones que se filtra al escribir (patrón
  combobox de la WAI-ARIA 1.2, con aria-activedescendant: el foco no sale del
  campo). Para listas largas donde un <select> se queda corto.
    - ↓ abre la lista o baja; ↑ sube; Enter elige la opción activa.
    - Escape cierra la lista; con la lista cerrada, borra el texto escrito.
    - El filtro ignora mayúsculas y acentos ("cancion" encuentra "Canción").
  `value` es el valor elegido (o null); el texto del campo es solo la búsqueda.

  Búsqueda remota: con `loadOptions(query, signal)` las opciones vienen de la API al
  escribir (con espera entre teclas y cancelando la petición anterior); el filtro
  lo hace el servidor.
  Varios valores: con `multiple`, `values` es la lista elegida; cada valor es una
  ficha con su botón de quitar, elegir una opción la añade o la quita y la lista
  sigue abierta; Retroceso con el campo vacío quita la última.
  Formularios: con `name` lleva inputs ocultos (uno por valor), así se envía en un
  <form> nativo, también sin JavaScript tras el render del servidor (SvelteKit).
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
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { pushLayer } from "$lib/internal/layers";
  import { anchor } from "$lib/internal/position";

  interface Props {
    /** Opciones locales; con `loadOptions` pueden faltar (vienen de la API). */
    options?: ComboboxOption[];
    value?: string | null;
    /** Con `multiple`: los valores elegidos. */
    values?: string[];
    multiple?: boolean;
    /** Opciones desde la API para lo escrito; `signal` se aborta si llega otra búsqueda. */
    loadOptions?: (query: string, signal: AbortSignal) => Promise<ComboboxOption[]>;
    /** Espera tras la última tecla antes de buscar en la API, en ms. */
    debounce?: number;
    /** Letras mínimas para buscar en la API. */
    minChars?: number;
    /** Nombre del campo en un formulario (inputs ocultos con el valor o los valores). */
    name?: string;
    required?: boolean;
    placeholder?: string;
    /** Nombre accesible si no va dentro de un Field. */
    ariaLabel?: string;
    /** Texto de la lista cuando nada coincide. */
    emptyText?: string;
    loadingText?: string;
    /** Nombre del botón que quita una ficha (modo `multiple`). */
    removeLabel?: (label: string) => string;
    disabled?: boolean;
    /** Filtro propio para opciones locales; por defecto, «contiene» sin mayúsculas ni acentos. */
    filter?: (option: ComboboxOption, query: string) => boolean;
    class?: string;
    onValueChange?: (value: string | null) => void;
    onValuesChange?: (values: string[]) => void;
  }

  const L = useLabels();
  let {
    options = [],
    value = $bindable(null),
    values = $bindable([]),
    multiple = false,
    loadOptions,
    debounce = 250,
    minChars = 0,
    name,
    required = false,
    placeholder,
    ariaLabel,
    emptyText = L.noResults,
    loadingText = L.loading,
    removeLabel = (label: string) => `${L.remove} ${label}`,
    disabled = false,
    filter = (o, q) => normalizar(o.label).includes(normalizar(q)),
    class: className = "",
    onValueChange,
    onValuesChange,
  }: Props = $props();

  const id = $props.id();
  let campo: HTMLInputElement | undefined = $state();
  let lista: HTMLElement | undefined = $state();
  let abierta = $state(false);
  let activa = $state(-1);
  // Lo escrito; cuando no se está escribiendo (modo simple), el campo muestra la opción elegida.
  let texto = $state("");
  let escribiendo = $state(false);

  // Remotas: lo último que devolvió la API, y lo que se ha visto, para poner nombre a lo elegido.
  let remotas = $state<ComboboxOption[]>([]);
  let cargando = $state(false);
  let conocidas = $state<Record<string, ComboboxOption>>({});
  let espera: ReturnType<typeof setTimeout> | undefined;
  let peticion: AbortController | undefined;

  $effect(() => {
    for (const o of options)
      if (!conocidas[o.value])
        untrack(() => {
          conocidas[o.value] = o;
        });
  });

  const etiqueta = (v: string) => conocidas[v]?.label ?? options.find((o) => o.value === v)?.label ?? v;
  const elegida = $derived(value == null ? null : (conocidas[value] ?? options.find((o) => o.value === value) ?? null));
  const elegidos = $derived(new Set(multiple ? values : value == null ? [] : [value]));
  const visibles = $derived(
    loadOptions ? remotas : escribiendo && texto ? options.filter((o) => filter(o, texto)) : options
  );

  // Modo simple: si el valor cambia desde fuera, el campo lo refleja.
  $effect(() => {
    if (!multiple && !escribiendo) texto = elegida?.label ?? "";
  });

  function buscar(q: string, ya = false) {
    if (!loadOptions) return;
    clearTimeout(espera);
    peticion?.abort();
    if (q.length < minChars) {
      remotas = [];
      cargando = false;
      return;
    }
    cargando = true;
    const lanzar = () => {
      const control = new AbortController();
      peticion = control;
      loadOptions(q, control.signal).then(
        (res) => {
          if (control.signal.aborted) return;
          remotas = res;
          for (const o of res) conocidas[o.value] = o;
          cargando = false;
          activa = siguiente(-1, 1);
        },
        () => {
          if (!control.signal.aborted) cargando = false;
        }
      );
    };
    if (ya) lanzar();
    else espera = setTimeout(lanzar, debounce);
  }

  function abrir() {
    if (disabled) return;
    abierta = true;
    if (loadOptions && remotas.length === 0) buscar(multiple ? texto : "", true);
    const i = visibles.findIndex((o) => elegidos.has(o.value));
    activa = i >= 0 ? i : siguiente(-1, 1);
  }

  function cerrar() {
    abierta = false;
    activa = -1;
    escribiendo = false;
    clearTimeout(espera);
    peticion?.abort();
    cargando = false;
    texto = multiple ? "" : (elegida?.label ?? "");
  }

  function elegir(o: ComboboxOption) {
    if (o.disabled) return;
    conocidas[o.value] = o;
    if (multiple) {
      values = values.includes(o.value) ? values.filter((v) => v !== o.value) : [...values, o.value];
      onValuesChange?.(values);
      texto = "";
      escribiendo = false;
      campo?.focus();
      return;
    }
    value = o.value;
    onValueChange?.(o.value);
    escribiendo = false;
    texto = o.label;
    abierta = false;
    activa = -1;
  }

  function quitar(v: string) {
    values = values.filter((x) => x !== v);
    onValuesChange?.(values);
    campo?.focus();
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
      if (abierta && activa >= 0 && visibles[activa]) {
        e.preventDefault();
        elegir(visibles[activa]);
      }
    } else if (e.key === "Backspace" && multiple && texto === "" && values.length) {
      quitar(values[values.length - 1]);
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
    if (loadOptions) buscar(texto);
    else activa = siguiente(-1, 1);
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
    const quitarCapa = pushLayer({ inside: () => [l, c], dismiss: cerrar });
    return () => {
      quitarCapa();
      soltar();
    };
  });

  // Al desmontar no queda una búsqueda en vuelo.
  $effect(() => () => {
    clearTimeout(espera);
    peticion?.abort();
  });
</script>

<div class={cn("ta-combobox", multiple && "ta-combobox--multiple", className)}>
  {#if name}
    {#if multiple}
      {#each values as v (v)}<input type="hidden" {name} value={v} />{/each}
    {:else}
      <input type="hidden" {name} value={value ?? ""} />
    {/if}
  {/if}

  <div class="ta-combobox-caja">
    {#if multiple}
      {#each values as v (v)}
        <span class="ta-combobox-ficha">
          {etiqueta(v)}
          <button
            type="button"
            class="ta-combobox-quitar"
            aria-label={removeLabel(etiqueta(v))}
            {disabled}
            onclick={() => quitar(v)}>×</button
          >
        </span>
      {/each}
    {/if}
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
      aria-busy={cargando || undefined}
      aria-required={required || undefined}
      placeholder={multiple && values.length ? undefined : placeholder}
      {disabled}
      class="ta-combobox-campo"
      oninput={alEscribir}
      onkeydown={tecla}
      onclick={() => (abierta ? null : abrir())}
    />
  </div>
  <svg class="ta-combobox-flecha" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>

  {#if abierta}
    <ul
      bind:this={lista}
      id={`${id}-lista`}
      role="listbox"
      aria-label={ariaLabel}
      aria-multiselectable={multiple || undefined}
      aria-busy={cargando || undefined}
      popover="manual"
      class="ta-combobox-lista"
    >
      {#each visibles as o, i (o.value)}
        <!-- El ratón elige sin quitar el foco al campo (mousedown con preventDefault). -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id={`${id}-op-${i}`}
          data-indice={i}
          role="option"
          aria-selected={elegidos.has(o.value)}
          aria-disabled={o.disabled ? "true" : undefined}
          class="ta-combobox-opcion"
          class:ta-combobox-opcion--activa={i === activa}
          onmousedown={(e) => e.preventDefault()}
          onpointermove={() => !o.disabled && (activa = i)}
          onclick={() => elegir(o)}
        >
          {#if multiple}<span class="ta-combobox-marca" aria-hidden="true">{elegidos.has(o.value) ? "✓" : ""}</span>{/if}
          {o.label}
        </li>
      {:else}
        <li class="ta-combobox-vacio" role="presentation">{cargando ? loadingText : emptyText}</li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .ta-combobox {
    position: relative;
    width: 100%;
  }

  .ta-combobox-caja {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }

  .ta-combobox--multiple .ta-combobox-caja {
    padding: 0.25rem 2rem 0.25rem 0.375rem;
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }
  .ta-combobox--multiple .ta-combobox-caja:focus-within {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
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

  .ta-combobox--multiple .ta-combobox-campo {
    flex: 1;
    min-width: 6rem;
    width: auto;
    padding: 0.25rem 0.375rem;
    border: none;
    background: transparent;
  }

  .ta-combobox:not(.ta-combobox--multiple) .ta-combobox-campo:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-combobox-campo:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ta-combobox-ficha {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.125rem 0.25rem 0.125rem 0.5rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated));
    border-radius: 9999px;
  }

  .ta-combobox-quitar {
    padding: 0 0.3rem;
    font: inherit;
    line-height: 1.1;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: 9999px;
    cursor: pointer;
  }
  .ta-combobox-quitar:hover { color: rgb(var(--ta-danger)); }
  .ta-combobox-quitar:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); }

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
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 0.6rem;
    font-size: 0.875rem;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }

  .ta-combobox-marca {
    width: 0.875rem;
    color: rgb(var(--ta-accent-hover));
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
