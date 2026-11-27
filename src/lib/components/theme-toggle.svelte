<!--
  tallao — ThemeToggle
  The button that switches the page between the dark and the light theme: it sets
  `data-tallao-theme` on <html> (what `tallao/tokens.css` reads), remembers the choice in
  localStorage and reveals the new theme with `themeTransition` from the click.

    <ThemeToggle />                                   remembered as "tallao-theme"
    <ThemeToggle storageKey="my-app-theme" transition="ink" bind:theme />
    <ThemeToggle storageKey={null} transition="none" />   remembers nothing, no reveal

  - A plain button whose name says what it does ("Switch to light theme"); the icon shows the
    theme it switches to (sun, moon). The name comes from the kit's labels or the props.
  - On mount it takes the stored choice, else the theme already on <html>, else dark (the tokens'
    default). On the server it renders for `theme` (default "dark"). To avoid a flash of the wrong
    theme on load, set the attribute before paint with an inline script in your page's <head>:
    `document.documentElement.dataset.tallaoTheme = localStorage.getItem("tallao-theme") ?? "dark"`.
  - Reduced motion (or no View Transitions) switches at once.
-->
<script lang="ts" module>
  export type Theme = "dark" | "light";
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { themeTransition, type ThemeTransitionStyle } from "$lib/motion";
  import Button from "./button.svelte";
  import Icon from "./icon.svelte";

  const L = useLabels();

  interface Props {
    /** The current theme; bind it to follow or set it. */
    theme?: Theme;
    /** Where the choice is remembered in localStorage; `null` remembers nothing. */
    storageKey?: string | null;
    /** How the new theme appears; `"none"` switches at once. */
    transition?: ThemeTransitionStyle | "none";
    variant?: "ghost" | "outline" | "soft" | "secondary";
    size?: "sm" | "icon";
    /** Name of the button while the theme is dark. */
    lightLabel?: string;
    /** Name of the button while the theme is light. */
    darkLabel?: string;
    /** Called after the theme changed. */
    onchange?: (theme: Theme) => void;
    class?: string;
    [key: string]: unknown;
  }

  let {
    theme = $bindable("dark"),
    storageKey = "tallao-theme",
    transition = "circle",
    variant = "ghost",
    size = "icon",
    lightLabel = L.themeToLight,
    darkLabel = L.themeToDark,
    onchange,
    class: className = "",
    ...rest
  }: Props = $props();

  const isTheme = (v: unknown): v is Theme => v === "dark" || v === "light";

  function read(): string | null {
    if (!storageKey) return null;
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null; // storage blocked (privacy mode, sandboxed frame)
    }
  }

  function apply(next: Theme) {
    theme = next;
    document.documentElement.dataset.tallaoTheme = next;
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, next);
    } catch {
      // storage blocked: the theme still changes for this page
    }
  }

  onMount(() => {
    const stored = read();
    const current = document.documentElement.dataset.tallaoTheme;
    const start = isTheme(stored) ? stored : isTheme(current) ? current : theme;
    theme = start;
    document.documentElement.dataset.tallaoTheme = start;
  });

  async function toggle(event: MouseEvent) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (transition === "none") apply(next);
    else await themeTransition(() => apply(next), { from: event, style: transition });
    onchange?.(next);
  }
</script>

<Button {...rest} {variant} {size} class={className} ariaLabel={theme === "dark" ? lightLabel : darkLabel} onclick={toggle}>
  <Icon name={theme === "dark" ? "sun" : "moon"} size={size === "sm" ? 16 : 18} />
</Button>
