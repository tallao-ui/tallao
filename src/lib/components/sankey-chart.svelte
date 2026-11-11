<!--
  tallao — SankeyChart
  Where a quantity comes from and where it goes: nodes in columns, joined by ribbons as
  thick as what flows between them (players from a rank to the next, traffic from a source to
  a page to an outcome, a budget split and split again).

    <SankeyChart title="Where new players end up" unit="players"
      links={[
        { source: "Signed up", target: "Finished tutorial", value: 720 },
        { source: "Signed up", target: "Left", value: 280 },
        { source: "Finished tutorial", target: "Ranked", value: 410 },
        { source: "Finished tutorial", target: "Casual", value: 310 },
      ]} />

  - Layout, with no library (`internal/sankey.ts`): columns by longest path from the sources,
    order inside each column by the barycentre heuristic over a few sweeps to reduce
    crossings, heights proportional to the flow on one scale, positions relaxed towards the
    neighbours. A link that skips columns is routed through a waypoint in each one.
  - Same contract as the other charts: a `<figure>` named by `title`, a labelled empty state
    and a "Show data" table with every flow (from, to, value), which is the text alternative.
  - Every node has its name and its total printed next to it; colour only groups a node with
    the ribbons that leave it. Pointing at a node, or focusing it (each node is a Tab stop
    with its name, total, and what flows in and out), highlights its flows and dims the rest;
    pointing at a ribbon shows "A → B: value".
  - `nodes` is optional: it gives a label or a colour to an id, and fixes the order in which
    nodes are first placed. `align="left"` keeps end nodes in the column after their source
    instead of moving them to the last one.
  - Limits: readable for about 5–25 nodes. The order is a heuristic, so a dense graph keeps
    some crossings; links that would close a cycle are not drawn (they stay in the table,
    marked); many small nodes in one column are squeezed, so raise `height`.
  - Plain SVG laid out in real pixels for the width it has (text does not scale). The server
    draws it at `width`; the browser redraws it to its container. `links` is plain JSON.
-->
<script lang="ts" module>
  export interface SankeyLink {
    source: string;
    target: string;
    value: number;
  }

  export interface SankeyNode {
    id: string;
    /** The name shown; the id by default. */
    label?: string;
    /** Any CSS colour; by default a series colour by position. */
    color?: string;
  }
</script>

<script lang="ts">
  import ChartFigure, { type ChartTable } from "$lib/internal/chart-figure.svelte";
  import { useLabels } from "$lib/i18n";
  import { compactNumber, seriesColor } from "$lib/internal/chart";
  import { ribbonPath, sankeyLayout } from "$lib/internal/sankey";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    links: SankeyLink[];
    /** Labels, colours and first order of the nodes; ids not listed are taken from the links. */
    nodes?: SankeyNode[];
    title: string;
    hideTitle?: boolean;
    /** What flows, after each figure ("players"). */
    unit?: string;
    /** Height of the drawing in px. */
    height?: number;
    /** Width used on the server and before the container is measured. */
    width?: number;
    /** Vertical gap between the nodes of a column. */
    nodePadding?: number;
    align?: "left" | "justify";
    locale?: string;
    format?: (n: number) => string;
    fromLabel?: string;
    toLabel?: string;
    valueLabel?: string;
    emptyText?: string;
    showDataLabel?: string;
    hideDataLabel?: string;
    class?: string;
  }

  const {
    links,
    nodes = [],
    title,
    hideTitle = false,
    unit,
    height = 320,
    width = 640,
    nodePadding = 16,
    align = "justify",
    locale,
    format = (n: number) => compactNumber(n, locale),
    fromLabel = L.from,
    toLabel = L.to,
    valueLabel = L.value,
    emptyText,
    showDataLabel,
    hideDataLabel,
    class: className = "",
  }: Props = $props();

  const NODE = 12;
  /** Room at both sides for the names of the first and last columns. */
  const SIDE = 6;
  let available = $state(0);
  const W = $derived(Math.max(280, available || width));

  // Nodes named in `nodes` come first, in that order: it seeds the layout.
  const ordered = $derived.by(() => {
    const rank = new Map(nodes.map((n, i) => [n.id, i]));
    return [...links].sort((a, b) => (rank.get(a.source) ?? 1e6) - (rank.get(b.source) ?? 1e6));
  });
  const layout = $derived(sankeyLayout(ordered, { width: W - SIDE * 2, height: height - 8, nodeWidth: NODE, nodePadding, align }));
  const info = $derived(new Map(nodes.map((n) => [n.id, n])));
  const labelOf = (id: string) => info.get(id)?.label ?? id;
  const colorOf = $derived.by(() => {
    const byId = new Map(layout.nodes.map((n, i) => [n.id, info.get(n.id)?.color ?? seriesColor(i)]));
    return (id: string) => byId.get(id) ?? seriesColor(0);
  });
  const withUnit = (n: number) => `${format(n)}${unit ? ` ${unit}` : ""}`;

  let active = $state<string | null>(null);
  const lit = (link: { source: string; target: string }) => active === null || link.source === active || link.target === active;

  const describe = (id: string) => {
    const into = layout.links.filter((l) => l.target === id).map((l) => `${labelOf(l.source)} ${withUnit(l.value)}`);
    const out = layout.links.filter((l) => l.source === id).map((l) => `${labelOf(l.target)} ${withUnit(l.value)}`);
    const node = layout.nodes.find((n) => n.id === id)!;
    return [`${labelOf(id)}: ${withUnit(node.value)}`, into.length ? `${fromLabel}: ${into.join(", ")}` : "", out.length ? `${toLabel}: ${out.join(", ")}` : ""].filter(Boolean).join(". ");
  };

  const table = $derived<ChartTable>({
    columns: [{ label: fromLabel }, { label: toLabel }, { label: valueLabel, numeric: true }],
    rows: links.map((l) => [labelOf(l.source), labelOf(l.target), layout.skipped.includes(l) ? `${withUnit(l.value)} *` : withUnit(l.value)]),
  });
