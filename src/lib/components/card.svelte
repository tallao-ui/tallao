<!--
  tallao — Card
  Styled container for content, with optional parts.

  `tone` lights the card's leading edge for a section that matters right now: `accent` (what the
  page is about), `live` (on air: a red edge that glows), `success`, `warning` or `danger`. The
  edge is decoration: say the state in words too (a Badge in the header).
-->
<script lang="ts" module>
  export interface CardProps {
    /** A lit leading edge for a section that matters now. */
    tone?: "accent" | "live" | "success" | "warning" | "danger";
    class?: string;
    children?: import("svelte").Snippet;
  }
</script>

<script lang="ts">
  import { cn } from "$lib/utils";
  const { tone, class: className = "", children }: CardProps = $props();
</script>

<div class={cn("ta-card", tone && `ta-card--tone ta-card--${tone}`, className)}>
  {@render children?.()}
</div>

<style>
  .ta-card {
    background: rgb(var(--ta-surface) / 0.5);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
  }

  .ta-card--tone {
    border-color: rgb(var(--ta-card-tone) / 0.45);
    box-shadow:
      inset 3px 0 0 rgb(var(--ta-card-tone)),
      0 0 0 1px rgb(var(--ta-card-tone) / 0.08),
      0 16px 40px -22px rgb(var(--ta-card-tone) / 0.55);
  }
  .ta-card--accent { --ta-card-tone: var(--ta-accent); }
  .ta-card--live,
  .ta-card--danger { --ta-card-tone: var(--ta-danger); }
  .ta-card--success { --ta-card-tone: var(--ta-success); }
  .ta-card--warning { --ta-card-tone: var(--ta-warning); }
</style>
