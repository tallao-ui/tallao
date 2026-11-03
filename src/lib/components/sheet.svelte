<!--
  tallao — Sheet
  Panel lateral modal (detalle de un registro, ajustes, un carrito): es un
  Dialog pegado a un borde, con todo lo suyo (foco contenido, Escape, scroll
  bloqueado, foco de vuelta).
-->
<script lang="ts">
  import Dialog from "./dialog.svelte";

  let {
    open = $bindable(false),
    side = "right",
    title = "",
    description,
    size = "lg",
    closeLabel,
    ariaLabel,
    class: className = "",
    onClose,
    children,
    footer,
  }: {
    open?: boolean;
    side?: "left" | "right" | "top" | "bottom";
    title?: string;
    description?: string;
    /** Ancho del panel lateral (no aplica arriba ni abajo). */
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    closeLabel?: string;
    ariaLabel?: string;
    class?: string;
    onClose?: () => void;
    children?: import("svelte").Snippet;
    footer?: import("svelte").Snippet;
  } = $props();
</script>

<Dialog
  bind:open
  placement={side}
  {title}
  {description}
  {size}
  {closeLabel}
  {ariaLabel}
  class={className}
  {onClose}
  {children}
  {footer}
/>
