<!-- The admin building blocks: PageHeader, FilterBar + FilterChip, EmptyState, SaveBar, DiffView, Kbd,
     DescriptionList, SavedViews, AppShell, the checked MenuItem and the DataTable additions. -->
<script lang="ts">
  import {
    AppShell,
    Badge,
    Breadcrumb,
    Button,
    DataTable,
    DescriptionList,
    DiffView,
    DropdownMenu,
    EmptyState,
    FilterBar,
    FilterChip,
    Kbd,
    MenuItem,
    PageHeader,
    SaveBar,
    SavedViews,
    Sidebar,
    Tabs,
    type DataDensity,
    type FilterValues,
    type SavedView,
  } from "$lib/components";

  let {
    query = $bindable({}),
    onchange,
    onAction,
    onClearFilters,
    onRetry,
    onSave,
    onCancel,
    onViewEvent,
    tableLoading = false,
    tableError = null,
    tableRows,
    platform = "other",
  }: {
    query?: FilterValues;
    onchange?: (value: FilterValues) => void;
    onAction?: () => void;
    onClearFilters?: () => void;
    onRetry?: () => void;
    onSave?: () => void;
    onCancel?: () => void;
    onViewEvent?: (kind: string, name: string, extra?: unknown) => void;
    tableLoading?: boolean;
    tableError?: string | null;
    tableRows?: { id: string; title: string; status: string; views: number }[];
    platform?: "auto" | "mac" | "other";
  } = $props();

  let section = $state("content");
  let chip = $state<string | boolean | null>(null);
  let dirty = $state(false);
  let saving = $state(false);
  let density = $state<DataDensity>("comfortable");
  let visibleColumns = $state<string[] | undefined>(undefined);
  let menuAction = $state("");

  let views = $state<SavedView<FilterValues>[]>([{ name: "Drafts", query: { status: "Draft" } }]);
  let currentView = $state<string | null>(null);

  const posts = [
    { id: "p1", title: "Patch 1.2 notes", status: "Published", views: 4120 },
    { id: "p2", title: "Autumn Open recap", status: "Draft", views: 12 },
  ];
  const long = "Lorem ipsum dolor sit amet. ".repeat(20);
</script>

