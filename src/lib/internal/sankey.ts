/**
 * tallao — Sankey layout
 *
 * A layered layout for a flow diagram, with no dependency:
 *   1. Links that would close a cycle are set aside (a Sankey is a directed acyclic graph).
 *   2. Layers by longest path from the sources; with `align: "justify"` the nodes nothing
 *      flows out of move to the last layer.
 *   3. A link that skips layers gets a waypoint in each layer it crosses, so it takes part in
 *      the ordering and is routed around the nodes in between.
 *   4. Order inside each layer by the barycentre heuristic (the value-weighted mean position
 *      of the neighbours), sweeping forwards and backwards a few times and keeping the order
 *      with the fewest crossings.
 *   5. Heights proportional to value on one scale; vertical positions relaxed towards the
 *      neighbours and then pushed apart so nothing overlaps.
 * It gives readable results for about 5–25 nodes. Limits: the ordering is a heuristic, not an
 * optimum (dense graphs keep some crossings); cycles are not drawn; a layer with many small
 * nodes is squeezed by the padding between them.
 */

export interface SankeyLinkInput {
  source: string;
  target: string;
  value: number;
}

export interface SankeyNodeBox {
  id: string;
  layer: number;
  /** Position inside its layer, top to bottom. */
  order: number;
  /** Flow through the node: the larger of what comes in and what goes out. */
  value: number;
  x: number;
  y: number;
  height: number;
}

export interface SankeyLinkPath {
  source: string;
  target: string;
  value: number;
  /** Thickness of the ribbon. */
  width: number;
  /** The ribbon's centre line: points at the right edge of the source, both edges of each
      waypoint and the left edge of the target. */
  points: { x: number; y: number }[];
}

export interface SankeyLayout {
  nodes: SankeyNodeBox[];
  links: SankeyLinkPath[];
  /** Links left out because they would close a cycle, or have no positive value. */
  skipped: SankeyLinkInput[];
  layers: number;
}

export interface SankeyOptions {
  width: number;
  height: number;
  nodeWidth?: number;
  /** Vertical gap between the nodes of a layer. */
  nodePadding?: number;
  align?: "left" | "justify";
  /** Sweeps of the ordering heuristic. */
  sweeps?: number;
}

interface Vertex {
  id: string;
  dummy: boolean;
  layer: number;
  order: number;
  value: number;
  y: number;
  height: number;
  /** Segments that end here / start here. */
  ins: Segment[];
  outs: Segment[];
}
interface Segment {
  from: Vertex;
  to: Vertex;
  value: number;
  link: number;
}

/** How many pairs of segments between two neighbouring layers cross, for a given order. */
function crossings(layers: Vertex[][]): number {
  let total = 0;
  for (const layer of layers) {
    const segments = layer.flatMap((v) => v.outs);
    for (let a = 0; a < segments.length; a++) {
      for (let b = a + 1; b < segments.length; b++) {
        const s = segments[a];
        const t = segments[b];
        if ((s.from.order - t.from.order) * (s.to.order - t.to.order) < 0) total++;
      }
    }
  }
  return total;
}

