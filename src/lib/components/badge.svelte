<!--
  tallao — Badge
  Etiquetas de estado y categorías, redondeadas y con borde suave.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  type Variant = "default" | "success" | "warning" | "error" | "info" | "purple" | "secondary";
  type Size = "sm" | "md";

  interface Props {
    variant?: Variant;
    size?: Size;
    class?: string;
    children: import("svelte").Snippet;
  }

  const { variant = "default", size = "sm", class: className = "", children }: Props = $props();
</script>

<span class={cn("ta-badge", `ta-badge--${variant}`, `ta-badge--${size}`, className)}>
  {@render children()}
</span>

<style>
  .ta-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    border-radius: 9999px;
    border: 1px solid;
    white-space: nowrap;
  }

  .ta-badge--sm { padding: 0.125rem 0.5rem; font-size: 0.75rem; }
  .ta-badge--md { padding: 0.25rem 0.625rem; font-size: 0.875rem; }

  .ta-badge--default {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text-dim));
    border-color: rgb(var(--ta-border));
  }
  .ta-badge--secondary {
    background: rgb(var(--ta-elevated));
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-muted));
  }
  .ta-badge--success {
    background: rgb(var(--ta-success) / 0.1);
    color: rgb(var(--ta-success));
    border-color: rgb(var(--ta-success) / 0.2);
  }
  .ta-badge--warning {
    background: rgb(var(--ta-warning) / 0.1);
    color: rgb(var(--ta-warning));
    border-color: rgb(var(--ta-warning) / 0.2);
  }
  .ta-badge--error {
    background: rgb(var(--ta-danger) / 0.1);
    color: rgb(var(--ta-danger));
    border-color: rgb(var(--ta-danger) / 0.2);
  }
  .ta-badge--info {
    background: rgb(var(--ta-info) / 0.1);
    color: rgb(var(--ta-info));
    border-color: rgb(var(--ta-info) / 0.2);
  }
  .ta-badge--purple {
    background: rgb(var(--ta-accent) / 0.1);
    color: rgb(var(--ta-accent-hover));
    border-color: rgb(var(--ta-accent) / 0.2);
  }
</style>
