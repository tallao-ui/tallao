<!-- layout: stack -->
<script lang="ts">
  import { DiffView } from "tallao";
</script>

<DiffView
  ariaLabel="Changes on Nov 2"
  changes={[
    { field: "title", label: "Title", before: "Patch 1.2", after: "Patch 1.2 notes" },
    { field: "hero", label: "Hero image", before: null, after: "/media/patch-1-2/hero.webp" },
    { field: "api_key", label: "API key", redacted: true },
  ]}
/>
<DiffView
  compact
  ariaLabel="Changes on Nov 3"
  changes={[
    { field: "status", label: "Status", before: "In review", after: "Published" },
    { field: "reviewer", label: "Reviewer", before: "Luis Vega", after: null },
  ]}
/>
