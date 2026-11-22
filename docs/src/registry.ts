/**
 * The docs' data: what scripts/docs-data.mjs read from the component sources, the demos next to
 * them, and the small helpers the pages use to draw a component's header comment.
 */
import type { Component } from "svelte";
import data from "../gen/components.json";

export interface Prop {
  name: string;
  optional: boolean;
  type: string;
  doc: string;
  default: string;
  bindable: boolean;
}
export interface Doc {
  name: string;
  slug: string;
  file: string;
  entry: string;
  purpose: string;
  details: string;
  example: string;
  exampleFromHeader: boolean;
  props: Prop[];
  family: string;
  parts: Doc[];
}
export interface Family {
  id: string;
  title: string;
  blurb: string;
  items: string[];
}

export const docs = data as unknown as {
  version: string;
  total: number;
  pages: number;
  families: Family[];
  components: Record<string, Doc>;
};

/** Components added since 0.7: they carry a "new" mark. */
export const NEW = new Set(["password-input", "floating-scene", "scene-player", "chat-thread", "document-tabs", "code-diff", "tag-input", "sortable-list", "tree-view", "date-range-picker", "sankey-chart", "calendar-heatmap", "card-stack", "beam", "terminal", "event-feed", "segmented-bar", "cohort-grid"]);

/** Every page in reading order, with its family and its place in it. */
export const order = docs.families.flatMap((f) => f.items.map((slug, i) => ({ slug, family: f, index: i + 1, of: f.items.length })));
export const pageOf = (slug: string) => order.find((p) => p.slug === slug);

// ——— Demos: docs/demos/<slug>.svelte, loaded on demand; its source is the "Code" tab ———
const loaders = import.meta.glob("../demos/*.svelte") as Record<string, () => Promise<{ default: Component }>>;
const sources = import.meta.glob("../demos/*.svelte", { query: "?raw", import: "default" }) as Record<string, () => Promise<string>>;
const key = (slug: string) => `../demos/${slug}.svelte`;

export const hasDemo = (slug: string) => key(slug) in loaders;
export const demoCount = () => Object.keys(loaders).length;

export type Layout = "center" | "stack" | "wide";
export interface Demo {
  component: Component;
  /** The file as the visitor copies it, without the layout comment. */
  code: string;
  layout: Layout;
  /** Minimum height of the stage, in rem, for demos that open overlays or float things. */
  height: number;
}

/** `<!-- layout: stack; height: 22 -->` on the first line tells the docs how to set the stage. */
export async function loadDemo(slug: string): Promise<Demo | null> {
  const k = key(slug);
  if (!(k in loaders)) return null;
  const [mod, raw] = await Promise.all([loaders[k](), sources[k]()]);
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(/^<!--\s*([^>]*?)\s*-->\n?/);
  const opts = Object.fromEntries((m?.[1] ?? "").split(";").map((kv) => kv.split(":").map((x) => x.trim())).filter((kv) => kv.length === 2));
  const layout = (["center", "stack", "wide"].includes(opts.layout) ? opts.layout : "center") as Layout;
  return { component: mod.default, code: (m ? text.slice(m[0].length) : text).trimEnd(), layout, height: Number(opts.height) || 0 };
}

// ——— A header comment, as blocks ———
export type Block = { type: "p"; text: string } | { type: "code"; text: string } | { type: "ul"; items: string[] };

/** Paragraphs, lists and code of a component's header comment (its contract), without the first sentence. */
export function blocksOf(details: string, purpose: string): Block[] {
  const lines = details.replace(/\r\n/g, "\n").split("\n");
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^\s*/)![0].length), 99);
  const text = lines.map((l) => l.slice(Math.min(indent, l.match(/^\s*/)![0].length)));
  const groups: string[][] = [[]];
  for (const l of text) {
    if (l.trim() === "") {
      if (groups.at(-1)!.length) groups.push([]);
    } else groups.at(-1)!.push(l);
  }
  const out: Block[] = [];
  for (const g of groups.filter((x) => x.length)) {
    const first = g[0];
    if (/^\s{2,}[<{]/.test(first) || (/^\s{2,}\S/.test(first) && g.every((l) => /^\s{2,}/.test(l)))) {
      const pad = Math.min(...g.map((l) => l.match(/^\s*/)![0].length));
      out.push({ type: "code", text: g.map((l) => l.slice(pad)).join("\n") });
    } else if (/^[-•]\s/.test(first)) {
      const items: string[] = [];
      for (const l of g) {
        if (/^[-•]\s/.test(l)) items.push(l.replace(/^[-•]\s+/, ""));
        else items[items.length - 1] += " " + l.trim();
      }
      out.push({ type: "ul", items });
    } else out.push({ type: "p", text: g.map((l) => l.trim()).join(" ") });
  }
  // The first sentence is the page's lead; do not say it twice.
  const lead = out[0];
  if (lead?.type === "p" && purpose && lead.text.startsWith(purpose.replace(/\.$/, ""))) {
    const rest = lead.text.slice(purpose.length).trim();
    if (rest) out[0] = { type: "p", text: rest };
    else out.shift();
  }
  return out;
}

/** `text with `code`` → pieces, for drawing inline code without {@html}. */
export function inline(text: string): { code: boolean; text: string }[] {
  return text.split("`").map((t, i) => ({ code: i % 2 === 1, text: t })).filter((p) => p.text);
}

// ——— A very small highlighter for Svelte / HTML / TypeScript snippets ———
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const TOKEN = /(<!--[\s\S]*?-->)|(\/\/[^\n]*)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.:-]*)|(\{[#/:@][a-z]+)|(\b(?:import|from|export|let|const|as|type|interface|if|else|each|snippet|render|await|async|return|true|false|null|undefined|new)\b)|(\$(?:state|derived|props|bindable|effect)\b)/g;

export function highlight(code: string): string {
  let out = "";
  let last = 0;
  for (const m of code.matchAll(TOKEN)) {
    out += esc(code.slice(last, m.index));
    const cls = m[1] || m[2] ? "c" : m[3] ? "s" : m[4] ? "t" : m[5] ? "b" : m[6] ? "k" : "r";
    out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = m.index! + m[0].length;
  }
  return out + esc(code.slice(last));
}
