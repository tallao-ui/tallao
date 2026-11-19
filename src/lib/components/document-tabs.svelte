<!--
  tallao — DocumentTabs
  Editor-style tabs for open documents or conversations: every tab can be closed and an add
  button opens a new one. The companion of Tabs (which has no close button).

    <DocumentTabs items={docs} bind:value onclose={(id) => (docs = docs.filter((d) => d.id !== id))} onadd={newDoc} />

  - WAI-ARIA tabs pattern with a close affordance: `role="tablist"` (it owns the tabs through
    `aria-owns`, so the close buttons laid out between them are not its children), each tab a
    `<button role="tab">` (`aria-selected`, roving tabindex) and its close button a SIBLING
    (never nested in the tab button) with `tabindex="-1"`: the mouse reaches it, the keyboard
    closes the focused tab with Delete or Backspace. Ctrl+W is not handled (the browser owns it).
  - ← → move focus and select (automatic activation, mirrored in right-to-left), Home / End go to
    the first / last tab, a middle click closes. The component never removes a tab: it calls
    `onclose(id)` and the parent decides what closing means (ask to save, remove, hide…). When the
    closed tab disappears, focus and selection move to its neighbour.
  - `busy` draws a small Spinner with the hidden text "Working"; `dirty` a dot with the hidden
    text "Unsaved changes": the state is never colour alone. The selected tab also has a bar
    under it and a heavier weight.
  - Many tabs scroll sideways (no wrapping) and the active one is scrolled into view; a long label
    is cut with an ellipsis at 14rem and the whole text is in `title`.
  - `panels={false}` (default) renders only the tablist and the page places the panels, naming
    them with `controls` / `tabId` as Tabs does; `panels` renders the active tab's `children`.
  - `end` puts extra controls on the right, outside the tablist. Same HTML on the server.
