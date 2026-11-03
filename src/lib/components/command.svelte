<!--
  tallao — Command
  Paleta de órdenes (⌘K / Ctrl+K): un diálogo con un buscador y la lista de
  acciones agrupadas que se filtra al escribir, sin mayúsculas ni acentos y
  también por palabras clave. Patrón combobox con aria-activedescendant: el
  foco se queda en el buscador mientras ↑ ↓ eligen y Enter ejecuta.

    <Command bind:open items={[
      { id: "nuevo", label: "Nuevo proyecto", group: "Proyectos", shortcut: "N", onSelect: crear },
      { id: "tema", label: "Cambiar tema", keywords: ["oscuro", "claro"], onSelect: alternarTema },
    ]} />
-->
<script lang="ts" module>
  export interface CommandItem {
    id: string;
    label: string;
    group?: string;
    /** Otras palabras por las que se encuentra. */
    keywords?: string[];
    /** Atajo que se muestra a la derecha (solo texto). */
    shortcut?: string;
    disabled?: boolean;
    onSelect: () => void;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import { normalizar } from "./combobox.svelte";
  import Dialog from "./dialog.svelte";

  const L = useLabels();
  let {
    open = $bindable(false),
    items,
    placeholder = L.search,
    label = L.commandPalette,
    emptyText = L.noResults,
    /** Atajo global que la abre: Ctrl+K y ⌘K. `false` lo desactiva. */
    hotkey = true,
    class: className = "",
  }: {
    open?: boolean;
    items: CommandItem[];
    placeholder?: string;
    /** Nombre accesible de la paleta. */
    label?: string;
    emptyText?: string;
    hotkey?: boolean;
    class?: string;
  } = $props();

  const id = $props.id();
  let lista: HTMLElement | undefined = $state();
  let busqueda = $state("");
  let activa = $state(0);

  const coincide = (it: CommandItem, q: string) =>
    !q || [it.label, ...(it.keywords ?? [])].some((t) => normalizar(t).includes(normalizar(q)));
  const visibles = $derived(items.filter((it) => coincide(it, busqueda)));
  const grupos = $derived(
    visibles.reduce<{ grupo: string | undefined; items: { it: CommandItem; i: number }[] }[]>((acc, it, i) => {
      const ultimo = acc.at(-1);
      if (ultimo && ultimo.grupo === it.group) ultimo.items.push({ it, i });
      else acc.push({ grupo: it.group, items: [{ it, i }] });
      return acc;
    }, [])
  );

  // Cada vez que se abre, empieza limpia. Solo depende de `open`: si siguiera a
  // la búsqueda, cada tecla la vaciaría.
  $effect(() => {
    if (!open) return;
    untrack(() => {
      busqueda = "";
      activa = siguiente(-1, 1);
    });
  });

  function siguiente(desde: number, paso: 1 | -1) {
    const n = visibles.length;
    for (let k = 1; k <= n; k++) {
      const i = (desde + paso * k + n * 2) % n;
      if (!visibles[i].disabled) return i;
    }
    return -1;
  }

  function ejecutar(it: CommandItem | undefined) {
    if (!it || it.disabled) return;
    open = false;
    it.onSelect();
  }

  function tecla(e: KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      activa = siguiente(activa, e.key === "ArrowDown" ? 1 : -1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      ejecutar(visibles[activa]);
    }
  }

  function atajo(e: KeyboardEvent) {
    if (hotkey && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      open = !open;
    }
  }

  $effect(() => {
    if (open && activa >= 0)
      lista?.querySelector(`[data-indice="${activa}"]`)?.scrollIntoView?.({ block: "nearest" });
  });
</script>

<svelte:window onkeydown={atajo} />

<Dialog bind:open ariaLabel={label} size="xl" class={cn("ta-command", className)}>
  <input
    type="text"
    role="combobox"
    autocomplete="off"
    aria-autocomplete="list"
    aria-expanded="true"
    aria-controls={`${id}-lista`}
    aria-activedescendant={activa >= 0 && visibles.length ? `${id}-op-${activa}` : undefined}
    aria-label={label}
    {placeholder}
    class="ta-command-buscador"
    bind:value={busqueda}
    oninput={() => (activa = siguiente(-1, 1))}
    onkeydown={tecla}
  />
  <div bind:this={lista} id={`${id}-lista`} role="listbox" aria-label={label} class="ta-command-lista">
    {#each grupos as g, gi (gi)}
      <div role="group" aria-labelledby={g.grupo ? `${id}-g-${gi}` : undefined}>
        {#if g.grupo}<div class="ta-command-grupo" id={`${id}-g-${gi}`} role="presentation">{g.grupo}</div>{/if}
        {#each g.items as { it, i } (it.id)}
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <div
            id={`${id}-op-${i}`}
            data-indice={i}
            role="option"
            tabindex="-1"
            aria-selected={i === activa}
            aria-disabled={it.disabled ? "true" : undefined}
            class="ta-command-item"
            class:ta-command-item--activa={i === activa}
            onmousedown={(e) => e.preventDefault()}
            onpointermove={() => !it.disabled && (activa = i)}
            onclick={() => ejecutar(it)}
          >
            <span>{it.label}</span>
            {#if it.shortcut}<kbd class="ta-command-atajo" aria-hidden="true">{it.shortcut}</kbd>{/if}
          </div>
        {/each}
      </div>
    {:else}
      <p class="ta-command-vacio">{emptyText}</p>
    {/each}
  </div>
</Dialog>

<style>
  .ta-command-buscador {
    width: 100%;
    padding: 0.625rem 0.75rem;
    font: inherit;
    font-size: 0.9375rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
  }
  .ta-command-buscador:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-command-lista {
    margin-top: 0.5rem;
    max-height: min(22rem, 60vh);
    overflow-y: auto;
  }

  .ta-command-grupo {
    padding: 0.5rem 0.5rem 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }

  .ta-command-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.5rem 0.625rem;
    font-size: 0.875rem;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-command-item--activa { background: rgb(var(--ta-elevated)); }
  .ta-command-item[aria-disabled="true"] { opacity: 0.5; cursor: not-allowed; }

  .ta-command-atajo {
    padding: 0.05rem 0.4rem;
    font-family: var(--ta-font-mono);
    font-size: 0.6875rem;
    color: rgb(var(--ta-text-dim));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
  }

  .ta-command-vacio {
    margin: 0;
    padding: 1rem 0.5rem;
    text-align: center;
    font-size: 0.875rem;
    color: rgb(var(--ta-text-dim));
  }
</style>
