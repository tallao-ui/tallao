<!-- What a site writes: a small Svelte wrapper that gives NavMenu its own icons, rendered from Astro. -->
<script lang="ts">
  import { NavMenu, type NavMenuGroup } from "$lib/components";
  import SiteIcon from "./SiteIcon.svelte";

  let { groups, label = "Games", ...rest }: { groups: NavMenuGroup[]; label?: string; [key: string]: unknown } = $props();
</script>

<NavMenu {label} {groups} {...rest}>
  {#snippet icon(item)}<SiteIcon shape={item.badge ? "circle" : "square"} />{/snippet}
</NavMenu>
