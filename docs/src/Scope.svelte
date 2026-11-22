<!--
  The kit's texts for a demo: they are read when a component starts, so the page keys this on the
  language and a switch draws the demos again with the kit's English or Spanish labels.
-->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { en, es, setLabels } from "tallao";

  let { lang, children }: { lang: "en" | "es"; children: Snippet } = $props();

  // svelte-ignore state_referenced_locally
  setLabels(lang === "es" ? es : en);
</script>

{@render children()}
