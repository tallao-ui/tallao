<!--
  tallao — Textarea
  Texto de varias líneas con los mismos estados que Input.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  let {
    value = $bindable(""),
    rows = 3,
    class: className = "",
    disabled = false,
    ...rest
  }: {
    value?: string;
    rows?: number;
    class?: string;
    disabled?: boolean;
    [key: string]: unknown;
  } = $props();
</script>

<textarea bind:value {rows} {disabled} class={cn("ta-textarea", className)} {...rest}></textarea>

<style>
  .ta-textarea {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-family: inherit;
    font-size: 0.875rem;
    line-height: 1.5;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    outline: none;
    resize: vertical;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .ta-textarea::placeholder {
    color: rgb(var(--ta-text-dim));
  }

  .ta-textarea:focus {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-textarea:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
