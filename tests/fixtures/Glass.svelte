<!-- GlassPanel (frosted and liquid) and a CategoryNav whose open category can change. -->
<script lang="ts">
  import { CategoryNav, GlassPanel } from "$lib/components";

  let { current = "levels" as string | null, chipsBelow = 900 } = $props();
  let open = $state<string | null>(null);
  const shown = $derived(open ?? current);
  let picked = $state("");
</script>

<GlassPanel class="chip" data-testid="frost">Agent</GlassPanel>
<GlassPanel as="section" liquid strength={30} tint="rgb(13 14 29 / 0.55)" aria-label="Sign in" data-testid="liquid"><p>Hello</p></GlassPanel>
<GlassPanel follow={false} data-testid="still">Still</GlassPanel>

<CategoryNav
  {chipsBelow}
  current={shown}
  linkProps={{ "data-sveltekit-noscroll": "" }}
  items={[
    { id: "welcome", label: "Welcome and roles", href: "?g=welcome", icon: "user", count: "3/7", lit: true },
    { id: "levels", label: "Levels and economy", href: "?g=levels", icon: "coin", count: "0/7" },
    { id: "custom", label: "Custom", icon: "slash", count: 2, onclick: () => (picked = "custom") },
  ]}
/>
<button type="button" onclick={() => (open = "welcome")}>Open welcome</button>
<button type="button" onclick={() => (open = null)}>Reset</button>
<p data-testid="picked">{picked}</p>
