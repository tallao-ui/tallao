<!-- layout: stack -->
<script lang="ts">
  import { CompareSlider } from "tallao";

  const svg = (a: string, b: string) =>
    "data:image/svg+xml," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="160" height="90" fill="url(#g)"/><circle cx="110" cy="35" r="16" fill="white" fill-opacity=".6"/><path d="M0 90 L50 45 L85 70 L120 40 L160 90Z" fill="black" fill-opacity=".3"/></svg>`,
    );

  const before = svg("#64748b", "#1e293b");
  const after = svg("#f59e0b", "#be185d");
  let value = $state(50);
</script>

<CompareSlider bind:value beforeSrc={before} afterSrc={after} beforeLabel="Before" afterLabel="After" label="Compare the two renders" />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">Divider at {Math.round(value)}%</p>
