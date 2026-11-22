<!--
  tallao — Beam
  A pulse of light that travels along a line between two elements: how an agent reaches its tools,
  how a request goes from a client to a server. It is decoration for something the text already
  says, so it is hidden from assistive technology (`aria-hidden`): name what is connected in the
  elements themselves.

    <div bind:this={box} style="position: relative">
      <div bind:this={agent}>Agent</div>
      <div bind:this={search}>Search</div>
      <Beam container={box} from={agent} to={search} />
    </div>

  - `container` is the element both ends live in and must be positioned (`position: relative`):
    the beam is an SVG drawn inside it, so it needs no wrapper and takes no space. `from` and `to`
    are any two elements inside it; the line leaves each at its edge, `gap` px before it.
  - It follows the layout: a ResizeObserver on the three elements draws it again when any of
    them changes size (a window resize, a collapsing panel). Until all three exist, and where there
    is no room between the ends, nothing is drawn.
  - `curvature` bends the line: the offset in px of its control point at right angles to the
    straight line (positive curves up when going left to right). One pulse takes `duration`
    seconds, with a rest between pulses; `reverse` sends it from `to` to `from`; `active={false}`
    leaves only the line.
  - Reduced motion (the system setting or `data-tallao-motion="reduce"`): only the line, no pulse.
  - On the server nothing is drawn (it needs to measure the page); it is decoration, so nothing is
    lost without JavaScript.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    /** The positioned element both ends live in. */
    container: HTMLElement | null | undefined;
    /** Where the beam starts. */
    from: HTMLElement | null | undefined;
    /** Where it ends. */
    to: HTMLElement | null | undefined;
    /** Offset in px of the control point, at right angles to the straight line; 0 is straight. */
    curvature?: number;
    /** Seconds a pulse takes, rest included. */
    duration?: number;
    /** Seconds before the first pulse. */
    delay?: number;
    /** The pulse goes from `to` to `from`. */
    reverse?: boolean;
    /** Runs the pulse; false leaves only the line. */
    active?: boolean;
    /** Colour of the pulse. */
    tone?: "accent" | "accent-2" | "success" | "warning" | "danger" | "info";
    /** Width of the line in px. */
    width?: number;
    /** Distance in px between each element's edge and the beam. */
    gap?: number;
    class?: string;
    /** Any other attribute goes to the `<svg>`. */
    [key: string]: unknown;
  }

  const {
    container,
    from,
    to,
    curvature = 0,
    duration = 3,
    delay = 0,
    reverse = false,
    active = true,
    tone = "accent",
    width = 2,
    gap = 6,
    class: className = "",
    ...rest
  }: Props = $props();

  let drawing = $state({ w: 0, h: 0, d: "" });

  const r = (n: number) => Math.round(n * 10) / 10;

  function measure() {
    if (!container || !from || !to) {
      drawing = { w: 0, h: 0, d: "" };
      return;
    }
    const c = container.getBoundingClientRect();
    const a = from.getBoundingClientRect();
    const b = to.getBoundingClientRect();
    // Centres, from the container's padding box (where the SVG's 0,0 is).
    const ox = c.left + container.clientLeft;
    const oy = c.top + container.clientTop;
    const ax = a.left - ox + a.width / 2;
    const ay = a.top - oy + a.height / 2;
    const bx = b.left - ox + b.width / 2;
    const by = b.top - oy + b.height / 2;
    const len = Math.hypot(bx - ax, by - ay);
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!len) {
      drawing = { w, h, d: "" };
      return;
    }
    const ux = (bx - ax) / len;
    const uy = (by - ay) / len;
    // How far from its centre the straight line leaves a box: to the nearer of its two sides.
    const reach = (rect: DOMRect) => Math.min(rect.width / 2 / (Math.abs(ux) || 1e-9), rect.height / 2 / (Math.abs(uy) || 1e-9));
    const out = reach(a) + gap;
    const back = reach(b) + gap;
    if (out + back >= len) {
      drawing = { w, h, d: "" };
      return;
    }
    const sx = ax + ux * out;
    const sy = ay + uy * out;
    const ex = bx - ux * back;
    const ey = by - uy * back;
    // The control point: the middle, pushed at right angles to the line ("up" going left to right).
    const cx = (sx + ex) / 2 + uy * curvature;
    const cy = (sy + ey) / 2 - ux * curvature;
    drawing = { w, h, d: `M ${r(sx)} ${r(sy)} Q ${r(cx)} ${r(cy)} ${r(ex)} ${r(ey)}` };
  }

  $effect(() => {
    // Reads the three elements, the gap and the curvature: any of them changing draws it again.
    void curvature;
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const watcher = new ResizeObserver(() => measure());
    for (const el of [container, from, to]) if (el) watcher.observe(el);
    return () => watcher.disconnect();
  });
</script>

<svg
  {...rest}
  class={cn("ta-beam", `ta-beam--${tone}`, className)}
  width={drawing.w}
  height={drawing.h}
  viewBox={`0 0 ${drawing.w} ${drawing.h}`}
  aria-hidden="true"
  focusable="false"
  style:--ta-beam-duration={`${duration}s`}
  style:--ta-beam-delay={`${delay}s`}
>
  {#if drawing.d}
    <path class="ta-beam-line" d={drawing.d} fill="none" stroke-width={width} stroke-linecap="round" />
    {#if active}
      <path
        class={cn("ta-beam-pulse", reverse && "ta-beam-pulse--reverse")}
        d={drawing.d}
        pathLength="100"
        fill="none"
        stroke-width={width}
        stroke-linecap="round"
      />
    {/if}
  {/if}
</svg>

<style>
  .ta-beam {
    position: absolute;
    left: 0;
    top: 0;
    overflow: visible;
    pointer-events: none;
    --ta-beam-rgb: var(--ta-accent-hover);
  }
  .ta-beam--accent-2 { --ta-beam-rgb: var(--ta-accent-2); }
  .ta-beam--success { --ta-beam-rgb: var(--ta-success); }
  .ta-beam--warning { --ta-beam-rgb: var(--ta-warning); }
  .ta-beam--danger { --ta-beam-rgb: var(--ta-danger); }
  .ta-beam--info { --ta-beam-rgb: var(--ta-info); }

  .ta-beam-line {
    stroke: rgb(var(--ta-text) / 0.16);
  }

  /* One bright stretch (14 of 100) that runs the line once and rests while the next one is "behind" it. */
  .ta-beam-pulse {
    stroke: rgb(var(--ta-beam-rgb));
    stroke-dasharray: 14 186;
    stroke-dashoffset: 14;
    filter: drop-shadow(0 0 4px rgb(var(--ta-beam-rgb) / 0.8));
    animation: ta-beam-run var(--ta-beam-duration, 3s) linear var(--ta-beam-delay, 0s) infinite;
  }
  .ta-beam-pulse--reverse {
    animation-direction: reverse;
  }

  @keyframes ta-beam-run {
    from { stroke-dashoffset: 14; }
    to { stroke-dashoffset: -186; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-beam-pulse {
      animation: none;
      display: none;
    }
  }
  :global([data-tallao-motion="reduce"]) .ta-beam-pulse {
    animation: none;
    display: none;
  }
</style>
