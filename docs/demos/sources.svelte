<!-- layout: stack -->
<script lang="ts">
  import { Sources } from "tallao";

  const sources = [
    { url: "https://valhalla.gg/news/patch-1-2", title: "Patch 1.2 notes" },
    { url: "https://stats.valhalla.gg/meta/pick-rates", title: "Pick rates by patch" },
    { url: "https://esports.example.com/autumn-open", title: "Autumn Open finals" },
  ];
</script>

<Sources {sources} />
<Sources compact {sources} />
