<script lang="ts">
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Toaster } from "tallao";

  const { children } = $props();
</script>

<nav><a href="/">Inicio</a> · <a href="/otra">Otra</a></nav>
{@render children()}
<Toaster />
