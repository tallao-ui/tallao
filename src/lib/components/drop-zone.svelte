<!--
  tallao — DropZone
  Una zona de un DragBoard donde caen elementos: con el ratón al soltar encima,
  con el teclado cuando las flechas la eligen. `label` es su nombre accesible y
  el que se oye en los avisos («Ganyu over S»). Mientras es el destino lleva
  `data-over`, para que quien la pinta marque toda la zona y no solo un trozo.
  Solo acepta elementos de su tablero: soltar un archivo encima no hace nada.
-->
<script lang="ts">
  import { useDragBoard } from "$lib/internal/drag-board";
  import { cn } from "$lib/utils";

  interface Props {
    id: string;
    /** Nombre accesible de la zona. */
    label: string;
    class?: string;
    children?: import("svelte").Snippet;
    /** Otros atributos (data-*, style…) van al elemento. */
    [key: string]: unknown;
  }

  const { id, label, class: className = "", children, ...rest }: Props = $props();

  const tablero = useDragBoard();

  /** dragenter/dragleave llegan también al pasar por los hijos: se cuentan. */
  let dentro = $state(0);

  const encima = $derived((tablero.dragging !== null && dentro > 0) || tablero.target === id);

  $effect(() => {
    if (tablero.dragging === null) dentro = 0;
  });

  function entrar(e: DragEvent) {
    if (!tablero.dragging) return;
    e.preventDefault();
    dentro++;
  }

  function sobre(e: DragEvent) {
    if (!tablero.dragging) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  }

  function soltar(e: DragEvent) {
    if (!tablero.dragging) return;
    e.preventDefault();
    e.stopPropagation();
    dentro = 0;
    tablero.drop(id);
  }
</script>

<div
  {...rest}
  role="group"
  aria-label={label}
  class={cn("ta-drop-zone", encima && "ta-drop-zone--encima", className)}
  data-ta-drop-zone={id}
  data-over={encima ? "true" : undefined}
  ondragenter={entrar}
  ondragover={sobre}
  ondragleave={() => (dentro = Math.max(0, dentro - 1))}
  ondrop={soltar}
>
  {@render children?.()}
</div>

<style>
  .ta-drop-zone {
    border-radius: var(--ta-radius);
    transition: box-shadow 0.15s;
  }

  .ta-drop-zone--encima {
    box-shadow: inset 0 0 0 2px rgb(var(--ta-accent));
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-drop-zone { transition: none; }
  }
</style>
