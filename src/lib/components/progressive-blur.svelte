<!--
  tallao — ProgressiveBlur
  A blur that grows toward one edge of a box: the end of a scrolling list, the foot of a card with
  a cover image, the top of a feed under a sticky header. It is decoration, so it is hidden from
  assistive technology (`aria-hidden`) and lets every click through (`pointer-events: none`).

    <div style="position: relative; overflow: auto">
      …content…
      <ProgressiveBlur side="bottom" size="40%" />
    </div>

  - Place it last inside a positioned parent (`position: relative`, `sticky`…): it is absolutely
    positioned along `side` and spans the parent's width, `size` tall (any CSS length or percent
    of the parent).
  - Three stacked layers, each with a stronger `backdrop-filter: blur()` and a shorter mask
    (`mask-image: linear-gradient(…)`), so the blur builds up toward the edge instead of starting
    as a hard line. `strength` is the blur in px of the strongest layer; the others scale from it
    (1/7 and 3/7 of it).
  - Touch screens (`pointer: coarse`) get one layer at half the strength: a backdrop filter is
    repainted on every scroll frame, and pages with dozens of blurred cards stutter on phones.
  - Where `backdrop-filter` is not supported it draws nothing: there is no blur to fake, and a
    tinted gradient would change the content's colours in a way the author did not choose.
  - No JavaScript, nothing measured: it renders the same on the server.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    /** The edge the blur grows toward. */
    side?: "top" | "bottom";
    /** How far it reaches from that edge: a CSS length or a percent of the parent. */
    size?: string;
    /** Blur in px of the strongest layer, at the edge; the other layers scale from it. */
    strength?: number;
    class?: string;
    /** Any other attribute goes to the root `<div>`. */
    [key: string]: unknown;
  }

  const { side = "bottom", size = "60%", strength = 14, class: className = "", ...rest }: Props = $props();
</script>

<div
  {...rest}
  class={cn("ta-progressive-blur", `ta-progressive-blur--${side}`, className)}
  aria-hidden="true"
  style:--ta-pblur-size={size}
  style:--ta-pblur-strength={`${strength}px`}
>
  <div class="ta-progressive-blur-layer ta-progressive-blur-layer--1"></div>
  <div class="ta-progressive-blur-layer ta-progressive-blur-layer--2"></div>
  <div class="ta-progressive-blur-layer ta-progressive-blur-layer--3"></div>
</div>

<style>
  .ta-progressive-blur {
    position: absolute;
    inset-inline: 0;
    height: var(--ta-pblur-size, 60%);
    pointer-events: none;
    /* The gradient runs from the edge (opaque mask, full blur) inward (transparent). */
    --ta-pblur-to: top;
  }
  .ta-progressive-blur--bottom { bottom: 0; }
  .ta-progressive-blur--top { top: 0; --ta-pblur-to: bottom; }

  .ta-progressive-blur-layer {
    position: absolute;
    inset-inline: 0;
    height: var(--ta-pblur-h);
    backdrop-filter: blur(var(--ta-pblur-blur));
    -webkit-backdrop-filter: blur(var(--ta-pblur-blur));
    mask-image: linear-gradient(to var(--ta-pblur-to), #000 var(--ta-pblur-solid), transparent);
    -webkit-mask-image: linear-gradient(to var(--ta-pblur-to), #000 var(--ta-pblur-solid), transparent);
  }
  .ta-progressive-blur--bottom .ta-progressive-blur-layer { bottom: 0; }
  .ta-progressive-blur--top .ta-progressive-blur-layer { top: 0; }

  /* Heights are shares of the overlay; at strength 14 the blurs are 2, 6 and 14 px. */
  .ta-progressive-blur-layer--1 {
    --ta-pblur-h: 100%;
    --ta-pblur-blur: calc(var(--ta-pblur-strength, 14px) / 7);
    --ta-pblur-solid: 45%;
  }
  .ta-progressive-blur-layer--2 {
    --ta-pblur-h: 70%;
    --ta-pblur-blur: calc(var(--ta-pblur-strength, 14px) * 3 / 7);
    --ta-pblur-solid: 35%;
  }
  .ta-progressive-blur-layer--3 {
    --ta-pblur-h: 43%;
    --ta-pblur-blur: var(--ta-pblur-strength, 14px);
    --ta-pblur-solid: 40%;
  }

  /* Phones: one layer at half the strength (each backdrop filter repaints on every scroll frame). */
  @media (pointer: coarse) {
    .ta-progressive-blur-layer--1,
    .ta-progressive-blur-layer--3 {
      display: none;
    }
    .ta-progressive-blur-layer--2 {
      --ta-pblur-h: 100%;
      --ta-pblur-blur: calc(var(--ta-pblur-strength, 14px) / 2);
      --ta-pblur-solid: 40%;
    }
  }

  /* No backdrop filter, no blur: nothing is drawn rather than a tint the author did not ask for. */
  @supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
    .ta-progressive-blur {
      display: none;
    }
  }
</style>
