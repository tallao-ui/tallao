<!--
  tallao — the Admin demo
  One model list page and one record detail page built only from the kit, inside an AppShell.
  It is the reference an admin copies: the order of the pieces, who owns which state, and
  what each page does with loading, empty and error.

  List:   PageHeader → FilterBar (+ SavedViews) → SelectionBar → DataTable → Pagination
  Detail: PageHeader (+ Tabs) → form fields + DescriptionList → Timeline + DiffView → SaveBar
-->
<script lang="ts">
  import {
    AppShell,
    Avatar,
    Badge,
    Breadcrumb,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    DescriptionList,
    DiffView,
    DropdownMenu,
    EmptyState,
    Field,
    FilterBar,
    Icon,
    Input,
    Kbd,
    MenuItem,
    MenuSeparator,
    PageHeader,
    Pagination,
    SaveBar,
    SavedViews,
    Select,
    SelectionBar,
    Sidebar,
    Switch,
    Tabs,
    Textarea,
    Timeline,
    ToggleGroup,
    filtersToQuery,
    type DataDensity,
    type DataSort,
    type FilterDef,
    type FilterValues,
    type SavedView,
  } from "$lib/components";
  import { toast } from "$lib/toast.svelte";

  interface Post {
    id: string;
    title: string;
    author: string;
    status: "Draft" | "In review" | "Published";
    featured: boolean;
    updated: string;
    views: number;
  }

  const posts: Post[] = [
    { id: "42", title: "Patch 1.2 notes", author: "Ana López", status: "Published", featured: true, updated: "2026-11-03", views: 9810 },
    { id: "41", title: "Autumn Open: finals recap", author: "Luis Vega", status: "Published", featured: false, updated: "2026-10-19", views: 7302 },
    { id: "40", title: "Controller rework preview", author: "Ana López", status: "In review", featured: false, updated: "2026-11-08", views: 0 },
    { id: "39", title: "Tier list: November", author: "Bea Ortiz", status: "Draft", featured: false, updated: "2026-11-09", views: 0 },
    { id: "38", title: "How ranked placements work", author: "Luis Vega", status: "Published", featured: true, updated: "2026-09-28", views: 4120 },
    { id: "37", title: "Kaela build guide", author: "Bea Ortiz", status: "Published", featured: false, updated: "2026-10-02", views: 2875 },
    { id: "36", title: "Season 3 roadmap", author: "Ana López", status: "Draft", featured: false, updated: "2026-11-01", views: 0 },
    { id: "35", title: "Community tournament rules", author: "Luis Vega", status: "In review", featured: false, updated: "2026-10-27", views: 0 },
    { id: "34", title: "Patch 1.1 notes", author: "Ana López", status: "Published", featured: false, updated: "2026-10-06", views: 6640 },
    { id: "33", title: "Meet the casters", author: "Bea Ortiz", status: "Published", featured: false, updated: "2026-09-14", views: 1203 },
  ];

  const filterDefs: FilterDef[] = [
    { key: "status", label: "Status", type: "select", options: ["Draft", "In review", "Published"] },
    { key: "featured", label: "Featured", type: "boolean" },
    { key: "author", label: "Author", type: "text", placeholder: "Name contains…", hidden: true },
    { key: "since", label: "Updated since", type: "date", hidden: true },
  ];

  // ——— Navigation between the two pages (a router in a real admin) ———
  let view = $state<"list" | "detail">("list");
  let recordId = $state("42");
  const record = $derived(posts.find((p) => p.id === recordId) ?? posts[0]);

  function open(id: string) {
    recordId = id;
    form = initialForm(posts.find((p) => p.id === id) ?? posts[0]);
    saved = { ...form };
    section = "content";
    view = "detail";
  }

  function route(event: MouseEvent) {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#admin/"]');
    if (!link) return;
    event.preventDefault();
    const id = link.getAttribute("href")!.split("/")[2];
    if (id) open(id);
    else view = "list";
  }

  // ——— List page state: everything the URL would hold ———
  let query = $state<FilterValues>({});
  let sort = $state<DataSort | null>({ key: "updated", direction: "desc" });
  let page = $state(1);
  let selected = $state<string[]>([]);
  let density = $state<DataDensity>("comfortable");
  let visibleColumns = $state<string[] | undefined>(undefined);
  let simulate = $state("data");
  const pageSize = 5;

  let views = $state<SavedView<FilterValues>[]>([
    { name: "Drafts", query: { status: "Draft" } },
    { name: "Featured and published", query: { status: "Published", featured: true } },
  ]);
  let currentView = $state<string | null>(null);

  const matches = (post: Post) => {
    const text = typeof query.q === "string" ? query.q.toLowerCase() : "";
    if (text && !post.title.toLowerCase().includes(text)) return false;
    if (query.status && post.status !== query.status) return false;
    if (typeof query.featured === "boolean" && post.featured !== query.featured) return false;
    if (typeof query.author === "string" && !post.author.toLowerCase().includes(query.author.toLowerCase())) return false;
    if (typeof query.since === "string" && post.updated < query.since) return false;
    return true;
  };
  const filtered = $derived.by(() => {
    if (simulate === "empty") return [];
    const rows = posts.filter(matches);
    if (!sort) return rows;
    const { key, direction } = sort;
    const sign = direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = a[key as keyof Post];
      const y = b[key as keyof Post];
      return sign * (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y)));
    });
  });
  const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / pageSize)));
  const rows = $derived(simulate === "loading" ? [] : filtered.slice((page - 1) * pageSize, page * pageSize));
  const hasFilters = $derived(Object.keys(query).length > 0);

  function setQuery(next: FilterValues) {
    query = next;
    page = 1;
    selected = [];
  }

  const statusVariant = (status: Post["status"]) => (status === "Published" ? "success" : status === "In review" ? "warning" : "default");
  const dateText = (iso: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(`${iso}T00:00:00Z`));

  // ——— Detail page state ———
  const initialForm = (post: Post) => ({
    title: post.title,
    slug: post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    status: post.status as string,
    excerpt: "Dash reset removed, Oskar's shield up 10%, and the first controller changes.",
    featured: post.featured,
  });
  let form = $state(initialForm(posts[0]));
  let saved = $state({ ...initialForm(posts[0]) });
  let saving = $state(false);
  let section = $state("content");
  const dirty = $derived(JSON.stringify(form) !== JSON.stringify(saved));

  function save(next?: "list" | "new") {
    saving = true;
    setTimeout(() => {
      saving = false;
      saved = { ...form };
      toast.success("Post saved");
      if (next === "list") view = "list";
    }, 900);
  }

  const history = [
    { date: "2026-11-03", title: "Published by Ana López", description: "Status: In review → Published", tag: "Publish", tone: "success" as const, current: true },
    { date: "2026-11-02", title: "Edited by Luis Vega", description: "Title, excerpt and tags changed", tag: "Edit" },
    { date: "2026-10-30", title: "Created by Ana López", tag: "Create", tone: "accent" as const },
  ];
  const lastChanges = [
    { field: "title", label: "Title", before: "Patch 1.2", after: "Patch 1.2 notes" },
    {
      field: "excerpt",
      label: "Excerpt",
      before: "Dash reset removed.",
      after: "Dash reset removed, Oskar's shield up 10%, and the first controller changes.",
    },
    { field: "tags", label: "Tags", before: ["patch"], after: ["patch", "balance", "controller"] },
    { field: "hero", label: "Hero image", before: null, after: "/media/patch-1-2/hero.webp" },
    { field: "legacy_id", label: "Legacy id", before: 1042, after: null },
  ];
