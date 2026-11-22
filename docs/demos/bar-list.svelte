<!-- layout: stack -->
<script lang="ts">
  import { BarList } from "tallao";

  const pages = [
    { label: "/pricing", value: 8420, note: "+12%" },
    { label: "/docs/getting-started", value: 6310 },
    { label: "/blog/release-3-0", value: 4980, note: "new" },
    { label: "/changelog", value: 2750 },
    { label: "/docs/theming", value: 1940 },
    { label: "/about", value: 820 },
  ];
</script>

<BarList title="Top pages this week" data={pages} ranked limit={5} />