export function sankeyLayout(input: SankeyLinkInput[], options: SankeyOptions): SankeyLayout {
  const { width, height, nodeWidth = 12, nodePadding = 14, align = "justify", sweeps = 8 } = options;

  // ——— 1. Nodes, and the links that keep the graph acyclic
  const ids: string[] = [];
  const seen = new Set<string>();
  const skipped: SankeyLinkInput[] = [];
  const kept: SankeyLinkInput[] = [];
  const reaches = new Map<string, Set<string>>();
  const canReach = (from: string, to: string, visited = new Set<string>()): boolean => {
    if (from === to) return true;
    if (visited.has(from)) return false;
    visited.add(from);
    for (const next of reaches.get(from) ?? []) if (canReach(next, to, visited)) return true;
    return false;
  };
  for (const link of input) {
    if (!(link.value > 0) || !Number.isFinite(link.value) || link.source === link.target || canReach(link.target, link.source)) {
      skipped.push(link);
      continue;
    }
    for (const id of [link.source, link.target]) {
      if (!seen.has(id)) {
        seen.add(id);
        ids.push(id);
      }
    }
    if (!reaches.has(link.source)) reaches.set(link.source, new Set());
    reaches.get(link.source)!.add(link.target);
    kept.push(link);
  }
  if (kept.length === 0) return { nodes: [], links: [], skipped, layers: 0 };

  // ——— 2. Layers by longest path
  const layerOf = new Map<string, number>(ids.map((id) => [id, 0]));
  for (let pass = 0; pass < ids.length; pass++) {
    let moved = false;
    for (const link of kept) {
      const next = layerOf.get(link.source)! + 1;
      if (next > layerOf.get(link.target)!) {
        layerOf.set(link.target, next);
        moved = true;
      }
    }
    if (!moved) break;
  }
  const last = Math.max(...layerOf.values());
  if (align === "justify") {
    const hasOut = new Set(kept.map((l) => l.source));
    for (const id of ids) if (!hasOut.has(id)) layerOf.set(id, last);
  }

  // ——— 3. Vertices, with a waypoint per layer a link skips
  const vertex = new Map<string, Vertex>();
  const layers: Vertex[][] = Array.from({ length: last + 1 }, () => []);
  const add = (id: string, layer: number, dummy: boolean): Vertex => {
    const v: Vertex = { id, dummy, layer, order: layers[layer].length, value: 0, y: 0, height: 0, ins: [], outs: [] };
    layers[layer].push(v);
    return v;
  };
  for (const id of ids) vertex.set(id, add(id, layerOf.get(id)!, false));
  const chains: Vertex[][] = kept.map((link, index) => {
    const from = vertex.get(link.source)!;
    const to = vertex.get(link.target)!;
    const chain = [from];
    for (let layer = from.layer + 1; layer < to.layer; layer++) {
      const waypoint = add(`${link.source}→${link.target}#${layer}`, layer, true);
      waypoint.value = link.value;
      chain.push(waypoint);
    }
    chain.push(to);
    for (let i = 0; i < chain.length - 1; i++) {
      const segment: Segment = { from: chain[i], to: chain[i + 1], value: link.value, link: index };
      chain[i].outs.push(segment);
      chain[i + 1].ins.push(segment);
    }
    return chain;
  });
  for (const v of vertex.values()) {
    const sum = (segments: Segment[]) => segments.reduce((total, s) => total + s.value, 0);
    v.value = Math.max(sum(v.ins), sum(v.outs));
  }

  // ——— 4. Order inside the layers: barycentre sweeps, keeping the best
  const reorder = (layer: Vertex[], side: "ins" | "outs") => {
    const centre = (v: Vertex) => {
      const segments = v[side];
      if (segments.length === 0) return v.order;
      const weight = segments.reduce((total, s) => total + s.value, 0);
      return segments.reduce((total, s) => total + (side === "ins" ? s.from : s.to).order * s.value, 0) / weight;
    };
    const keyed = layer.map((v) => ({ v, key: centre(v), was: v.order }));
    keyed.sort((a, b) => a.key - b.key || a.was - b.was);
    keyed.forEach(({ v }, i) => {
      layer[i] = v;
      v.order = i;
    });
  };
  let best = layers.map((layer) => layer.map((v) => v.id));
  let fewest = crossings(layers);
  for (let sweep = 0; sweep < sweeps && fewest > 0; sweep++) {
    if (sweep % 2 === 0) for (let l = 1; l < layers.length; l++) reorder(layers[l], "ins");
    else for (let l = layers.length - 2; l >= 0; l--) reorder(layers[l], "outs");
    const now = crossings(layers);
    if (now < fewest) {
      fewest = now;
      best = layers.map((layer) => layer.map((v) => v.id));
    }
  }
  const all = new Map(layers.flat().map((v) => [v.id, v]));
  best.forEach((order, l) => {
    layers[l] = order.map((id, i) => {
      const v = all.get(id)!;
      v.order = i;
      return v;
    });
  });

  // ——— 5. Heights on one scale, then vertical positions
  const scale = Math.min(
    ...layers.map((layer) => {
      const total = layer.reduce((sum, v) => sum + v.value, 0);
      return (height - (layer.length - 1) * nodePadding) / (total || 1);
    })
  );
  const ky = Math.max(scale, 0.000001);
  for (const layer of layers) {
    const total = layer.reduce((sum, v) => sum + v.value * ky, 0) + (layer.length - 1) * nodePadding;
    let y = Math.max(0, (height - total) / 2);
    for (const v of layer) {
      v.height = Math.max(1, v.value * ky);
      v.y = y;
      y += v.height + nodePadding;
    }
  }
  const centreOf = (v: Vertex) => v.y + v.height / 2;
  const settle = (layer: Vertex[]) => {
    // Keep the order: push down what overlaps, then push back up what fell off the bottom.
    let y = 0;
    for (const v of layer) {
      if (v.y < y) v.y = y;
      y = v.y + v.height + nodePadding;
    }
    let bottom = height;
    for (let i = layer.length - 1; i >= 0; i--) {
      const v = layer[i];
      if (v.y + v.height > bottom) v.y = bottom - v.height;
      bottom = v.y - nodePadding;
    }
    if (layer.length && layer[0].y < 0) {
      // More than fits: stack from the top (the drawing overflows rather than overlap).
      let top = 0;
      for (const v of layer) {
        v.y = top;
        top += v.height + nodePadding;
      }
    }
  };
  const pull = (layer: Vertex[], side: "ins" | "outs", strength: number) => {
    for (const v of layer) {
      const segments = v[side];
      if (segments.length === 0) continue;
      const weight = segments.reduce((total, s) => total + s.value, 0);
      const target = segments.reduce((total, s) => total + centreOf(side === "ins" ? s.from : s.to) * s.value, 0) / weight;
      v.y += (target - centreOf(v)) * strength;
    }
    settle(layer);
  };
  for (let round = 0, strength = 1; round < 6; round++, strength *= 0.85) {
    for (let l = layers.length - 2; l >= 0; l--) pull(layers[l], "outs", strength);
    for (let l = 1; l < layers.length; l++) pull(layers[l], "ins", strength);
  }

  // ——— 6. Where each ribbon leaves and enters its nodes
  const step = layers.length > 1 ? (width - nodeWidth) / (layers.length - 1) : 0;
  const xOf = (v: Vertex) => v.layer * step;
  const slot = new Map<Segment, { out: number; in: number }>();
  for (const v of all.values()) {
    let offset = 0;
    for (const s of [...v.outs].sort((a, b) => a.to.order - b.to.order)) {
      slot.set(s, { ...(slot.get(s) ?? { in: 0 }), out: offset });
      offset += s.value * ky;
    }
    offset = 0;
    for (const s of [...v.ins].sort((a, b) => a.from.order - b.from.order)) {
      slot.set(s, { ...(slot.get(s) ?? { out: 0 }), in: offset });
      offset += s.value * ky;
    }
  }

  const links: SankeyLinkPath[] = kept.map((link, index) => {
    const chain = chains[index];
    const w = Math.max(1, link.value * ky);
    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < chain.length - 1; i++) {
      const from = chain[i];
      const to = chain[i + 1];
      const segment = from.outs.find((s) => s.link === index && s.to === to)!;
      const where = slot.get(segment)!;
      // A waypoint is as tall as the ribbon: it leaves and enters at its own top.
      points.push({ x: xOf(from) + nodeWidth, y: (from.dummy ? from.y : from.y + where.out) + w / 2 });
      points.push({ x: xOf(to), y: (to.dummy ? to.y : to.y + where.in) + w / 2 });
    }
    return { source: link.source, target: link.target, value: link.value, width: w, points };
  });

  const nodes: SankeyNodeBox[] = ids.map((id) => {
    const v = vertex.get(id)!;
    return { id, layer: v.layer, order: v.order, value: v.value, x: xOf(v), y: v.y, height: v.height };
  });
  return { nodes, links, skipped, layers: layers.length };
}

/** The outline of a ribbon of thickness `width` along its centre line. */
export function ribbonPath(points: { x: number; y: number }[], width: number): string {
  const half = width / 2;
  const f = (n: number) => n.toFixed(1);
  let top = `M${f(points[0].x)},${f(points[0].y - half)}`;
  let bottom = "";
  for (let i = 0; i < points.length - 1; i += 2) {
    const a = points[i];
    const b = points[i + 1];
    const mid = (a.x + b.x) / 2;
    if (i > 0) top += `L${f(a.x)},${f(a.y - half)}`;
    top += `C${f(mid)},${f(a.y - half)} ${f(mid)},${f(b.y - half)} ${f(b.x)},${f(b.y - half)}`;
    bottom = `C${f(mid)},${f(b.y + half)} ${f(mid)},${f(a.y + half)} ${f(a.x)},${f(a.y + half)}` + (i > 0 ? `L${f(points[i - 1].x)},${f(points[i - 1].y + half)}` : "") + bottom;
  }
  const end = points[points.length - 1];
  return `${top}L${f(end.x)},${f(end.y + half)}${bottom}Z`;
}
