<!--
  tallao — FlowNode
  One step of a flow you build or watch run: a bot's command, a workflow, an agent's pipeline. It
  reads as a sentence (the step's name, then what it does) with an optional number, an icon tinted
  in its category's colour, extra detail (a condition, a problem) and actions on the side. Where
  Steps shows a plan someone else runs, FlowNode is the editable block of a builder.

    <ol class="flow">
      {#each steps as step, i (step.id)}
        <li><FlowNode index={i + 1} label={step.name} description={step.summary} status={run[i]}
          selected={picked === i} onclick={() => (picked = i)} color="rgb(var(--ta-series-3))">
          {#snippet icon()}<Icon name="branch" />{/snippet}
        </FlowNode></li>
      {/each}
    </ol>

  - With `onclick` the body is one button (`aria-pressed` = `selected`); without it, a block.
    `children` sits inside that button: keep it to text (a condition, a problem), no controls.
    Controls go in `actions` (a menu, a remove button), beside the body, not in it.
  - `status` follows a run: `running` (aria-current="step"), `done`, `failed`, `skipped`,
    `stopped` (the run ended on purpose here, like a cooldown). Each one shows its word, so colour
    is never the only cue; `pending` (default) is the resting state and shows none.
  - Put nodes in an ordered list (yours, or SortableList `variant="bare"` to reorder them): the
    number is drawn for the eye and the list gives the order to screen readers.
  - Tokens: `--ta-flow-node-glow` (selected and running; set it on any ancestor) and
    `--ta-flow-node-tone` (set by `color`).
-->
<script lang="ts" module>
  import type { StepStatus } from "./steps.svelte";

  export type FlowNodeStatus = StepStatus | "stopped";
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    /** What the step is ("Give coins"). */
    label: string;
    /** What it does with its settings ("100 coins to the member"). */
    description?: string;
    /** The number drawn at the start; the list around the nodes gives the order to screen readers. */
    index?: number | string;
    status?: FlowNodeStatus;
    /** The status word; defaults to the kit's label for `status`. */
    statusLabel?: string;
    selected?: boolean;
    /** Marks the node as having a problem (danger border); say what in `children`. */
    invalid?: boolean;
    /** Any CSS colour for the icon and its tint, e.g. `rgb(var(--ta-series-3))`. */
    color?: string;
    /** Makes the body a button. */
    onclick?: (event: MouseEvent) => void;
    /** The step's icon (decorative: the label names it). */
    icon?: Snippet;
    /** Text under the description: a condition, a problem. No controls. */
    children?: Snippet;
    /** Controls beside the body: a menu, a remove button. */
    actions?: Snippet;
    /** The root element, e.g. to anchor a Beam between nodes. */
    ref?: HTMLElement;
    class?: string;
    [key: string]: unknown;
  }

  let {
    label,
    description,
    index,
    status = "pending",
    statusLabel,
    selected = false,
    invalid = false,
    color,
    onclick,
    icon,
    children,
    actions,
    ref = $bindable(),
    class: className = "",
    ...rest
  }: Props = $props();

  const word = $derived(
    statusLabel ??
      ({ pending: "", running: L.running, done: L.done, failed: L.failed, skipped: L.skipped, stopped: L.stopped } as Record<FlowNodeStatus, string>)[status],
  );
</script>

{#snippet inner()}
  {#if index != null}<span class="ta-flow-node-index" aria-hidden="true">{index}</span>{/if}
  {#if icon}<span class="ta-flow-node-icon" aria-hidden="true">{@render icon()}</span>{/if}
  <span class="ta-flow-node-text">
    <span class="ta-flow-node-label">{label}</span>
    {#if description}<span class="ta-flow-node-description">{description}</span>{/if}
    {#if children}{@render children()}{/if}
  </span>
  {#if word}<span class="ta-flow-node-status">{word}</span>{/if}
{/snippet}

<div
  {...rest}
  bind:this={ref}
  class={cn("ta-flow-node", `ta-flow-node--${status}`, className)}
  data-selected={selected || undefined}
  data-invalid={invalid || undefined}
  aria-current={status === "running" ? "step" : undefined}
  style:--ta-flow-node-tone={color}
>
  {#if onclick}
    <button type="button" class="ta-flow-node-body" aria-pressed={selected} {onclick}>{@render inner()}</button>
  {:else}
    <div class="ta-flow-node-body">{@render inner()}</div>
  {/if}
  {#if actions}<div class="ta-flow-node-actions">{@render actions()}</div>{/if}
</div>

<style>
  .ta-flow-node {
    position: relative;
    display: flex;
    align-items: stretch;
    min-width: 0;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    transition:
      border-color var(--ta-duration-base) var(--ta-ease-out),
      box-shadow var(--ta-duration-slow) var(--ta-ease-out),
      opacity var(--ta-duration-slow) var(--ta-ease-out);
  }

  .ta-flow-node:hover {
    border-color: rgb(var(--ta-muted));
  }

  .ta-flow-node[data-invalid] {
    border-color: rgb(var(--ta-danger) / 0.8);
  }

  .ta-flow-node[data-selected],
  .ta-flow-node--running {
    border-color: rgb(var(--ta-accent));
    box-shadow: var(--ta-flow-node-glow, 0 0 0 3px rgb(var(--ta-accent) / 0.2));
  }

  .ta-flow-node--failed {
    border-color: rgb(var(--ta-danger));
  }

  .ta-flow-node--stopped {
    border-color: rgb(var(--ta-warning));
  }

  .ta-flow-node--skipped {
    opacity: 0.6;
    border-style: dashed;
  }

  .ta-flow-node-body {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem;
    font: inherit;
    text-align: start;
    color: inherit;
    background: none;
    border: 0;
    border-radius: inherit;
  }

  button.ta-flow-node-body {
    cursor: pointer;
  }

  button.ta-flow-node-body:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }

  .ta-flow-node-index,
  .ta-flow-node-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 1.625rem;
    height: 1.625rem;
  }

  .ta-flow-node-index {
    font-size: 0.75rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text-dim));
    border: 1px solid rgb(var(--ta-border));
    border-radius: 50%;
    transition:
      color var(--ta-duration-base) var(--ta-ease-out),
      background var(--ta-duration-base) var(--ta-ease-out),
      border-color var(--ta-duration-base) var(--ta-ease-out);
  }

  .ta-flow-node--done .ta-flow-node-index {
    color: rgb(var(--ta-on-accent));
    background: rgb(var(--ta-accent));
    border-color: rgb(var(--ta-accent));
  }

  .ta-flow-node-icon {
    --tone: var(--ta-flow-node-tone, rgb(var(--ta-text-dim)));
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border-radius: var(--ta-radius-sm);
  }

  .ta-flow-node-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.1875rem;
    padding-top: 0.0625rem;
  }

  .ta-flow-node-label {
    font-weight: 600;
    line-height: 1.35;
  }

  .ta-flow-node-description {
    font-size: 0.875rem;
    line-height: 1.4;
    color: rgb(var(--ta-text-dim));
    overflow-wrap: anywhere;
  }

  .ta-flow-node-status {
    flex: none;
    align-self: center;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(var(--ta-accent));
  }

  .ta-flow-node--skipped .ta-flow-node-status {
    color: rgb(var(--ta-text-dim));
  }

  .ta-flow-node--failed .ta-flow-node-status {
    color: rgb(var(--ta-danger));
  }

  .ta-flow-node--stopped .ta-flow-node-status {
    color: rgb(var(--ta-warning));
  }

  .ta-flow-node-actions {
    flex: none;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding-inline-end: 0.375rem;
  }

  @media (pointer: coarse) {
    button.ta-flow-node-body {
      min-height: 2.75rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-flow-node,
    .ta-flow-node-index {
      transition: none;
    }
  }
</style>