<PageHeader title="Posts" description="Everything published on the site." data-testid="header">
  {#snippet breadcrumb()}<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Posts" }]} />{/snippet}
  {#snippet status()}<Badge variant="success" dot>Published</Badge>{/snippet}
  {#snippet meta()}Updated 2 hours ago by Ana{/snippet}
  {#snippet actions()}<Button variant="secondary">Export</Button><Button>New post</Button>{/snippet}
  {#snippet tabs()}<Tabs ariaLabel="Post sections" panels={false} bind:value={section} items={[{ id: "content", label: "Content" }, { id: "history", label: "History" }]} />{/snippet}
</PageHeader>
<PageHeader title="Plain" level={2} divider={false} data-testid="plain-header" />

<FilterBar
  bind:value={query}
  {onchange}
  filters={[
    { key: "status", label: "Status", type: "select", options: ["Draft", { value: "pub", label: "Published" }] },
    { key: "featured", label: "Featured", type: "boolean" },
    { key: "since", label: "Since", type: "date", hidden: true },
    { key: "author", label: "Author", type: "text", hidden: true },
  ]}
>
  {#snippet end()}
    <SavedViews
      {views}
      bind:current={currentView}
      {query}
      onSelect={(view) => {
        query = view.query;
        onViewEvent?.("select", view.name);
      }}
      onSave={(view) => {
        views = [...views.filter((v) => v.name !== view.name), view];
        onViewEvent?.("save", view.name, view.query);
      }}
      onRename={(view, name) => {
        views = views.map((v) => (v.name === view.name ? { ...v, name } : v));
        onViewEvent?.("rename", view.name, name);
      }}
      onDelete={(view) => {
        views = views.filter((v) => v.name !== view.name);
        onViewEvent?.("delete", view.name);
      }}
    />
  {/snippet}
</FilterBar>
<output data-testid="query">{JSON.stringify(query)}</output>
<output data-testid="view">{currentView ?? "none"}</output>

<FilterChip label="Lone" type="text" bind:value={chip} placeholder="Contains…" />
<output data-testid="chip">{JSON.stringify(chip)}</output>

<EmptyState title="No posts yet" description="Write the first one." actionLabel="New post" {onAction} data-testid="empty" />
<EmptyState variant="no-results" {onClearFilters} level={2} />
<EmptyState variant="error" description="The API answered 500." {onRetry} />

<form id="post-form" onsubmit={(e) => e.preventDefault()}>
  <label>Title <input name="title" oninput={() => (dirty = true)} /></label>
</form>
<SaveBar
  form="post-form"
  {dirty}
  {saving}
  savedText="All changes saved"
  onSave={() => {
    onSave?.();
    saving = true;
  }}
  {onCancel}
  secondaryActions={[{ id: "add", label: "Save and add another", name: "_next", value: "add" }]}
/>
<SaveBar error="The title is taken" sticky={false} ariaLabel="Failed form" disableWhenClean data-testid="failed-bar" />
<button type="button" onclick={() => ((saving = false), (dirty = false))}>Finish saving</button>

<DiffView
  data-testid="diff"
  changes={[
    { field: "title", label: "Title", before: "Hello", after: "Hello, world" },
    { field: "tags", label: "Tags", before: null, after: ["news", "patch"] },
    { field: "excerpt", label: "Excerpt", before: "Old text", after: "" },
    { field: "slug", before: "same", after: "same" },
    { field: "body", label: "Body", before: long, after: `${long} More.` },
  ]}
/>
<DiffView compact ariaLabel="Compact changes" changes={[{ field: "status", label: "Status", before: "Draft", after: "Published" }, { field: "meta", before: null, after: { a: 1 } }]} />
<DiffView changes={[]} />

<p>Open with <Kbd keys={["Mod", "K"]} {platform} data-testid="kbd" />, close with <Kbd>Esc</Kbd>, send with <Kbd keys={["Shift", "Enter"]} platform="mac" data-testid="kbd-mac" /></p>

<DescriptionList
  ariaLabel="About"
  items={[
    { label: "Created", value: "3 Nov 2026" },
    { label: "Author", value: "Ana López", href: "/users/ana" },
    { label: "API path", value: "/api/posts/42", copy: true, mono: true },
    { label: "Deleted", value: null },
  ]}
/>
<DescriptionList ariaLabel="Custom" columns={2} items={[{ label: "Status", value: "live" }]}>
  {#snippet value(item)}<Badge variant="success">{item.value}</Badge>{/snippet}
</DescriptionList>

<DropdownMenu label="Options">
  {#snippet trigger(props)}<Button {...props}>Options</Button>{/snippet}
  <MenuItem onSelect={() => (menuAction = "plain")}>Plain</MenuItem>
  <MenuItem checked={menuAction === "wrap"} closeOnSelect={false} onSelect={() => (menuAction = menuAction === "wrap" ? "" : "wrap")}>Wrap lines</MenuItem>
  <MenuItem checked={false} checkType="radio" onSelect={() => (menuAction = "radio")}>Radio</MenuItem>
</DropdownMenu>
<output data-testid="menu-action">{menuAction}</output>

<DataTable
  caption="Posts"
  rows={tableRows ?? posts}
  rowKey="id"
  rowLabel={(r) => r.title}
  columns={[
    { key: "title", header: "Title", sortable: true, hideable: false },
    { key: "status", header: "Status" },
    { key: "views", header: "Views", align: "right", sortable: true },
  ]}
  selectable
  densityToggle
  columnChooser
  bind:density
  bind:visibleColumns
  rowHref={(r) => `/posts/${r.id}`}
  loading={tableLoading}
  error={tableError}
  {onRetry}
>
  {#snippet toolbar()}<span data-testid="toolbar-start">2 posts</span>{/snippet}
  {#snippet rowActions(row)}
    <DropdownMenu label={`Actions: ${row.title}`} placement="bottom-end">
      {#snippet trigger(props)}<Button {...props} variant="ghost" size="icon" ariaLabel={`Actions: ${row.title}`}>⋯</Button>{/snippet}
      <MenuItem>Duplicate</MenuItem>
    </DropdownMenu>
  {/snippet}
</DataTable>
<output data-testid="density">{density}</output>
<output data-testid="columns">{visibleColumns ? visibleColumns.join(",") : "all"}</output>

<DataTable caption="Custom empty" rows={[]} rowKey="id" columns={[{ key: "x", header: "X" }]}>
  {#snippet empty({ filtered })}<EmptyState level={null} title={filtered ? "Filtered out" : "Nothing in the custom table"} />{/snippet}
</DataTable>

<AppShell landmarks={false} height="auto" mainId="shell-main">
  {#snippet sidebar({ mobile, close })}
    <Sidebar
      ariaLabel={mobile ? "Mobile navigation" : "Main navigation"}
      collapsible={!mobile}
      groups={[{ items: [{ id: "posts", label: "Posts", href: "#posts", onclick: close }, { id: "users", label: "Users", href: "#users", onclick: close }] }]}
      current="posts"
    />
  {/snippet}
  {#snippet breadcrumb()}<Breadcrumb ariaLabel="Shell trail" items={[{ label: "Admin", href: "/" }, { label: "Posts" }]} />{/snippet}
  {#snippet command()}<Button variant="secondary" size="sm">Search <Kbd keys={["Mod", "K"]} platform="other" size="sm" /></Button>{/snippet}
  {#snippet user()}<Button variant="ghost" size="sm">Ana</Button>{/snippet}
  <p>Shell content</p>
</AppShell>
