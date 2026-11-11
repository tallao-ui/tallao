<!--
  tallao — the Motion demo
  Every piece of `tallao/motion` on a small stage with a replay button. With "reduce motion"
  on (the system setting, or the switch here, which sets `data-tallao-motion` on <html>)
  nothing moves and every stage shows its final state.
-->
<script lang="ts">
  import { Button, Icon, Switch, Tabs } from "$lib/components";
  import {
    collapse,
    crossfade,
    drawCheck,
    fade,
    press,
    rise,
    rollNumber,
    scaleIn,
    shake,
    shimmer,
    slide,
    stagger,
    viewTransition,
  } from "$lib/motion";

  // One counter per stage: bumping it re-creates the stage's content, which replays it.
  let runs = $state<Record<string, number>>({});
  const run = (name: string) => runs[name] ?? 0;
  const replay = (name: string) => (runs[name] = run(name) + 1);

  let reduce = $state(false);
  $effect(() => {
    if (reduce) document.documentElement.dataset.tallaoMotion = "reduce";
    else delete document.documentElement.dataset.tallaoMotion;
  });

  let open = $state(true);
  let total = $state(1280);
  let tab = $state("overview");
  let field: HTMLInputElement | undefined = $state();
  let order = $state(["Kaela", "Oskar", "Tide"]);

  const [send, receive] = crossfade();
  let left = $state(["Fire", "Water"]);
  let right = $state(["Grass"]);
  function move(item: string) {
    if (left.includes(item)) {
      left = left.filter((x) => x !== item);
      right = [...right, item];
    } else {
      right = right.filter((x) => x !== item);
      left = [...left, item];
    }
  }
</script>

