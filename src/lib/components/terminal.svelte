<!--
  tallao — Terminal
  What an agent runs, as a terminal window that writes itself: commands are typed one character at
  a time, their output appears a line at a time.

    <Terminal title="agent · ~/app" lines={[
      { kind: "command", text: "pnpm test" },
      { kind: "output", text: "36 files, 506 tests" },
      { kind: "success", text: "All checks passed" },
    ]} />

  - `lines` are `{ kind, text }`: `command` (typed, after the prompt), `output` (the default),
    `success` (✓), `error` (✗), `info` (i) and `comment` (#). The kind is shown by a mark before the
    text, never by colour alone. Plain text: nothing is interpreted as HTML.
  - `speed` is the ms per typed character, `lineDelay` the pause before the next line. It plays
    when it mounts (`autoplay`); with `autoplay={false}` it shows the whole text and waits for the
    Replay button. Giving other `lines` plays it again from the start; `onDone` runs at the end.
  - Screen readers do not hear the typing: the animated lines are `aria-hidden` and a hidden list
    holds the whole transcript from the start, so it reads once, in order, and does not move. The
    group is `aria-busy` while it plays and its name is `label`, the `title` or a default.
  - Replay is a real button (`replay`, on by default), shown when it has finished; its 44px target
    applies under coarse pointers.
  - Reduced motion (the system setting or `data-tallao-motion="reduce"`): everything is shown at
    once, no caret blink, no Replay. On the server (and without JavaScript) the whole text is
    rendered, so nothing is lost.
-->
<script lang="ts" module>
  export type TerminalKind = "command" | "output" | "success" | "error" | "info" | "comment";
  export interface TerminalLine {
    /** `command` is typed after the prompt; the others appear whole. Default `output`. */
    kind?: TerminalKind;
    text: string;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    lines: TerminalLine[];
    /** Shown in the window's bar (a path, a command); also the name of the group when `label` is not given. */
    title?: string;
    /** Accessible name of the transcript. */
    label?: string;
    /** Milliseconds per typed character. */
    speed?: number;
    /** Milliseconds before the next line starts. */
    lineDelay?: number;
    /** Plays when it mounts and when `lines` change; false shows the whole text until Replay. */
    autoplay?: boolean;
    /** The mark before a command. */
    prompt?: string;
    /** Shows the Replay button once it has finished. */
    replay?: boolean;
    /** Name of the Replay button. */
    replayLabel?: string;
    /** It reached the end of `lines`. */
    onDone?: () => void;
    class?: string;
    /** Any other attribute goes to the root element. */
    [key: string]: unknown;
  }

  const {
    lines,
    title,
    label,
    speed = 28,
    lineDelay = 420,
    autoplay = true,
    prompt = "$",
    replay = true,
    replayLabel = L.terminalReplay,
    onDone,
    class: className = "",
    ...rest
  }: Props = $props();

  // The whole text first: that is what the server renders; the browser starts over when it mounts.
  let shown = $state(untrack(() => lines.length));
  let typed = $state(0);
  let playing = $state(false);
  // Reduced motion: shown at once, so there is nothing to replay.
  let still = $state(false);
  let run = $state(0);

  const isCommand = (line: TerminalLine | undefined) => (line?.kind ?? "output") === "command";

  $effect(() => {
    void run;
    const items = lines;
    const perChar = speed;
    const gap = lineDelay;
    if (!autoplay && run === 0) return;
    if (prefersReducedMotion()) {
      still = true;
      shown = items.length;
      typed = 0;
      playing = false;
      return;
    }
    still = false;
    let alive = true;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => {
          timers.delete(t);
          resolve();
        }, ms);
        timers.add(t);
      });
    shown = 0;
    typed = 0;
    playing = true;
    (async () => {
      for (let i = 0; i < items.length; i++) {
        if (!alive) return;
        if (isCommand(items[i])) {
          for (let c = 1; c <= items[i].text.length; c++) {
            typed = c;
            await sleep(perChar);
            if (!alive) return;
          }
        }
        shown = i + 1;
        typed = 0;
        if (i < items.length - 1) await sleep(gap);
      }
      if (!alive) return;
      playing = false;
      untrack(() => onDone?.());
    })();
    return () => {
      alive = false;
      for (const t of timers) clearTimeout(t);
    };
  });

  // The line being typed (or waiting at its prompt) comes after the finished ones.
  const rows = $derived.by(() => {
    const done = lines.slice(0, shown);
    const next = lines[shown];
    if (playing && isCommand(next)) return [...done, { ...next, text: next.text.slice(0, typed) }];
    return done;
  });

  const MARKS: Record<TerminalKind, string> = { command: "", output: "", success: "✓", error: "✗", info: "i", comment: "#" };
  const markOf = (line: TerminalLine) => ((line.kind ?? "output") === "command" ? prompt : MARKS[line.kind ?? "output"]);
