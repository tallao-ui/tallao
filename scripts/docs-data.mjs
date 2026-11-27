/**
 * tallao — docs data
 *
 * Writes `docs/gen/components.json` from the component sources: for every component its
 * purpose, the header comment (the contract: ARIA pattern, keyboard, SSR), a usage example, its
 * props with types, defaults and docs, and its parts (CardHeader under Card…). The docs app reads
 * that file; nothing in it is written by hand.
 *
 *   node scripts/docs-data.mjs
 *
 * It reuses the parsers of `scripts/llms.mjs`, so `llms.txt` and the docs always say the same.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { braceBody, example, exportsOf, header, parseProps, propsBody, purpose } from "./llms.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPONENTS = path.join(ROOT, "src/lib/components");
const OUT = path.join(ROOT, "docs/gen/components.json");

/** The eight families of the landing, in its order; a part (CardHeader) lives under its parent. */
const FAMILIES = [
  { id: "generative", title: "Generative UI", blurb: "Show what a model is doing, and let a person decide.", items: ["PromptInput", "ChatMessage", "ChatThread", "Thinking", "StreamingText", "Terminal", "EventFeed", "Beam", "ToolChips", "ToolCallCard", "TaskList", "Steps", "ApprovalCard", "ContextCards", "RecommendationCard", "InsightCard", "SuggestionChips", "CodeBlock", "CodeDiff", "Sources", "UsageMeter", "ScenePlayer"] },
  { id: "charts", title: "Charts and BI", blurb: "Charts with a legend and a table with all the data, and the figures of a dashboard.", items: ["BarChart", "LineChart", "DonutChart", "ScatterChart", "RadarChart", "SankeyChart", "Heatmap", "CalendarHeatmap", "Funnel", "BarList", "Sparkline", "Gauge", "ChartLegend", "KpiCard", "BigNumber", "RollingCounter", "IconArray", "Timeline", "ComparisonBar", "SegmentedBar", "CohortGrid", "DashboardGrid", "ChartCard"] },
  { id: "admin", title: "Admin pages", blurb: "The blocks of a list page and a record detail page, inside an AppShell or a kon view.", items: ["AppShell", "PageHeader", "FilterBar", "SavedViews", "EmptyState", "SaveBar", "DiffView", "DescriptionList", "Kbd", "ShortcutList", "SyncStatus"] },
  { id: "data", title: "Data", blurb: "Tables with sorting, filters, density and pinned row actions; drag between zones with the keyboard too.", items: ["Table", "DataTable", "MonthView", "CompareSlider", "SelectionBar", "DragBoard", "SortableList", "GameMap"] },
  { id: "actions", title: "Actions and feedback", blurb: "Buttons, status and loading states, and notifications in an aria-live region.", items: ["Button", "Badge", "Spinner", "Alert", "Progress", "Skeleton", "Toaster", "CopyButton", "Stat", "Icon", "Avatar"] },
  { id: "overlays", title: "Overlays and menus", blurb: "Built on the native <dialog> and the Popover API: focus is contained and restored.", items: ["Dialog", "Sheet", "ConfirmDialog", "Popover", "Tooltip", "DropdownMenu", "ContextMenu", "Command"] },
  { id: "forms", title: "Forms", blurb: "Native controls, with name so SvelteKit form actions work without JavaScript.", items: ["Input", "Textarea", "Select", "Checkbox", "Label", "Field", "SearchInput", "NumberInput", "Slider", "Switch", "Toggle", "ToggleGroup", "RadioGroup", "Rating", "InputOTP", "Combobox", "KeyValueEditor", "TagInput", "PasswordInput", "FileUpload", "Calendar", "DatePicker", "DateRangePicker", "SchemaForm", "CodeEditor"] },
  { id: "layout", title: "Navigation and layout", blurb: "The app shell. NavMenu, MegaMenu and BottomNav are <details>-based and work with no hydration.", items: ["Card", "Tabs", "DocumentTabs", "Accordion", "Breadcrumb", "Pagination", "Sidebar", "TreeView", "NavMenu", "MegaMenu", "BottomNav", "SplitPane", "Carousel", "CardStack", "ThemeScope", "FloatingScene", "ProgressiveBlur", "ReadingProgress"] },
];

const PARTS = {
  Card: ["CardHeader", "CardTitle", "CardContent", "CardFooter"],
  Table: ["TableHeader", "TableBody", "TableRow", "TableHead", "TableCell"],
  DropdownMenu: ["MenuItem", "MenuSeparator", "MenuLabel"],
  DragBoard: ["DropZone", "DragItem"],
  DashboardGrid: ["DashboardItem"],
  FilterBar: ["FilterChip"],
};

