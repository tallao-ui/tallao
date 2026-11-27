<!--
  tallao — Field
  Label + control + error. The <label> wraps the control, so the
  association is implicit and there is no need to make up ids.
  With `error`, the control gets `aria-invalid="true"` and `aria-describedby` pointing at the
  message (added to any ids it already had), and both go when the error does (WCAG 3.3.1).
  `hint` is a quiet line under the control ("Empty: no budget"); the control's description points at
  it, and it stays out of the control's name (the <label> would otherwise read it as part of it).
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    label: string;
    /** Error message under the control; it also marks the field. */
    error?: string;
    /** Help under the control: its accessible description, not part of its name. */
    hint?: string;
    required?: boolean;
    class?: string;
    children: import("svelte").Snippet;
  }

  const { label, error, hint, required = false, class: className = "", children }: Props = $props();

  const uid = $props.id();
  const errorId = `${uid}-error`;
  const hintId = `${uid}-hint`;
  let root = $state<HTMLLabelElement>();

  // The first control inside: a field, or a custom one that names its role.
  const CONTROL = "input:not([type=hidden]), select, textarea, [role=combobox], [role=spinbutton], [role=textbox]";

  $effect(() => {
    const control = root?.querySelector<HTMLElement>(CONTROL);
    if (!control || !hint) return;
    const before = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    control.setAttribute("aria-describedby", [...before.filter((i) => i !== hintId), hintId].join(" "));
    return () => {
      const ids = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((i) => i && i !== hintId);
      if (ids.length) control.setAttribute("aria-describedby", ids.join(" "));
      else control.removeAttribute("aria-describedby");
    };
  });

  $effect(() => {
    const control = root?.querySelector<HTMLElement>(CONTROL);
    if (!control || !error) return;
    const before = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean);
    const hadInvalid = control.getAttribute("aria-invalid");
    control.setAttribute("aria-invalid", "true");
    control.setAttribute("aria-describedby", [...before.filter((i) => i !== errorId), errorId].join(" "));
    return () => {
      const ids = (control.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((i) => i && i !== errorId);
      if (ids.length) control.setAttribute("aria-describedby", ids.join(" "));
      else control.removeAttribute("aria-describedby");
      if (hadInvalid === null) control.removeAttribute("aria-invalid");
      else control.setAttribute("aria-invalid", hadInvalid);
    };
  });
</script>

<label bind:this={root} class={cn("ta-field", error && "ta-field--error", className)}>
  <span class="ta-field-label">
    {label}{#if required}<span class="ta-field-required" aria-hidden="true"> *</span>{/if}
  </span>
  {@render children()}
  {#if hint}
    <span class="ta-field-hint" id={hintId} aria-hidden="true">{hint}</span>
  {/if}
  {#if error}
    <span class="ta-field-error" id={errorId} role="alert">{error}</span>
  {/if}
</label>

<style>
  .ta-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  .ta-field-label {
    font-size: 0.75rem;
    font-weight: 500;
    color: rgb(var(--ta-text-dim));
  }

  .ta-field-required {
    color: rgb(var(--ta-danger));
  }

  .ta-field-hint {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-field-error {
    font-size: 0.75rem;
    color: rgb(var(--ta-danger));
  }

  .ta-field--error :global(input),
  .ta-field--error :global(select),
  .ta-field--error :global(textarea) {
    border-color: rgb(var(--ta-danger) / 0.6);
  }
</style>
