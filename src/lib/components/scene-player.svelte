<!--
  tallao — ScenePlayer
  A "video" drawn with components: a sequence of timed scenes with a play button, a seek bar,
  chapters and captions. The page draws each scene from data, so a tutorial built with it
  changes when the product it explains changes (no recorded file to redo).

    <ScenePlayer label="Tutorial" scenes={[{ id: "paste", title: "Paste a capture", duration: 6000, caption: "…" }]}>
      {#snippet scene(s, progress)}<MyScene id={s.id} {progress} />{/snippet}
    </ScenePlayer>

  - The `scene` snippet gets the current scene and its progress (0 to 1), to animate from it:
    type code up to `progress`, move a pointer, fill a meter.
  - Controls: Play / Pause (a button with a changing name), Previous / Next chapter, a seek bar
    (role "slider" with "0:12 of 1:30" as its value text) and a chapter list (buttons,
    `aria-current` on the playing one).
  - Keyboard, with focus anywhere in the player: Space or K play and pause, ← and → seek 5 s,
    Home and End go to the ends, N and P change chapter. On the seek bar the arrows move it.
  - Captions: each scene's `caption` is shown under the stage and read once by a polite live
    region when the scene starts, so the tutorial works without looking at the animation.
  - It never plays by itself unless `autoplay`, and not even then under reduced motion
    (WCAG 2.2.2); under reduced motion each scene is drawn at its final state (progress 1).
    It pauses when the tab is hidden. At the end it stops on the last frame.
  - On the server it renders the first scene, paused, at progress 0.
-->
<script lang="ts" module>
  export interface PlayerScene {
    id: string;
    /** Chapter name. */
    title: string;
    /** Length in milliseconds. */
    duration: number;
    /** What the scene says, as text (shown and read aloud). */
    caption?: string;
  }

  /** "1:05". */
  export function formatTime(ms: number): string {
    const s = Math.max(0, Math.round(ms / 1000));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }
</script>

<script lang="ts">
  import { untrack, type Snippet } from "svelte";
  import { useLabels } from "$lib/i18n";
  import { prefersReducedMotion } from "$lib/motion";
  import { cn } from "$lib/utils";

  interface Props {
    scenes: PlayerScene[];
    /** Draws a scene: gets the scene and its progress (0–1). */
    scene: Snippet<[PlayerScene, number]>;
    /** Accessible name of the player. */
    label?: string;
    /** Current time in ms (bindable). */
    time?: number;
    /** Playing (bindable). */
    playing?: boolean;
    /** Start playing on mount (never under reduced motion). */
    autoplay?: boolean;
    /** Show the chapter list. */
    chapters?: boolean;
    playLabel?: string;
    pauseLabel?: string;
    previousLabel?: string;
    nextLabel?: string;
    seekLabel?: string;
    chaptersLabel?: string;
    class?: string;
    onSceneChange?: (scene: PlayerScene, index: number) => void;
    onEnd?: () => void;
    [key: string]: unknown;
  }

  const L = useLabels();
  let {
    scenes,
    scene,
    label = L.player,
    time = $bindable(0),
    playing = $bindable(false),
    autoplay = false,
    chapters = true,
    playLabel = L.play,
    pauseLabel = L.pause,
    previousLabel = L.previousChapter,
    nextLabel = L.nextChapter,
    seekLabel = L.seek,
    chaptersLabel = L.chapters,
    class: className = "",
    onSceneChange,
    onEnd,
    ...rest
  }: Props = $props();

  const id = $props.id();
  const starts = $derived(scenes.reduce<number[]>((acc, s, i) => [...acc, i ? acc[i - 1] + scenes[i - 1].duration : 0], []));
  const total = $derived(scenes.reduce((a, s) => a + s.duration, 0));
  const index = $derived.by(() => {
    let i = 0;
    while (i < scenes.length - 1 && time >= starts[i + 1]) i++;
    return i;
  });
  const current = $derived(scenes[index]);
  let still = $state(false);
  const progress = $derived(
    still ? 1 : current ? Math.min(1, Math.max(0, (time - starts[index]) / Math.max(1, current.duration))) : 0
  );

  // Announce each scene once, when it starts.
  let announced = $state("");
  let lastIndex = -1;
  $effect(() => {
    const i = index;
    if (i === lastIndex) return;
    lastIndex = i;
    if (!current) return;
    announced = current.caption ? `${current.title}. ${current.caption}` : current.title;
    onSceneChange?.(current, i);
  });

  $effect(() => {
    const reduced = prefersReducedMotion();
    still = reduced;
    if (untrack(() => autoplay) && !reduced) playing = true;
  });

  // The clock: requestAnimationFrame while playing, paused when the tab is hidden.
  $effect(() => {
    if (!playing) return;
    // Only `playing` starts and stops the clock: time is read without tracking it.
    untrack(() => {
      if (time >= total) time = 0;
    });
    let frame = 0;
    // The first frame only sets the reference: its timestamp may come from another clock.
    let before: number | null = null;
    const tick = (now: number) => {
      const end = untrack(() => total);
      const step = before === null ? 0 : Math.max(0, now - before);
      before = now;
      time = Math.min(end, untrack(() => time) + step);
      if (time >= end) {
        playing = false;
        onEnd?.();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const hide = () => {
      if (document.hidden) playing = false;
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", hide);
    };
  });

  function seek(to: number) {
    time = Math.min(total, Math.max(0, to));
  }
  function goTo(i: number) {
    const n = Math.min(scenes.length - 1, Math.max(0, i));
    seek(starts[n]);
  }
  function chapterStep(step: number) {
    // "Previous" past the first second of a scene restarts it, like a media player.
    if (step < 0 && time - starts[index] > 1000) goTo(index);
    else goTo(index + step);
  }

  function onKey(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement;
    const onSlider = t.getAttribute("role") === "slider";
    const onButton = t.tagName === "BUTTON";
    if (e.key === " " && onButton) return; // the button's own activation
    if (e.key === " " || e.key.toLowerCase() === "k") playing = !playing;
    else if (e.key === "ArrowLeft") seek(time - 5000);
    else if (e.key === "ArrowRight") seek(time + 5000);
    else if (e.key === "Home" && (onSlider || !onButton)) seek(0);
    else if (e.key === "End" && (onSlider || !onButton)) seek(total);
    else if (e.key.toLowerCase() === "n") chapterStep(1);
    else if (e.key.toLowerCase() === "p") chapterStep(-1);
    else return;
    e.preventDefault();
  }

  let bar = $state<HTMLElement>();
  function drag(e: PointerEvent) {
    if (!bar || e.button !== 0) return;
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture?.(e.pointerId);
    const at = (x: number) => {
      const r = bar!.getBoundingClientRect();
      seek(((x - r.left) / Math.max(1, r.width)) * total);
    };
    at(e.clientX);
    const move = (ev: PointerEvent) => at(ev.clientX);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
  }

  const valueText = $derived(L.timeOf.replace("{time}", formatTime(time)).replace("{total}", formatTime(total)));
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section class={cn("ta-player", className)} aria-label={label} aria-roledescription={L.playerRole} onkeydown={onKey} {...rest}>
  <div class="ta-player-stage">
    {#if current}{@render scene(current, progress)}{/if}
  </div>

  {#if current?.caption}
    <p class="ta-player-caption" aria-hidden="true">{current.caption}</p>
  {/if}
  <p class="ta-player-sr" aria-live="polite">{announced}</p>

  <div class="ta-player-controls">
    <button type="button" class="ta-player-btn" aria-label={previousLabel} onclick={() => chapterStep(-1)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
    </button>
    <button type="button" class="ta-player-btn ta-player-play" aria-label={playing ? pauseLabel : playLabel} onclick={() => (playing = !playing)}>
      {#if playing}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
      {:else}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4v16l13-8z" /></svg>
      {/if}
    </button>
    <button type="button" class="ta-player-btn" aria-label={nextLabel} onclick={() => chapterStep(1)}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
    </button>

    <div
      bind:this={bar}
      class="ta-player-bar"
      role="slider"
      tabindex="0"
      aria-label={seekLabel}
      aria-valuemin={0}
      aria-valuemax={Math.round(total / 1000)}
      aria-valuenow={Math.round(time / 1000)}
      aria-valuetext={valueText}
      onpointerdown={drag}
    >
      <div class="ta-player-fill" style:width="{total ? (time / total) * 100 : 0}%"></div>
      {#each starts.slice(1) as s, i (i)}
        <span class="ta-player-mark" style:left="{(s / total) * 100}%"></span>
      {/each}
    </div>
    <span class="ta-player-time" aria-hidden="true">{formatTime(time)} / {formatTime(total)}</span>
  </div>

  {#if chapters}
    <nav class="ta-player-chapters" aria-label={chaptersLabel}>
      <ol>
        {#each scenes as s, i (s.id)}
          <li>
            <button type="button" class="ta-player-chapter" aria-current={i === index ? "step" : undefined} onclick={() => goTo(i)} id="{id}-ch-{i}">
              <span class="ta-player-chapter-n" aria-hidden="true">{i + 1}</span>
              <span>{s.title}</span>
            </button>
          </li>
        {/each}
      </ol>
    </nav>
  {/if}
</section>

<style>
  .ta-player {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .ta-player-stage {
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
  }
  .ta-player-caption {
    margin: 0;
    min-height: 2.75em;
    font-size: 0.9375rem;
    line-height: 1.45;
    color: rgb(var(--ta-text));
  }
  .ta-player-sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .ta-player-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .ta-player-btn {
    display: grid;
    place-items: center;
    width: 2rem;
    height: 2rem;
    padding: 0;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: 999px;
    cursor: pointer;
    transition: background-color var(--ta-duration-fast, 120ms) var(--ta-ease-out, ease-out);
  }
  .ta-player-btn:hover {
    background: rgb(var(--ta-accent) / 0.15);
  }
  .ta-player-play {
    width: 2.5rem;
    height: 2.5rem;
    color: rgb(var(--ta-on-accent, 255 255 255));
    background: rgb(var(--ta-accent));
    border-color: transparent;
  }
  .ta-player-play:hover {
    background: rgb(var(--ta-accent-hover, var(--ta-accent)));
  }
  .ta-player-btn:focus-visible,
  .ta-player-bar:focus-visible,
  .ta-player-chapter:focus-visible {
    outline: 2px solid rgb(var(--ta-accent));
    outline-offset: 2px;
  }
  .ta-player-bar {
    position: relative;
    flex: 1;
    height: 0.5rem;
    background: rgb(var(--ta-border));
    border-radius: 999px;
    cursor: pointer;
    touch-action: none;
  }
  .ta-player-fill {
    position: absolute;
    inset: 0 auto 0 0;
    background: rgb(var(--ta-accent));
    border-radius: inherit;
  }
  .ta-player-mark {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgb(var(--ta-bg));
  }
  .ta-player-time {
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: rgb(var(--ta-text-dim));
    white-space: nowrap;
  }
  .ta-player-chapters ol {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .ta-player-chapter {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.3rem 0.625rem 0.3rem 0.375rem;
    font: inherit;
    font-size: 0.8125rem;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: 1px solid rgb(var(--ta-border));
    border-radius: 999px;
    cursor: pointer;
  }
  .ta-player-chapter[aria-current="step"] {
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-accent));
    background: rgb(var(--ta-accent) / 0.12);
  }
  .ta-player-chapter-n {
    display: grid;
    place-items: center;
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    border-radius: 999px;
    background: rgb(var(--ta-border));
  }
  @media (prefers-reduced-motion: reduce) {
    .ta-player-btn {
      transition: none;
    }
  }
  @media (pointer: coarse) {
    .ta-player-btn {
      width: 2.75rem;
      height: 2.75rem;
    }
    .ta-player-bar {
      height: 0.75rem;
    }
    .ta-player-bar::after {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: 50%;
      height: 2.75rem;
      transform: translateY(-50%);
    }
    .ta-player-chapter {
      min-height: 2.75rem;
    }
  }
</style>