</script>

<ChartFigure {title} {hideTitle} empty={layout.nodes.length === 0} {emptyText} {table} {showDataLabel} {hideDataLabel} class={cn("ta-sankey", className)}>
  <div class="ta-sankey-box" bind:clientWidth={available}>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <svg class="ta-sankey-svg" width={W} {height} viewBox={`0 0 ${W} ${height}`} role="group" aria-label={title} onpointerleave={() => (active = null)}>
      <g transform={`translate(${SIDE} 4)`}>
        {#each layout.links as link, i (i)}
          <path class={cn("ta-sankey-link", !lit(link) && "ta-sankey-link--dim", active !== null && lit(link) && "ta-sankey-link--lit")} d={ribbonPath(link.points, link.width)} fill={colorOf(link.source)} aria-hidden="true">
            <title>{labelOf(link.source)} → {labelOf(link.target)}: {withUnit(link.value)}</title>
          </path>
        {/each}
        {#each layout.nodes as node (node.id)}
          {@const lastColumn = node.layer === layout.layers - 1}
          <g
            class={cn("ta-sankey-node", active !== null && active !== node.id && !layout.links.some((l) => (l.source === active && l.target === node.id) || (l.target === active && l.source === node.id)) && "ta-sankey-node--dim")}
            role="img"
            aria-label={describe(node.id)}
            tabindex="0"
            onpointerenter={() => (active = node.id)}
            onfocus={() => (active = node.id)}
            onblur={() => (active = null)}
          >
            <rect class="ta-sankey-hit" x={node.x - 4} y={node.y - 4} width={NODE + 8} height={Math.max(node.height + 8, 24)} />
            <rect class="ta-sankey-bar" x={node.x} y={node.y} width={NODE} height={node.height} rx="2" fill={colorOf(node.id)} />
            <text class="ta-sankey-label" x={lastColumn ? node.x - 6 : node.x + NODE + 6} y={node.y + node.height / 2} text-anchor={lastColumn ? "end" : "start"} dominant-baseline="middle" aria-hidden="true">
              {labelOf(node.id)}<tspan class="ta-sankey-value" dx="6">{format(node.value)}</tspan>
            </text>
          </g>
        {/each}
      </g>
    </svg>
  </div>
  {#if layout.skipped.length}<p class="ta-sankey-note">* {L.flowsNotDrawn.replace("{n}", String(layout.skipped.length))}</p>{/if}
</ChartFigure>

<style>
  .ta-sankey-box { width: 100%; min-width: 0; overflow-x: auto; }
  /* Clipped: the wider touch strip of a node in the last column must not widen the page. */
  .ta-sankey-svg { display: block; overflow: hidden; }

  .ta-sankey-link {
    fill-opacity: 0.32;
    transition: fill-opacity var(--ta-duration-fast, 120ms) ease-out;
  }
  .ta-sankey-link:hover,
  .ta-sankey-link--lit { fill-opacity: 0.62; }
  .ta-sankey-link--dim { fill-opacity: 0.08; }

  .ta-sankey-node { outline: none; cursor: default; transition: opacity var(--ta-duration-fast, 120ms) ease-out; }
  .ta-sankey-node--dim { opacity: 0.35; }
  .ta-sankey-hit { fill: transparent; }
  .ta-sankey-node:focus-visible .ta-sankey-bar { stroke: rgb(var(--ta-text)); stroke-width: 2; }

  .ta-sankey-label {
    fill: rgb(var(--ta-text));
    font-size: 11px;
    font-weight: 500;
    paint-order: stroke;
    stroke: rgb(var(--ta-bg) / 0.8);
    stroke-width: 3px;
    stroke-linejoin: round;
    pointer-events: none;
  }
  .ta-sankey-value { fill: rgb(var(--ta-text-dim)); font-weight: 400; font-variant-numeric: tabular-nums; }
  .ta-sankey-note { margin: 0; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); }

  /* A finger gets a wider strip around each node (the bar itself is 12px). */
  @media (pointer: coarse) {
    .ta-sankey-hit { width: 2.75rem; transform: translateX(-1rem); }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-sankey-link,
    .ta-sankey-node { transition: none; }
  }
</style>
