<!--
  tallao — EventFeed
  The activity of an agent (or of anything) as a list where each new event enters at the top and the
  older ones slide down to make room: tool calls, files touched, approvals, errors.

    <EventFeed events={events} limit={6} />      the page unshifts a new event onto `events`

  - `events` are `{ id, title, detail?, time?, tone?, icon? }`, newest first, in the order the page
    gives them: the component draws and animates, the page owns the data. Each `id` must be unique
    and stable (events are keyed by it). `limit` keeps only the first N: an older event leaves with
    a fade. `time` is text the page formats ("12:04", "2 min ago").
  - `tone` (`default`, `accent`, `success`, `warning`, `error`, `info`) picks the icon and its
    colour; the icon shape is a second cue, and the title must say what happened, because the
    tone is not read aloud. A `item` snippet draws an event your own way.
  - A list (`<ol>`) named `ariaLabel`. Silent by default; with `announce` a new event is read
    aloud politely (`aria-live="polite"`, additions only), so use it for what a person must notice.
  - Nothing moves layout except the slide: a new event rises 8px while it fades in and the others
    glide down (FLIP), 120–240 ms. Reduced motion (the system setting or
    `data-tallao-motion="reduce"`): they change place at once. On the server the list is rendered
    whole, with no transitions.
  - Empty: the text `emptyText` (default "No events yet") is shown instead of the list.
-->
<script lang="ts" module>
  import type { IconName } from "./icon.svelte";

  export type FeedTone = "default" | "accent" | "success" | "warning" | "error" | "info";
  export interface FeedEvent {
    /** Unique and stable: the event is keyed by it. */
    id: string | number;
    title: string;
    detail?: string;
    /** Text the page formats ("12:04", "2 min ago"). */
    time?: string;
    tone?: FeedTone;
    /** Overrides the tone's icon. */
    icon?: IconName;
  }
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { fade, prefersReducedMotion, rise } from "$lib/motion";
  import { cn } from "$lib/utils";

  import Icon from "./icon.svelte";

  const L = useLabels();

  interface Props {
    events: FeedEvent[];
    /** Shows only the first N events (the newest). */
    limit?: number;
    /** Accessible name of the list. */
    ariaLabel?: string;
    /** Reads each new event aloud, politely. */
    announce?: boolean;
    /** Shown when there are no events. */
    emptyText?: string;
    /** Draws an event instead of the default row. */
    item?: Snippet<[FeedEvent]>;
    class?: string;
    /** Any other attribute goes to the `<ol>`. */
    [key: string]: unknown;
  }

  const { events, limit, ariaLabel, announce = false, emptyText, item, class: className = "", ...rest }: Props = $props();

  const visible = $derived(limit != null && limit >= 0 ? events.slice(0, limit) : events);

  const TONE_ICONS: Record<FeedTone, IconName | null> = { default: null, accent: "sparkle", success: "check", warning: "alert", error: "x", info: "info" };
  const iconOf = (ev: FeedEvent) => ev.icon ?? TONE_ICONS[ev.tone ?? "default"];

  // The others glide to their new place; it is read when the move starts, so the setting can change.
  const glide = (_node: Element, { from, to }: { from: DOMRect; to: DOMRect }) => {
    const dy = from.top - to.top;
    const still = prefersReducedMotion() || !dy;
    return { duration: still ? 0 : 200, easing: (t: number) => 1 - Math.pow(1 - t, 4), css: (_t: number, u: number) => `transform: translateY(${u * dy}px)` };
  };
</script>

<ol {...rest} class={cn("ta-feed", className)} aria-label={ariaLabel ?? L.eventFeed} aria-live={announce ? "polite" : "off"} aria-relevant="additions">
  {#each visible as ev (ev.id)}
    <li class={cn("ta-feed-item", `ta-feed-item--${ev.tone ?? "default"}`)} animate:glide in:rise={{ y: -8 }} out:fade>
      {#if item}
        {@render item(ev)}
      {:else}
        <span class="ta-feed-mark" aria-hidden="true">
          {#if iconOf(ev)}<Icon name={iconOf(ev)!} size={14} />{:else}<span class="ta-feed-dot"></span>{/if}
        </span>
        <span class="ta-feed-body">
          <span class="ta-feed-title">{ev.title}</span>
          {#if ev.detail}<span class="ta-feed-detail">{ev.detail}</span>{/if}
        </span>
        {#if ev.time}<span class="ta-feed-time">{ev.time}</span>{/if}
      {/if}
    </li>
  {/each}
</ol>
{#if !visible.length}<p class="ta-feed-empty">{emptyText ?? L.noEvents}</p>{/if}

<style>
  .ta-feed {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
    min-width: 0;
  }

  .ta-feed-item {
    display: flex;
    align-items: flex-start;
    gap: 0.625rem;
    padding: 0.5rem 0.75rem;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    min-width: 0;
  }

  .ta-feed-mark {
    flex: none;
    display: inline-grid;
    place-items: center;
    width: 1.375rem;
    height: 1.375rem;
    margin-top: 0.0625rem;
    color: rgb(var(--ta-text-dim));
    background: rgb(var(--ta-text) / 0.06);
    border-radius: 50%;
  }
  .ta-feed-dot {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 50%;
    background: currentColor;
  }
  .ta-feed-item--accent .ta-feed-mark { color: rgb(var(--ta-accent-hover)); background: rgb(var(--ta-accent) / 0.16); }
  .ta-feed-item--success .ta-feed-mark { color: rgb(var(--ta-success)); background: rgb(var(--ta-success) / 0.16); }
  .ta-feed-item--warning .ta-feed-mark { color: rgb(var(--ta-warning)); background: rgb(var(--ta-warning) / 0.16); }
  .ta-feed-item--error .ta-feed-mark { color: rgb(var(--ta-danger)); background: rgb(var(--ta-danger) / 0.16); }
  .ta-feed-item--info .ta-feed-mark { color: rgb(var(--ta-info)); background: rgb(var(--ta-info) / 0.16); }

  .ta-feed-body {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    min-width: 0;
  }
  .ta-feed-title {
    font-size: 0.875rem;
    font-weight: 500;
    color: rgb(var(--ta-text));
    overflow-wrap: anywhere;
  }
  .ta-feed-detail {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
    overflow-wrap: anywhere;
  }
  .ta-feed-time {
    flex: none;
    font-family: var(--ta-font-mono);
    font-size: 0.6875rem;
    color: rgb(var(--ta-text-dim));
    white-space: nowrap;
    margin-top: 0.1875rem;
  }

  .ta-feed-empty {
    margin: 0;
    padding: 0.75rem;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text-dim));
    border: 1px dashed rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }
</style>
