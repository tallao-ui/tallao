<!--
  tallao — PromptInput
  Input box for chatting with a model: Enter sends, Shift+Enter
  inserts a line break, loading state, optional attachments button.
  With `mentions`, typing a trigger ("#", "@") at the start of a word
  opens a list of matches above the box: arrows move, Enter or Tab
  insert the name, Escape closes.
-->
<script lang="ts" module>
  /** Something a person can mention: a channel, a role, a file. */
  export interface PromptMention {
    id: string;
    /** The name inserted after the trigger ("general" → "#general"). */
    label: string;
    /** A quiet second line ("Text channel · Community"). */
    hint?: string;
    /** A colour dot before the name (a role's colour), any CSS colour. */
    color?: string;
  }

  /** The things one trigger character mentions. */
  export interface PromptMentionSource {
    /** One character typed at the start of a word: "#", "@", "/". */
    trigger: string;
    items: PromptMention[];
    /** Accessible name of the list ("Channels"); the kit's "Suggestions" by default. */
    label?: string;
  }
</script>

<script lang="ts">
  import { tick } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Button from "./button.svelte";

  interface Props {
    /** Current text of the prompt (bindable). */
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    loading?: boolean;
    /** Shows the attachments button and emits onAttach. */
    attachments?: boolean;
    /** Sends on Enter (Shift+Enter = new line). Defaults to true. */
    submitOnEnter?: boolean;
    /** Accessible name of the field (defaults to the placeholder). */
    ariaLabel?: string;
    sendLabel?: string;
    attachLabel?: string;
    /** What a trigger character mentions; a list of matches opens as the person types. */
    mentions?: PromptMentionSource[];
    /** How many matches the list shows at most (default 8). */
    maxMentions?: number;
    onSend?: (text: string) => void;
    onAttach?: () => void;
    /** A mention was inserted (the text holds its trigger and label; keep the id from here). */
    onMention?: (trigger: string, item: PromptMention) => void;
    class?: string;
  }

  const L = useLabels();
  let {
    value = $bindable(""),
    placeholder = L.promptPlaceholder,
    disabled = false,
    loading = false,
    attachments = false,
    submitOnEnter = true,
    ariaLabel,
    sendLabel = L.send,
    attachLabel = L.attach,
    mentions = [],
    maxMentions = 8,
    onSend,
    onAttach,
    onMention,
    class: className = "",
  }: Props = $props();

  const uid = $props.id();
  const listId = `${uid}-mentions`;

  let textarea = $state<HTMLTextAreaElement>();
  /** The word being typed after a trigger: which source, where it starts, what follows the trigger. */
  let typing = $state<{ index: number; start: number; query: string } | null>(null);
  const source = $derived(typing ? mentions[typing.index] : undefined);
  let active = $state(0);

  const matches = $derived.by(() => {
    if (!typing || !source) return [];
    const q = typing.query.toLowerCase();
    const found = source.items.filter((i) => i.label.toLowerCase().includes(q));
    // Names that start with what was typed come first.
    found.sort((a, b) => Number(!a.label.toLowerCase().startsWith(q)) - Number(!b.label.toLowerCase().startsWith(q)));
    return found.slice(0, maxMentions);
  });
  const open = $derived(matches.length > 0);
  const current = $derived(Math.min(active, Math.max(matches.length - 1, 0)));
  const optionId = (i: number) => `${uid}-mention-${i}`;

  const canSend = $derived(value.trim().length > 0 && !disabled && !loading);

  function send() {
    if (!canSend) return;
    onSend?.(value.trim());
    value = "";
    typing = null;
  }

  /** Finds a trigger at the start of the word the caret is in. */
  function detect() {
    if (!mentions.length || !textarea || textarea.selectionStart !== textarea.selectionEnd) {
      typing = null;
      return;
    }
    const before = value.slice(0, textarea.selectionStart);
    let start = -1;
    let index = -1;
    mentions.forEach((s, i) => {
      const at = before.lastIndexOf(s.trigger);
      if (at > start) {
        start = at;
        index = i;
      }
    });
    const query = index >= 0 ? before.slice(start + mentions[index].trigger.length) : "";
    if (index < 0 || (start > 0 && !/\s/.test(before[start - 1])) || /\s/.test(query) || query.length > 50) {
      typing = null;
      return;
    }
    if (typing?.start !== start || typing.index !== index) active = 0;
    typing = { index, start, query };
  }

  async function pick(item: PromptMention) {
    if (!typing || !textarea || !source) return;
    const { start, query } = typing;
    const { trigger } = source;
    const insert = `${trigger}${item.label} `;
    value = value.slice(0, start) + insert + value.slice(start + trigger.length + query.length);
    typing = null;
    onMention?.(trigger, item);
    await tick();
    const caret = start + insert.length;
    textarea.focus();
    textarea.setSelectionRange(caret, caret);
  }

  function onKey(e: KeyboardEvent) {
    if (open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        active = (current + step + matches.length) % matches.length;
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        void pick(matches[current]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        typing = null;
        return;
      }
    }
    if (submitOnEnter && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }
</script>

<form
  class={cn("ta-prompt", className)}
  onsubmit={(e) => { e.preventDefault(); send(); }}
>
  {#if attachments}
    <button
      type="button"
      class="ta-prompt-attach"
      onclick={onAttach}
      disabled={disabled || loading}
      aria-label={attachLabel}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
    </button>
  {/if}

  <textarea
    bind:this={textarea}
    bind:value
    {placeholder}
    disabled={disabled || loading}
    rows="1"
    class="ta-prompt-text"
    aria-label={ariaLabel ?? placeholder}
    aria-autocomplete={mentions.length ? "list" : undefined}
    aria-controls={open ? listId : undefined}
    aria-activedescendant={open ? optionId(current) : undefined}
    onkeydown={onKey}
    oninput={detect}
    onclick={detect}
    onblur={() => (typing = null)}
  ></textarea>

  <Button
    type="submit"
    variant="primary"
    size="icon"
    loading={loading}
    disabled={!canSend}
    ariaLabel={sendLabel}
  >
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
  </Button>

  {#if open && source}
    <ul id={listId} class="ta-prompt-mentions" role="listbox" aria-label={source.label ?? L.suggestions}>
      {#each matches as item, i (item.id)}
        <!-- The field keeps focus: options are reached with the arrows, or clicked. -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <li
          id={optionId(i)}
          role="option"
          aria-selected={i === current}
          class="ta-prompt-mention"
          onmousedown={(e) => e.preventDefault()}
          onclick={() => pick(item)}
          onmousemove={() => (active = i)}
        >
          {#if item.color}<span class="ta-prompt-mention-dot" style:background={item.color} aria-hidden="true"></span>{/if}
          <span class="ta-prompt-mention-text">
            <span class="ta-prompt-mention-label"><span aria-hidden="true">{source.trigger}</span>{item.label}</span>
            {#if item.hint}<span class="ta-prompt-mention-hint">{item.hint}</span>{/if}
          </span>
        </li>
      {/each}
    </ul>
  {/if}
</form>

<style>
  .ta-prompt {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 0.5rem;
    padding: 0.5rem;
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-prompt:focus-within {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-prompt-text {
    flex: 1;
    min-width: 0;
    padding: 0.375rem 0.5rem;
    background: transparent;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgb(var(--ta-text));
    max-height: 10rem;
    field-sizing: content;
  }

  .ta-prompt-text::placeholder {
    color: rgb(var(--ta-text-dim));
  }

  .ta-prompt-attach {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
    background: none;
    border: none;
    border-radius: var(--ta-radius);
    color: rgb(var(--ta-text-dim));
    cursor: pointer;
    transition: color 0.2s, background-color 0.2s;
  }
  .ta-prompt-attach:hover:not(:disabled) {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated));
  }
  .ta-prompt-attach:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* The list opens above the box: a prompt usually sits at the bottom of the screen. */
  .ta-prompt-mentions {
    position: absolute;
    left: 0.5rem;
    right: 0.5rem;
    bottom: calc(100% + 0.375rem);
    z-index: 20;
    max-height: 16rem;
    overflow-y: auto;
    margin: 0;
    padding: 0.25rem;
    list-style: none;
    background: rgb(var(--ta-elevated));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.25);
  }
  .ta-prompt-mention {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: var(--ta-radius-sm);
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
    cursor: pointer;
  }
  .ta-prompt-mention[aria-selected="true"] {
    background: rgb(var(--ta-accent) / 0.14);
  }
  .ta-prompt-mention-dot {
    flex: none;
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
  }
  .ta-prompt-mention-text {
    display: grid;
    min-width: 0;
  }
  .ta-prompt-mention-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ta-prompt-mention-label > span {
    color: rgb(var(--ta-text-dim));
  }
  .ta-prompt-mention-hint {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }
  @media (pointer: coarse) {
    .ta-prompt-attach { min-width: 2.75rem; min-height: 2.75rem; }
    .ta-prompt-mention { min-height: 2.75rem; }
    /* 16px text: iOS does not zoom the page when the field gets focus. */
    .ta-prompt-text { font-size: 1rem; }
  }
</style>
