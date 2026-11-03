<!--
  tallao — ContextMenu
  Menú de clic derecho sobre una zona. Se abre donde se pulsó; con el teclado,
  con la tecla Menú o Mayús+F10 sobre la zona enfocada, junto a ella. Dentro,
  el mismo teclado que DropdownMenu y las mismas piezas (MenuItem, MenuSeparator,
  MenuLabel). La zona recibe el foco con Tab para que el menú sea alcanzable.

    <ContextMenu label="Acciones de la fila">
      {#snippet target(props)}<tr {...props}>…</tr>{/snippet}
      <MenuItem onSelect={abrir}>Abrir</MenuItem>
    </ContextMenu>
-->
<script lang="ts">
  import { tick } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  import { cn } from "$lib/utils";
  import { devolverFoco } from "$lib/internal/focus";
  import { pushLayer } from "$lib/internal/layers";
  import { focusItem, menuKeyboard, provideMenu } from "$lib/internal/menu";
  import { anchor, pointAnchor, type VirtualElement } from "$lib/internal/position";

  import type { TriggerProps } from "./popover.svelte";

  const {
    label,
    class: className = "",
    target,
    children,
  }: {
    /** Nombre accesible del menú. */
    label: string;
    class?: string;
    /** La zona sobre la que se abre; recibe las props a esparcir en su elemento. */
    target: import("svelte").Snippet<[TriggerProps]>;
    children?: import("svelte").Snippet;
  } = $props();

  const id = $props.id();
  let zona: HTMLElement | null = $state(null);
  let lista: HTMLElement | undefined = $state();
  let open = $state(false);
  let punto: VirtualElement | null = null;

  async function abrirEn(x: number, y: number) {
    punto = pointAnchor(x, y, zona ?? undefined);
    open = true;
    await tick();
    focusItem(lista, 0);
  }

  function cerrar() {
    open = false;
    devolverFoco(zona);
  }

  provideMenu({ close: cerrar });
  const teclado = menuKeyboard(() => (open = false));

  const targetProps = $derived({
    tabindex: 0,
    "aria-haspopup": "menu",
    oncontextmenu: (e: MouseEvent) => {
      e.preventDefault();
      abrirEn(e.clientX, e.clientY);
    },
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        abrirEn(r.left + 8, r.bottom);
      }
    },
    [createAttachmentKey()]: (nodo: HTMLElement) => {
      zona = nodo;
      return () => {
        if (zona === nodo) zona = null;
      };
    },
  });

  $effect(() => {
    const l = lista;
    if (!open || !l || !punto) return;
    const soltar = anchor(punto, l, { placement: "bottom-start", gap: 2 });
    const quitar = pushLayer({
      inside: () => [l],
      dismiss: (motivo) => (motivo === "escape" ? cerrar() : (open = false)),
    });
    return () => {
      quitar();
      soltar();
    };
  });
</script>

{@render target(targetProps)}

{#if open}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    bind:this={lista}
    id={`${id}-menu`}
    role="menu"
    aria-label={label}
    popover="manual"
    class={cn("ta-menu", className)}
    onkeydown={(e) => teclado(e, lista)}
  >
    {@render children?.()}
  </div>
{/if}

<style>
  .ta-menu {
    position: fixed;
    inset: auto;
    margin: 0;
    z-index: 50;
    min-width: 10rem;
    max-width: min(20rem, calc(100vw - 1rem));
    max-height: min(24rem, calc(100vh - 2rem));
    overflow-y: auto;
    padding: 0.25rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45);
    font: inherit;
  }
</style>