{#snippet stage(name: string, title: string, note: string)}
  <div class="motion-head">
    <div>
      <h3>{title}</h3>
      <p>{note}</p>
    </div>
    <Button variant="ghost" size="sm" ariaLabel={`Replay ${title}`} onclick={() => replay(name)}><Icon name="refresh" size={14} /></Button>
  </div>
{/snippet}

<div class="motion-bar">
  <Switch bind:checked={reduce} label="Reduce motion" />
  <span class="motion-note">Durations and easings come from <code>--ta-duration-*</code> and <code>--ta-ease-*</code>.</span>
</div>

<div class="motion-grid">
  <article class="motion-card">
    {@render stage("fade", "fade", "Appears in place")}
    <div class="motion-stage">{#key run("fade")}<div class="motion-box" in:fade={{ duration: "slow" }}>Saved</div>{/key}</div>
  </article>

  <article class="motion-card">
    {@render stage("rise", "rise", "Cards, messages, list items")}
    <div class="motion-stage">{#key run("rise")}<div class="motion-box" in:rise>New message</div>{/key}</div>
  </article>

  <article class="motion-card">
    {@render stage("scale", "scaleIn", "Dialogs, popovers, menus")}
    <div class="motion-stage">{#key run("scale")}<div class="motion-box motion-box--panel" in:scaleIn>Menu</div>{/key}</div>
  </article>

  <article class="motion-card">
    {@render stage("slide", "slide", "Sheets and drawers")}
    <div class="motion-stage motion-stage--clip">{#key run("slide")}<div class="motion-sheet" in:slide={{ from: "right" }}>Sheet</div>{/key}</div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>collapse</h3>
        <p>A block of unknown height</p>
      </div>
      <Button variant="ghost" size="sm" aria-expanded={open} onclick={() => (open = !open)}>{open ? "Close" : "Open"}</Button>
    </div>
    <div class="motion-stage motion-stage--top">
      {#if open}<p class="motion-text" transition:collapse>Three elements are done. Fire, Water and Grass were recomputed with the patch 1.2 data.</p>{/if}
    </div>
  </article>

  <article class="motion-card">
    {@render stage("stagger", "stagger", "A list that enters in sequence")}
    <div class="motion-stage motion-stage--top">
      {#key run("stagger")}
        <ul class="motion-list">
          {#each ["Read the brief", "Compare the patches", "Write the summary", "Publish"] as item, i (item)}
            <li in:rise={stagger(i, { step: 60 })}>{item}</li>
          {/each}
        </ul>
      {/key}
    </div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>crossfade</h3>
        <p>An item that moves between lists</p>
      </div>
    </div>
    <div class="motion-stage motion-stage--split">
      {#each [left, right] as column, c (c)}
        <div class="motion-column">
          {#each column as item (item)}
            <button type="button" class="motion-chip" in:receive={{ key: item }} out:send={{ key: item }} onclick={() => move(item)}>{item}</button>
          {/each}
        </div>
      {/each}
    </div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>rollNumber</h3>
        <p>A figure that counts to its new value</p>
      </div>
      <Button variant="ghost" size="sm" onclick={() => (total += Math.round(120 + Math.random() * 900))}>Add</Button>
    </div>
    <div class="motion-stage"><span class="motion-figure" {@attach rollNumber(total, { format: (n) => Math.round(n).toLocaleString("en") })}>{total.toLocaleString("en")}</span></div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>tabIndicator</h3>
        <p>The underline slides to the tab (Tabs uses it)</p>
      </div>
    </div>
    <div class="motion-stage motion-stage--top">
      <Tabs ariaLabel="Motion tabs" panels={false} bind:value={tab} items={[{ id: "overview", label: "Overview" }, { id: "matches", label: "Matches" }, { id: "builds", label: "Builds" }]} />
    </div>
  </article>

  <article class="motion-card">
    {@render stage("shimmer", "shimmer", "A light across a placeholder")}
    <div class="motion-stage motion-stage--top">
      {#key run("shimmer")}
        <div class="motion-skeleton" {@attach shimmer()}></div>
        <div class="motion-skeleton motion-skeleton--short" {@attach shimmer()}></div>
      {/key}
    </div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>press</h3>
        <p>The control gives under the pointer</p>
      </div>
    </div>
    <div class="motion-stage"><button type="button" class="motion-press" {@attach press()}>Press and hold</button></div>
  </article>

  <article class="motion-card">
    {@render stage("check", "drawCheck", "A success mark drawn by its stroke")}
    <div class="motion-stage">
      {#key run("check")}
        <svg class="motion-check" width="44" height="44" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" {@attach drawCheck({ duration: 400 })} />
          <path d="M7.5 12.5l3 3 6-6.5" {@attach drawCheck({ delay: 250 })} />
        </svg>
      {/key}
    </div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>shake</h3>
        <p>An invalid field, a refused action</p>
      </div>
      <Button variant="ghost" size="sm" onclick={() => shake(field)}>Submit</Button>
    </div>
    <div class="motion-stage"><input bind:this={field} class="motion-field" aria-label="Code" aria-invalid="true" value="not-a-code" /></div>
  </article>

  <article class="motion-card">
    <div class="motion-head">
      <div>
        <h3>viewTransition</h3>
        <p>A DOM update inside a View Transition</p>
      </div>
      <Button variant="ghost" size="sm" onclick={() => viewTransition(() => void (order = [...order.slice(1), order[0]]))}>Reorder</Button>
    </div>
    <div class="motion-stage motion-stage--top">
      <ol class="motion-list motion-list--ranked">
        {#each order as name (name)}<li style:view-transition-name={`motion-${name}`}>{name}</li>{/each}
      </ol>
    </div>
  </article>
</div>

<style>
  .motion-bar { display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem 1.5rem; margin-bottom: 1rem; }
  .motion-note { font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); }
  .motion-note code { font-family: var(--ta-font-mono); font-size: 0.75rem; }

  .motion-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr)); gap: 0.75rem; }
  .motion-card {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: rgb(var(--ta-surface) / 0.5);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
  }
  .motion-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.5rem; padding: 0.625rem 0.5rem 0.5rem 0.875rem; }
  .motion-head h3 { margin: 0; font-family: var(--ta-font-mono); font-size: 0.8125rem; font-weight: 600; }
  .motion-head p { margin: 0.125rem 0 0; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); }

  .motion-stage {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 7.5rem;
    padding: 0.875rem;
    border-top: 1px solid rgb(var(--ta-border));
    background:
      radial-gradient(rgb(var(--ta-muted) / 0.35) 1px, transparent 1px) 0 0 / 12px 12px,
      rgb(var(--ta-bg));
  }
  .motion-stage--top { align-items: stretch; justify-content: flex-start; }
  .motion-stage--clip { position: relative; overflow: hidden; }
  .motion-stage--split { flex-direction: row; align-items: stretch; gap: 0.75rem; }

  .motion-box {
    padding: 0.5rem 0.875rem;
    font-size: 0.8125rem;
    font-weight: 500;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }
  .motion-box--panel { padding: 0.75rem 1.5rem; box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45); }
  .motion-sheet {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 55%;
    font-size: 0.8125rem;
    font-weight: 500;
    background: rgb(var(--ta-surface));
    border-left: 1px solid rgb(var(--ta-border));
  }
  .motion-text { margin: 0; font-size: 0.8125rem; line-height: 1.5; color: rgb(var(--ta-text-dim)); }

  .motion-list { display: flex; flex-direction: column; gap: 0.25rem; margin: 0; padding: 0; list-style: none; font-size: 0.8125rem; }
  .motion-list li { padding: 0.25rem 0.5rem; background: rgb(var(--ta-surface)); border: 1px solid rgb(var(--ta-border)); border-radius: var(--ta-radius-sm); }
  .motion-list--ranked { counter-reset: rank; }
  .motion-list--ranked li::before { counter-increment: rank; content: counter(rank) ". "; color: rgb(var(--ta-text-dim)); }

  .motion-column { display: flex; flex: 1; flex-direction: column; gap: 0.375rem; padding: 0.375rem; border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius); }
  .motion-chip,
  .motion-press {
    padding: 0.3125rem 0.625rem;
    font: inherit;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    cursor: pointer;
  }
  .motion-chip:focus-visible,
  .motion-press:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 1px; }
  .motion-press { padding: 0.5rem 1rem; font-weight: 500; }

  .motion-figure { font-size: 1.75rem; font-weight: 700; font-variant-numeric: tabular-nums; }

  .motion-skeleton { position: relative; height: 0.875rem; overflow: hidden; background-color: rgb(var(--ta-elevated)); border-radius: var(--ta-radius-sm); }
  .motion-skeleton--short { width: 60%; }

  .motion-check { fill: none; stroke: rgb(var(--ta-success)); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }

  .motion-field {
    width: 100%;
    max-width: 12rem;
    padding: 0.4375rem 0.625rem;
    font: inherit;
    font-size: 0.875rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-bg));
    border: 1px solid rgb(var(--ta-danger) / 0.7);
    border-radius: var(--ta-radius);
    outline: none;
  }

  @media (pointer: coarse) {
    .motion-chip,
    .motion-press { min-height: 2.75rem; }
    .motion-field { min-height: 2.75rem; font-size: 1rem; }
  }
</style>
