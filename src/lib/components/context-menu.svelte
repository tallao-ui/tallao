<!--
  tallao — ContextMenu
  Right-click menu over an area. It opens where the click happened; with the keyboard,
  with the Menu key or Shift+F10 on the focused area, next to it. Inside, the same
  keyboard as DropdownMenu and the same parts (MenuItem, MenuSeparator, MenuLabel).
  The area takes focus with Tab so the menu is reachable.

    <ContextMenu label="Row actions">
      {#snippet target(props)}<tr {...props}>…</tr>{/snippet}
      <MenuItem onSelect={openRow}>Open</MenuItem>
    </ContextMenu>
-->
<script lang="ts">
  import { tick } from "svelte";
  import { createAttachmentKey } from "svelte/attachments";

  import { cn } from "$lib/utils";
  import { restoreFocus } from "$lib/internal/focus";
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
    /** Accessible name of the menu. */
    label: string;
    class?: string;
    /** The area it opens over; receives the props to spread on its element. */
    target: import("svelte").Snippet<[TriggerProps]>;
    children?: import("svelte").Snippet;
  } = $props();

  const id = $props.id();
  let area: HTMLElement | null = $state(null);
  let menuEl: HTMLElement | undefined = $state();
  let open = $state(false);
  let point: VirtualElement | null = null;

  async function openAt(x: number, y: number) {
    point = pointAnchor(x, y, area ?? undefined);
    open = true;
    await tick();
    focusItem(menuEl, 0);
  }

  function close() {
    open = false;
    restoreFocus(area);
  }

  provideMenu({ close });
  const keyboard = menuKeyboard(() => (open = false));

  const targetProps = $derived({
    tabindex: 0,
    "aria-haspopup": "menu",
    oncontextmenu: (e: MouseEvent) => {
      e.preventDefault();
      openAt(e.clientX, e.clientY);
    },
    onkeydown: (e: KeyboardEvent) => {
      if (e.key === "ContextMenu" || (e.shiftKey && e.key === "F10")) {
        e.preventDefault();
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        openAt(r.left + 8, r.bottom);
      }
    },
    [createAttachmentKey()]: (node: HTMLElement) => {
      area = node;
      return () => {
        if (area === node) area = null;
      };
    },
  });

  $effect(() => {
    const l = menuEl;
    if (!open || !l || !point) return;
    const release = anchor(point, l, { placement: "bottom-start", gap: 2 });
    const remove = pushLayer({
      inside: () => [l],
      dismiss: (reason) => (reason === "escape" ? close() : (open = false)),
    });
    return () => {
      remove();
      release();
    };
  });
</script>

{@render target(targetProps)}

{#if open}
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <div
    bind:this={menuEl}
    id={`${id}-menu`}
    role="menu"
    aria-label={label}
    popover="manual"
    class={cn("ta-menu", className)}
    onkeydown={(e) => keyboard(e, menuEl)}
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
    max-height: min(24rem, var(--ta-available-height, calc(100dvh - 2rem)));
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
