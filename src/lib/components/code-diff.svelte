<!--
  tallao — CodeDiff
  A line diff of two code texts, as a review or a "what did the model change" view shows it.
  DiffView compares the fields of a record; this compares text.

    <CodeDiff before={oldSource} after={newSource} beforeLabel="Current" afterLabel="Proposed" />

  - `diffLines(before, after, { normalize })` (exported, pure) is a Myers O(ND) line diff with the
    common head and tail trimmed first; past 2000 edits it falls back to "all removed, then all
    added" instead of burning time. Inside a run of removed lines followed by added ones, lines
    are paired one to one and the changed characters (the middle between the common prefix and
    suffix) are returned as `marks`. A final newline is not a line of its own.
  - The header says `+A −R` in text, with the same counts in words for a screen reader. Every
    changed line has a sign column ("+" / "−") and visually hidden text ("Added" / "Removed"); the
    changed characters are an `<ins>` (underlined, heavier) or a `<del>` (struck through), so
    colour is never the only cue. Line numbers are `aria-hidden`.
  - `mode="split"` is two columns, before | after, aligned row by row; on a narrow container it
    falls back to the unified view (measured in the browser, so the server draws the requested one).
  - Runs of unchanged lines longer than `context` lines around a change fold into a button row
    ("12 unchanged lines", `aria-expanded`); `fold={false}` shows everything.
  - Semantics: a `<figure>` named by `ariaLabel`, a `role="list"` of lines. Monospace, `white-space:
    pre` (`pre-wrap` with `wrap`), `tab-size: 8`. With no differences it shows `emptyText`.
    `actions` puts extra controls (copy buttons…) in the header. Same HTML on the server.
