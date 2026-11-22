<!--
  tallao docs — the frame: a top bar like the landing's, a sidebar by family and the page in hash
  routes (#/ and #/c/<slug>), so it works on GitHub Pages with no server rules.
-->
<script lang="ts">
  import { onMount } from "svelte";
  import { docs, NEW, order, pageOf } from "./registry";
  import { fill, strings, type Lang } from "./i18n";
  import Home from "./Home.svelte";
  import ComponentPage from "./ComponentPage.svelte";

  const parse = (hash: string) => {
    const m = hash.match(/^#\/c\/([\w-]+)/);
    return m && docs.components[m[1]] ? m[1] : "";
  };

  const root = document.documentElement;
  let slug = $state(parse(location.hash));
  let lang = $state<Lang>(root.lang === "es" ? "es" : "en");
  let light = $state(root.dataset.tallaoTheme === "light");
  let accent = $state(root.dataset.accent ?? "lilac");
  let query = $state("");
  let menu = $state(false);
  let opened = $state<Record<string, boolean>>({});
  let search: HTMLInputElement | undefined = $state();
  let main: HTMLElement | undefined = $state();

  const t = $derived(strings[lang]);
  const ACCENTS = ["lilac", "orange", "green", "blue"];

  // The open families: the one of the page you are on, plus the ones you opened.
  $effect(() => {
    const fam = slug && pageOf(slug)?.family.id;
    if (fam && !opened[fam]) opened[fam] = true;
  });

  $effect(() => {
    root.lang = lang;
    root.dataset.tallaoTheme = light ? "light" : "dark";
    root.dataset.accent = accent;
    try {
      localStorage.setItem("tallao-docs", JSON.stringify({ theme: light ? "light" : "dark", accent, lang }));
      localStorage.setItem("tallao-lang", lang);
      const site = JSON.parse(localStorage.getItem("tallao-site") || "{}");
      localStorage.setItem("tallao-site", JSON.stringify({ ...site, theme: light ? "light" : "dark", accent }));
    } catch {}
  });

  $effect(() => {
    document.title = slug ? `${docs.components[slug].name} · tallao docs` : "tallao docs — every component, live, with its code";
  });

  onMount(() => {
    const onhash = () => {
      slug = parse(location.hash);
      menu = false;
      scrollTo({ top: 0, behavior: "instant" });
      queueMicrotask(() => main?.focus({ preventScroll: true }));
    };
    const onkey = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement).tagName);
      if (((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        menu = true;
        queueMicrotask(() => search?.focus());
      } else if (e.key === "Escape" && menu) menu = false;
    };
    addEventListener("hashchange", onhash);
    addEventListener("keydown", onkey);
    return () => {
      removeEventListener("hashchange", onhash);
      removeEventListener("keydown", onkey);
    };
  });

  const q = $derived(query.trim().toLowerCase());
  const matches = (s: string) => {
    if (!q) return true;
    const c = docs.components[s];
    return c.name.toLowerCase().includes(q) || c.purpose.toLowerCase().includes(q) || c.parts.some((p) => p.name.toLowerCase().includes(q));
  };
  const hits = $derived(order.filter((p) => matches(p.slug)));
  const pad = (n: number) => String(n).padStart(2, "0");
</script>

<a class="skip" href="#main" onclick={(e) => { e.preventDefault(); main?.focus(); }}>{t.skip}</a>

<header class="bar">
  <div class="wrap">
    <a class="brand" href="../" aria-label="tallao"><img src="/brand/tallao-mark-64.png" width="28" height="28" alt="" decoding="async" />tallao</a>
    <nav aria-label="tallao">
      <a href="#/" aria-current={slug ? undefined : "page"}>{t.docs}</a>
      <a href="../">{t.landing}</a>
      <a href="https://github.com/tallao-ui/tallao">GitHub</a>
    </nav>
    <div class="ctl">
      <button class="ic menu-btn" type="button" aria-expanded={menu} aria-controls="side" onclick={() => (menu = !menu)}>{t.menu}</button>
      <button class="ic" type="button" aria-label={t.language} onclick={() => (lang = lang === "es" ? "en" : "es")}>{lang === "es" ? "EN" : "ES"}</button>
      <button class="ic" type="button" aria-label={t.theme} aria-pressed={light} onclick={() => (light = !light)}>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" /></svg>
      </button>
      <button class="ic accent-btn" type="button" aria-label={`${t.accent}: ${accent}`} onclick={() => (accent = ACCENTS[(ACCENTS.indexOf(accent) + 1) % ACCENTS.length])}><span class="dot" aria-hidden="true"></span></button>
    </div>
  </div>
</header>

<div class="wrap layout">
  <aside id="side" class="side" class:open={menu} aria-label={t.sections}>
    <div class="side-in">
      <div class="search">
        <input bind:this={search} bind:value={query} type="search" placeholder={t.search} aria-label={t.searchLabel} autocomplete="off" spellcheck="false" />
        <kbd aria-hidden="true">/</kbd>
      </div>
      <button class="side-close" type="button" onclick={() => (menu = false)}>{t.closeMenu}</button>

      {#if q}
        {#if hits.length}
          <ul class="results">
            {#each hits as p (p.slug)}
              <li>
                <a href={`#/c/${p.slug}`} aria-current={p.slug === slug ? "page" : undefined}>
                  <span>{docs.components[p.slug].name}</span><span class="mono">{p.family.title}</span>
                </a>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="empty mono">{t.noResults}</p>
        {/if}
      {:else}
        <a class="all" href="#/" aria-current={slug ? undefined : "page"}>{t.all}<span class="mono">{docs.pages}</span></a>
        {#each docs.families as f, fi (f.id)}
          <details open={!!opened[f.id]} ontoggle={(e) => (opened[f.id] = e.currentTarget.open)}>
            <summary><span class="mono">{pad(fi + 1)}</span>{f.title}<span class="cnt mono">{f.items.length}</span></summary>
            <ul>
              {#each f.items as s (s)}
                <li>
                  <a href={`#/c/${s}`} aria-current={s === slug ? "page" : undefined}>
                    {docs.components[s].name}{#if NEW.has(s)}<i class="new">{t.newBadge}</i>{/if}
                  </a>
                </li>
              {/each}
            </ul>
          </details>
        {/each}
      {/if}
    </div>
  </aside>
  {#if menu}<button class="scrim" type="button" aria-label={t.closeMenu} tabindex="-1" onclick={() => (menu = false)}></button>{/if}

  <main id="main" bind:this={main} tabindex="-1">
    {#if slug}
      <ComponentPage {slug} {lang} {t} />
    {:else}
      <Home {t} {lang} {fill} />
    {/if}
  </main>
</div>

<footer class="foot">
  <div class="wrap">
    <span class="mono">tallao v{docs.version} · MIT</span>
    <a class="mono" href="https://github.com/tallao-ui/tallao">GitHub</a>
    <a class="mono" href="https://github.com/tallao-ui/tallao/blob/main/CHANGELOG.md">Changelog</a>
    <a class="mono" href="https://github.com/tallao-ui/tallao/blob/main/llms.txt">llms.txt</a>
  </div>
</footer>
