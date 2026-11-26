// Pure pieces of the tallao docs MCP server: tool definitions and `callTool`.
// The protocol lives in scripts/mcp-server.mjs; this file's only I/O is reading the docs data
// (and generating it when it is missing).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DOCS_URL = "https://tallao-ui.github.io/tallao/docs/#/c/";
const SOURCE_URL = "https://github.com/tallao-ui/tallao/blob/main/";

export const tools = [
  {
    name: "list_components",
    description: "List every tallao component as 'Name — purpose (family)', grouped by family, with the total.",
    inputSchema: {
      type: "object",
      properties: { family: { type: "string", description: "Optional family id or title (case-insensitive)." } },
      additionalProperties: false,
    },
  },
  {
    name: "search_components",
    description: "Find the components that fit a need. Returns up to 10 ranked matches with purpose and slug.",
    inputSchema: {
      type: "object",
      properties: { query: { type: "string", description: "A component name or a word describing the need." } },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "get_component",
    description:
      "Full page of a component: purpose, import, docs URL, working example, props table, behaviour and accessibility notes. Accepts a part name such as CardHeader.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Component or part name, case-insensitive." } },
      required: ["name"],
      additionalProperties: false,
    },
  },
  {
    name: "get_setup",
    description: "How to install tallao, import its CSS and components, set texts, use motion, and the rules to never invent props.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
];

const text = (t, isError) => (isError ? { content: [{ type: "text", text: t }], isError: true } : { content: [{ type: "text", text: t }] });
const norm = (s) => String(s ?? "").trim().toLowerCase();
const oneLine = (s) => String(s ?? "").replace(/\s+/g, " ").trim();
/** Longest name or query a tool accepts: longer input is refused before any matching, so a huge
 * argument cannot keep the server busy (the closest-name search is quadratic). */
export const MAX_INPUT = 200;
const tooLong = (field, s) => text(`"${field}" is too long (${s.length} characters, at most ${MAX_INPUT}).`, true);

/**
 * Loads docs/gen/components.json. The file is generated and gitignored, so on a fresh clone
 * (or in CI) it is built first with scripts/docs-data.mjs. The npm package ships it ready
 * (`prepack`), since it has no component sources to build it from.
 */
