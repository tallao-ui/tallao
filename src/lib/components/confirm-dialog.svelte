<!--
  tallao — ConfirmDialog
  Confirmación sobre Dialog. `onConfirm` puede ser asíncrono: el botón queda
  cargando y el diálogo solo se cierra si termina bien (si lanza, sigue abierto
  y el error lo pinta quien llama). Los hijos van entre el texto y los botones
  (p. ej. a dónde mover lo que se borra).
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";

  import Button from "./button.svelte";
  import Dialog from "./dialog.svelte";

  interface Props {
    open?: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    closeLabel?: string;
    variant?: "primary" | "danger";
    onConfirm: () => void | Promise<void>;
    /** Se cerró sin confirmar: Cancelar, Escape, la X o un clic fuera. */
    onCancel?: () => void;
    onOpenChange?: (open: boolean) => void;
    children?: import("svelte").Snippet;
  }

  const L = useLabels();
  let {
    open = $bindable(false),
    title,
    description,
    confirmLabel = L.confirm,
    cancelLabel = L.cancel,
    closeLabel,
    variant = "danger",
    onConfirm,
    onCancel,
    onOpenChange,
    children,
  }: Props = $props();

  let ocupado = $state(false);
  // Un solo aviso por apertura: el botón Cancelar y el cierre del Dialog pueden llegar los dos.
  let avisado = false;
  $effect(() => {
    if (open) avisado = false;
  });

  function avisarCancelacion() {
    if (avisado) return;
    avisado = true;
    onOpenChange?.(false);
    onCancel?.();
  }

  async function confirmar() {
    ocupado = true;
    try {
      await onConfirm();
      avisado = true;
      open = false;
      onOpenChange?.(false);
    } catch {
      // Quien llama ya muestra el error; el diálogo sigue abierto para reintentar.
    } finally {
      ocupado = false;
    }
  }

  function cancelar() {
    open = false;
    avisarCancelacion();
  }
</script>

<!-- Dialog avisa con onClose solo cuando lo cierra el usuario (Escape, la X, el fondo):
     eso es cancelar. Cerrarlo por haber confirmado no pasa por ahí. -->
<Dialog bind:open {title} {description} {closeLabel} size="sm" onClose={avisarCancelacion}>
  {@render children?.()}
  {#snippet footer()}
    <Button variant="ghost" onclick={cancelar} disabled={ocupado}>{cancelLabel}</Button>
    <Button {variant} loading={ocupado} onclick={confirmar}>{confirmLabel}</Button>
  {/snippet}
</Dialog>
