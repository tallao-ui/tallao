<!-- layout: wide; height: 26 -->
<script lang="ts">
  import { AppShell, Avatar, Breadcrumb, Button, Icon, Kbd, PageHeader, Sidebar } from "tallao";
</script>

<div style="height: 26rem; overflow: hidden; border: 1px solid rgb(var(--ta-border)); border-radius: var(--ta-radius-lg)">
  <AppShell landmarks={false} height="100%">
    {#snippet sidebar({ mobile, close })}
      <Sidebar
        ariaLabel={mobile ? "Navigation (sheet)" : "Navigation"}
        collapsible={!mobile}
        current="posts"
        groups={[
          {
            label: "Content",
            items: [
              { id: "posts", label: "Posts", icon: "edit", badge: 10, onclick: close },
              { id: "media", label: "Media", icon: "upload", onclick: close },
            ],
          },
          { label: "System", items: [{ id: "settings", label: "Settings", icon: "settings", onclick: close }] },
        ]}
      >
        {#snippet header()}Kitsuden{/snippet}
      </Sidebar>
    {/snippet}
    {#snippet breadcrumb()}
      <Breadcrumb ariaLabel="Trail" items={[{ label: "Content", href: "#" }, { label: "Posts" }]} />
    {/snippet}
    {#snippet command()}
      <Button variant="secondary" size="sm" ariaLabel="Search or run a command">
        <Icon name="search" size={14} /> Search <Kbd keys={["Mod", "K"]} size="sm" />
      </Button>
    {/snippet}
    {#snippet user()}
      <Avatar name="Ana López" size="sm" />
    {/snippet}

    <PageHeader title="Posts" level={2} description="News, patch notes and guides published on the site." />
  </AppShell>
</div>