/** Where a header comment's first sentence is not a good one-line description (a title, or cut at a parenthesis). */
const PURPOSE = {
  Button: "The button: seven variants, four sizes, a loading state, and a real link when it has an href.",
  Tooltip: "Short text that describes a control, on hover or when it gets keyboard focus.",
  DescriptionList: "Label / value pairs of a record, like its “About” panel.",
  Combobox: "A text field with a list of options filtered as you type.",
  ScatterChart: "Two measures against each other, one point per item.",
  Gauge: "One value inside a known range, as a half dial or a full ring.",
  Funnel: "How many make it through each step of a sequence.",
  Label: "A standalone label, for when the control is not inside a Field.",
  KeyValueEditor: "A list of key → value pairs, each with a remove button, plus a row to add another.",
  Table: "A table container with a rounded border and safe horizontal scrolling.",
};

const kebab = (name) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

/** Splits at top-level commas, ignoring strings and nested brackets. */
function splitTop(text) {
  const out = [];
  let depth = 0;
  let quote = "";
  let current = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      current += ch;
      if (ch === "\\") current += text[++i] ?? "";
      else if (ch === quote) quote = "";
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    if ("{([".includes(ch)) depth++;
    else if ("})]".includes(ch)) depth--;
    if (ch === "," && depth === 0) {
      out.push(current);
      current = "";
    } else current += ch;
  }
  if (current.trim()) out.push(current);
  return out;
}

/** `{ a = 1, b = $bindable(2), ...rest }: Props = $props()` → { a: { value: "1" }, b: { value: "2", bindable: true } }. */
function defaultsOf(source) {
  const call = source.indexOf("$props()");
  if (call < 0) return {};
  const opens = [...source.slice(0, call).matchAll(/(?:let|const)\s*\{/g)];
  const open = opens.at(-1);
  if (!open) return {};
  let body = braceBody(source, open.index + open[0].length - 1);
  body = body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  const defaults = {};
  for (const item of splitTop(body)) {
    const text = item.trim();
    const m = text.match(/^(\w+)(?:\s*:\s*\w+)?(?:\s*=\s*([\s\S]+))?$/);
    if (!m) continue;
    const bind = m[2]?.match(/^\$bindable\(([\s\S]*)\)$/);
    const value = (bind ? bind[1] : (m[2] ?? "")).replace(/\s+/g, " ").trim();
    defaults[m[1]] = { value, bindable: !!bind };
  }
  return defaults;
}

function describe(name, file, entry) {
  const source = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const defaults = defaultsOf(source);
  const props = parseProps(propsBody(source)).map((p) => ({
    ...p,
    default: defaults[p.name]?.value || "",
    bindable: !!defaults[p.name]?.bindable,
  }));
  return {
    name,
    slug: kebab(name),
    file: path.relative(ROOT, file).replace(/\\/g, "/"),
    entry,
    purpose: PURPOSE[name] ?? purpose(source, name),
    details: header(source, name).body,
    example: example(source, name, props),
    // The generated example (required props only) is a placeholder; a header snippet is a real one.
    exampleFromHeader: new RegExp(`^\\s{2,}<${name}([\\s/>]|$)`, "m").test(header(source, name).comment),
    props,
  };
}

const lookup = new Map();
for (const { name, file } of exportsOf(path.join(COMPONENTS, "index.ts"))) lookup.set(name, { file, entry: "tallao" });
lookup.set("GameMap", { file: path.join(ROOT, "src/lib/map/game-map.svelte"), entry: "tallao/map" });
lookup.set("CodeEditor", { file: path.join(ROOT, "src/lib/code/code-editor.svelte"), entry: "tallao/code" });

const placed = new Set(Object.values(PARTS).flat());
const components = {};
const families = [];
for (const fam of FAMILIES) {
  const slugs = [];
  for (const name of fam.items) {
    const hit = lookup.get(name);
    if (!hit) throw new Error(`docs-data: ${name} is not exported`);
    const doc = describe(name, hit.file, hit.entry);
    doc.family = fam.id;
    doc.parts = (PARTS[name] ?? []).map((p) => {
      const part = lookup.get(p);
      if (!part) throw new Error(`docs-data: part ${p} is not exported`);
      return describe(p, part.file, part.entry);
    });
    components[doc.slug] = doc;
    slugs.push(doc.slug);
  }
  families.push({ id: fam.id, title: fam.title, blurb: fam.blurb, items: slugs });
}

const listed = new Set([...FAMILIES.flatMap((f) => f.items), ...placed]);
const missing = [...lookup.keys()].filter((n) => !listed.has(n));
if (missing.length) throw new Error(`docs-data: not in any family: ${missing.join(", ")}`);

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, "package.json"), "utf8"));
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify({ version: pkg.version, total: lookup.size, pages: Object.keys(components).length, families, components }, null, 1));
console.log(`docs data: ${Object.keys(components).length} pages, ${lookup.size} components → ${path.relative(ROOT, OUT)}`);
