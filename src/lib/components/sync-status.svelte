<!--
  tallao — SyncStatus
  The instrument line of a data view: whether what it shows is in sync with the server and how
  long ago it was read ("Synced 12 s ago", ticking), a Live badge when the view drives something
  on air, a Refresh button and room for more (a shortcuts button, a filter).

    <SyncStatus status={phase} updatedAt={load.updatedAt} live={onAir} onRefresh={reload} refreshKey="R">
      {#snippet actions()}<Button size="sm" variant="ghost">Shortcuts</Button>{/snippet}
    </SyncStatus>

  - `status`: `loading` (first read), `syncing` (a refresh while the data stays on screen),
    `ready` or `error`. The text sits in a polite live region, so a screen reader hears when the
    view stops reaching the server; the coloured dot is never the only cue.
  - `updatedAt` (ms or Date) gives the relative time; it ticks once a second in the browser
    only (the server renders the time as of that render, the first client render matches it).
  - `refreshKey` only labels the button (`aria-keyshortcuts` and a Kbd): the page listens to
    the key itself, as Kbd does.
  - Refresh is disabled while `loading` or `syncing`.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import Kbd from "./kbd.svelte";

  interface Props {
    status?: "loading" | "syncing" | "ready" | "error";
    /** When the data on screen was read (ms since the epoch, or a Date); null: not yet. */
    updatedAt?: number | Date | null;
    /** The view drives something on air: a pulsing badge (`true` says "Live", a string says that). */
    live?: boolean | string;
    /** Draws the Refresh button. */
    onRefresh?: () => unknown;
    /** The key the page binds to refresh: shown on the button and in `aria-keyshortcuts`. */
    refreshKey?: string;
    /** Overrides the state text. */
    text?: string;
    /** Buttons after Refresh, on the right. */
    actions?: import("svelte").Snippet;
    class?: string;
    /** Any other attribute goes to the root <div>. */
    [key: string]: unknown;
  }

  const L = useLabels();
  const {
    status = "ready",
    updatedAt = null,
    live = false,
    onRefresh,
    refreshKey,
    text,
    actions,
    class: className = "",
    ...rest
  }: Props = $props();

  let now = $state(Date.now());
  $effect(() => {
    const tick = setInterval(() => (now = Date.now()), 1000);
    return () => clearInterval(tick);
  });

  const at = $derived(updatedAt instanceof Date ? updatedAt.getTime() : updatedAt);

  function ago(t: number): string {
    const s = Math.max(0, Math.round((now - t) / 1000));
    if (s < 5) return L.justNow;
    if (s < 60) return L.secondsAgo.replace("{n}", String(s));
    const m = Math.floor(s / 60);
    if (m < 60) return L.minutesAgo.replace("{n}", String(m));
    return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  const stateText = $derived(
    text ??
      (status === "error"
        ? L.syncFailed
        : status === "loading"
          ? L.loading
          : status === "syncing"
            ? L.syncing
            : at !== null
              ? L.synced.replace("{time}", ago(at))
              : L.syncReady)
  );
  const liveText = $derived(typeof live === "string" ? live : L.live);
  const busy = $derived(status === "loading" || status === "syncing");
</script>

<div {...rest} class={cn("ta-sync", className)} data-state={status}>
  <span class="ta-sync-signal" role="status" aria-live="polite">
    <span class="ta-sync-dot" aria-hidden="true"></span>
    <span class="ta-sync-text">{stateText}</span>
  </span>
  {#if live}
    <span class="ta-sync-live"><span class="ta-sync-live-dot" aria-hidden="true"></span>{liveText}</span>
  {/if}
  <span class="ta-sync-spacer"></span>
  {#if onRefresh}
    <button
      type="button"
      class="ta-sync-btn"
      aria-keyshortcuts={refreshKey}
      disabled={busy}
      onclick={() => onRefresh?.()}
    >
      {#if refreshKey}<Kbd size="sm" aria-hidden="true">{refreshKey}</Kbd>{/if}<span>{L.refresh}</span>
    </button>
  {/if}
  {@render actions?.()}
</div>

<style>
  .ta-sync {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem 0.75rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.375rem 0.25rem 0.75rem;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-md, 0.5rem);
    background: rgb(var(--ta-surface) / 0.6);
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
    font-variant-numeric: tabular-nums;
  }

  .ta-sync-signal {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    min-width: 0;
  }

  .ta-sync-dot {
    flex: none;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 999px;
    background: rgb(var(--ta-success));
    box-shadow: 0 0 0 3px rgb(var(--ta-success) / 0.18);
  }
  [data-state="syncing"] .ta-sync-dot,
  [data-state="loading"] .ta-sync-dot {
    background: rgb(var(--ta-accent));
    box-shadow: 0 0 0 3px rgb(var(--ta-accent) / 0.2);
    animation: ta-sync-breathe 1.2s var(--ta-ease-in-out, ease-in-out) infinite;
  }
  [data-state="error"] .ta-sync-dot {
    background: rgb(var(--ta-danger));
    box-shadow: 0 0 0 3px rgb(var(--ta-danger) / 0.2);
  }
  [data-state="error"] .ta-sync-text {
    color: rgb(var(--ta-danger));
  }

  .ta-sync-live {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.125rem 0.5rem;
    border: 1px solid rgb(var(--ta-danger) / 0.5);
    border-radius: 999px;
    background: rgb(var(--ta-danger) / 0.12);
    color: rgb(var(--ta-text));
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .ta-sync-live-dot {
    width: 0.4375rem;
    height: 0.4375rem;
    border-radius: 999px;
    background: rgb(var(--ta-danger));
    box-shadow: 0 0 8px rgb(var(--ta-danger) / 0.7);
    animation: ta-sync-breathe 1.4s var(--ta-ease-in-out, ease-in-out) infinite;
  }

  .ta-sync-spacer {
    flex: 1;
  }

  .ta-sync-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    min-height: 1.75rem;
    padding: 0 0.5rem;
    border: 1px solid transparent;
    border-radius: var(--ta-radius-sm);
    background: transparent;
    color: rgb(var(--ta-text-dim));
    font: inherit;
    cursor: pointer;
    transition: background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-sync-btn:hover:not(:disabled) {
    background: rgb(var(--ta-text) / 0.06);
    color: rgb(var(--ta-text));
  }
  .ta-sync-btn:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }
  .ta-sync-btn:disabled {
    opacity: 0.55;
    cursor: default;
  }

  @keyframes ta-sync-breathe {
    50% {
      opacity: 0.45;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-sync-dot,
    .ta-sync-live-dot {
      animation: none !important;
    }
  }
  :global([data-tallao-motion="reduce"]) .ta-sync-dot,
  :global([data-tallao-motion="reduce"]) .ta-sync-live-dot {
    animation: none !important;
  }

  @media (pointer: coarse) {
    .ta-sync-btn {
      min-height: 2.75rem;
      padding: 0 0.75rem;
    }
  }
</style>
