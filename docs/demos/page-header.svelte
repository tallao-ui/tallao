<!-- layout: wide -->
<script lang="ts">
  import { Badge, Breadcrumb, Button, PageHeader, Tabs } from "tallao";

  let section = $state("content");
</script>

<PageHeader title="Patch 1.2 notes" level={2}>
  {#snippet breadcrumb()}
    <Breadcrumb ariaLabel="Trail" items={[{ label: "Posts", href: "#" }, { label: "Patch 1.2 notes" }]} />
  {/snippet}
  {#snippet status()}<Badge variant="success" dot>Published</Badge>{/snippet}
  {#snippet meta()}Post #42 · updated Nov 3, 2026 by Ana López{/snippet}
  {#snippet actions()}
    <Button variant="secondary">View on site</Button>
    <Button>Edit</Button>
  {/snippet}
  {#snippet tabs()}
    <Tabs
      ariaLabel="Post sections"
      panels={false}
      bind:value={section}
      items={[
        { id: "content", label: "Content" },
        { id: "history", label: "History", count: 3 },
      ]}
    />
  {/snippet}
</PageHeader>
