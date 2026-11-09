<!--
  tallao — CodeEditor (tallao/code)
  Code editor on CodeMirror 6 with the kit's theme: line numbers, undo,
  Markdown, JSON or JavaScript/TypeScript highlighting.
  - Before CodeMirror loads (the server render, or without JavaScript) it is a
    real <textarea>: it can be read, edited and, with `name`, submitted in a <form>.
    Once CodeMirror is ready, the textarea is hidden but still submits the value.
  - Tab does not get trapped: it leaves the editor as in any field (CodeMirror does not
    capture Tab by default, and it is not enabled here).
  CodeMirror is in optional peerDependencies: install @codemirror/state, view,
  commands, language, @lezer/highlight and the lang-* for each language you use.
-->
<script lang="ts">
  import { onMount } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  type Language = "markdown" | "json" | "javascript" | "typescript" | "text";

  const L = useLabels();
  let {
    value = $bindable(""),
    language = "text",
    name,
    readonly = false,
    lineNumbers = true,
    ariaLabel = L.codeEditor,
    minHeight = "10rem",
    maxHeight = "28rem",
    class: className = "",
    onchange,
  }: {
    value?: string;
    language?: Language;
    name?: string;
    readonly?: boolean;
    lineNumbers?: boolean;
    ariaLabel?: string;
    minHeight?: string;
    maxHeight?: string;
    class?: string;
    onchange?: (value: string) => void;
  } = $props();

  let box: HTMLElement | undefined = $state();
  let ready = $state(false);
  // The CodeMirror view; no CodeMirror types in the component's public API.
  let view: { state: { doc: { toString(): string } }; dispatch(t: unknown): void; destroy(): void } | null = null;

  async function loadLanguage(lang: Language) {
    try {
      if (lang === "markdown") return (await import("@codemirror/lang-markdown")).markdown();
      if (lang === "json") return (await import("@codemirror/lang-json")).json();
      if (lang === "javascript" || lang === "typescript")
        return (await import("@codemirror/lang-javascript")).javascript({ typescript: lang === "typescript" });
    } catch {
      // That lang-* is not installed: the editor works the same, without highlighting.
    }
    return [];
  }

  onMount(() => {
    let cancelled = false;
    (async () => {
      const [{ EditorState }, cm, commands, languages, { tags: t }] = await Promise.all([
        import("@codemirror/state"),
        import("@codemirror/view"),
        import("@codemirror/commands"),
        import("@codemirror/language"),
        import("@lezer/highlight"),
      ]);
      // Highlighting with the kit's tokens: reads the same in the dark and light themes.
      const highlight = languages.HighlightStyle.define([
        { tag: [t.keyword, t.operatorKeyword, t.modifier], color: "rgb(var(--ta-accent-hover))" },
        { tag: [t.string, t.special(t.string)], color: "rgb(var(--ta-success))" },
        { tag: [t.number, t.bool, t.null, t.atom], color: "rgb(var(--ta-warning))" },
        { tag: [t.propertyName, t.attributeName], color: "rgb(var(--ta-info))" },
        { tag: [t.comment, t.meta, t.processingInstruction], color: "rgb(var(--ta-text-dim))", fontStyle: "italic" },
        { tag: [t.punctuation, t.bracket, t.separator], color: "rgb(var(--ta-text-dim))" },
        { tag: t.heading, fontWeight: "700" },
        { tag: t.strong, fontWeight: "700" },
        { tag: t.emphasis, fontStyle: "italic" },
        { tag: t.strikethrough, textDecoration: "line-through" },
        { tag: [t.link, t.url], color: "rgb(var(--ta-accent-hover))", textDecoration: "underline" },
        { tag: t.monospace, fontFamily: "var(--ta-font-mono)", color: "rgb(var(--ta-info))" },
        { tag: t.invalid, color: "rgb(var(--ta-danger))" },
      ]);
      const extension = await loadLanguage(language);
      if (cancelled || !box) return;
      const { EditorView, keymap, lineNumbers: lineNumbersExt, highlightActiveLine, drawSelection } = cm;
      const theme = EditorView.theme({
        "&": {
          color: "rgb(var(--ta-text))",
          backgroundColor: "rgb(var(--ta-bg))",
          fontSize: "0.8125rem",
          minHeight,
          maxHeight,
        },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": { fontFamily: "var(--ta-font-mono)", overflow: "auto" },
        ".cm-content": { caretColor: "rgb(var(--ta-accent))", padding: "0.5rem 0" },
        ".cm-gutters": {
          color: "rgb(var(--ta-text-dim))",
          backgroundColor: "rgb(var(--ta-surface))",
          borderRight: "1px solid rgb(var(--ta-border))",
        },
        ".cm-activeLine": { backgroundColor: "rgb(var(--ta-elevated) / 0.35)" },
        ".cm-activeLineGutter": { backgroundColor: "rgb(var(--ta-elevated) / 0.5)" },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
          backgroundColor: "rgb(var(--ta-accent) / 0.25)",
        },
      });
      const editorState = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers ? lineNumbersExt() : [],
          highlightActiveLine(),
          drawSelection(),
          commands.history(),
          keymap.of([...commands.defaultKeymap, ...commands.historyKeymap]),
          languages.syntaxHighlighting(highlight),
          extension,
          theme,
          EditorState.readOnly.of(readonly),
          EditorView.editable.of(!readonly),
          EditorView.contentAttributes.of({ "aria-label": ariaLabel, "aria-multiline": "true" }),
          EditorView.updateListener.of((u) => {
            if (!u.docChanged) return;
            value = u.state.doc.toString();
            onchange?.(value);
          }),
        ],
      });
      view = new EditorView({ state: editorState, parent: box });
      ready = true;
    })();
    return () => {
      cancelled = true;
      view?.destroy();
      view = null;
    };
  });

  // A change to `value` from outside reaches the editor (and the one that came from it is not repeated).
  $effect(() => {
    const v = value;
    if (!view) return;
    const current = view.state.doc.toString();
    if (v !== current) view.dispatch({ changes: { from: 0, to: current.length, insert: v } });
  });
</script>

<div class={cn("ta-code", className)}>
  <textarea
    class="ta-code-fallback"
    class:ta-code-fallback--hidden={ready}
    {name}
    bind:value
    {readonly}
    aria-label={ariaLabel}
    aria-hidden={ready ? "true" : undefined}
    tabindex={ready ? -1 : undefined}
    spellcheck="false"
    style:min-height={minHeight}
  ></textarea>
  <div class="ta-code-editor" bind:this={box}></div>
</div>

<style>
  .ta-code {
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    overflow: hidden;
  }
  .ta-code:focus-within {
    border-color: rgb(var(--ta-accent) / 0.5);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }

  .ta-code-fallback {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-family: var(--ta-font-mono);
    font-size: 0.8125rem;
    line-height: 1.5;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: none;
    outline: none;
    resize: vertical;
  }
  /* Hidden but in the form: it still submits the value. */
  .ta-code-fallback--hidden { display: none; }
  @media (pointer: coarse) {
    /* 16px text: iOS does not zoom the page when the editor gets focus. */
    .ta-code-fallback,
    .ta-code-editor :global(.cm-content) { font-size: 1rem; }
    .ta-code-fallback { min-height: 2.75rem; }
  }
</style>
