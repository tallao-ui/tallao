/**
 * tallao — llms.txt
 *
 * Writes `llms.txt` at the repository root from the component sources, so an agent building
 * with the kit can read one file: every exported component with its one-line purpose, its
 * props with their types, and a minimal usage example.
 *
 *   node scripts/llms.mjs           writes llms.txt
 *   node scripts/llms.mjs --check   exits 1 if llms.txt is not what the sources give
 *
 * The purpose is the first sentence of the component's header comment, the example the first
 * snippet in that comment (or a generated one with the required props), and the props come
 * from its `Props` type. `tests/ssr/llms.test.ts` runs the check with the rest of the suite.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = path.join(ROOT, "src/lib/components");

/** `export { default as Name } from "./file.svelte"` lines, in order, for one index file. */
function exportsOf(indexFile) {
  const source = fs.readFileSync(indexFile, "utf8");
  return [...source.matchAll(/export \{ default as (\w+)[^}]*\} from "\.\/([\w-]+\.svelte)";/g)].map((m) => ({ name: m[1], file: path.join(path.dirname(indexFile), m[2]) }));
}

/** The body between the brace at `open` and its match. */
function braceBody(source, open) {
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    else if (source[i] === "}" && --depth === 0) return source.slice(open + 1, i);
  }
  return "";
}

