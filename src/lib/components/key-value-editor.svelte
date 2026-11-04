<!--
  tallao — KeyValueEditor
  Lista de pares clave → valor con su botón de quitar y una fila para añadir
  otro (variables, cabeceras, mapas de columnas a campos…). La clave se
  escribe o, con `keyOptions`, se elige de una lista. Los pares son una
  lista y no un objeto: así se conserva el orden y, con `unique={false}`,
  se admiten claves repetidas.

  Los valores van siempre como texto; con `valueType="number"` solo se
  añade un número finito y quien lo usa lo convierte con Number().
-->
<script lang="ts" module>
  export interface KeyValueEntry {
    key: string;
    value: string;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import Button from "./button.svelte";
  import Input from "./input.svelte";
  import Select from "./select.svelte";

  const L = useLabels();

  let {
    entries = $bindable([]),
    keyOptions,
    keyPlaceholder = "",
    valuePlaceholder = "",
    valueType = "text",
    separator = "=",
    unique = true,
    keyLabel = "Key",
    valueLabel = "Value",
    addLabel = "Add",
    removeLabel = "Remove",
    emptyText = L.noResults,
    disabled = false,
    class: className = "",
    onchange,
  }: {
    entries?: KeyValueEntry[];
    /** La clave se elige de esta lista en vez de escribirse. */
    keyOptions?: string[];
    keyPlaceholder?: string;
    valuePlaceholder?: string;
    valueType?: "text" | "number";
    /** Lo que se pinta entre clave y valor en cada fila («=», «→», «:»…). */
    separator?: string;
    /** Con `true`, añadir una clave que ya está cambia su valor en vez de repetirla. */
    unique?: boolean;
    /** Nombres accesibles de los dos campos de la fila de añadir. */
    keyLabel?: string;
    valueLabel?: string;
    addLabel?: string;
    /** Texto del botón de quitar; su nombre accesible le añade la clave. */
    removeLabel?: string;
    /** Lo que se ve cuando no hay pares: la lista no desaparece. */
    emptyText?: string;
    disabled?: boolean;
    class?: string;
    onchange?: (entries: KeyValueEntry[]) => void;
  } = $props();

  // La clave elegida de la lista arranca en la primera opción, como un <select> sin vacío.
  let nuevaClave = $state("");
  let nuevoValor = $state("");

  // Con lista, una clave que ya no está en ella vuelve a la primera opción.
  const claveElegida = $derived(
    keyOptions ? (keyOptions.includes(nuevaClave) ? nuevaClave : (keyOptions[0] ?? "")) : nuevaClave.trim()
  );
  // Un <input type="number"> devuelve número o null: se normaliza a texto.
  const valorEscrito = $derived(String(nuevoValor ?? "").trim());
  const valorValido = $derived(
    valorEscrito !== "" && (valueType !== "number" || Number.isFinite(Number(valorEscrito)))
  );
  const sePuedeAnadir = $derived(!disabled && claveElegida !== "" && valorValido);

  function cambiar(siguientes: KeyValueEntry[]) {
    entries = siguientes;
    onchange?.(siguientes);
  }

  function anadir() {
    if (!sePuedeAnadir) return;
    const par = { key: claveElegida, value: valorEscrito };
    const i = unique ? entries.findIndex((e) => e.key === par.key) : -1;
    cambiar(i >= 0 ? entries.map((e, j) => (j === i ? par : e)) : [...entries, par]);
    if (!keyOptions) nuevaClave = "";
    nuevoValor = "";
  }

  function quitar(indice: number) {
    cambiar(entries.filter((_, j) => j !== indice));
  }

  // Intro en cualquiera de los dos campos añade el par, como el botón.
  function tecla(e: KeyboardEvent) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    anadir();
  }
</script>

<div class={cn("ta-kv", className)}>
  {#if entries.length}
    <ul class="ta-kv-lista">
      {#each entries as par, i (`${i}:${par.key}`)}
        <li class="ta-kv-fila">
          <span class="ta-kv-par">
            <span class="ta-kv-clave">{par.key}</span>
            <span class="ta-kv-separador" aria-hidden="true">{separator}</span>
            <span class="ta-kv-valor">{par.value}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            {disabled}
            ariaLabel={`${removeLabel} ${par.key}`}
            onclick={() => quitar(i)}
          >
            {removeLabel}
          </Button>
        </li>
      {/each}
    </ul>
  {:else}
    <p class="ta-kv-vacio">{emptyText}</p>
  {/if}

  <div class="ta-kv-nuevo">
    <div class="ta-kv-campo-clave">
      {#if keyOptions}
        <Select
          value={claveElegida}
          onchange={(e: Event) => (nuevaClave = (e.currentTarget as HTMLSelectElement).value)}
          options={keyOptions.map((o) => ({ value: o, label: o }))}
          disabled={disabled || keyOptions.length === 0}
          aria-label={keyLabel}
          onkeydown={tecla}
        />
      {:else}
        <Input
          bind:value={nuevaClave}
          placeholder={keyPlaceholder}
          {disabled}
          aria-label={keyLabel}
          autocomplete="off"
          spellcheck="false"
          onkeydown={tecla}
        />
      {/if}
    </div>
    <div class="ta-kv-campo-valor">
      <Input
        bind:value={nuevoValor}
        type={valueType}
        placeholder={valuePlaceholder}
        {disabled}
        aria-label={valueLabel}
        autocomplete="off"
        onkeydown={tecla}
      />
    </div>
    <Button variant="secondary" size="sm" disabled={!sePuedeAnadir} onclick={anadir}>
      {addLabel}
    </Button>
  </div>
</div>

<style>
  .ta-kv {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  .ta-kv-lista {
    display: flex;
    flex-direction: column;
    margin: 0;
    padding: 0;
    list-style: none;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }

  .ta-kv-fila {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.25rem 0.25rem 0.25rem 0.75rem;
    font-size: 0.875rem;
  }

  .ta-kv-fila + .ta-kv-fila {
    border-top: 1px solid rgb(var(--ta-border));
  }

  .ta-kv-par {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.5rem;
    min-width: 0;
  }

  .ta-kv-clave {
    font-family: var(--ta-font-mono);
    color: rgb(var(--ta-text));
    overflow-wrap: anywhere;
  }

  .ta-kv-separador {
    color: rgb(var(--ta-text-dim));
  }

  .ta-kv-valor {
    font-family: var(--ta-font-mono);
    color: rgb(var(--ta-text-dim));
    overflow-wrap: anywhere;
  }

  .ta-kv-vacio {
    margin: 0;
    padding: 0.5rem 0;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-kv-nuevo {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }

  .ta-kv-campo-clave {
    flex: 0 1 12rem;
    min-width: 8rem;
  }

  .ta-kv-campo-valor {
    flex: 1 1 12rem;
    min-width: 8rem;
  }
</style>
