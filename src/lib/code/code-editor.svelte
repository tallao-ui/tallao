<!--
  tallao — CodeEditor (tallao/code)
  Editor de código sobre CodeMirror 6 con el tema del kit: números de línea, deshacer,
  resaltado de Markdown, JSON o JavaScript/TypeScript.
  - Antes de que cargue CodeMirror (el render del servidor, o sin JavaScript) es un
    <textarea> de verdad: se lee, se edita y, con `name`, se envía en un <form>.
    Cuando CodeMirror está listo, el textarea queda oculto pero sigue enviando el valor.
  - Tab no se queda atrapado: sale del editor como en cualquier campo (CodeMirror no
    captura Tab por defecto, y aquí no se activa).
  CodeMirror va en peerDependencies opcionales: instala @codemirror/state, view,
  commands, language, @lezer/highlight y el lang-* de cada lenguaje que uses.
-->
<script lang="ts">
  import { onMount } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  type Lenguaje = "markdown" | "json" | "javascript" | "typescript" | "text";

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
    language?: Lenguaje;
    name?: string;
    readonly?: boolean;
    lineNumbers?: boolean;
    ariaLabel?: string;
    minHeight?: string;
    maxHeight?: string;
    class?: string;
    onchange?: (value: string) => void;
  } = $props();

  let caja: HTMLElement | undefined = $state();
  let listo = $state(false);
  // La vista de CodeMirror; sin tipos de CodeMirror en la API pública del componente.
  let vista: { state: { doc: { toString(): string } }; dispatch(t: unknown): void; destroy(): void } | null = null;

  async function cargarLenguaje(lenguaje: Lenguaje) {
    try {
      if (lenguaje === "markdown") return (await import("@codemirror/lang-markdown")).markdown();
      if (lenguaje === "json") return (await import("@codemirror/lang-json")).json();
      if (lenguaje === "javascript" || lenguaje === "typescript")
        return (await import("@codemirror/lang-javascript")).javascript({ typescript: lenguaje === "typescript" });
    } catch {
      // Ese lang-* no está instalado: el editor funciona igual, sin resaltado.
    }
    return [];
  }

  onMount(() => {
    let cancelado = false;
    (async () => {
      const [{ EditorState }, cm, comandos, lenguajes, { tags: t }] = await Promise.all([
        import("@codemirror/state"),
        import("@codemirror/view"),
        import("@codemirror/commands"),
        import("@codemirror/language"),
        import("@lezer/highlight"),
      ]);
      // Resaltado con los tokens del kit: se lee igual en el tema oscuro y en el claro.
      const resaltado = lenguajes.HighlightStyle.define([
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
      const extension = await cargarLenguaje(language);
      if (cancelado || !caja) return;
      const { EditorView, keymap, lineNumbers: numeros, highlightActiveLine, drawSelection } = cm;
      const tema = EditorView.theme({
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
      const estado = EditorState.create({
        doc: value,
        extensions: [
          lineNumbers ? numeros() : [],
          highlightActiveLine(),
          drawSelection(),
          comandos.history(),
          keymap.of([...comandos.defaultKeymap, ...comandos.historyKeymap]),
          lenguajes.syntaxHighlighting(resaltado),
          extension,
          tema,
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
      vista = new EditorView({ state: estado, parent: caja });
      listo = true;
    })();
    return () => {
      cancelado = true;
      vista?.destroy();
      vista = null;
    };
  });

  // Un cambio de `value` desde fuera llega al editor (y no se repite el que salió de él).
  $effect(() => {
    const v = value;
    if (!vista) return;
    const actual = vista.state.doc.toString();
    if (v !== actual) vista.dispatch({ changes: { from: 0, to: actual.length, insert: v } });
  });
</script>

<div class={cn("ta-code", className)}>
  <textarea
    class="ta-code-respaldo"
    class:ta-code-respaldo--oculto={listo}
    {name}
    bind:value
    {readonly}
    aria-label={ariaLabel}
    aria-hidden={listo ? "true" : undefined}
    tabindex={listo ? -1 : undefined}
    spellcheck="false"
    style:min-height={minHeight}
  ></textarea>
  <div class="ta-code-editor" bind:this={caja}></div>
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

  .ta-code-respaldo {
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
  /* Oculto pero en el formulario: sigue enviando el valor. */
  .ta-code-respaldo--oculto { display: none; }
</style>
