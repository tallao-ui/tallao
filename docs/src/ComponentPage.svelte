<!--
  One component's page: the live demo with its code, how to install it, its usage, its props and
  its contract (keyboard, ARIA, SSR), all but the demo read from the component's own source.
-->
<script lang="ts">
  import { blocksOf, docs, highlight, inline, loadDemo, NEW, order, pageOf, type Demo, type Doc } from "./registry";
  import { fill, type Lang, type Strings } from "./i18n";
  import Scope from "./Scope.svelte";

  let { slug, lang, t }: { slug: string; lang: Lang; t: Strings } = $props();

  const c = $derived(docs.components[slug]);
  const pos = $derived(pageOf(slug)!);
  const at = $derived(order.findIndex((p) => p.slug === slug));
  const prev = $derived(order[at - 1]);
  const next = $derived(order[at + 1]);

  /** `undefined`: loading; `null`: no demo for this component yet. */
  let demo = $state<Demo | null | undefined>(undefined);
  let tab = $state<"preview" | "code">("preview");
  let nonce = $state(0);
  let copied = $state("");

  $effect(() => {
    const s = slug;
    demo = undefined;
    tab = "preview";
    let live = true;
    loadDemo(s)
      .then((d) => live && (demo = d))
      .catch(() => live && (demo = null));
    return () => (live = false);
  });

  const importLine = $derived(`import { ${[c.name, ...c.parts.map((p) => p.name)].join(", ")} } from "${c.entry}";`);
  const codeShown = $derived(demo?.code ?? c.example);
  const blocks = $derived(blocksOf(c.details, c.purpose));
  const showUsage = $derived(c.exampleFromHeader || demo === null);
  const entries = $derived([c, ...c.parts] as Doc[]);

  async function copy(id: string, text: string) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.append(ta);
      ta.select();
      try {
        ok = document.execCommand("copy");
      } catch {}
      ta.remove();
    }
    copied = ok ? id : "!" + id;
    setTimeout(() => (copied = ""), 2000);
  }
  const label = (id: string) => (copied === id ? t.copied : copied === "!" + id ? t.copyFailed : t.copy);

  function onTabKey(e: KeyboardEvent) {
    const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    tab = e.key === "ArrowLeft" || e.key === "Home" ? "preview" : "code";
    queueMicrotask(() => document.getElementById(`tab-${tab}`)?.focus());
  }
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
</script>