</script>

<div {...rest} class={cn("ta-terminal", className)} role="group" aria-label={label ?? title ?? L.terminal} aria-busy={playing}>
  <div class="ta-terminal-bar">
    <span class="ta-terminal-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    {#if title}<span class="ta-terminal-title" aria-hidden="true">{title}</span>{/if}
    {#if replay && !playing && !still && lines.length}
      <button type="button" class="ta-terminal-replay" onclick={() => run++}>{replayLabel}</button>
    {/if}
  </div>
  <div class="ta-terminal-screen" aria-hidden="true">
    {#each rows as line, i (i)}
      <div class={cn("ta-terminal-line", `ta-terminal-line--${line.kind ?? "output"}`)}>
        <span class="ta-terminal-mark">{markOf(line)}</span><span class="ta-terminal-text">{line.text}</span>{#if playing && i === rows.length - 1}<span class="ta-terminal-caret"></span>{/if}
      </div>
    {/each}
  </div>
  <ol class="ta-terminal-sr">
    {#each lines as line, i (i)}<li>{line.text}</li>{/each}
  </ol>
</div>

<style>
  .ta-terminal {
    min-width: 0;
    overflow: hidden;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    font-family: var(--ta-font-mono);
  }

  .ta-terminal-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 2.25rem;
    padding: 0.25rem 0.5rem 0.25rem 0.75rem;
    background: rgb(var(--ta-surface));
    border-bottom: 1px solid rgb(var(--ta-border));
  }
  .ta-terminal-dots {
    display: inline-flex;
    gap: 0.375rem;
  }
  .ta-terminal-dots i {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 50%;
    background: rgb(var(--ta-text) / 0.18);
  }
  .ta-terminal-title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }
  .ta-terminal-replay {
    margin-inline-start: auto;
    padding: 0.2rem 0.6rem;
    font: inherit;
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
    background: transparent;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-terminal-replay:hover {
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-accent));
  }
  .ta-terminal-replay:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }

  .ta-terminal-screen {
    padding: 0.75rem 1rem 1rem;
    font-size: 0.8125rem;
    line-height: 1.65;
    min-height: 3rem;
  }
  .ta-terminal-line {
    display: flex;
    gap: 0.75ch;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .ta-terminal-mark {
    flex: none;
    width: 1.5ch;
    color: rgb(var(--ta-accent-hover));
    user-select: none;
  }
  .ta-terminal-text {
    min-width: 0;
  }
  .ta-terminal-line--output .ta-terminal-text { color: rgb(var(--ta-text-dim)); }
  .ta-terminal-line--comment .ta-terminal-text { color: rgb(var(--ta-text-dim)); font-style: italic; }
  .ta-terminal-line--success .ta-terminal-mark, .ta-terminal-line--success .ta-terminal-text { color: rgb(var(--ta-success)); }
  .ta-terminal-line--error .ta-terminal-mark, .ta-terminal-line--error .ta-terminal-text { color: rgb(var(--ta-danger)); }
  .ta-terminal-line--info .ta-terminal-mark, .ta-terminal-line--info .ta-terminal-text { color: rgb(var(--ta-info)); }

  /* A box of fixed width that follows the last character, so the line never changes height. */
  .ta-terminal-caret {
    display: inline-block;
    flex: none;
    width: 0.55em;
    height: 1.1em;
    margin-left: 0.1em;
    vertical-align: -0.2em;
    background: rgb(var(--ta-accent));
    animation: ta-terminal-blink 1s steps(2, jump-none) infinite;
  }
  @keyframes ta-terminal-blink {
    50% { opacity: 0; }
  }

  /* The whole transcript, for screen readers only. */
  .ta-terminal-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    list-style: none;
  }

  @media (pointer: coarse) {
    .ta-terminal-replay {
      min-height: 2.75rem;
      padding-inline: 1rem;
      font-size: 1rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-terminal-caret {
      animation: none;
    }
  }
  :global([data-tallao-motion="reduce"]) .ta-terminal-caret {
    animation: none;
  }
</style>
