<!-- layout: stack -->
<script lang="ts">
  import { Button, Badge, ThemeScope } from "tallao";
</script>

<div style="display: grid; gap: 0.5rem">
  <span>The page's own tokens</span>
  <div style="display: flex; gap: 0.5rem; align-items: center">
    <Button>Deploy</Button>
    <Badge>Default</Badge>
  </div>
</div>

<!-- ThemeScope reads --kitsuden-* (RGB channels): set them on a parent to remap the accent -->
<div style="--kitsuden-accent: 20 184 166; --kitsuden-accent-hover: 45 212 191; --kitsuden-accent-dim: 15 118 110; --kitsuden-on-accent: 9 9 11">
  <ThemeScope source="kitsuden">
    <div style="display: grid; gap: 0.5rem; padding: 0.75rem; border: 1px dashed rgb(var(--ta-border)); border-radius: 0.5rem">
      <span>Inside ThemeScope, accent remapped</span>
      <div style="display: flex; gap: 0.5rem; align-items: center">
        <Button>Deploy</Button>
        <Badge>Default</Badge>
      </div>
    </div>
  </ThemeScope>
</div>
