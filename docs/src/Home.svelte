<!-- The docs' first page: the eight families, each with its components as links. -->
<script lang="ts">
  import { demoCount, docs, hasDemo, NEW } from "./registry";
  import type { Lang, Strings } from "./i18n";

  let { t, fill }: { t: Strings; lang: Lang; fill: (text: string, vars: Record<string, string | number>) => string } = $props();
  const demos = demoCount();
</script>

<section class="home">
  <p class="mono kicker">{t.homeKicker} <span>{fill(t.pagesOf, { pages: docs.pages, total: docs.total, version: docs.version })}</span></p>
  <h1 class="home-t">{t.homeTitle}</h1>
  <p class="lead">{t.homeLead}</p>

  <div class="board fams">
    {#each docs.families as f, i (f.id)}
      <div class="fam">
        <h2><span class="mono">{String(i + 1).padStart(2, "0")}</span>{f.title}<span class="cnt mono">{f.items.length}</span></h2>
        <p>{f.blurb}</p>
        <ul class="chips">
          {#each f.items as s (s)}
            <li class:nodemo={demos > 0 && !hasDemo(s)}>
              <a href={`#/c/${s}`}>{docs.components[s].name}{#if NEW.has(s)}<i class="new">{t.newBadge}</i>{/if}</a>
            </li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</section>
