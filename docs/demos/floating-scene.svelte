<!-- layout: wide -->
<script lang="ts">
  import { FloatingScene, Button } from "tallao";
</script>

<!-- a bounded stage: the tiles float behind the content and stay out of the middle band -->
<FloatingScene tiles={["BEG READ", "GOTO", "IF", "LOOP", "END"]} count={14} seed={7} parallax>
  <div style="min-height: 18rem; display: grid; place-content: center; justify-items: center; gap: 0.75rem; text-align: center">
    <h2 style="margin: 0">Welcome back</h2>
    <p style="margin: 0; color: rgb(var(--ta-text-dim))">Sign in to continue your last run.</p>
    <Button>Continue</Button>
  </div>
</FloatingScene>
