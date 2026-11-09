<!-- A site's own icon component (like lucide-svelte): draws a square or a circle. -->
<script lang="ts">
  let { shape = "square" }: { shape?: "square" | "circle" } = $props();
</script>

<svg class="site-icon" data-shape={shape} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
  {#if shape === "circle"}<circle cx="12" cy="12" r="9" />{:else}<rect x="4" y="4" width="16" height="16" rx="2" />{/if}
</svg>