</script>

<!-- The demo's router: links to #admin/posts and #admin/posts/<id> switch the page in place. -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="admin-frame" onclick={route}>
  <AppShell landmarks={false} height="100%" mainId="admin-demo-main">
    {#snippet sidebar({ mobile, close })}
      <Sidebar
        ariaLabel={mobile ? "Admin navigation (sheet)" : "Admin navigation"}
        collapsible={!mobile}
        current="posts"
        groups={[
          {
            label: "Content",
            items: [
              { id: "posts", label: "Posts", icon: "edit", badge: posts.length, onclick: () => ((view = "list"), close()) },
              { id: "pages", label: "Pages", icon: "copy", onclick: close },
              { id: "media", label: "Media", icon: "upload", onclick: close },
            ],
          },
          {
            label: "System",
            items: [
              { id: "users", label: "Users", icon: "user", onclick: close },
              { id: "approvals", label: "Approvals", icon: "check", badge: 2, badgeVariant: "warning", badgePulse: true, onclick: close },
              { id: "settings", label: "Settings", icon: "settings", onclick: close },
            ],
          },
        ]}
      >
        {#snippet header()}Kitsuden{/snippet}
      </Sidebar>
    {/snippet}
    {#snippet breadcrumb()}
      {#if view === "list"}
        <Breadcrumb ariaLabel="Admin trail" items={[{ label: "Content", href: "#admin/posts" }, { label: "Posts" }]} />
      {:else}
        <Breadcrumb ariaLabel="Admin trail" items={[{ label: "Content", href: "#admin/posts" }, { label: "Posts", href: "#admin/posts" }, { label: record.title }]} />
      {/if}
    {/snippet}
    {#snippet command()}
      <Button variant="secondary" size="sm" ariaLabel="Search or run a command">
        <Icon name="search" size={14} /><span class="admin-command-text">Search</span><span class="admin-command-keys"><Kbd keys={["Mod", "K"]} size="sm" /></span>
      </Button>
    {/snippet}
    {#snippet user()}
      <DropdownMenu label="Account" placement="bottom-end">
        {#snippet trigger(props)}
          <button {...props} type="button" class="admin-user" aria-label="Account: Ana López"><Avatar name="Ana López" size="sm" decorative /></button>
        {/snippet}
        <MenuItem>Profile</MenuItem>
        <MenuItem>API tokens</MenuItem>
        <MenuSeparator />
        <MenuItem>Sign out</MenuItem>
      </DropdownMenu>
    {/snippet}

    {#if view === "list"}
      <!-- ——— Model list ——— -->
      <PageHeader title="Posts" level={3} description="News, patch notes and guides published on the site.">
        {#snippet meta()}{posts.length} posts · 3 authors{/snippet}
        {#snippet actions()}
          <Button variant="secondary">Export</Button>
          <Button onclick={() => open("42")}>New post</Button>
        {/snippet}
      </PageHeader>

      <div class="admin-stack">
        <FilterBar filters={filterDefs} bind:value={query} onchange={setQuery} searchPlaceholder="Search posts…">
          {#snippet end()}
            <SavedViews
              {views}
              bind:current={currentView}
              {query}
              onSelect={(v) => setQuery(v.query)}
              onSave={(v) => (views = [...views.filter((x) => x.name !== v.name), v])}
              onRename={(v, name) => (views = views.map((x) => (x.name === v.name ? { ...x, name } : x)))}
              onDelete={(v) => (views = views.filter((x) => x.name !== v.name))}
            />
          {/snippet}
        </FilterBar>

        {#if selected.length > 0}
          <SelectionBar
            total={rows.length}
            selected={selected.length}
            onToggleAll={(checked) => (selected = checked ? rows.map((r) => r.id) : [])}
            ariaLabel="Bulk actions"
          >
            {#snippet actions()}
              <Button size="sm" variant="secondary" onclick={() => { toast.success(`${selected.length} published`); selected = []; }}>Publish</Button>
              <Button size="sm" variant="secondary">Move to draft</Button>
              <Button size="sm" variant="danger-ghost">Delete</Button>
            {/snippet}
          </SelectionBar>
        {/if}

        <DataTable
          caption="Posts"
          {rows}
          rowKey="id"
          rowLabel={(r) => r.title}
          manual
          bind:sort
          bind:selected
          bind:density
          bind:visibleColumns
          selectable
          densityToggle
          columnChooser
          rowHref={(r) => `#admin/posts/${r.id}`}
          loading={simulate === "loading"}
          error={simulate === "error" ? "The API answered 503. Nothing was changed." : null}
          onRetry={() => (simulate = "data")}
          columns={[
            { key: "title", header: "Title", sortable: true, hideable: false },
            { key: "status", header: "Status", sortable: true },
            { key: "author", header: "Author", sortable: true },
            { key: "updated", header: "Updated", sortable: true },
            { key: "views", header: "Views", sortable: true, align: "right" },
          ]}
        >
          {#snippet toolbar()}
            <span class="admin-count" aria-live="polite">
              {filtered.length} {filtered.length === 1 ? "post" : "posts"}{#if hasFilters}<code>?{filtersToQuery(query)}</code>{/if}
            </span>
          {/snippet}
          {#snippet cell(row, col)}
            {#if col.key === "title"}
              {row.title}{#if row.featured}<Badge variant="accent" size="sm" class="admin-flag">Featured</Badge>{/if}
            {:else if col.key === "status"}
              <Badge variant={statusVariant(row.status)} dot>{row.status}</Badge>
            {:else if col.key === "updated"}
              {dateText(row.updated)}
            {:else if col.key === "views"}
              {row.views.toLocaleString("en")}
            {:else}
              {row[col.key as keyof Post]}
            {/if}
          {/snippet}
          {#snippet rowActions(row)}
            <DropdownMenu label={`Actions: ${row.title}`} placement="bottom-end">
              {#snippet trigger(props)}
                <Button {...props} variant="ghost" size="icon" ariaLabel={`Actions: ${row.title}`}><span aria-hidden="true">⋯</span></Button>
              {/snippet}
              <MenuItem onSelect={() => open(row.id)}>Edit</MenuItem>
              <MenuItem>Duplicate</MenuItem>
              <MenuItem>View on site</MenuItem>
              <MenuSeparator />
              <MenuItem variant="danger">Delete</MenuItem>
            </DropdownMenu>
          {/snippet}
          {#snippet empty()}
            {#if hasFilters}
              <EmptyState variant="no-results" size="sm" level={null} description="Try fewer filters, or a different search." onClearFilters={() => setQuery({})} />
            {:else}
              <EmptyState size="sm" level={null} title="No posts yet" description="Posts you write appear here." actionLabel="New post" onAction={() => open("42")} />
            {/if}
          {/snippet}
        </DataTable>

        <div class="admin-foot">
          <ToggleGroup
            ariaLabel="Simulate a table state"
            size="sm"
            bind:value={simulate}
            options={[
              { value: "data", label: "Data" },
              { value: "loading", label: "Loading" },
              { value: "empty", label: "Empty" },
              { value: "error", label: "Error" },
            ]}
          />
          {#if pageCount > 1 && simulate === "data"}
            <Pagination bind:page {pageCount} ariaLabel="Pagination: Posts" />
          {/if}
        </div>
      </div>
    {:else}
      <!-- ——— Record detail ——— -->
      <PageHeader title={form.title || "Untitled"} level={3}>
        {#snippet status()}<Badge variant={statusVariant(record.status)} dot>{record.status}</Badge>{/snippet}
        {#snippet meta()}Post #{record.id} · updated {dateText(record.updated)} by {record.author}{/snippet}
        {#snippet actions()}
          <Button variant="secondary">View on site</Button>
          <DropdownMenu label="More actions" placement="bottom-end">
            {#snippet trigger(props)}<Button {...props} variant="secondary" size="icon" ariaLabel="More actions"><span aria-hidden="true">⋯</span></Button>{/snippet}
            <MenuItem>Duplicate</MenuItem>
            <MenuItem>Move to draft</MenuItem>
            <MenuSeparator />
            <MenuItem variant="danger">Delete</MenuItem>
          </DropdownMenu>
        {/snippet}
        {#snippet tabs()}
          <Tabs
            ariaLabel="Post sections"
            panels={false}
            bind:value={section}
            items={[
              { id: "content", label: "Content", controls: "admin-panel-content", tabId: "admin-tab-content" },
              { id: "history", label: "History", count: history.length, controls: "admin-panel-history", tabId: "admin-tab-history" },
            ]}
          />
        {/snippet}
      </PageHeader>

      <div id="admin-panel-content" role="tabpanel" aria-labelledby="admin-tab-content" hidden={section !== "content"}>
        <form id="admin-post-form" class="admin-detail" onsubmit={(e) => { e.preventDefault(); save(); }}>
          <div class="admin-fields">
            <Field label="Title" required><Input bind:value={form.title} required /></Field>
            <Field label="Slug"><Input bind:value={form.slug} /></Field>
            <Field label="Status">
              <Select bind:value={form.status} options={[{ value: "Draft", label: "Draft" }, { value: "In review", label: "In review" }, { value: "Published", label: "Published" }]} />
            </Field>
            <Field label="Excerpt"><Textarea bind:value={form.excerpt} rows={4} /></Field>
            <Switch bind:checked={form.featured} label="Featured on the home page" />
          </div>
          <Card class="admin-about">
            <CardHeader><CardTitle level={4}>About</CardTitle></CardHeader>
            <CardContent>
              <DescriptionList
                ariaLabel="About this post"
                layout="stacked"
                items={[
                  { label: "Created", value: "Oct 30, 2026, 10:12" },
                  { label: "Updated", value: `${dateText(record.updated)}, 18:40` },
                  { label: "Author", value: record.author, href: "#admin/posts" },
                  { label: "Views", value: record.views.toLocaleString("en") },
                  { label: "API path", value: `/api/posts/${record.id}`, copy: true },
                  { label: "Deleted", value: null },
                ]}
              />
            </CardContent>
          </Card>
        </form>
        <SaveBar
          form="admin-post-form"
          {dirty}
          {saving}
          savedText="All changes saved"
          cancelLabel="Discard"
          onCancel={dirty ? () => (form = { ...saved }) : undefined}
          secondaryActions={[{ id: "list", label: "Save and close", onSelect: (e) => { e.preventDefault(); save("list"); } }]}
        />
      </div>

      <div id="admin-panel-history" role="tabpanel" aria-labelledby="admin-tab-history" hidden={section !== "history"}>
        <div class="admin-history">
          <div>
            <h4 class="admin-h">Activity</h4>
            <Timeline ariaLabel="History of this post" locale="en" items={history} />
            <h4 class="admin-h">Earlier, in one line each</h4>
            <DiffView
              compact
              ariaLabel="Changes on Nov 3"
              changes={[
                { field: "status", label: "Status", before: "In review", after: "Published" },
                { field: "published_at", label: "Published at", before: null, after: "2026-11-03T18:40:00Z" },
                { field: "reviewer", label: "Reviewer", before: "Luis Vega", after: null },
              ]}
            />
          </div>
          <div>
            <h4 class="admin-h">Edited by Luis Vega · Nov 2, 2026</h4>
            <DiffView ariaLabel="Changes on Nov 2" changes={lastChanges} />
          </div>
        </div>
      </div>
    {/if}
  </AppShell>
</div>

<style>
  .admin-frame {
    height: 52rem;
    max-height: 90vh;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
  }

  .admin-stack { display: flex; flex-direction: column; gap: 0.75rem; }
  .admin-count { display: inline-flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); }
  .admin-count code {
    max-width: 100%;
    padding: 0.0625rem 0.375rem;
    font-family: var(--ta-font-mono);
    font-size: 0.75rem;
    overflow-wrap: anywhere;
    background: rgb(var(--ta-elevated));
    border-radius: var(--ta-radius-sm);
  }
  :global(.admin-flag) { margin-left: 0.5rem; vertical-align: middle; }
  .admin-foot { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; }

  .admin-user { display: inline-flex; padding: 0; background: none; border: none; border-radius: 50%; cursor: pointer; }
  .admin-user:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

  .admin-detail { display: grid; grid-template-columns: minmax(0, 1fr) 18rem; gap: 1.5rem; align-items: start; }
  .admin-fields { display: flex; flex-direction: column; gap: 1rem; min-width: 0; max-width: 40rem; }
  .admin-history { display: grid; grid-template-columns: minmax(0, 20rem) minmax(0, 1fr); gap: 2rem; align-items: start; }
  .admin-h { margin: 0 0 0.75rem; font-size: 0.8125rem; font-weight: 600; color: rgb(var(--ta-text-dim)); }
  .admin-h:not(:first-child) { margin-top: 1.5rem; }

  @media (max-width: 900px) {
    .admin-detail,
    .admin-history { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 480px) {
    .admin-command-text,
    .admin-command-keys { display: none; }
    .admin-frame { max-height: none; height: 46rem; }
  }
</style>
