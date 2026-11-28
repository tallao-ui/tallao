<!-- layout: wide; height: 18 -->
<script lang="ts">
  import { Button, GlassPanel } from "tallao";
</script>

<div
  style="position: relative; display: grid; place-items: center; gap: 1rem; min-height: 18rem; padding: 2rem; border-radius: var(--ta-radius-lg); overflow: hidden;
  background: radial-gradient(circle at 25% 30%, rgb(var(--ta-accent) / 0.8), transparent 40%), radial-gradient(circle at 75% 70%, rgb(var(--ta-accent-2) / 0.8), transparent 45%), rgb(var(--ta-bg))"
>
  <GlassPanel liquid as="section" aria-labelledby="glass-title" style="padding: 1.25rem 1.5rem; max-width: 22rem">
    <h3 id="glass-title" style="margin: 0 0 0.25rem">Your bot is online</h3>
    <p style="margin: 0 0 1rem; color: rgb(var(--ta-text-dim))">43 modules, 7 on. Move the pointer: the rim follows it.</p>
    <Button>Open the panel</Button>
  </GlassPanel>
  <GlassPanel style="padding: 0.375rem 0.875rem; border-radius: 9999px">Agent ready</GlassPanel>
</div>