-->
<script lang="ts" module>
  export type CodeDiffKind = "same" | "add" | "del";

  export interface DiffLine {
    kind: CodeDiffKind;
    text: string;
    /** 1-based line number in the "before" text (not on added lines). */
    beforeNo?: number;
    /** 1-based line number in the "after" text (not on removed lines). */
    afterNo?: number;
    /** For paired removed / added lines: `[start, end)` ranges of the changed characters in `text`. */
    marks?: [number, number][];
  }

  /** The most edits (removed + added lines) the Myers search looks for before giving up. */
  const MAX_EDITS = 2000;

  type Op = { kind: CodeDiffKind; a: number; b: number };

  /** Myers O(ND) shortest edit script between two key lists, or `null` past `maxD` edits. */
  function myers(a: string[], b: string[], maxD: number): Op[] | null {
    const N = a.length;
    const M = b.length;
    const max = Math.min(N + M, maxD);
    const off = max + 1;
    const v = new Int32Array(2 * max + 3);
    const trace: Int32Array[] = [];
    let found = -1;
    for (let d = 0; d <= max && found < 0; d++) {
      trace.push(v.slice(off - d - 1, off + d + 2));
      for (let k = -d; k <= d; k += 2) {
        let x = k === -d || (k !== d && v[off + k - 1] < v[off + k + 1]) ? v[off + k + 1] : v[off + k - 1] + 1;
        let y = x - k;
        while (x < N && y < M && a[x] === b[y]) {
          x++;
          y++;
        }
        v[off + k] = x;
        if (x >= N && y >= M) {
          found = d;
          break;
        }
      }
    }
    if (found < 0) return null;

    const ops: Op[] = [];
    let x = N;
    let y = M;
    for (let d = found; d > 0; d--) {
      const snap = trace[d];
      const base = off - d - 1;
      const at = (k: number) => snap[off + k - base];
      const k = x - y;
      const prevK = k === -d || (k !== d && at(k - 1) < at(k + 1)) ? k + 1 : k - 1;
      const prevX = at(prevK);
      const prevY = prevX - prevK;
      while (x > prevX && y > prevY) {
        ops.push({ kind: "same", a: x - 1, b: y - 1 });
        x--;
        y--;
      }
      if (prevK === k + 1) ops.push({ kind: "add", a: -1, b: prevY });
      else ops.push({ kind: "del", a: prevX, b: -1 });
      x = prevX;
      y = prevY;
    }
    while (x > 0 && y > 0) {
      ops.push({ kind: "same", a: x - 1, b: y - 1 });
      x--;
      y--;
    }
    return ops.reverse();
  }

  /**
   * The line diff of two texts split into lines. Removed lines come before the added ones that
   * replace them. `normalize` maps each line before comparing (trim trailing spaces, lowercase…);
   * the text shown is the line as it is.
   */
  export function diffLines(before: string[], after: string[], opts: { normalize?: (line: string) => string } = {}): DiffLine[] {
    const norm = opts.normalize ?? ((l: string) => l);
    const ka = before.map(norm);
    const kb = after.map(norm);

    // The common head and tail need no search.
    let head = 0;
    while (head < ka.length && head < kb.length && ka[head] === kb[head]) head++;
    let tail = 0;
    while (tail < ka.length - head && tail < kb.length - head && ka[ka.length - 1 - tail] === kb[kb.length - 1 - tail]) tail++;

    const midA = ka.slice(head, ka.length - tail);
    const midB = kb.slice(head, kb.length - tail);
    let ops: Op[] | null;
    if (midA.length === 0 || midB.length === 0) {
      ops = [...midA.map((_, i): Op => ({ kind: "del", a: i, b: -1 })), ...midB.map((_, i): Op => ({ kind: "add", a: -1, b: i }))];
    } else {
      ops = myers(midA, midB, MAX_EDITS);
      // Too different to align: the whole middle was replaced.
      ops ??= [...midA.map((_, i): Op => ({ kind: "del", a: i, b: -1 })), ...midB.map((_, i): Op => ({ kind: "add", a: -1, b: i }))];
    }

    const out: DiffLine[] = [];
    for (let i = 0; i < head; i++) out.push({ kind: "same", text: after[i], beforeNo: i + 1, afterNo: i + 1 });
    let run: DiffLine[] = [];
    const flush = () => {
      if (!run.length) return;
      const dels = run.filter((l) => l.kind === "del");
      const adds = run.filter((l) => l.kind === "add");
      for (let i = 0; i < Math.min(dels.length, adds.length); i++) markPair(dels[i], adds[i]);
      out.push(...dels, ...adds);
      run = [];
    };
    for (const op of ops) {
      if (op.kind === "same") {
        flush();
        out.push({ kind: "same", text: after[head + op.b], beforeNo: head + op.a + 1, afterNo: head + op.b + 1 });
      } else if (op.kind === "del") {
        run.push({ kind: "del", text: before[head + op.a], beforeNo: head + op.a + 1 });
      } else {
        run.push({ kind: "add", text: after[head + op.b], afterNo: head + op.b + 1 });
      }
    }
    flush();
    for (let i = 0; i < tail; i++) {
      const bi = before.length - tail + i;
      const ai = after.length - tail + i;
      out.push({ kind: "same", text: after[ai], beforeNo: bi + 1, afterNo: ai + 1 });
    }
    return out;
  }

  /** Marks what changed between a removed line and the added line that replaces it. */
  function markPair(del: DiffLine, add: DiffLine) {
    const a = del.text;
    const b = add.text;
    let p = 0;
    while (p < a.length && p < b.length && a[p] === b[p]) p++;
    let s = 0;
    while (s < a.length - p && s < b.length - p && a[a.length - 1 - s] === b[b.length - 1 - s]) s++;
    // Nothing in common: the whole line changed, which marking would only repeat.
    if (p === 0 && s === 0) return;
    if (p < a.length - s) del.marks = [[p, a.length - s]];
    if (p < b.length - s) add.marks = [[p, b.length - s]];
  }

  /** A text as lines: `\r\n` or `\n`; the newline that ends the text does not start another line. */
  function toLines(text: string): string[] {
    if (text === "") return [];
    const lines = text.split(/\r?\n/);
    if (lines.length > 1 && lines[lines.length - 1] === "") lines.pop();
    return lines;
  }

  type Row =
    | { type: "fold"; id: number; count: number }
    | { type: "line"; line: DiffLine }
    | { type: "pair"; left?: DiffLine; right?: DiffLine };
</script>

