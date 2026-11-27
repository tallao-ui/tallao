<!--
  tallao — ShortcutList
  The keys of a view and what each does, as a description list: one Kbd per combination on the
  left, its action on the right. Put it in a Popover, a Sheet or a help section; it does not
  listen to the keys (the page does).

    <ShortcutList shortcuts={[
      { keys: ["R"], label: "Refresh" },
      { keys: ["J", "K"], label: "Next / previous row", alternatives: true },
      { keys: ["Mod", "S"], label: "Save draft" },
    ]} />

  - `keys` is one combination (`["Mod", "S"]`, drawn as ⌘S / Ctrl+S); with `alternatives`, each
    key is an alternative of its own (J or K) and they are drawn apart.
  - Items with a `group` are listed under that heading, in order of first appearance.
-->
<script lang="ts" module>
  export interface ShortcutItem {
    keys: string[];
    label: string;
    /** Each key is an alternative (J / K), not a combination. */
    alternatives?: boolean;
    /** Heading the item is listed under. */
    group?: string;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import Kbd from "./kbd.svelte";

  interface Props {
    shortcuts: ShortcutItem[];
    /** Accessible name of the list; "Keyboard shortcuts" by default. */
    ariaLabel?: string;
    class?: string;
    /** Any other attribute goes to the root <div>. */
    [key: string]: unknown;
  }

  const L = useLabels();
  const { shortcuts, ariaLabel, class: className = "", ...rest }: Props = $props();

  const groups = $derived.by(() => {
    const out: { name: string | undefined; items: ShortcutItem[] }[] = [];
    for (const s of shortcuts) {
      let g = out.find((x) => x.name === s.group);
      if (!g) out.push((g = { name: s.group, items: [] }));
      g.items.push(s);
    }
    return out;
  });
  const uid = $props.id();
</script>

<div {...rest} class={cn("ta-shortcuts", className)} role="group" aria-label={ariaLabel ?? L.keyboardShortcuts}>
  {#each groups as g, gi (g.name ?? `_${gi}`)}
    {#if g.name}<p class="ta-shortcuts-group" id={`${uid}-g${gi}`}>{g.name}</p>{/if}
    <dl aria-labelledby={g.name ? `${uid}-g${gi}` : undefined}>
      {#each g.items as s, i (i)}
        <div class="ta-shortcuts-row">
          <dt>
            {#if s.alternatives}
              {#each s.keys as k (k)}<Kbd size="sm">{k}</Kbd>{/each}
            {:else}
              <Kbd size="sm" keys={s.keys} />
            {/if}
          </dt>
          <dd>{s.label}</dd>
        </div>
      {/each}
    </dl>
  {/each}
</div>

<style>
  .ta-shortcuts {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 14rem;
    font-size: 0.8125rem;
  }
  .ta-shortcuts-group {
    margin: 0.25rem 0 0;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: rgb(var(--ta-text-dim));
  }
  dl {
    display: grid;
    gap: 0.375rem;
    margin: 0;
  }
  .ta-shortcuts-row {
    display: grid;
    grid-template-columns: minmax(4.5rem, auto) 1fr;
    align-items: center;
    gap: 0.75rem;
  }
  dt {
    display: inline-flex;
    gap: 0.25rem;
  }
  dd {
    margin: 0;
    color: rgb(var(--ta-text));
  }
</style>
