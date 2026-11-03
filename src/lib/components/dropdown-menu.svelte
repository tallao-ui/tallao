<!--
  tallao — DropdownMenu
  Menú de acciones de un botón (patrón «menu button» de la WAI-ARIA APG):
    - Enter, Espacio o ↓ en el disparador lo abren con el foco en la primera
      opción; ↑ lo abre con el foco en la última.
    - ↑ ↓ recorren las opciones (dan la vuelta), Inicio y Fin saltan a los
      extremos, una letra salta a la siguiente opción que empieza por ella.
    - Escape lo cierra y devuelve el foco al disparador; Tab lo cierra.
    - Elegir una opción la ejecuta y cierra el menú.

    <DropdownMenu label="Acciones del proyecto">
      {#snippet trigger(props)}<Button {...props}>Acciones</Button>{/snippet}
      <MenuItem onSelect={editar}>Editar</MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger" onSelect={borrar}>Borrar</MenuItem>
    </DropdownMenu>
-->
<script lang="ts">
  import { tick } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  import { cn } from "$lib/utils";
  import { devolverFoco } from "$lib/internal/focus";
  import { pushLayer } from "$lib/internal/layers";
  import { focusItem, menuKeyboard, provideMenu } from "$lib/internal/menu";
  import { anchor, type Placement } from "$lib/internal/position";

  import type { TriggerProps } from "./popover.svelte";

  interface Props {
    /** Nombre accesible del menú. */
    label: string;
    open?: boolean;
    placement?: Placement;
    class?: string;
    onOpenChange?: (open: boolean) => void;
    trigger: import("svelte").Snippet<[TriggerProps]>;
    children?: import("svelte").Snippet;
  }

  let {
    label,
    open = $bindable(false),
    placement = "bottom-start",
    class: className = "",
    onOpenChange,
    trigger,
    children,
  }: Props = $props();

  const id = $props.id();
  let disparador: HTMLElement | null = $state(null);
  let lista: HTMLElement | undefined = $state();

  function poner(valor: boolean) {
    if (open === valor) return;
    open = valor;
    onOpenChange?.(valor);
  }

  async function abrir(foco: "primera" | "ultima") {
    poner(true);
    await tick();
    // El panel se coloca en un efecto; el foco espera a que exista.
    focusItem(lista, foco === "primera" ? 0 : -1);
  }

  function cerrar() {
    poner(false);
    devolverFoco(disparador);
  }

  provideMenu({ close: cerrar });

  const triggerProps = $derived({
    id: `${id}-boton`,
    "aria-haspopup": "menu",
    "aria-expanded": open,
    "aria-controls": open ? `${id}-menu` : undefined,
    onclick: () => (open ? poner(false) : abrir("primera")),
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        abrir(e.key === "ArrowDown" ? "primera" : "ultima");
      }
    },
    [createAttachmentKey()]: (nodo: HTMLElement) => {
      disparador = nodo;
      return () => {
        if (disparador === nodo) disparador = null;
      };
    },
  });

  const teclado = menuKeyboard(() => poner(false));

  $effect(() => {
    const l = lista;
    const a = disparador;
    if (!open || !l || !a) return;
    const soltar = anchor(a, l, { placement });
    const quitar = pushLayer({
      inside: () => [l, a],
      dismiss: (motivo) => (motivo === "escape" ? cerrar() : poner(false)),
    });
    return () => {
      quitar();
      soltar();
    };
  });
</script>

{@render trigger(triggerProps)}

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
    animation: ta-menu-aparece 0.1s ease-out;
  }

  @keyframes ta-menu-aparece {
    from { opacity: 0; transform: translateY(-2px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-menu { animation: none; }
  }
</style>