/** The members of the component's props type: `interface Props { … }` or `}: { … } = $props()`. */
function propsBody(source) {
  const named = source.search(/interface Props\s*\{/);
  if (named >= 0) return braceBody(source, source.indexOf("{", named));
  const call = source.indexOf("= $props()");
  if (call < 0) return "";
  // Walk back from `} = $props()` to the brace that opens the inline type.
  let depth = 0;
  for (let i = source.lastIndexOf("}", call); i >= 0; i--) {
    if (source[i] === "}") depth++;
    else if (source[i] === "{" && --depth === 0) return source[i - 2] === ":" ? source.slice(i + 1, source.lastIndexOf("}", call)) : "";
  }
  return "";
}

/** Top-level `name?: type` members with their doc comment. */
function parseProps(body) {
  const props = [];
  let depth = 0;
  let current = "";
  let doc = "";
  let i = 0;
  const flush = () => {
    const text = current.replace(/\s+/g, " ").trim();
    current = "";
    const match = text.match(/^(?:"([^"]+)"|([\w$]+))(\?)?:\s*(.+)$/);
    if (match) props.push({ name: match[1] ?? match[2], optional: !!match[3], type: match[4], doc: doc.replace(/\s+/g, " ").trim() });
    doc = "";
  };
  while (i < body.length) {
    if (depth === 0 && body.startsWith("/**", i)) {
      const end = body.indexOf("*/", i);
      doc = body.slice(i + 3, end).replace(/^\s*\*\s?/gm, "");
      i = end + 2;
      continue;
    }
    if (depth === 0 && body.startsWith("//", i)) {
      i = body.indexOf("\n", i);
      if (i < 0) break;
      continue;
    }
    const ch = body[i];
    if ("{([<".includes(ch)) depth++;
    else if ("})]".includes(ch) || (ch === ">" && body[i - 1] !== "=")) depth = Math.max(0, depth - 1);
    if (ch === ";" && depth === 0) flush();
    else if (ch === "\n" && depth === 0 && /:\s*\S/.test(current) && !/[|&,(<{=]\s*$/.test(current) && !/^\s*[|&]/.test(body.slice(i + 1))) flush();
    else current += ch;
    i++;
  }
  flush();
  return props.filter((p) => !p.name.startsWith("["));
}

/** The header comment's text, without the `tallao — Name` title. */
function header(source, name) {
  const comment = source.match(/^\s*<!--([\s\S]*?)-->/)?.[1] ?? "";
  const lines = comment.split("\n");
  const body = lines
    .join("\n")
    .replace(new RegExp(`^\\s*(tallao\\s+[—-]\\s+)?${name}[^\\n]*?(:\\s+|\\n)`), "")
    .trimEnd();
  return { comment, body };
}

function purpose(source, name) {
  const { body } = header(source, name);
  const paragraph = body.split(/\n\s*\n/)[0].replace(/\s+/g, " ").trim();
  if (!paragraph) return "";
  const sentence = paragraph.match(/^.*?[.:](?=\s|$)/)?.[0] ?? paragraph;
  return sentence.replace(/[:]$/, ".").trim();
}

function example(source, name, props) {
  const { comment } = header(source, name);
  const lines = comment.split("\n");
  const start = lines.findIndex((l) => new RegExp(`^\\s{2,}<${name}([\\s/>]|$)`).test(l));
  if (start >= 0) {
    const out = [];
    for (let i = start; i < lines.length; i++) {
      if (lines[i].trim() === "" && out.length) break;
      out.push(lines[i]);
      const joined = out.join("\n");
      if (new RegExp(`</${name}>\\s*$`).test(joined) || (/\/>\s*$/.test(joined) && !joined.includes(`</${name}`) && (joined.match(/<[A-Z]/g) ?? []).length === (joined.match(/\/>/g) ?? []).length)) break;
    }
    const indent = Math.min(...out.filter((l) => l.trim()).map((l) => l.match(/^\s*/)[0].length));
    return out.map((l) => l.slice(indent)).join("\n").trimEnd();
  }
  const required = props.filter((p) => !p.optional && p.name !== "children");
  const attrs = required.map((p) => (/^string\b/.test(p.type) ? `${p.name}="…"` : `{${p.name}}`)).join(" ");
  const hasChildren = props.some((p) => p.name === "children");
  return hasChildren ? `<${name}${attrs ? " " + attrs : ""}>…</${name}>` : `<${name}${attrs ? " " + attrs : ""} />`;
}

export function generate() {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const groups = [
    { entry: "tallao", list: exportsOf(path.join(COMPONENTS, "index.ts")) },
    { entry: "tallao/map", list: [{ name: "GameMap", file: path.join(ROOT, "src/lib/map/game-map.svelte") }] },
    { entry: "tallao/code", list: [{ name: "CodeEditor", file: path.join(ROOT, "src/lib/code/code-editor.svelte") }] },
  ];
  const out = [
    "# tallao",
    "",
    `> ${pkg.description}. Svelte 5 components in plain CSS on \`--ta-*\` tokens: accessible by keyboard and screen reader, SSR-ready, usable inside a Shadow DOM through ThemeScope.`,
    "",
    "Generated by `node scripts/llms.mjs` from `src/lib/components/*.svelte`; do not edit by hand.",
    "Each component's header comment in its source file is the full contract (ARIA pattern, keyboard, SSR).",
    "",
    "## Use",
    "",
    "```svelte",
    "<script>",
    '  import "tallao/tokens.css";',
    '  import "tallao/base.css";',
    '  import { Button, Dialog } from "tallao";',
    '  import { rise, collapse } from "tallao/motion";',
    "</script>",
    "```",
    "",
    "- Texts are English by default; `setLabels(es)` in the root component switches them, and a label prop on a component wins.",
    "- Popover, Tooltip and DropdownMenu take their trigger as a snippet: `{#snippet trigger(props)}<Button {...props}>…</Button>{/snippet}`.",
    "- Compositions to copy: `src/AgentDemo.svelte` (an agent run screen), `src/AdminDemo.svelte` (a model list page and a record detail page), the `#dashboard` section of `src/App.svelte` (a public dashboard).",
    "- Motion: `tallao/motion` (fade, rise, scaleIn, slide, collapse, stagger, crossfade, press, shimmer, shake, drawCheck, rollNumber, tabIndicator, viewTransition) on the tokens `--ta-duration-fast | base | slow` and `--ta-ease-out | in-out | spring`; all of it stops under reduced motion.",
    "",
  ];
  let count = 0;
  for (const group of groups) {
    out.push(`## Components (\`${group.entry}\`)`, "");
    for (const { name, file } of group.list) {
      if (!fs.existsSync(file)) continue;
      const source = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
      const props = parseProps(propsBody(source));
      const what = purpose(source, name);
      out.push(`### ${name}`, "");
      if (what) out.push(what, "");
      out.push("```svelte", example(source, name, props), "```", "");
      if (props.length) {
        out.push("Props:");
        for (const p of props) out.push(`- \`${p.name}${p.optional ? "?" : ""}: ${p.type}\`${p.doc ? ` — ${p.doc}` : ""}`);
        out.push("");
      }
      count++;
    }
  }
  return { text: out.join("\n"), count };
}

const target = path.join(ROOT, "llms.txt");

/** Whether llms.txt matches the sources (line endings aside). */
export function isCurrent() {
  if (!fs.existsSync(target)) return false;
  return fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") === generate().text;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes("--check")) {
    if (!isCurrent()) {
      console.error("llms.txt is out of date: run `pnpm llms` and include the result.");
      process.exit(1);
    }
    console.log("llms.txt is up to date.");
  } else {
    const { text, count } = generate();
    fs.writeFileSync(target, text);
    console.log(`llms.txt: ${count} components.`);
  }
}