<script lang="ts">
  import type { Snippet } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    /** The old text. */
    before: string;
    /** The new text. */
    after: string;
    /** `split`: two columns, before | after, aligned row by row (unified on a narrow container). */
    mode?: "unified" | "split";
    /** Name of the old side. */
    beforeLabel?: string;
    /** Name of the new side. */
    afterLabel?: string;
    /** Accessible name of the diff. */
    ariaLabel?: string;
    lineNumbers?: boolean;
    /** Unchanged lines kept around each change; longer runs fold into a button. */
    context?: number;
    /** `false` shows every unchanged line. */
    fold?: boolean;
    /** Maps a line before comparing, to ignore trailing spaces, case… */
    normalize?: (line: string) => string;
    /** Maximum height before scrolling (CSS). */
    maxHeight?: string;
    /** Wrap long lines instead of scrolling sideways. */
    wrap?: boolean;
    /** Extra controls in the header (copy buttons…), given the counts. */
    actions?: Snippet<[{ added: number; removed: number }]>;
    /** Shown when the texts have no differences. */
    emptyText?: string;
    class?: string;
    [key: string]: unknown;
  }

  const {
    before,
    after,
    mode = "unified",
    beforeLabel,
    afterLabel,
    ariaLabel,
    lineNumbers = true,
    context = 3,
    fold = true,
    normalize,
    maxHeight = "28rem",
    wrap = false,
    actions,
    emptyText,
    class: className = "",
    ...rest
  }: Props = $props();

  const lines = $derived(diffLines(toLines(before), toLines(after), { normalize }));
  const added = $derived(lines.filter((l) => l.kind === "add").length);
  const removed = $derived(lines.filter((l) => l.kind === "del").length);

  // Measured in the browser: the server draws the requested mode.
  let width = $state(0);
  const split = $derived(mode === "split" && !(width > 0 && width < 560));

  /** The folds the reader opened, by the index of their first line; reset when the diff changes. */
  let open = $state<Record<number, boolean>>({});
  $effect.pre(() => {
    void lines;
    open = {};
  });

  /** Which lines stay visible: the changes and `context` lines around them. */
  const keep = $derived.by(() => {
    const keep = new Array<boolean>(lines.length).fill(!fold);
    if (!fold) return keep;
    const c = Math.max(0, context);
    lines.forEach((l, i) => {
      if (l.kind === "same") return;
      for (let j = Math.max(0, i - c); j <= Math.min(lines.length - 1, i + c); j++) keep[j] = true;
    });
    return keep;
  });

  /** The lines and the folds between them, in the order they are drawn. */
  const entries = $derived.by(() => {
    const out: ({ type: "line"; line: DiffLine } | { type: "fold"; id: number; count: number; lines: DiffLine[] })[] = [];
    let i = 0;
    while (i < lines.length) {
      if (keep[i]) {
        out.push({ type: "line", line: lines[i++] });
        continue;
      }
      const start = i;
      while (i < lines.length && !keep[i]) i++;
      // One line is no shorter than the button that would replace it.
      if (i - start < 2) for (let j = start; j < i; j++) out.push({ type: "line", line: lines[j] });
      else out.push({ type: "fold", id: start, count: i - start, lines: lines.slice(start, i) });
    }
    return out;
  });

  /** Split mode pairs the removed and added lines of a run row by row. */
  function pair(ls: DiffLine[]): Row[] {
    const rows: Row[] = [];
    let dels: DiffLine[] = [];
    let adds: DiffLine[] = [];
    const flush = () => {
      for (let i = 0; i < Math.max(dels.length, adds.length); i++) rows.push({ type: "pair", left: dels[i], right: adds[i] });
      dels = [];
      adds = [];
    };
    for (const l of ls) {
      if (l.kind === "del") dels.push(l);
      else if (l.kind === "add") adds.push(l);
      else {
        flush();
        rows.push({ type: "pair", left: l, right: l });
      }
    }
    flush();
    return rows;
  }

  const rows = $derived.by(() => {
    const out: Row[] = [];
    for (const e of entries) {
      if (e.type === "fold") {
        out.push({ type: "fold", id: e.id, count: e.count });
        if (open[e.id]) out.push(...e.lines.map((line): Row => ({ type: "line", line })));
      } else out.push(e);
    }
    // Pairing needs whole runs: in split mode the visible lines are paired together.
    if (!split) return out;
    const paired: Row[] = [];
    let run: DiffLine[] = [];
    const flush = () => {
      paired.push(...pair(run));
      run = [];
    };
    for (const r of out) {
      if (r.type === "line") run.push(r.line);
      else {
        flush();
        paired.push(r);
      }
    }
    flush();
    return paired;
  });

  const name = $derived(ariaLabel ?? L.codeDiff);
  const titled = $derived(!!(beforeLabel || afterLabel));

  const sign = (k: CodeDiffKind) => (k === "add" ? "+" : k === "del" ? "−" : "");

  /** The text of a line cut at its marks, to wrap each changed part in `<ins>` / `<del>`. */
  function pieces(line: DiffLine): { text: string; mark: boolean }[] {
    if (!line.marks?.length) return [{ text: line.text, mark: false }];
    const out: { text: string; mark: boolean }[] = [];
    let at = 0;
    for (const [s, e] of line.marks) {
      if (s > at) out.push({ text: line.text.slice(at, s), mark: false });
      out.push({ text: line.text.slice(s, e), mark: true });
      at = e;
    }
    if (at < line.text.length) out.push({ text: line.text.slice(at), mark: false });
    return out;
  }
