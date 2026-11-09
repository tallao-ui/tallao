<!--
  tallao — Rating
  Star rating on native radios: it is a named group of options
  ("What did you think of the course?"), navigated with the arrows like any radio and
  submitted in a <form> with `name`.
  - On hover, the stars show what would be chosen.
  - `readonly`: only shows the score (an image with "4 of 5"), without controls.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();
  let {
    value = $bindable(0),
    max = 5,
    label,
    hideLabel = false,
    readonly = false,
    required = false,
    disabled = false,
    size = "md",
    name,
    starLabel = (n: number, total: number) => L.ratingOf.replace("{n}", String(n)).replace("{total}", String(total)),
    class: className = "",
    onchange,
    onhover,
  }: {
    value?: number;
    max?: number;
    /** Name of the group: the question. */
    label: string;
    hideLabel?: boolean;
    readonly?: boolean;
    required?: boolean;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
    name?: string;
    /** How each star is read ("4 of 5"). */
    starLabel?: (n: number, total: number) => string;
    class?: string;
    onchange?: (value: number) => void;
    /** The star under the pointer (null on leaving): for a caption next to it. */
    onhover?: (value: number | null) => void;
  } = $props();

  const id = $props.id();
  const groupName = $derived(name ?? `${id}-rating`);
  let hovered = $state<number | null>(null);
  const lit = $derived(hovered ?? value);
  const stars = $derived(Array.from({ length: max }, (_, i) => i + 1));
  const sizes = { sm: 16, md: 22, lg: 28 } as const;

  function choose(n: number) {
    value = n;
    onchange?.(n);
  }
</script>

{#snippet star(filled: boolean)}
  <svg width={sizes[size]} height={sizes[size]} viewBox="0 0 24 24" aria-hidden="true" class={cn("ta-rating-star", filled && "ta-rating-star--filled")}>
    <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" stroke-linejoin="round" stroke-width="1.5" />
  </svg>
{/snippet}

{#if readonly}
  <span class={cn("ta-rating", className)} role="img" aria-label={`${label}: ${starLabel(value, max)}`}>
    {#each stars as n (n)}{@render star(n <= Math.round(value))}{/each}
  </span>
{:else}
  <fieldset class={cn("ta-rating", "ta-rating--editable", className)} {disabled} onpointerleave={() => { hovered = null; onhover?.(null); }}>
    <legend class={hideLabel ? "ta-rating-hidden" : "ta-rating-legend"}>{label}</legend>
    <div class="ta-rating-row">
      {#each stars as n (n)}
        <label class="ta-rating-option" onpointerenter={() => { hovered = n; onhover?.(n); }}>
          <input
            class="ta-rating-radio"
            type="radio"
            name={groupName}
            value={n}
            checked={value === n}
            required={required && n === 1}
            onchange={() => choose(n)}
          />
          <span class="ta-rating-hidden">{starLabel(n, max)}</span>
          {@render star(n <= lit)}
        </label>
      {/each}
    </div>
  </fieldset>
{/if}

<style>
  .ta-rating { display: inline-flex; flex-direction: column; gap: 0.375rem; margin: 0; padding: 0; border: none; min-width: 0; }
  span.ta-rating { flex-direction: row; gap: 0.125rem; }
  .ta-rating-legend { padding: 0; margin-bottom: 0.375rem; font-size: 0.875rem; font-weight: 500; color: rgb(var(--ta-text)); }
  .ta-rating-row { display: inline-flex; gap: 0.125rem; }

  .ta-rating-option { position: relative; display: inline-flex; padding: 0.125rem; border-radius: var(--ta-radius-sm); cursor: pointer; }
  .ta-rating--editable:disabled .ta-rating-option { cursor: not-allowed; opacity: 0.5; }
  .ta-rating-radio { position: absolute; inset: 0; margin: 0; opacity: 0; cursor: inherit; }
  .ta-rating-option:has(.ta-rating-radio:focus-visible) { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 1px; }

  .ta-rating-star { fill: none; stroke: rgb(var(--ta-muted)); transition: fill 0.12s, stroke 0.12s, transform 0.12s; }
  .ta-rating-star--filled { fill: rgb(var(--ta-warning)); stroke: rgb(var(--ta-warning)); }
  .ta-rating-option:hover .ta-rating-star { transform: scale(1.1); }

  .ta-rating-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }

  @media (pointer: coarse) {
    .ta-rating-option { display: inline-flex; align-items: center; justify-content: center; min-width: 2.75rem; min-height: 2.75rem; padding: 0.5rem; }
  }
  @media (prefers-reduced-motion: reduce) {
    .ta-rating-star { transition: none; }
    .ta-rating-option:hover .ta-rating-star { transform: none; }
  }
</style>