<article class="page">
  <p class="mono kicker">
    <span>[ {pos.family.title} · {String(pos.index).padStart(2, "0")}/{String(pos.of).padStart(2, "0")} ]</span>
    <a href={`https://github.com/tallao-ui/tallao/blob/main/${c.file}`}>{c.file.replace("src/lib/", "")}</a>
  </p>
  <h1 class="page-t">{c.name}{#if NEW.has(slug)}<i class="new new-lg">{t.newBadge}</i>{/if}</h1>
  {#if c.purpose}<p class="lead">{c.purpose}</p>{/if}

  <nav class="jump" aria-label={t.jump}>
    <button type="button" onclick={() => jump("preview")}>{t.preview}</button>
    <button type="button" onclick={() => jump("install")}>{t.install}</button>
    {#if showUsage}<button type="button" onclick={() => jump("usage")}>{t.usage}</button>{/if}
    <button type="button" onclick={() => jump("api")}>{t.api}</button>
    {#if blocks.length}<button type="button" onclick={() => jump("behaviour")}>{t.behaviour}</button>{/if}
  </nav>

  <!-- Preview and code -->
  <section id="preview" class="block" aria-label={t.preview}>
    <div class="tabs-row">
      <div class="tabs" role="tablist" aria-label={c.name} tabindex="-1" onkeydown={onTabKey}>
        <button type="button" role="tab" id="tab-preview" aria-selected={tab === "preview"} aria-controls="panel-preview" tabindex={tab === "preview" ? 0 : -1} onclick={() => (tab = "preview")}>{t.preview}</button>
        <button type="button" role="tab" id="tab-code" aria-selected={tab === "code"} aria-controls="panel-code" tabindex={tab === "code" ? 0 : -1} onclick={() => (tab = "code")}>{t.code}</button>
      </div>
      <div class="tools">
        {#if tab === "preview" && demo}<button type="button" class="mini" onclick={() => nonce++}>{t.reset}</button>{/if}
        {#if tab === "code"}<button type="button" class="mini" onclick={() => copy("code", codeShown)} aria-live="polite">{label("code")}</button>{/if}
      </div>
    </div>

    <div role="tabpanel" id="panel-preview" aria-labelledby="tab-preview" tabindex="-1" hidden={tab !== "preview"}>
      {#if demo === undefined}
        <div class="stage stage--center"><p class="mono">{t.loading}</p></div>
      {:else if demo === null}
        <div class="stage stage--center nodemo-note"><p>{t.noDemo}</p></div>
      {:else}
        {#key `${slug}-${lang}-${nonce}`}
          <div class={`stage stage--${demo.layout}`} style:min-height={demo.height ? `${demo.height}rem` : undefined} role="group" aria-label={fill(t.stageLabel, { name: c.name })}>
            <Scope {lang}>
              <svelte:boundary>
                <demo.component />
                {#snippet failed(error)}
                  <p class="demo-fail mono">{t.demoFailed}: {String((error as Error)?.message ?? error)}</p>
                {/snippet}
              </svelte:boundary>
            </Scope>
          </div>
        {/key}
      {/if}
    </div>
    <div role="tabpanel" id="panel-code" aria-labelledby="tab-code" tabindex="-1" hidden={tab !== "code"}>
      <pre class="code" tabindex="0"><code>{@html highlight(codeShown)}</code></pre>
    </div>
  </section>

  <!-- Install -->
  <section id="install" class="block">
    <h2>{t.install}</h2>
    <p class="muted">{t.installLead}</p>
    <div class="copy">
      <pre class="code"><code>pnpm add tallao</code></pre>
      <button type="button" class="mini" onclick={() => copy("pkg", "pnpm add tallao")}>{label("pkg")}</button>
    </div>
    <div class="copy">
      <pre class="code"><code>{@html highlight(`import "tallao/tokens.css";\nimport "tallao/base.css";\n${importLine}`)}</code></pre>
      <button type="button" class="mini" onclick={() => copy("imp", `import "tallao/tokens.css";\nimport "tallao/base.css";\n${importLine}`)}>{label("imp")}</button>
    </div>
    <p class="muted">{t.orCopy} <a href={`https://github.com/tallao-ui/tallao/blob/main/${c.file}`}><code>{c.file}</code></a></p>
  </section>

  <!-- Usage -->
  {#if showUsage}
    <section id="usage" class="block">
      <h2>{t.usage}</h2>
      <div class="copy">
        <pre class="code" tabindex="0"><code>{@html highlight(c.example)}</code></pre>
        <button type="button" class="mini" onclick={() => copy("use", c.example)}>{label("use")}</button>
      </div>
    </section>
  {/if}

  <!-- API -->
  <section id="api" class="block">
    <h2>{t.api}</h2>
    {#each entries as d, i (d.name)}
      {#if i > 0}
        <h3 class="part-t">{d.name}<span class="mono">{t.part}</span></h3>
        {#if d.purpose}<p class="muted">{d.purpose}</p>{/if}
      {/if}
      {#if d.props.length}
        <div class="tbl" role="region" tabindex="0" aria-label={`${d.name} · ${t.props}`}>
          <table>
            <thead>
              <tr><th scope="col">{t.prop}</th><th scope="col">{t.type}</th><th scope="col">{t.default}</th><th scope="col">{t.description}</th></tr>
            </thead>
            <tbody>
              {#each d.props as p (p.name)}
                <tr>
                  <th scope="row">
                    <code>{p.name}</code>
                    {#if !p.optional}<span class="tag tag--req">{t.required}</span>{/if}
                    {#if p.bindable}<span class="tag">{t.bindable}</span>{/if}
                  </th>
                  <td><code class="type">{p.type}</code></td>
                  <td>{#if p.default}<code>{p.default}</code>{:else}<span class="dash" aria-label="—">—</span>{/if}</td>
                  <td>{#each inline(p.doc) as piece}{#if piece.code}<code>{piece.text}</code>{:else}{piece.text}{/if}{/each}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="muted">—</p>
      {/if}
    {/each}
  </section>

  <!-- Behaviour -->
  {#if blocks.length}
    <section id="behaviour" class="block prose">
      <h2>{t.behaviour}</h2>
      {#each blocks as b}
        {#if b.type === "p"}
          <p>{#each inline(b.text) as piece}{#if piece.code}<code>{piece.text}</code>{:else}{piece.text}{/if}{/each}</p>
        {:else if b.type === "ul"}
          <ul>
            {#each b.items as item}<li>{#each inline(item) as piece}{#if piece.code}<code>{piece.text}</code>{:else}{piece.text}{/if}{/each}</li>{/each}
          </ul>
        {:else}
          <pre class="code" tabindex="0"><code>{@html highlight(b.text)}</code></pre>
        {/if}
      {/each}
    </section>
  {/if}

  <nav class="pager" aria-label={t.sections}>
    {#if prev}
      <a href={`#/c/${prev.slug}`} class="pager-a"><span class="mono">← {t.previous}</span><b>{docs.components[prev.slug].name}</b></a>
    {:else}<span></span>{/if}
    {#if next}
      <a href={`#/c/${next.slug}`} class="pager-a pager-a--next"><span class="mono">{t.next} →</span><b>{docs.components[next.slug].name}</b></a>
    {/if}
  </nav>
</article>
