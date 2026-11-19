<!--
  tallao — ChatThread
  The scrolling area of a conversation. It follows the newest content while the reply streams
  in, and stops following as soon as the reader scrolls up to read something earlier; then a
  "Jump to latest" button appears, and pressing it (or scrolling back to the bottom) resumes.

    <ChatThread label="Conversation">
      {#each messages as m (m.id)}<ChatMessage role={m.role} content={m.text} />{/each}
    </ChatThread>

  - Accessibility: a region with `role="log"` and a name (`label`). It is not a live region
    (`aria-live="off"`): the messages announce themselves (StreamingText reads a reply sentence
    by sentence), so the thread does not read every token again. It takes focus (tabindex 0) so
    the keyboard can scroll it with the arrows, Page Up / Page Down, Home and End.
  - Following: "at the bottom" means within `threshold` px of it. Only scrolling up stops
    following (content that grows under a streamed reply does not). Content growth is watched with
    a ResizeObserver, so streamed text, images that load and messages that are added all keep
    the view pinned while following. `follow` is bindable, to show it or to force it.
  - Reduced motion: jumps without smooth scrolling.
  - On the server it renders the content; following starts in the browser.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { useLabels } from "$lib/i18n";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";

  interface Props {
    /** Accessible name of the conversation. */
    label?: string;
    /** Pinned to the newest content (bindable). */
    follow?: boolean;
    /** Distance in px from the bottom still counted as "at the bottom". */
    threshold?: number;
    /** Text of the button that jumps back to the newest content. */
    jumpLabel?: string;
    class?: string;
    children?: Snippet;
    /** Any other attribute goes to the scrolling element. */
    [key: string]: unknown;
  }

  const L = useLabels();
  let {
    label = L.conversation,
    follow = $bindable(true),
    threshold = 48,
    jumpLabel = L.jumpToLatest,
    class: className = "",
    children,
    ...rest
  }: Props = $props();

  let scroller = $state<HTMLElement>();
  let content = $state<HTMLElement>();
  // Scrolls made by the component itself must not count as the reader leaving the bottom.
  let selfScroll = false;

  function atBottom(el: HTMLElement) {
    return el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
  }

  export function scrollToLatest(smooth = true) {
    const el = scroller;
    if (!el) return;
    selfScroll = true;
    const behavior = smooth && !prefersReducedMotion() ? "smooth" : "auto";
    if (typeof el.scrollTo === "function") el.scrollTo({ top: el.scrollHeight, behavior });
    else el.scrollTop = el.scrollHeight;
    follow = true;
    // A smooth scroll fires several scroll events; let them pass.
    setTimeout(() => (selfScroll = false), behavior === "smooth" ? 400 : 0);
  }

  // Only the reader scrolling up leaves the bottom. While a reply streams, the content can grow
  // between our own scroll and its scroll event: that must not count as leaving.
  let lastTop = 0;
  function onScroll() {
    if (!scroller) return;
    const top = scroller.scrollTop;
    const movedUp = top < lastTop - 1;
    lastTop = top;
    if (atBottom(scroller)) follow = true;
    else if (movedUp && !selfScroll) follow = false;
  }

  // Keep the newest content in view while following.
  $effect(() => {
    if (!scroller || !content || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      if (follow) scrollToLatest(false);
    });
    observer.observe(content);
    return () => observer.disconnect();
  });
</script>

<div class={cn("ta-thread", className)}>
  <!-- A scrollable region must take focus so the keyboard can scroll it (axe: scrollable-region-focusable). -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div bind:this={scroller} class="ta-thread-scroll" role="log" aria-live="off" aria-label={label} tabindex="0" onscroll={onScroll} {...rest}>
    <div bind:this={content} class="ta-thread-content">
      {@render children?.()}
    </div>
  </div>
  {#if !follow}
    <button type="button" class="ta-thread-jump" onclick={() => scrollToLatest()}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 5v14M5 12l7 7 7-7" /></svg>
      {jumpLabel}
    </button>
  {/if}
</div>

<style>
  .ta-thread {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .ta-thread-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    outline: none;
  }
  .ta-thread-scroll:focus-visible {
    box-shadow: inset 0 0 0 2px rgb(var(--ta-accent) / 0.6);
  }
  .ta-thread-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .ta-thread-jump {
    position: absolute;
    left: 50%;
    bottom: 0.75rem;
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.4rem 0.875rem;
    font: inherit;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: 999px;
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.5);
    transform: translateX(-50%);
    cursor: pointer;
    transition: background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-thread-jump:hover {
    background: rgb(var(--ta-accent) / 0.15);
  }
  .ta-thread-jump:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }
  @media (prefers-reduced-motion: reduce) {
    .ta-thread-jump {
      transition: none;
    }
  }
  @media (pointer: coarse) {
    .ta-thread-jump {
      min-height: 2.75rem;
      padding-inline: 1.125rem;
    }
  }
</style>
