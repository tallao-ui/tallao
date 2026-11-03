<!--
  tallao — MenuItem
  Una opción de DropdownMenu. Al elegirla (clic, Enter o Espacio) llama a
  `onSelect` y cierra el menú; con `closeOnSelect={false}` lo deja abierto.
  Una opción desactivada se anuncia y se salta al navegar, pero no se oculta.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  import { useMenu } from "./dropdown-menu.svelte";

  interface Props {
    onSelect?: () => void;
    disabled?: boolean;
    variant?: "default" | "danger";
    closeOnSelect?: boolean;
    class?: string;
    children: import("svelte").Snippet;
  }

  const {
    onSelect,
    disabled = false,
    variant = "default",
    closeOnSelect = true,
    class: className = "",
    children,
  }: Props = $props();

  const menu = useMenu();

  function elegir() {
    if (disabled) return;
    onSelect?.();
    if (closeOnSelect) menu?.close();
  }
</script>

<button
  type="button"
  role="menuitem"
  tabindex="-1"
  aria-disabled={disabled ? "true" : undefined}
  class={cn("ta-menu-item", `ta-menu-item--${variant}`, className)}
  onclick={elegir}
>
  {@render children()}
</button>

<style>
  .ta-menu-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.4rem 0.6rem;
    font: inherit;
    font-size: 0.875rem;
    text-align: left;
    color: rgb(var(--ta-text));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
    outline: none;
  }

  .ta-menu-item:hover,
  .ta-menu-item:focus-visible,
  .ta-menu-item:focus {
    background: rgb(var(--ta-elevated));
  }

  .ta-menu-item--danger {
    color: rgb(var(--ta-danger));
  }

  .ta-menu-item[aria-disabled="true"] {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