-->
<script lang="ts" module>
  export interface DocumentTab {
    id: string;
    label: string;
    /** The full name, shown as the tab's tooltip (`title`); the label by default. */
    title?: string;
    /** Work in progress: shows a Spinner and the hidden text "Working". */
    busy?: boolean;
    /** Unsaved or unread: shows a dot and the hidden text "Unsaved changes". */
    dirty?: boolean;
    /** `false` hides the close button (and Delete / middle click do nothing). Default `true`. */
    closable?: boolean;
    /** With `panels={false}`: the id of the page's panel for this tab (`aria-controls`). */
    controls?: string;
    /** The tab's own id, instead of the generated one (to label a panel the page renders). */
    tabId?: string;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { tick } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Spinner from "./spinner.svelte";

  const L = useLabels();

  interface Props {
    items: DocumentTab[];
    /** The id of the selected tab (bindable). */
    value?: string;
    /** Accessible name of the tablist. */
    ariaLabel?: string;
    /** Called with the id of the tab to close; the component does not remove it. */
    onclose?: (id: string) => void;
    /** Renders a "+" button after the tabs when given. */
    onadd?: () => void;
    /** Name of the add button. */
    addLabel?: string;
    /** Name of each close button; "Close {label}" by default. */
    closeLabel?: (tab: DocumentTab) => string;
    /** Hidden text of a busy tab. */
    busyLabel?: string;
    /** Hidden text of a dirty tab. */
    dirtyLabel?: string;
    onchange?: (id: string) => void;
    /** `false`: only the tablist; the page renders the panels (see `controls`). */
    panels?: boolean;
    /** Controls on the same row as the tabs, on the right (outside the tablist). */
    end?: Snippet;
    /** With `panels`: the active tab's content, given its id. */
    children?: Snippet<[string]>;
    class?: string;
  }

  let {
    items,
    value = $bindable(items[0]?.id ?? ""),
    ariaLabel,
    onclose,
    onadd,
    addLabel = L.newTab,
    closeLabel = (t: DocumentTab) => L.closeTab.replace("{label}", t.label),
    busyLabel = L.tabBusy,
    dirtyLabel = L.tabDirty,
    onchange,
    panels = false,
    end,
    children,
    class: className = "",
  }: Props = $props();

  // Unique ids that match on server and browser ($props.id).
  const uid = $props.id();
  const prefix = `ta-doctabs-${uid}`;
  let list: HTMLElement | undefined = $state();

  const tabIdOf = (t: DocumentTab) => t.tabId || `${prefix}-${t.id}`;
  /** The tab that is in the tab order: the selected one, or the first if `value` matches none. */
  const activeId = $derived(items.some((t) => t.id === value) ? value : (items[0]?.id ?? ""));
  const activeTabId = $derived(tabIdOf(items.find((t) => t.id === activeId) ?? { id: activeId, label: "" }));

  const tabEls = () => (list ? Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]')) : []);

  function select(id: string, focus = false) {
    if (id !== value) {
      value = id;
      onchange?.(id);
    }
    if (focus) tabEls()[items.findIndex((t) => t.id === id)]?.focus();
  }

  /** Asks the parent to close `id`; once the tab is gone, focus and selection go to a neighbour. */
  async function close(id: string) {
    const i = items.findIndex((t) => t.id === id);
    if (i < 0 || items[i].closable === false) return;
    const neighbour = items[i + 1] ?? items[i - 1];
    const hadFocus = !!tabEls()[i]?.parentElement?.contains(document.activeElement);
    onclose?.(id);
    await tick();
    if (!neighbour || items.some((t) => t.id === id) || !items.some((t) => t.id === neighbour.id)) return;
    if (value === id || !items.some((t) => t.id === value)) select(neighbour.id, hadFocus);
    else if (hadFocus) tabEls()[items.findIndex((t) => t.id === neighbour.id)]?.focus();
  }

  function onKey(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    const wrap = target.closest<HTMLElement>(".ta-doctab");
    if (!wrap || !list?.contains(wrap)) return;
    const i = Array.from(list.querySelectorAll(".ta-doctab")).indexOf(wrap);
    if (i < 0) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      void close(items[i].id);
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const dir = list.closest("[dir]")?.getAttribute("dir");
    const rtl = dir === "rtl" || (dir !== "ltr" && getComputedStyle(list).direction === "rtl");
    const next = e.key === (rtl ? "ArrowLeft" : "ArrowRight");
    const prev = e.key === (rtl ? "ArrowRight" : "ArrowLeft");
    const to = next ? (i + 1) % items.length : prev ? (i - 1 + items.length) % items.length : e.key === "Home" ? 0 : e.key === "End" ? items.length - 1 : -1;
    if (to < 0) return;
    e.preventDefault();
    select(items[to].id, true);
  }

  // A middle click closes; pressing it must not start the browser's autoscroll first.
  function onMouseDown(e: MouseEvent) {
    if (e.button === 1) e.preventDefault();
  }
  function onAuxClick(e: MouseEvent, t: DocumentTab) {
    if (e.button !== 1) return;
    e.preventDefault();
    void close(t.id);
  }

  // Keep the selected tab visible when there are more tabs than room.
  $effect(() => {
    void activeId;
    void items.length;
    const el = tabEls()[items.findIndex((t) => t.id === activeId)]?.parentElement;
    el?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  });
</script>

<div class={cn("ta-doctabs", className)}>
  <div class="ta-doctabs-row">
    <!-- The tabs are laid out among their close buttons, which are not tabs: the tablist is an empty
         element that owns the tabs (aria-owns), so it contains only tabs for assistive technology. -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="ta-doctabs-list" bind:this={list} onkeydown={onKey}>
      <div class="ta-doctabs-owner" role="tablist" aria-label={ariaLabel} aria-owns={items.map(tabIdOf).join(" ") || undefined}></div>
      {#each items as t (t.id)}
        {@const selected = t.id === activeId}
        <div class={cn("ta-doctab", selected && "ta-doctab--selected")} role="presentation" onmousedown={onMouseDown} onauxclick={(e) => onAuxClick(e, t)}>
          <button
            type="button"
            role="tab"
            id={tabIdOf(t)}
            title={t.title ?? t.label}
            aria-selected={selected}
            aria-controls={panels ? `${prefix}-panel` : t.controls || undefined}
            tabindex={selected ? 0 : -1}
            class="ta-doctab-tab"
            onclick={() => select(t.id)}
          >
            {#if t.busy}<Spinner size="sm" label={busyLabel} class="ta-doctab-busy" />{/if}
            <span class="ta-doctab-label">{t.label}</span>
            {#if t.dirty}<span class="ta-doctab-dot" aria-hidden="true"></span><span class="ta-doctab-hidden">{dirtyLabel}</span>{/if}
          </button>
          {#if t.closable !== false}
            <button type="button" class="ta-doctab-close" tabindex="-1" aria-label={closeLabel(t)} onclick={() => close(t.id)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          {/if}
        </div>
      {/each}
    </div>
    {#if onadd}
      <button type="button" class="ta-doctabs-add" title={addLabel} aria-label={addLabel} onclick={() => onadd()}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </button>
    {/if}
    {#if end}<div class="ta-doctabs-end">{@render end()}</div>{/if}
  </div>
  {#if panels}
    <div class="ta-doctabs-panel" role="tabpanel" id={`${prefix}-panel`} aria-labelledby={activeTabId} tabindex="-1">
      {@render children?.(activeId)}
    </div>
  {/if}
</div>

<style>
  .ta-doctabs-row {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    box-shadow: inset 0 -1px 0 rgb(var(--ta-border));
  }
  .ta-doctabs-owner {
    position: absolute;
    width: 0;
    height: 0;
    overflow: hidden;
    pointer-events: none;
  }
  .ta-doctabs-list {
    position: relative;
    display: flex;
    flex: 0 1 auto;
    min-width: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: rgb(var(--ta-border)) transparent;
  }
  .ta-doctabs-end {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-inline-start: auto;
    flex: none;
  }

  .ta-doctab {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    max-width: 14rem;
    border-bottom: 2px solid transparent;
    color: rgb(var(--ta-text-dim));
    transition: color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out), background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-doctab:hover {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated) / 0.6);
  }
  .ta-doctab--selected {
    color: rgb(var(--ta-text));
    font-weight: 600;
    background: rgb(var(--ta-surface));
    border-bottom-color: rgb(var(--ta-accent));
  }

  .ta-doctab-tab {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    min-width: 0;
    padding: 0.5rem 0.25rem 0.5rem 0.75rem;
    font: inherit;
    font-size: 0.8125rem;
    color: inherit;
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
  }
  .ta-doctab-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ta-doctab-tab:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px rgb(var(--ta-accent) / 0.7);
    border-radius: var(--ta-radius-sm);
  }
  .ta-doctab-tab :global(.ta-doctab-busy) {
    flex: none;
    --ta-spinner-size: 0.75rem;
  }
  .ta-doctab-dot {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: rgb(var(--ta-accent));
    box-shadow: 0 0 0 1px rgb(var(--ta-surface));
  }
  .ta-doctab-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  .ta-doctab-close,
  .ta-doctabs-add {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    margin-inline-end: 0.375rem;
    padding: 0;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
    transition: color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out), background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-doctabs-add {
    width: 1.75rem;
    height: 1.75rem;
    margin: 0 0.25rem;
  }
  .ta-doctab-close:hover,
  .ta-doctabs-add:hover {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated));
  }
  .ta-doctab-close:focus-visible,
  .ta-doctabs-add:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.7);
    outline-offset: 1px;
  }

  .ta-doctabs-panel {
    padding-top: 1rem;
    outline: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-doctab,
    .ta-doctab-close,
    .ta-doctabs-add {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    .ta-doctab-tab { min-height: 2.75rem; }
    .ta-doctabs-add { width: 2.75rem; height: 2.75rem; }
    .ta-doctab-close::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2.75rem;
      height: 2.75rem;
      transform: translate(-50%, -50%);
    }
  }
</style>
