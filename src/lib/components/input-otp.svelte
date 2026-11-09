<!--
  tallao — InputOTP
  A one-time code field (SMS or e-mail codes, 2FA): a row of slots, one per character.

    <InputOTP bind:value={code} length={6} groupSize={3} name="code" oncomplete={verify} />

  One real <input> sits under the visual slots, not one input per slot:
  - SMS autofill (`autocomplete="one-time-code"`) and password managers fill one field,
    and a pasted code lands in one field, with no event juggling between inputs;
  - a screen reader meets one text field with one name, not six unnamed boxes, and its
    description says where the caret is ("Digit 2 of 6");
  - without JavaScript it is still a plain text field that is submitted with `name`.
  The slots are only a picture of that input (aria-hidden); clicking one moves the caret.

  Keyboard: typing fills the current slot and moves on, typing past the end is ignored,
  Backspace deletes back, Delete deletes forward, ← → Home End move between slots. Pasting
  takes only the allowed characters, so "123 456" or "123-456" fills every slot.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    value?: string;
    /** Number of slots (default 6). */
    length?: number;
    /** Allowed characters: digits (default) or letters and digits. */
    pattern?: "digits" | "alphanumeric";
    /** Draws a separator every `groupSize` slots (e.g. 3 → "123 456"). Visual only. */
    groupSize?: number;
    /** Called once the last slot is filled, with the whole code. */
    oncomplete?: (value: string) => void;
    /** Name in a form: the real input is submitted, also without JavaScript. */
    name?: string;
    /** Accessible name; defaults to the `oneTimeCode` text. */
    label?: string;
    disabled?: boolean;
    invalid?: boolean;
    required?: boolean;
    autocomplete?: import("svelte/elements").FullAutoFill;
    /** Virtual keyboard; by default `numeric` for digits and `text` otherwise. */
    inputmode?: "numeric" | "text";
    /** The native element (bind:ref). */
    ref?: HTMLInputElement;
    class?: string;
    [key: string]: unknown;
  }

  let {
    value = $bindable(""),
    length = 6,
    pattern = "digits",
    groupSize,
    oncomplete,
    name,
    label = L.oneTimeCode,
    disabled = false,
    invalid = false,
    required = false,
    autocomplete = "one-time-code",
    inputmode,
    ref = $bindable(),
    class: className = "",
    ...rest
  }: Props = $props();

  const id = $props.id();

  const allowed = $derived(pattern === "digits" ? /[0-9]/ : /[A-Za-z0-9]/);
  const clean = (text: string) => [...text].filter((c) => allowed.test(c)).join("").slice(0, length);

  /** Caret position: 0..value.length. The active slot is this one, capped at the last slot. */
  let caret = $state(0);
  let focused = $state(false);
  const active = $derived(Math.min(caret, length - 1));
  const chars = $derived(Array.from({ length }, (_, i) => value[i] ?? ""));
  const position = $derived(
    L.otpDigit.replace("{n}", String(active + 1)).replace("{total}", String(length))
  );

  function placeCaret(at: number) {
    caret = Math.max(0, Math.min(at, value.length));
    ref?.setSelectionRange(caret, caret);
  }

  // Writing the input's value moves the browser's caret to the end: put it back where the
  // slots say it is, after the DOM update, so typing and the slots agree.
  $effect(() => {
    void value;
    const at = caret;
    if (focused && ref && ref.selectionStart !== at) ref.setSelectionRange(at, at);
  });

  function commit(next: string, at: number) {
    const was = value;
    value = next;
    placeCaret(at);
    if (next.length === length && next !== was) oncomplete?.(next);
  }

  function onkeydown(e: KeyboardEvent) {
    if (disabled || e.ctrlKey || e.metaKey || e.altKey) return;
    const at = Math.min(caret, value.length);
    if (e.key.length === 1) {
      e.preventDefault();
      if (!allowed.test(e.key) || at >= length) return;
      // Overwrites the character under the caret, or appends at the end.
      commit(value.slice(0, at) + e.key + value.slice(at + 1), at + 1);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      if (at > 0) commit(value.slice(0, at - 1) + value.slice(at), at - 1);
    } else if (e.key === "Delete") {
      e.preventDefault();
      commit(value.slice(0, at) + value.slice(at + 1), at);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      placeCaret(Math.min(at, length - 1) - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      placeCaret(at + 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      placeCaret(0);
    } else if (e.key === "End") {
      e.preventDefault();
      placeCaret(value.length);
    }
  }

  function onpaste(e: ClipboardEvent) {
    if (disabled) return;
    e.preventDefault();
    const pasted = clean(e.clipboardData?.getData("text") ?? "");
    if (!pasted) return;
    if (pasted.length >= length) {
      commit(pasted, length);
      return;
    }
    const at = Math.min(caret, value.length);
    const next = clean(value.slice(0, at) + pasted + value.slice(at + pasted.length));
    commit(next, at + pasted.length);
  }

  // Whatever the keydown did not handle (autofill, mobile keyboards that send no keys, dictation).
  function oninput(e: Event) {
    const el = e.currentTarget as HTMLInputElement;
    const next = clean(el.value);
    el.value = next;
    commit(next, Math.min(el.selectionStart ?? next.length, next.length));
  }

  function syncCaret() {
    if (ref) caret = Math.min(ref.selectionStart ?? value.length, value.length);
  }

  function pick(i: number) {
    if (disabled) return;
    ref?.focus();
    placeCaret(i);
  }

  // A value set from outside (bind:value, a reset) is cleaned and keeps the caret in range.
  $effect(() => {
    const next = clean(value);
    if (next !== value) value = next;
    if (caret > value.length) caret = value.length;
  });

  const separatorAfter = (i: number) => !!groupSize && groupSize > 0 && (i + 1) % groupSize === 0 && i < length - 1;
</script>

<div
  {...rest}
  role="group"
  aria-label={label}
  class={cn("ta-otp", disabled && "ta-otp--off", invalid && "ta-otp--invalid", className)}
>
  <input
    bind:this={ref}
    {value}
    {name}
    {disabled}
    {required}
    {autocomplete}
    inputmode={inputmode ?? (pattern === "digits" ? "numeric" : "text")}
    pattern={pattern === "digits" ? `[0-9]{${length}}` : `[A-Za-z0-9]{${length}}`}
    maxlength={length}
    spellcheck="false"
    autocapitalize="off"
    aria-label={label}
    aria-describedby={`${id}-position`}
    aria-invalid={invalid || undefined}
    class="ta-otp-input"
    {onkeydown}
    {onpaste}
    {oninput}
    onfocus={() => { focused = true; syncCaret(); }}
    onblur={() => (focused = false)}
    onselect={syncCaret}
    onclick={syncCaret}
  />
  <div class="ta-otp-slots" aria-hidden="true">
    {#each chars as char, i (i)}
      <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
      <div
        class={cn("ta-otp-slot", char && "ta-otp-slot--filled", focused && i === active && "ta-otp-slot--active")}
        onmousedown={(e) => e.preventDefault()}
        onclick={() => pick(i)}
      >
        {char}
        {#if focused && i === active && !char}<span class="ta-otp-caret"></span>{/if}
      </div>
      {#if separatorAfter(i)}<span class="ta-otp-separator"></span>{/if}
    {/each}
  </div>
  <span class="ta-hidden" id={`${id}-position`}>{position}</span>
</div>

<style>
  .ta-otp {
    position: relative;
    display: inline-flex;
  }

  /* The real input covers the slots, invisible: the touch keyboard and autofill work on it. */
  .ta-otp-input {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    border: 0;
    opacity: 0;
    font-size: 1rem;
    color: transparent;
    background: transparent;
    caret-color: transparent;
  }

  .ta-otp-slots {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  .ta-otp-slot {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.75rem;
    font-family: var(--ta-font-mono);
    font-size: 1.125rem;
    font-weight: 600;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    cursor: text;
    transition: border-color 0.2s, box-shadow 0.2s;
    user-select: none;
  }

  .ta-otp-slot--active {
    border-color: rgb(var(--ta-accent) / 0.6);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.2);
  }

  .ta-otp--invalid .ta-otp-slot { border-color: rgb(var(--ta-danger) / 0.7); }
  .ta-otp--invalid .ta-otp-slot--active { box-shadow: 0 0 0 2px rgb(var(--ta-danger) / 0.2); }

  .ta-otp--off .ta-otp-slot { opacity: 0.5; cursor: not-allowed; }

  .ta-otp-caret {
    width: 1px;
    height: 1.25rem;
    background: rgb(var(--ta-text));
    animation: ta-otp-blink 1s steps(1) infinite;
  }

  @keyframes ta-otp-blink {
    50% { opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-otp-caret { animation: none; }
  }

  .ta-otp-separator {
    width: 0.5rem;
    height: 2px;
    margin: 0 0.125rem;
    border-radius: 1px;
    background: rgb(var(--ta-muted));
  }

  .ta-hidden {
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

  @media (pointer: coarse) {
    .ta-otp-slot { width: 2.75rem; height: 3rem; font-size: 1.25rem; }
  }
</style>
