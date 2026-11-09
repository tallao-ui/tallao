<script lang="ts">
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Toaster } from "tallao";

  const { children } = $props();
</script>

<nav><a href="/">Home</a> · <a href="/other">Other</a></nav>
{@render children()}
<Toaster />