</script>

{#snippet code(line: DiffLine)}
  {#each pieces(line) as p}{#if p.mark}{#if line.kind === "add"}<ins>{p.text}</ins>{:else}<del>{p.text}</del>{/if}{:else}{p.text}{/if}{/each}
{/snippet}

{#snippet cell(line: DiffLine | undefined, side: "before" | "after")}
  <div class={cn("ta-cd-cell", line ? `ta-cd-cell--${line.kind}` : "ta-cd-cell--empty")} data-side={side}>
    {#if lineNumbers}<span class="ta-cd-no" aria-hidden="true">{line ? (side === "before" ? line.beforeNo : line.afterNo) : ""}</span>{/if}
    <span class="ta-cd-sign" aria-hidden="true">{line ? sign(line.kind) : ""}</span>
    {#if line && line.kind !== "same"}<span class="ta-cd-hidden">{line.kind === "add" ? L.added : L.removed}</span>{/if}
    <span class="ta-cd-text">{#if line}{@render code(line)}{/if}</span>
  </div>
{/snippet}

<figure {...rest} class={cn("ta-cd", split && "ta-cd--split", wrap && "ta-cd--wrap", !lineNumbers && "ta-cd--nonumbers", className)} aria-label={name} bind:clientWidth={width}>
  <figcaption class="ta-cd-header">
    {#if titled}<span class="ta-cd-title">{beforeLabel ?? L.diffBefore} → {afterLabel ?? L.diffAfter}</span>{/if}
    <span class="ta-cd-counts">
      <span aria-hidden="true"><span class="ta-cd-count ta-cd-count--add">+{added}</span> <span class="ta-cd-count ta-cd-count--del">−{removed}</span></span>
      <span class="ta-cd-hidden">{L.linesAdded.replace("{n}", String(added))}, {L.linesRemoved.replace("{n}", String(removed))}</span>
    </span>
    {#if actions}<span class="ta-cd-actions">{@render actions({ added, removed })}</span>{/if}
  </figcaption>

  {#if added + removed === 0}
    <p class="ta-cd-empty">{emptyText ?? L.noDifferences}</p>
  {:else}
    <div class="ta-cd-body" style:max-height={maxHeight}>
      {#if split}
        <div class="ta-cd-heads" aria-hidden="true">
          <span>{beforeLabel ?? L.diffBefore}</span>
          <span>{afterLabel ?? L.diffAfter}</span>
        </div>
      {/if}
      <div class="ta-cd-lines" role="list" aria-label={name}>
        {#each rows as row, i (row.type === "fold" ? `f${row.id}` : `r${i}`)}
          {#if row.type === "fold"}
            <div role="listitem" class="ta-cd-fold">
              <button type="button" class="ta-cd-fold-btn" aria-expanded={!!open[row.id]} onclick={() => (open[row.id] = !open[row.id])}>
                <span aria-hidden="true">{open[row.id] ? "▾" : "▸"}</span>
                <span>{L.unchangedLines.replace("{n}", String(row.count))}</span>
              </button>
            </div>
          {:else if row.type === "pair"}
            <div role="listitem" class="ta-cd-row ta-cd-row--split">
              {@render cell(row.left, "before")}
              {@render cell(row.right, "after")}
            </div>
          {:else}
            <div role="listitem" class={cn("ta-cd-row", `ta-cd-row--${row.line.kind}`)}>
              {#if lineNumbers}
                <span class="ta-cd-no" aria-hidden="true">{row.line.beforeNo ?? ""}</span>
                <span class="ta-cd-no" aria-hidden="true">{row.line.afterNo ?? ""}</span>
              {/if}
              <span class="ta-cd-sign" aria-hidden="true">{sign(row.line.kind)}</span>
              {#if row.line.kind !== "same"}<span class="ta-cd-hidden">{row.line.kind === "add" ? L.added : L.removed}</span>{/if}
              <span class="ta-cd-text">{@render code(row.line)}</span>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</figure>

<style>
  .ta-cd {
    margin: 0;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    background: rgb(var(--ta-bg));
    overflow: hidden;
  }

  .ta-cd-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem 0.75rem;
    padding: 0.375rem 0.5rem 0.375rem 0.75rem;
    border-bottom: 1px solid rgb(var(--ta-border));
    background: rgb(var(--ta-surface));
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }
  .ta-cd-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: rgb(var(--ta-text));
  }
  .ta-cd-counts {
    font-family: var(--ta-font-mono);
    font-weight: 600;
  }
  .ta-cd-count--add { color: color-mix(in srgb, rgb(var(--ta-success)), rgb(var(--ta-text)) var(--ta-tone-ink, 0%)); }
  .ta-cd-count--del { color: color-mix(in srgb, rgb(var(--ta-danger)), rgb(var(--ta-text)) var(--ta-tone-ink, 0%)); }
  .ta-cd-actions {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    margin-inline-start: auto;
  }

  .ta-cd-empty {
    margin: 0;
    padding: 1rem;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-cd-body {
    overflow: auto;
    font-family: var(--ta-font-mono);
    font-size: 0.8125rem;
    line-height: 1.6;
    color: rgb(var(--ta-text));
    tab-size: 8;
  }
  .ta-cd-lines {
    width: max-content;
    min-width: 100%;
  }
  .ta-cd--wrap .ta-cd-lines {
    width: auto;
  }

  .ta-cd-row,
  .ta-cd-cell {
    position: relative;
    display: flex;
    align-items: flex-start;
    min-height: 1.6em;
  }
  .ta-cd-row--split {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
  .ta-cd-cell + .ta-cd-cell {
    border-inline-start: 1px solid rgb(var(--ta-border));
  }

  .ta-cd-no {
    flex: none;
    min-width: 3ch;
    padding: 0 0.5ch;
    text-align: end;
    user-select: none;
    color: rgb(var(--ta-text-dim));
    opacity: 0.85;
  }
  .ta-cd-sign {
    flex: none;
    width: 2ch;
    text-align: center;
    user-select: none;
    font-weight: 700;
  }
  .ta-cd-text {
    flex: 1 1 auto;
    min-width: 0;
    padding-inline-end: 0.75rem;
    white-space: pre;
  }
  .ta-cd--wrap .ta-cd-text {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .ta-cd--split .ta-cd-text {
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .ta-cd--wrap.ta-cd--split .ta-cd-text {
    overflow-x: visible;
  }

  .ta-cd-row--add,
  .ta-cd-cell--add { background: rgb(var(--ta-success) / 0.12); }
  .ta-cd-row--del,
  .ta-cd-cell--del { background: rgb(var(--ta-danger) / 0.12); }
  .ta-cd-cell--empty { background: rgb(var(--ta-elevated) / 0.4); }
  .ta-cd-row--add .ta-cd-sign,
  .ta-cd-cell--add .ta-cd-sign { background: rgb(var(--ta-success) / 0.3); }
  .ta-cd-row--del .ta-cd-sign,
  .ta-cd-cell--del .ta-cd-sign { background: rgb(var(--ta-danger) / 0.3); }
  .ta-cd-row--add .ta-cd-no,
  .ta-cd-cell--add .ta-cd-no { background: rgb(var(--ta-success) / 0.2); }
  .ta-cd-row--del .ta-cd-no,
  .ta-cd-cell--del .ta-cd-no { background: rgb(var(--ta-danger) / 0.2); }

  /* The changed characters: a stronger tint AND an underline (added) or a strike-through (removed). */
  .ta-cd ins,
  .ta-cd del {
    color: inherit;
    font-weight: 700;
    border-radius: 2px;
  }
  .ta-cd ins {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;
    text-decoration-color: rgb(var(--ta-success));
    background: rgb(var(--ta-success) / 0.35);
  }
  .ta-cd del {
    text-decoration: line-through;
    text-decoration-thickness: 2px;
    text-decoration-color: rgb(var(--ta-danger));
    background: rgb(var(--ta-danger) / 0.35);
  }

  .ta-cd-heads {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    position: sticky;
    top: 0;
    z-index: 1;
    border-bottom: 1px solid rgb(var(--ta-border));
    background: rgb(var(--ta-surface));
    font-family: var(--ta-font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--ta-text-dim));
  }
  .ta-cd-heads > span {
    padding: 0.25rem 0.75rem;
  }

  .ta-cd-fold { background: rgb(var(--ta-surface)); }
  .ta-cd-fold-btn {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.125rem 0.75rem;
    font: inherit;
    font-size: 0.75rem;
    text-align: start;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    cursor: pointer;
  }
  .ta-cd-fold-btn:hover {
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-elevated));
  }
  .ta-cd-fold-btn:focus-visible {
    outline: 2px solid rgb(var(--ta-accent) / 0.7);
    outline-offset: -2px;
  }

  .ta-cd-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @media (pointer: coarse) {
    .ta-cd-fold-btn { min-height: 2.75rem; }
  }
</style>