export function loadData(root = ROOT) {
  const file = path.join(root, "docs", "gen", "components.json");
  if (!fs.existsSync(file)) {
    const r = spawnSync(process.execPath, [path.join(root, "scripts", "docs-data.mjs")], {
      cwd: root,
      stdio: ["ignore", "ignore", "inherit"],
    });
    if (r.status !== 0 || !fs.existsSync(file)) throw new Error("tallao docs: could not generate docs/gen/components.json");
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function allEntries(data) {
  return Object.values(data.components);
}

function listComponents(args, data) {
  const fam = norm(args.family);
  if (fam.length > MAX_INPUT) return tooLong("family", fam);
  let families = data.families;
  if (fam) {
    families = families.filter((f) => norm(f.id) === fam || norm(f.title) === fam);
    if (!families.length) {
      return text(`Unknown family "${args.family}". Families: ${data.families.map((f) => `${f.id} (${f.title})`).join(", ")}.`, true);
    }
  }
  const out = [];
  let n = 0;
  for (const f of families) {
    const lines = f.items
      .map((s) => data.components[s])
      .filter(Boolean)
      .map((c) => `${c.name} — ${oneLine(c.purpose)} (${f.title})`);
    n += lines.length;
    out.push(`## ${f.title}`, ...lines, "");
  }
  out.push(`Total: ${n} components.`);
  return text(out.join("\n"));
}

function searchComponents(args, data) {
  const q = norm(args.query);
  if (!q) return text("Give a non-empty query.", true);
  if (q.length > MAX_INPUT) return tooLong("query", q);
  const scored = [];
  for (const c of allEntries(data)) {
    const name = norm(c.name);
    let score = 0;
    if (name === q) score = 5;
    else if (name.startsWith(q)) score = 4;
    else if (name.includes(q)) score = 3;
    else if (norm(c.purpose).includes(q)) score = 2;
    else if ((c.parts ?? []).some((p) => norm(p.name).includes(q))) score = 1;
    if (score) scored.push({ c, score });
  }
  scored.sort((a, b) => b.score - a.score || a.c.name.localeCompare(b.c.name));
  if (!scored.length) return text(`No component matches "${args.query}". Use list_components to browse every component.`);
  const lines = scored.slice(0, 10).map(({ c }) => `${c.name} (${c.slug}) — ${oneLine(c.purpose)}`);
  const more = scored.length > 10 ? `\n${scored.length - 10} more matches not shown; refine the query.` : "";
  return text(lines.join("\n") + more);
}

function levenshtein(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

function closest(q, data) {
  const names = [];
  for (const c of allEntries(data)) {
    names.push(c.name);
    for (const p of c.parts ?? []) names.push(p.name);
  }
  return names
    .map((n) => ({ n, s: q && (norm(n).includes(q) || q.includes(norm(n))) ? 0 : levenshtein(norm(n), q) }))
    .sort((a, b) => a.s - b.s)
    .slice(0, 5)
    .map((x) => x.n);
}

function find(q, data) {
  const list = allEntries(data);
  const direct = list.find((c) => norm(c.name) === q || c.slug === q);
  if (direct) return { c: direct, part: null };
  for (const c of list) {
    const part = (c.parts ?? []).find((p) => norm(p.name) === q);
    if (part) return { c, part };
  }
  return null;
}

function propsTable(props) {
  if (!props?.length) return "No props.";
  const cell = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
  const rows = props.map((p) => {
    const flags = [p.optional ? "" : "required", p.bindable ? "bindable" : ""].filter(Boolean).join(", ");
    const doc = [cell(p.doc), flags ? `(${flags})` : ""].filter(Boolean).join(" ");
    return `| ${cell(p.name)}${p.optional ? "?" : ""} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : ""} | ${doc} |`;
  });
  return ["| Prop | Type | Default | Description |", "| --- | --- | --- | --- |", ...rows].join("\n");
}

function demoCode(slug, root) {
  const file = path.join(root, "docs", "demos", `${slug}.svelte`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, "utf8").replace(/^\s*<!--\s*layout:[^>]*-->\s*\r?\n?/, "").trim();
}

function getComponent(args, data, root) {
  const q = norm(args.name);
  if (q.length > MAX_INPUT) return tooLong("name", q);
  const hit = q && find(q, data);
  if (!hit) return text(`Unknown component "${args.name}". Closest: ${closest(q, data).join(", ")}. Use search_components or list_components.`, true);
  const { c, part } = hit;
  const names = [c.name, ...(c.parts ?? []).map((p) => p.name)];
  const out = [`# ${c.name}`, oneLine(c.purpose)];
  if (part) out.push(`(${part.name} is a part of ${c.name}; this is ${c.name}'s page.)`);
  out.push("", `Import: \`import { ${names.join(", ")} } from "${c.entry}";\``, `Docs: ${DOCS_URL}${c.slug}`, `Source: ${SOURCE_URL}${c.file}`);
  const demo = demoCode(c.slug, root);
  out.push("", "## Usage", "```svelte", demo ?? c.example, "```");
  out.push("", "## Props", propsTable(c.props));
  for (const p of c.parts ?? []) out.push("", `### ${p.name}`, oneLine(p.purpose), propsTable(p.props));
  const details = String(c.details ?? "").split(/\r?\n/).map((l) => l.trim()).join("\n").trim();
  out.push("", "## Behaviour and accessibility", details || "No notes in the header comment.");
  return text(out.join("\n"));
}

function getSetup(root) {
  const file = path.join(root, "llms.txt");
  if (!fs.existsSync(file)) return text("llms.txt not found in the package root.", true);
  const src = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const start = src.indexOf("\n## Use\n");
  if (start < 0) return text('No "## Use" section in llms.txt.', true);
  const body = src.slice(start + 8);
  const end = body.search(/^## /m);
  const section = (end < 0 ? body : body.slice(0, end)).trim();
  return text(
    [
      "# Setup",
      "Install: `pnpm add tallao` (or `npm install tallao`). Requires Svelte 5.29 or later.",
      "",
      section,
      "",
      "- Never invent props, variants or snippets: call get_component and use only what its props table lists.",
    ].join("\n"),
  );
}

/** Runs a tool. `data` is the parsed components.json; `root` is the repository root. */
export function callTool(name, args, data, root = ROOT) {
  args = args && typeof args === "object" ? args : {};
  try {
    switch (name) {
      case "list_components":
        return listComponents(args, data);
      case "search_components":
        return searchComponents(args, data);
      case "get_component":
        return getComponent(args, data, root);
      case "get_setup":
        return getSetup(root);
      default:
        return text(`Unknown tool "${name}".`, true);
    }
  } catch (e) {
    return text(`Tool failed: ${e instanceof Error ? e.message : String(e)}`, true);
  }
}
