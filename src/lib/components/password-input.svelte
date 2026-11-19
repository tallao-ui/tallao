<!--
  tallao — PasswordInput
  A password (or secret key) field with a button that shows and hides what was typed.

    <Field label="API key"><PasswordInput name="key" autocomplete="current-password" /></Field>

  - The field is a real <input> (type "password" or "text"), so password managers, paste and
    autofill keep working (WCAG 3.3.8 Accessible Authentication); every native attribute goes
    to it through rest props, and with `name` it submits in a plain <form>.
  - The toggle is a <button type="button"> with `aria-pressed` and a fixed accessible name
    ("Show password"): pressed means visible. Tab reaches it after the field; a click keeps
    the focus in the field.
  - `revealed` is bindable, for an app that reacts to it (a mascot that covers its eyes).
  - Same HTML on the server: hidden by default, and the button works once hydrated.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  interface Props {
    /** What was typed (bindable). */
    value?: string;
    /** The text is shown (bindable). */
    revealed?: boolean;
    /** The native element (bind:ref). */
    ref?: HTMLInputElement;
    disabled?: boolean;
    /** Accessible name of the toggle; by default "Show password". */
    toggleLabel?: string;
    class?: string;
    onRevealChange?: (revealed: boolean) => void;
    /** Any other attribute goes to the <input>. */
    [key: string]: unknown;
  }

  const L = useLabels();
  let {
    value = $bindable(""),
    revealed = $bindable(false),
    ref = $bindable(),
    disabled = false,
    toggleLabel = L.showPassword,
    class: className = "",
    onRevealChange,
    ...rest
  }: Props = $props();

  function toggle() {
    revealed = !revealed;
    onRevealChange?.(revealed);
    ref?.focus();
  }
</script>

<div class={cn("ta-password", className)} class:ta-password--off={disabled}>
  <input bind:this={ref} bind:value class="ta-password-input" type={revealed ? "text" : "password"} {disabled} {...rest} />
  <button
    type="button"
    class="ta-password-toggle"
    aria-label={toggleLabel}
    aria-pressed={revealed}
    {disabled}
    onmousedown={(e) => e.preventDefault()}
    onclick={toggle}
  >
    {#if revealed}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.4 10.4 0 0 1 12 5c7 0 10 7 10 7a13.2 13.2 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.5 13.5 0 0 0 2 12s3 7 10 7a9.7 9.7 0 0 0 5.39-1.61" /><path d="m2 2 20 20" /></svg>
    {:else}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
    {/if}
  </button>
</div>

<style>
  .ta-password {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  .ta-password-input {
    width: 100%;
    padding: 0.5rem 2.5rem 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
    transition: border-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out), box-shadow var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-password-input::placeholder {
    color: rgb(var(--ta-text-dim));
  }
  .ta-password-input:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }
  .ta-password--off {
    opacity: 0.5;
  }
  .ta-password--off .ta-password-input {
    cursor: not-allowed;
  }

  .ta-password-toggle {
    position: absolute;
    right: 0.375rem;
    display: grid;
    place-items: center;
    width: 1.75rem;
    height: 1.75rem;
    padding: 0;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
    transition: color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-password-toggle:hover,
  .ta-password-toggle[aria-pressed="true"] {
    color: rgb(var(--ta-text));
  }
  .ta-password-toggle:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.6);
    outline-offset: 1px;
  }
  .ta-password-toggle:disabled {
    cursor: not-allowed;
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-password-input,
    .ta-password-toggle {
      transition: none;
    }
  }

  @media (pointer: coarse) {
    .ta-password-input {
      min-height: 2.75rem;
      padding-right: 3rem;
      font-size: 1rem;
    }
    .ta-password-toggle {
      width: 2.75rem;
      height: 2.75rem;
      right: 0;
    }
  }
</style>
