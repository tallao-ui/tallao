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
    children,
  }: Props = $props();

  let ocupado = $state(false);

  async function confirmar() {
    ocupado = true;
    try {
      await onConfirm();
      open = false;
    } catch {
      // Quien llama ya muestra el error; el diálogo sigue abierto para reintentar.
    } finally {
      ocupado = false;
    }
  }
</script>

<Dialog bind:open {title} {description} {closeLabel} size="sm">
  {@render children?.()}
  {#snippet footer()}
    <Button variant="ghost" onclick={() => (open = false)} disabled={ocupado}>{cancelLabel}</Button>
    <Button {variant} loading={ocupado} onclick={confirmar}>{confirmLabel}</Button>
  {/snippet}
</Dialog>
