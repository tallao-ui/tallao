<!-- layout: stack -->
<script lang="ts">
  import { DescriptionList } from "tallao";
</script>

<DescriptionList
  ariaLabel="About this post"
  items={[
    { label: "Created", value: "Oct 30, 2026, 10:12" },
    { label: "Author", value: "Ana López", href: "#" },
    { label: "Views", value: (9810).toLocaleString("en") },
    { label: "API path", value: "/api/posts/42", copy: true, mono: true },
    { label: "Deleted", value: null },
  ]}
/>
