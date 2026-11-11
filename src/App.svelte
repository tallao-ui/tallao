<!--
  tallao — demo
  Shows every v0.1 component with its variants and states.
-->
<script lang="ts">
  import {
    Button,
    Badge,
    Input,
    Dialog,
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
    PromptInput,
    ToolCallCard,
    Select,
    Textarea,
    Checkbox,
    Field,
    Tabs,
    Alert,
    Stat,
    ConfirmDialog,
    Popover,
    Tooltip,
    DropdownMenu,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    Combobox,
    Switch,
    RadioGroup,
    Sheet,
    Toaster,
    Command,
    ContextMenu,
    Accordion,
    Progress,
    Skeleton,
    Avatar,
    Label,
    SelectionBar,
    KeyValueEditor,
    CopyButton,
    DragBoard,
    DropZone,
    DragItem,
    ChatMessage,
    DataTable,
    Pagination,
    DatePicker,
    Calendar,
    MonthView,
    Spinner,
    FileUpload,
    Breadcrumb,
    Icon,
    SplitPane,
    Sidebar,
    BottomNav,
    NavMenu,
    BarChart,
    LineChart,
    SchemaForm,
    Slider,
    SearchInput,
    Toggle,
    ToggleGroup,
    NumberInput,
    Rating,
    Carousel,
    CompareSlider,
    Steps,
    SuggestionChips,
    CodeBlock,
    Sources,
    UsageMeter,
    InputOTP,
    BarList,
    BigNumber,
    ChartCard,
    ChartLegend,
    ComparisonBar,
    DashboardGrid,
    DashboardItem,
    DonutChart,
    Funnel,
    Gauge,
    Heatmap,
    IconArray,
    KpiCard,
    ScatterChart,
    Sparkline,
    Timeline,
    type DataFilters,
    type JsonSchema,
  } from "$lib/components";
  import { CodeEditor } from "$lib/code";
  import { GameMap } from "$lib/map";
  import { toast } from "$lib/toast.svelte";

  // The demo is in English, so it keeps the kit's default `en` labels.

  let theme = $state<"dark" | "light">("dark");
  let dialogOpen = $state(false);
  let search = $state("");
  let loading = $state(false);

  // ——— Forms and administration ———
  let role = $state("member");
  let notes = $state("");
  let isAgent = $state(true);
  let tab = $state("members");
  let adminTab = $state("drafts");
  let confirmOpen = $state(false);
  let noticeVisible = $state(true);

  // ——— Floating layer ———
  let popoverFilter = $state("");
  let lastAction = $state("none");
  let chosenGame = $state<string | null>(null);

  // ——— 0.6 ———
  const tableGames = [
    { id: "aniimo", name: "Aniimo", visits: 4120, status: "Published" },
    { id: "cardback", name: "Cardback", visits: 2875, status: "In review" },
    { id: "cozy", name: "Cozy Games", visits: 640, status: "Draft" },
    { id: "d4", name: "Diablo IV", visits: 9810, status: "Published" },
    { id: "er", name: "Elden Ring", visits: 7302, status: "Published" },
    { id: "gd", name: "Grim Dawn", visits: 1203, status: "Draft" },
  ];
  let tableSelection = $state<string[]>([]);
  let demoDate = $state<string | null>("2026-11-03");
  let demoPage = $state(3);
  let demoOtp = $state("");
  let demoFilters = $state<DataFilters>({});
  let demoTags = $state<string[]>(["bug"]);
  const searchGames = (q: string) =>
    new Promise<{ value: string; label: string }[]>((r) =>
      setTimeout(() => r(tableGames.filter((g) => g.name.toLowerCase().includes(q.toLowerCase())).map((g) => ({ value: g.id, label: g.name }))), 300)
    );

  // ——— 0.5 ———
  const demoRows = ["Comment by ana", "Comment by luis", "Comment by eva"];
  let demoChecked = $state<string[]>([]);
  let demoStats = $state([{ key: "hp", value: "1200" }, { key: "atk", value: "85" }]);
  let demoTiers = $state<Record<string, string>>({ Nahida: "pool", Raiden: "pool", Furina: "s" });

  // ——— 0.4 ———
  let emailNotices = $state(true);
  let plan = $state("pro");
  let sidePanel = $state(false);
  let palette = $state(false);
  let lastCommand = $state("none");
  const commands = [
    { id: "new", label: "New project", group: "Projects", shortcut: "N", onSelect: () => (lastCommand = "new project") },
    { id: "open", label: "Open Aniimo", group: "Projects", keywords: ["game"], onSelect: () => (lastCommand = "open Aniimo") },
    { id: "theme", label: "Toggle theme", group: "Settings", keywords: ["dark", "light"], onSelect: () => toggleTheme() },
    { id: "logout", label: "Log out", group: "Settings", disabled: true, onSelect: () => {} },
  ];
  const comboGames = [
    "Aniimo", "Cardback", "Cozy Games", "Diablo IV", "Elden Ring", "Grim Dawn", "Last Epoch",
    "Monster Hunter Wilds", "Palworld", "Path of Exile 2", "Pokémon TCG Pocket", "Star Rail",
  ].map((n) => ({ value: n.toLowerCase().replaceAll(" ", "-"), label: n }));
  // Palette with results from the page (like the sites' search): unfiltered, with a delay and links.
  let remotePalette = $state(false);
  let remoteQuery = $state("");
  let remoteLoading = $state(false);
  let remoteResults = $state<{ id: string; label: string; description: string; href: string; group: string; badge: string }[]>([]);
  $effect(() => {
    const q = remoteQuery.trim().toLowerCase();
    if (q.length < 2) {
      remoteResults = [];
      remoteLoading = false;
      return;
    }
    remoteLoading = true;
    const wait = setTimeout(() => {
      remoteResults = comboGames
        .filter((g) => g.label.toLowerCase().includes(q))
        .slice(0, 5)
        .map((g) => ({ id: g.value, label: g.label, description: "Simulated API response", href: `#${g.value}`, group: "Games", badge: "Game" }));
      remoteLoading = false;
    }, 500);
    return () => clearTimeout(wait);
  });

  $effect(() => {
    document.documentElement.dataset.tallaoTheme = theme;
  });

  const games = [
    { name: "World of Warcraft: Forever", status: "Published", platforms: 2, popularity: 98 },
    { name: "Aniimo", status: "Draft", platforms: 3, popularity: 41 },
    { name: "Riftbound", status: "In review", platforms: 1, popularity: 77 },
    { name: "Dressmaker", status: "Published", platforms: 2, popularity: 86 },
  ];

  function toggleTheme() {
    theme = theme === "dark" ? "light" : "dark";
  }

  function simulateLoading() {
    loading = true;
    setTimeout(() => (loading = false), 1600);
  }

  // ——— Generative layer: demo mini-chat ———
  type Message =
    | { kind: "user"; text: string }
    | { kind: "tool"; name: string; args: Record<string, unknown>; status: "pending" | "executing" | "executed" | "rejected" };

  let messages = $state<Message[]>([]);
  let thinking = $state(false);

  function sendPrompt(text: string) {
    messages = [...messages, { kind: "user", text }];
    thinking = true;
    setTimeout(() => {
      thinking = false;
      messages = [
        ...messages,
        {
          kind: "tool",
          name: "publish_post",
          args: { site: "valhalla", title: text, section: "news" },
          status: "pending",
        },
      ];
    }, 900);
  }

  function decide(i: number, approved: boolean) {
    const m = messages[i];
    if (m.kind !== "tool") return;
    m.status = approved ? "executing" : "rejected";
    if (approved) {
      setTimeout(() => { m.status = "executed"; }, 1200);
    }
  }

  // ——— Map ———
  const demoMarkers = [
    { lat: 40.4168, lng: -3.7038, title: "Madrid", description: "Guild headquarters · 12 members" },
    { lat: 41.3874, lng: 2.1686, title: "Barcelona", description: "Regional tournament · Saturday 18:00" },
    { lat: 37.3891, lng: -5.9845, title: "Seville", description: "Community meetup" },
  ];

  // ——— 0.7 ———
  let listWidth = $state(35);
  let sidebarCollapsed = $state(false);
  const monthlyVisits = [
    { month: "Jun", visits: 4200, signups: 310 },
    { month: "Jul", visits: 5100, signups: 380 },
    { month: "Aug", visits: 4800, signups: 290 },
    { month: "Sep", visits: 6900, signups: 520 },
    { month: "Oct", visits: 8300, signups: 610 },
    { month: "Nov", visits: 7600, signups: 570 },
  ];
  const demoSchema: JsonSchema = {
    type: "object",
    required: ["title", "status"],
    properties: {
      title: { type: "string", title: "Title", minLength: 3 },
      status: {
        type: "string",
        title: "Status",
        oneOf: [
          { const: "draft", title: "Draft" },
          { const: "live", title: "Published" },
        ],
      },
      priority: { type: "integer", title: "Priority", minimum: 1, maximum: 5, default: 3 },
      publishOn: { type: "string", title: "Publish on", format: "date" },
      featured: { type: "boolean", title: "Featured" },
      tags: { type: "array", title: "Tags", items: { enum: ["guide", "patch", "event"] } },
    },
  };
  let schemaValue = $state<Record<string, unknown>>({});
  let demoCode = $state(["# Patch notes", "", "- New **map**", "- Various fixes", ""].join("\n"));

  // ——— Site controls ———
  let demoLevel = $state(30);
  let demoSearch = $state("");
  let favoritesOnly = $state(false);
  let demoRarity = $state("all");
  let demoTypes = $state<string[]>(["fire"]);
  let demoFacets = $state<string[]>([]);
  let demoCopies = $state<number | null>(2);
  let demoRating = $state(4);

  // ——— Carousel · CompareSlider ———
  const demoCards = [
    { id: "aniimo", name: "Aniimo", genre: "Creature collecting", score: "8.6" },
    { id: "d4", name: "Diablo IV", genre: "ARPG", score: "8.1" },
    { id: "er", name: "Elden Ring", genre: "Soulslike", score: "9.5" },
    { id: "gd", name: "Grim Dawn", genre: "ARPG", score: "8.4" },
    { id: "le", name: "Last Epoch", genre: "ARPG", score: "8.0" },
    { id: "pal", name: "Palworld", genre: "Survival", score: "7.9" },
    { id: "sr", name: "Star Rail", genre: "Turn-based gacha", score: "8.3" },
  ];
  let demoAutoplay = $state(false);
  let demoComparison = $state(50);
  // Two images drawn right here: the demo does not depend on files.
  const demoImage = (background: string, text: string) =>
    `data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900"><defs><linearGradient id="g" x2="1" y2="1"><stop offset="0" stop-color="${background}"/><stop offset="1" stop-color="#111"/></linearGradient></defs><rect width="1600" height="900" fill="url(#g)"/><text x="800" y="480" font-family="sans-serif" font-size="120" fill="#fff" text-anchor="middle">${text}</text></svg>`
    )}`;
  const demoBefore = demoImage("#7c3aed", "v1.0");
  const demoAfter = demoImage("#059669", "v2.0");

  // ——— Compact Table · MonthView · Spinner ———
  const matrixTypes = ["Fire", "Water", "Grass", "Electric", "Ice", "Rock", "Wind", "Light", "Shadow"];
  const demoMatrix = matrixTypes.map((_, i) => matrixTypes.map((_, j) => (j === (i + 1) % 9 ? 0.5 : j === (i + 8) % 9 ? 2 : 1)));
  let chosenType = $state(0);
  let demoMonth = $state("2026-11-01");
  const demoEvents = [
    { id: "e1", date: "2026-11-03", title: "Patch 1.2" },
    { id: "e2", date: "2026-11-14", title: "Regional tournament" },
    { id: "e3", date: "2026-11-14", title: "Team livestream" },
    { id: "e4", date: "2026-11-27", title: "End of season" },
  ];
  let chosenEvent = $state("none");

  // ——— BI: a patch report for an invented hero game (every figure is made up) ———
  const percent = (n: number) => `${n.toLocaleString("en", { maximumFractionDigits: 1 })}%`;
  const signedPoints = (n: number) => `${n > 0 ? "+" : ""}${n.toLocaleString("en", { maximumFractionDigits: 1 })} pp`;
  const biRoles = [
    { key: "duelist", label: "Duelist" },
    { key: "vanguard", label: "Vanguard" },
    { key: "support", label: "Support" },
    { key: "controller", label: "Controller" },
  ];
  const biRoleShare = [
    { patch: "0.9", duelist: 38, vanguard: 24, support: 22, controller: 16 },
    { patch: "1.0", duelist: 36, vanguard: 25, support: 22, controller: 17 },
    { patch: "1.1", duelist: 41, vanguard: 21, support: 21, controller: 17 },
    { patch: "1.2", duelist: 34, vanguard: 26, support: 23, controller: 17 },
  ];
  const biHeroes = [
    { label: "Kaela", group: "Duelist", x: 18.4, y: 53.8 },
    { label: "Brann", group: "Vanguard", x: 14.1, y: 51.2 },
    { label: "Ysolde", group: "Support", x: 12.7, y: 52.6 },
    { label: "Riven", group: "Duelist", x: 11.9, y: 48.3 },
    { label: "Thorne", group: "Controller", x: 9.6, y: 50.4 },
    { label: "Mirel", group: "Support", x: 8.8, y: 49.1 },
    { label: "Oskar", group: "Vanguard", x: 7.2, y: 54.6 },
    { label: "Nyx", group: "Controller", x: 6.4, y: 46.9 },
    { label: "Dara", group: "Duelist", x: 5.1, y: 51.7 },
    { label: "Fenn", group: "Support", x: 3.3, y: 47.5 },
    { label: "Vex", group: "Controller", x: 2.5, y: 55.9 },
  ];
  const biTopPicks = biHeroes.slice(0, 8).map((h) => ({ label: h.label, value: h.x, note: h.group, href: `#${h.label.toLowerCase()}` }));
  const biTiers = [
    { label: "S tier", value: 4 },
    { label: "A tier", value: 9 },
    { label: "B tier", value: 14 },
    { label: "C tier", value: 8 },
    { label: "D tier", value: 3 },
  ];
  const biTrends = {
    win: [
      { patch: "0.8", kaela: 49.2, oskar: 51.0, nyx: 50.8 },
      { patch: "0.9", kaela: 50.1, oskar: 51.9, nyx: 49.6 },
      { patch: "1.0", kaela: 51.4, oskar: 52.2, nyx: 49.9 },
      { patch: "1.1", kaela: 55.2, oskar: 53.0, nyx: 48.1 },
      { patch: "1.2", kaela: 53.8, oskar: 54.6, nyx: 46.9 },
    ],
    pick: [
      { patch: "0.8", kaela: 9.4, oskar: 6.1, nyx: 9.8 },
      { patch: "0.9", kaela: 10.8, oskar: 6.0, nyx: 9.1 },
      { patch: "1.0", kaela: 12.9, oskar: 6.6, nyx: 8.2 },
      { patch: "1.1", kaela: 21.3, oskar: 6.9, nyx: 7.0 },
      { patch: "1.2", kaela: 18.4, oskar: 7.2, nyx: 6.4 },
    ],
  };
  let biMeasure = $state<"win" | "pick">("win");
  const biTrendSeries = [
    { key: "kaela", label: "Kaela" },
    { key: "oskar", label: "Oskar" },
    { key: "nyx", label: "Nyx" },
  ];
  const biRoleNames = biRoles.map((r) => r.label);
  const biMatchupValues = [
    [50, 54.2, 47.1, 51.8],
    [45.8, 50, 53.4, 48.9],
    [52.9, 46.6, 50, 55.3],
    [48.2, 51.1, 44.7, 50],
  ];
  const biMatchups = biRoleNames.flatMap((y, r) => biRoleNames.map((x, c) => ({ x, y, value: biMatchupValues[r][c] })));
  const biLadder = [
    { label: "Finished placements", value: 412000 },
    { label: "Reached Gold", value: 238000 },
    { label: "Reached Platinum", value: 96500 },
    { label: "Reached Diamond", value: 21400 },
    { label: "Reached Master", value: 3100 },
  ];
  const biPatchEvents = [
    { date: "2026-10-06", title: "Patch 1.1", description: "Kaela's dash resets on takedown. Pick rate doubles in a week.", tag: "Patch", tone: "warning" as const },
    { date: "2026-10-18", title: "Autumn Open finals", description: "Kaela picked or banned in 31 of 34 maps.", tag: "Tournament" },
    { date: "2026-11-03", title: "Patch 1.2", description: "Dash reset removed, Oskar's shield up 10%.", tag: "Patch", tone: "accent" as const, current: true },
    { date: "2026-11-24", title: "Patch 1.3 preview", description: "Controller rework on the test server.", tag: "Upcoming" },
  ];
  const biDaily = [31, 34, 33, 38, 44, 52, 49, 41, 40, 43, 47, 55, 61, 58];
</script>

<svelte:head>
  <title>tallao — v0.1 components</title>
</svelte:head>

<div class="demo">
  <header class="demo-header">
    <div>
      <h1>⛏️ tallao</h1>
      <p class="demo-subtitle">
        Svelte 5 UI kit extracted from the Kitsuden admin — v0.1 ·
        Button · Card · Dialog · Table · Input · Badge
      </p>
    </div>
    <Button variant="secondary" size="md" onclick={toggleTheme}>
      {theme === "dark" ? "☀️ Light theme" : "🌙 Dark theme"}
    </Button>
  </header>

  <!-- ——— BUTTON ——— -->
  <section class="section">
    <h2>Button</h2>
    <div class="row">
      {#each ["primary", "secondary", "danger", "danger-ghost", "ghost", "outline"] as v}
        <Button variant={v as any}>{v}</Button>
      {/each}
    </div>
    <div class="row">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" ariaLabel="Close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>
    </div>
    <div class="row">
      <Button loading={true}>Loading…</Button>
      <Button disabled={true}>Disabled</Button>
      <Button variant="outline" loading={loading} onclick={simulateLoading}>
        {loading ? "Simulating…" : "Simulate loading"}
      </Button>
      <Button href="https://svelte.dev" variant="ghost">I am a link ↗</Button>
    </div>
  </section>

  <!-- ——— BADGE ——— -->
  <section class="section">
    <h2>Badge</h2>
    <div class="row">
      <Badge>default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="error">error</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="purple">purple</Badge>
      <Badge variant="accent-2">accent-2</Badge>
      <Badge size="md">size md</Badge>
    </div>
    <div class="row">
      {#each ["success", "warning", "error", "info", "accent", "accent-2"] as v}
        <Badge variant={v as any} tone="solid">{v}</Badge>
      {/each}
      <Badge variant="accent-2" tone="solid" title="Broadcast in progress">LIVE</Badge>
    </div>
    <div class="row">
      <Badge variant="success" dot>Published</Badge>
      <Badge variant="info" pulse>Running</Badge>
      <Badge variant="warning" dot>Pending review</Badge>
      <Badge variant="error" dot>Failed</Badge>
      <Badge dot>Draft</Badge>
      <Badge variant="accent-2" tone="solid" pulse>LIVE</Badge>
    </div>
  </section>

  <!-- ——— INPUT ——— -->
  <section class="section">
    <h2>Input</h2>
    <div class="grid">
      <label class="field">
        <span class="field-label">Normal</span>
        <Input placeholder="Type something…" />
      </label>
      <label class="field">
        <span class="field-label">With value ({search.length} characters)</span>
        <Input placeholder="Search for a game…" bind:value={search} />
      </label>
      <label class="field">
        <span class="field-label">Disabled</span>
        <Input placeholder="You cannot type here" disabled={true} />
      </label>
    </div>
  </section>

  <!-- ——— DIALOG ——— -->
  <section class="section">
    <h2>Dialog</h2>
    <div class="row">
      <Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
    </div>
    <Dialog
      bind:open={dialogOpen}
      title="Publish changes"
      description="They will be deployed to the 4 sites in the network."
      size="md"
    >
      <p class="dialog-text">
        You are about to publish. This action rebuilds Valhalla, TodoGachas,
        Cardback and Cozy with the latest CMS content.
      </p>
      {#snippet footer()}
        <Button variant="ghost" onclick={() => (dialogOpen = false)}>Cancel</Button>
        <Button onclick={() => (dialogOpen = false)}>Publish now</Button>
      {/snippet}
    </Dialog>
  </section>

  <!-- ——— CARD ——— -->
  <section class="section">
    <h2>Card</h2>
    <div class="grid-2">
      <Card>
        <CardHeader>
          <CardTitle>Card with parts</CardTitle>
          <Badge variant="purple">new</Badge>
        </CardHeader>
        <CardContent>
          <p class="card-text">
            CardHeader, CardTitle, CardContent and CardFooter make up the full
            container, just like in the admin dashboard.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Discard</Button>
          <Button size="sm">Accept</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardContent>
          <p class="card-text">
            Bare Card: just the container and its content. Useful for dashboard
            panels and widgets.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- ——— TABLE ——— -->
  <section class="section">
    <h2>Table</h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Game</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Platforms</TableHead>
          <TableHead>Popularity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each games as g}
          <TableRow>
            <TableCell><strong>{g.name}</strong></TableCell>
            <TableCell>
              <Badge
                variant={g.status === "Published" ? "success" : g.status === "In review" ? "warning" : "default"}
              >{g.status}</Badge>
            </TableCell>
            <TableCell>{g.platforms}</TableCell>
            <TableCell>{g.popularity} %</TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
    <p class="card-text">Compact, with a sticky first column: a type matrix.</p>
    <Table density="compact" stickyFirstColumn aria-label="Multiplier by attacker and defender">
      <TableHeader>
        <TableRow>
          <TableHead>Attacks ↓ · Defends →</TableHead>
          {#each matrixTypes as d (d)}<TableHead style="text-align: center">{d}</TableHead>{/each}
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each matrixTypes as a, i (a)}
          <TableRow>
            <TableHead scope="row">
              <Button variant={i === chosenType ? "soft" : "ghost"} size="sm" aria-pressed={i === chosenType} onclick={() => (chosenType = i)}>{a}</Button>
            </TableHead>
            {#each matrixTypes as d, j (d)}
              <TableCell style="text-align: center; font-family: var(--ta-font-mono)" title={`${a} → ${d}: ×${demoMatrix[i][j]}`}>×{demoMatrix[i][j]}</TableCell>
            {/each}
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </section>

  <!-- ——— FORMS ——— -->
  <section class="section">
    <h2>Field · Select · Textarea · Checkbox</h2>
    <div class="grid">
      <Field label="Role" required>
        <Select
          bind:value={role}
          options={[
            { value: "owner", label: "Owner" },
            { value: "member", label: "Member" },
            { value: "viewer", label: "Viewer" },
          ]}
        />
      </Field>
      <Field label="Notes" error={notes.length > 40 ? "40 characters maximum" : undefined}>
        <Textarea bind:value={notes} rows={2} placeholder="For whoever comes next…" />
      </Field>
      <div class="row">
        <Checkbox bind:checked={isAgent} label="Is an agent" />
      </div>
      <div class="stack">
        <Label for="demo-slug" required>Slug</Label>
        <Input id="demo-slug" required placeholder="my-first-post" />
      </div>
    </div>
    <div style="margin-top: 1rem">
      <Tabs
        ariaLabel="Post states"
        panels={false}
        bind:value={adminTab}
        items={[
          { id: "drafts", label: "Drafts", controls: "demo-panel-drafts", tabId: "demo-tab-drafts" },
          { id: "published", label: "Published", controls: "demo-panel-published", tabId: "demo-tab-published" },
        ]}
      />
      <p class="note">Tabs with <code>panels=&#123;false&#125;</code>: the page renders each panel where it wants.</p>
      <div id="demo-panel-drafts" role="tabpanel" aria-labelledby="demo-tab-drafts" hidden={adminTab !== "drafts"}>3 drafts waiting.</div>
      <div id="demo-panel-published" role="tabpanel" aria-labelledby="demo-tab-published" hidden={adminTab !== "published"}>12 posts published.</div>
    </div>
  </section>

  <!-- ——— ADMINISTRATION ——— -->
  <section class="section">
    <h2>Tabs · Alert · Stat · ConfirmDialog</h2>
    <Tabs
      bind:value={tab}
      ariaLabel="Project sections"
      items={[
        { id: "members", label: "Members", count: 4 },
        { id: "intakes", label: "Intakes", count: 2 },
        { id: "cost", label: "Cost" },
      ]}
    >
      {#snippet children(active)}
        {#if active === "members"}
          {#if noticeVisible}
            <Alert variant="success" title="Member added" onDismiss={() => (noticeVisible = false)}>
              agent-dev-a joins as a member.
            </Alert>
          {/if}
          <div class="row" style="margin-top: 0.75rem">
            <Button variant="danger" onclick={() => (confirmOpen = true)}>Remove member</Button>
          </div>
        {:else if active === "intakes"}
          <Alert variant="warning" title="2 pending">Waiting for a person to decide.</Alert>
        {:else}
          <div class="grid">
            <Stat label="Jobs done" value={18} variant="success" />
            <Stat label="Failed" value={2} variant="error" />
            <Stat label="Cost" value="$0.42" />
          </div>
        {/if}
      {/snippet}
    </Tabs>
    <ConfirmDialog
      bind:open={confirmOpen}
      title="Remove agent-dev-a?"
      description="They will no longer see the project or its work queue."
      confirmLabel="Remove"
      onConfirm={() => new Promise((r) => setTimeout(r, 800))}
    />
  </section>

  <!-- ——— FLOATING LAYER ——— -->
  <section class="section">
    <h2>Popover · Tooltip · DropdownMenu · Combobox</h2>
    <div class="row">
      <Popover title="Filters">
        {#snippet trigger(props)}<Button variant="secondary" {...props}>Filters</Button>{/snippet}
        <Field label="Name contains"><Input bind:value={popoverFilter} placeholder="Type…" /></Field>
      </Popover>

      <Tooltip text="Copies the link to the clipboard">
        {#snippet trigger(props)}<Button variant="outline" {...props}>Copy link</Button>{/snippet}
      </Tooltip>

      <DropdownMenu label="Project actions">
        {#snippet trigger(props)}<Button variant="secondary" {...props}>Actions ▾</Button>{/snippet}
        <MenuLabel>Project</MenuLabel>
        <MenuItem onSelect={() => (lastAction = "edit")}>Edit</MenuItem>
        <MenuItem onSelect={() => (lastAction = "duplicate")} disabled>Duplicate</MenuItem>
        <MenuItem onSelect={() => (lastAction = "archive")}>Archive</MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onSelect={() => (lastAction = "delete")}>Delete</MenuItem>
      </DropdownMenu>
      <span class="note">Last action: {lastAction}</span>
    </div>
    <div class="grid">
      <Field label="Game">
        <Combobox options={comboGames} bind:value={chosenGame} placeholder="Search for a game…" />
      </Field>
      <p class="note">Chosen: {chosenGame ?? "none"}</p>
    </div>
  </section>

  <!-- ——— Site controls ——— -->
  <section class="section">
    <h2>Slider · SearchInput · Toggle · ToggleGroup · NumberInput · Rating · InputOTP</h2>
    <div class="grid-2">
      <Slider
        label="Level"
        bind:value={demoLevel}
        min={1}
        max={60}
        valueText={(v) => `Lv. ${v}`}
        marks={[{ value: 1, label: "Lv. 1" }, { value: 30, label: "Lv. 30" }, { value: 60, label: "Lv. 60" }]}
      />
      <SearchInput bind:value={demoSearch} placeholder="Search species…" />
    </div>
    <div class="row" style="margin-top: 1rem">
      <Toggle bind:pressed={favoritesOnly}>Favorites only</Toggle>
      <ToggleGroup
        label="Rarity"
        bind:value={demoRarity}
        required
        options={[{ value: "all", label: "All" }, { value: "rare", label: "Rare", count: 12 }, { value: "epic", label: "Epic", count: 3 }]}
      />
      <ToggleGroup label="Types" type="multiple" bind:values={demoTypes} options={[{ value: "fire", label: "Fire" }, { value: "water", label: "Water" }, { value: "grass", label: "Grass" }]} />
    </div>
    <div class="row" style="margin-top: 1rem; align-items: flex-end">
      <NumberInput bind:value={demoCopies} min={0} max={3} stepper width="auto" ariaLabel="Copies" />
      <Rating bind:value={demoRating} label="What did you think?" />
      <Rating value={4} label="Average rating" readonly />
      <InputOTP bind:value={demoOtp} groupSize={3} oncomplete={(c) => toast.success(`Code ${c} sent`)} />
      <ToggleGroup ariaLabel="View" variant="segmented" tone="solid" value="month" options={[{ value: "day", label: "Day" }, { value: "month", label: "Month" }, { value: "year", label: "Year" }]} />
    </div>
    <div class="row" style="margin-top: 1rem">
      <ToggleGroup
        label="Element"
        hideLabel={false}
        type="multiple"
        variant="bare"
        bind:values={demoFacets}
        options={[
          { value: "fire", label: "Fire", ariaLabel: "Fire", title: "Fire", color: "#e4572e" },
          { value: "water", label: "Water", ariaLabel: "Water", title: "Water", color: "#3a86ff" },
          { value: "grass", label: "Grass", ariaLabel: "Grass", title: "Grass", color: "#2a9d8f" },
          { value: "lightning", label: "Lightning", ariaLabel: "Lightning", title: "Lightning", color: "#f4c542" },
          { value: "ice", label: "Ice", ariaLabel: "Ice (no data)", title: "Ice (no data)", color: "#8ecae6", disabled: true },
        ]}
      >
        {#snippet item(o)}
          <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="14" fill={o.color} /><text x="15" y="20" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">{o.label[0]}</text></svg>
        {/snippet}
      </ToggleGroup>
    </div>
  </section>

  <section class="section">
    <h2>Carousel · CompareSlider</h2>
    <div class="row" style="margin-bottom: 0.75rem">
      <Switch bind:checked={demoAutoplay} label="Autoplay" />
    </div>
    <Carousel label="Featured games" items={demoCards} key={(g) => g.id} autoplay={demoAutoplay} interval={4000}>
      {#snippet slide(g)}
        <Card>
          <CardHeader><CardTitle level={3}>{g.name}</CardTitle></CardHeader>
          <CardContent>
            <p class="card-text">{g.genre}</p>
            <Badge>{g.score}/10</Badge>
          </CardContent>
        </Card>
      {/snippet}
    </Carousel>
    <div style="margin-top: 1.5rem; max-width: 40rem">
      <CompareSlider bind:value={demoComparison} beforeSrc={demoBefore} afterSrc={demoAfter} label="Compare the map" />
      <p class="note">Divider at {Math.round(demoComparison)} %</p>
    </div>
  </section>

  <section class="section">
    <h2>MonthView · Spinner</h2>
    <MonthView bind:month={demoMonth} locale="en-US" headingLevel={3}>
      {#snippet day(d)}
        {#each demoEvents.filter((e) => e.date === d.date) as e (e.id)}
          <Button variant="soft" size="sm" title={e.title} onclick={() => (chosenEvent = e.title)}>{e.title}</Button>
        {/each}
      {/snippet}
    </MonthView>
    <p class="note">Month: {demoMonth} · event: {chosenEvent}</p>
    <div class="row">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" label="Loading the month" style="color: rgb(var(--ta-accent))" />
    </div>
  </section>

  <!-- ——— 0.7 ——— -->
  <section class="section">
    <h2>Breadcrumb · Icon · SplitPane · Sidebar</h2>
    <Breadcrumb items={[{ label: "Home", href: "#" }, { label: "Kons", href: "#" }, { label: "Agile" }]} />
    <div class="icons">
      {#each ["check", "plus", "search", "home", "user", "trash", "edit", "copy", "calendar", "settings", "bot"] as const as n (n)}
        <Icon name={n} size={18} />
      {/each}
    </div>
    <div class="split-frame">
      <Sidebar
        bind:collapsed={sidebarCollapsed}
        current="agile"
        persistKey="tallao-demo-sidebar"
        groups={[
          {
            items: [
              { id: "home", label: "Home", icon: "home" },
              { id: "users", label: "Users", icon: "user", badge: 4 },
              { id: "approvals", label: "Approvals", icon: "check", badge: 2, badgeVariant: "warning", badgePulse: true },
            ],
          },
          {
            label: "Kons",
            items: [
              { id: "kons", label: "Kons", icon: "settings", children: [{ id: "agile", label: "Agile" }, { id: "blog", label: "Blog" }] },
            ],
          },
        ]}
      >
        {#snippet footer(isCollapsed)}
          {#if isCollapsed}
            <Avatar name="Ana López" size="sm" title="Ana López" />
          {:else}
            <div class="row" style="gap: 0.5rem"><Avatar name="Ana López" size="sm" decorative /> Ana López</div>
          {/if}
        {/snippet}
      </Sidebar>
      <SplitPane bind:size={listWidth} label="List width">
        {#snippet first()}<div class="demo-panel">List ({listWidth}%)</div>{/snippet}
        {#snippet second()}<div class="demo-panel">Detail</div>{/snippet}
      </SplitPane>
    </div>
  </section>

  <section class="section">
    <h2>NavMenu · BottomNav</h2>
    <div class="row">
      <NavMenu
        label="Games"
        name="demo-menus"
        groups={[
          {
            label: "Gacha",
            items: [
              { label: "Genshin Impact", href: "#genshin", description: "Tier list, builds and team planner", icon: "bot", badge: "New" },
              { label: "Star Rail", href: "#star-rail", description: "Teams and relics", icon: "user" },
            ],
          },
          {
            label: "Card games",
            items: [
              { label: "Riftbound", href: "#riftbound", description: "Decks and meta", icon: "copy" },
              { label: "Aion 2", description: "Wiki in progress", icon: "clock", soon: true },
            ],
          },
        ]}
      />
      <NavMenu
        label="Tools"
        name="demo-menus"
        columns={1}
        groups={[{ items: [{ label: "Calculators", href: "#tools", description: "Damage and stats", icon: "settings" }, { label: "Maps", href: "#maps", description: "Interactive maps", icon: "search" }] }]}
      />
    </div>
    <p class="note">On a phone-sized window a BottomNav sits at the bottom of this page (<code>hideAbove=&#123;767&#125;</code>).</p>
    <BottomNav
      ariaLabel="Demo sections"
      current="home"
      hideAbove={767}
      items={[
        { id: "home", label: "Home", href: "#", icon: "home" },
        { id: "news", label: "News", href: "#news", icon: "info", badge: 3 },
        { id: "search", label: "Search", href: "#search", icon: "search" },
        { id: "me", label: "Profile", href: "#me", icon: "user" },
      ]}
    >
      {#snippet action()}<a href="#new" aria-label="New post"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg></a>{/snippet}
    </BottomNav>
  </section>

  <section class="section">
    <h2>BarChart · LineChart</h2>
    <div class="grid-2">
      <BarChart title="Visits and sign-ups per month" data={monthlyVisits} x="month" series={[{ key: "visits", label: "Visits" }, { key: "signups", label: "Sign-ups" }]} locale="en" />
      <LineChart title="Visits per month" data={monthlyVisits} x="month" series={[{ key: "visits", label: "Visits" }]} area locale="en" />
      <BarChart title="Role share by patch (stacked)" data={biRoleShare} x="patch" xLabel="Patch" series={biRoles} stacked format={percent} />
      <BarChart title="Role share by patch (horizontal)" data={biRoleShare} x="patch" xLabel="Patch" series={biRoles.slice(0, 2)} orientation="horizontal" format={percent} />
      <LineChart title="Role share by patch (stacked areas)" data={biRoleShare} x="patch" xLabel="Patch" series={biRoles} stacked format={percent} />
      <LineChart title="Win rate by patch (domain 44–58)" data={biTrends.win} x="patch" xLabel="Patch" series={biTrendSeries} domain={[44, 58]} format={percent} />
      <BarChart title="No matches yet" data={[]} x="patch" series={biRoles} />
    </div>
  </section>

  <section class="section">
    <h2>DonutChart · ScatterChart · Heatmap · Funnel · BarList · ChartLegend</h2>
    <div class="grid-2">
      <DonutChart title="Heroes per tier" data={biTiers} centerLabel="Heroes" locale="en" />
      <DonutChart title="Heroes per tier (pie, legend below)" data={biTiers} innerRadius={0} legend="bottom" size={160} locale="en" />
      <ScatterChart title="Pick rate against win rate" data={biHeroes} xLabel="Pick rate" yLabel="Win rate" yRef={50} showLabels format={percent} />
      <Heatmap title="Win rate by role matchup" data={biMatchups} cornerLabel="Row beats column" format={percent} />
      <Funnel title="Ranked ladder this season" data={biLadder} locale="en" />
      <BarList title="Most picked heroes" data={biTopPicks} ranked format={percent} />
    </div>
    <div class="row" style="margin-top: 1rem">
      <ChartLegend items={[{ label: "Duelist", value: "34%" }, { label: "Vanguard", value: "26%" }, { label: "Support", value: "23%" }, { label: "Controller", value: "17%" }]} aria-label="Role share" />
    </div>
  </section>

  <section class="section">
    <h2>KpiCard · Sparkline · Gauge · BigNumber · IconArray · Timeline · ComparisonBar</h2>
    <div class="grid">
      <KpiCard label="Kaela win rate" value={53.8} format={percent} delta={-1.4} deltaFormat={signedPoints} deltaLabel="vs patch 1.1" goodWhen="down" trend={biTrends.win.map((r) => r.kaela)} target={50} targetLabel="Balance target" />
      <KpiCard label="Kaela ban rate" value={41} format={percent} delta={6} deltaFormat={signedPoints} deltaLabel="vs patch 1.1" goodWhen="down" trend={[22, 25, 28, 35, 41]} />
      <KpiCard label="Heroes in the roster" value={38} delta={0} deltaLabel="no new hero" locale="en" />
    </div>
    <p class="note" style="margin-top: 1rem">
      Matches per day <Sparkline data={biDaily} label="Matches per day, in thousands" area locale="en" /> and as columns
      <Sparkline data={biDaily} label="Matches per day, in thousands" variant="bar" locale="en" />
    </p>
    <div class="row" style="align-items: flex-start; gap: 2rem; margin-top: 1rem">
      <Gauge value={53.8} label="Kaela win rate" target={50} format={percent} tone="warning" />
      <Gauge value={72} label="Season progress" variant="ring" format={percent} size={150} />
      <BigNumber value={1240000} unit="matches" label="analysed since patch 1.2 went live" locale="en" />
      <IconArray value={7} total={10} label="ranked matches had a Kaela pick or ban" shape="person" />
    </div>
    <div class="grid-2" style="margin-top: 1.5rem">
      <Timeline items={biPatchEvents} ariaLabel="Patch history" locale="en" />
      <ComparisonBar title="Win rate by side" left={{ label: "Attack", value: 51.6 }} right={{ label: "Defence", value: 48.4 }} format={percent} showShare={false} />
    </div>
  </section>

  <section class="section section--wide" id="dashboard">
    <h2>Dashboard: DashboardGrid · ChartCard</h2>
    <p class="section-note">
      One public report built only from the kit: a patch report for an invented hero game. Every figure is made up.
    </p>
    <DashboardGrid>
      <KpiCard label="Matches analysed" value={1240000} delta={8.2} deltaFormat={(n) => `${n > 0 ? "+" : ""}${n}%`} deltaLabel="vs patch 1.1" trend={biDaily} locale="en" />
      <KpiCard label="Top hero win rate" value={55.9} format={percent} delta={0.7} deltaFormat={signedPoints} deltaLabel="Vex, vs patch 1.1" goodWhen="none" trend={[53.1, 54.0, 54.4, 55.2, 55.9]} />
      <KpiCard label="Most banned: Kaela" value={41} format={percent} delta={6} deltaFormat={signedPoints} deltaLabel="vs patch 1.1" goodWhen="down" trend={[22, 25, 28, 35, 41]} />
      <KpiCard label="Heroes within 48–52%" value={61} format={percent} delta={9} deltaFormat={signedPoints} deltaLabel="vs patch 1.1" trend={[48, 50, 49, 52, 61]} target={75} targetLabel="Balance target" />

      <ChartCard title="Pick rate against win rate" description="Top right is strong and popular; bottom right is popular but losing." span={2} source="Ranked matches, Gold and above">
        <ScatterChart title="Pick rate against win rate, per hero" hideTitle data={biHeroes} xLabel="Pick rate" yLabel="Win rate" yRef={50} showLabels format={percent} height={300} />
      </ChartCard>
      <ChartCard title={biMeasure === "win" ? "Win rate by patch" : "Pick rate by patch"} description="Kaela's 1.1 spike and the 1.2 correction." span={2} source="Ranked matches, Gold and above">
        {#snippet toolbar()}
          <ToggleGroup
            ariaLabel="Measure"
            variant="segmented"
            required
            bind:value={biMeasure}
            options={[{ value: "win", label: "Win rate" }, { value: "pick", label: "Pick rate" }]}
          />
        {/snippet}
        <LineChart
          title={biMeasure === "win" ? "Win rate by patch" : "Pick rate by patch"}
          hideTitle
          data={biTrends[biMeasure]}
          x="patch"
          xLabel="Patch"
          series={biTrendSeries}
          domain={biMeasure === "win" ? [44, 58] : undefined}
          format={percent}
          height={300}
        />
      </ChartCard>

      <ChartCard title="Most picked" description="Share of ranked matches.">
        <BarList ariaLabel="Most picked heroes" data={biTopPicks} ranked limit={6} format={percent} />
      </ChartCard>
      <ChartCard title="Tier list shape" description="Heroes per tier after 1.2.">
        <DonutChart title="Heroes per tier" hideTitle data={biTiers} centerLabel="Heroes" legend="bottom" size={170} locale="en" />
      </ChartCard>
      <ChartCard title="Role share by patch" description="Share of all picks, by role." span={2}>
        <BarChart title="Role share by patch" hideTitle data={biRoleShare} x="patch" xLabel="Patch" series={biRoles} stacked format={percent} height={260} />
      </ChartCard>

      <ChartCard title="Role matchups" description="Win rate of the row's role against the column's." span={2} note="50% is an even matchup">
        <Heatmap title="Win rate by role matchup" hideTitle data={biMatchups} cornerLabel="Row vs column" format={percent} />
      </ChartCard>
      <ChartCard title="Ranked ladder" description="How far players climbed this season.">
        <Funnel title="Ranked ladder this season" hideTitle data={biLadder} align="left" locale="en" />
      </ChartCard>
      <ChartCard title="Balance" description="Side advantage and the season so far.">
        <div class="stack">
          <ComparisonBar ariaLabel="Win rate by side" left={{ label: "Attack", value: 51.6 }} right={{ label: "Defence", value: 48.4 }} format={percent} showShare={false} />
          <Gauge value={72} label="Season progress" format={percent} size={170} class="demo-center" />
        </div>
      </ChartCard>

      <ChartCard title="The patch in one number" span={2}>
        <div class="demo-infographic">
          <BigNumber value={1240000} unit="matches" label="analysed since patch 1.2 went live" size="xl" locale="en" />
          <IconArray value={7} total={10} label="ranked matches had a Kaela pick or ban" shape="person" />
        </div>
      </ChartCard>
      <ChartCard title="How we got here" span={2}>
        <Timeline items={biPatchEvents} ariaLabel="Patch history" locale="en" />
      </ChartCard>
    </DashboardGrid>
  </section>

  <section class="section">
    <h2>SchemaForm · CodeEditor</h2>
    <div class="grid-2">
      <SchemaForm schema={demoSchema} bind:value={schemaValue} onsubmit={(v) => toast.success("Saved", { description: JSON.stringify(v) })} />
      <CodeEditor bind:value={demoCode} language="markdown" />
    </div>
  </section>

  <!-- ——— 0.6 ——— -->
  <section class="section">
    <h2>DataTable with column filters · Pagination · remote and multiple Combobox · DatePicker · FileUpload</h2>
    <DataTable
      caption="Games"
      rows={tableGames}
      rowKey="id"
      rowLabel={(r) => r.name}
      columns={[
        { key: "name", header: "Game", sortable: true, filter: "text" },
        { key: "visits", header: "Visits", sortable: true, align: "right", filter: "range" },
        { key: "status", header: "Status", filter: "select" },
      ]}
      pageSize={4}
      selectable
      bind:selected={tableSelection}
      bind:filters={demoFilters}
    >
      {#snippet cell(row, col)}
        {#if col.key === "status"}<Badge variant={row.status === "Published" ? "success" : "default"}>{row.status}</Badge>{:else}{row[col.key as keyof typeof row]}{/if}
      {/snippet}
    </DataTable>
    <div class="grid">
      <Field label="Game (remote search)"><Combobox loadOptions={searchGames} placeholder="Type…" /></Field>
      <Field label="Tags">
        <Combobox multiple bind:values={demoTags} options={[{ value: "bug", label: "Bug" }, { value: "ux", label: "UX" }, { value: "api", label: "API" }]} />
      </Field>
      <Field label="Publication date"><DatePicker bind:value={demoDate} /></Field>
    </div>
    <div class="grid-2">
      <Calendar bind:value={demoDate} />
      <FileUpload multiple accept="image/*" maxSize={2_000_000} />
    </div>
    <Pagination bind:page={demoPage} pageCount={12} />
  </section>

  <!-- ——— 0.5 ——— -->
  <section class="section">
    <h2>SelectionBar · KeyValueEditor · CopyButton · DragBoard · ChatMessage</h2>
    <div class="grid-2">
      <div class="stack">
        <SelectionBar
          total={demoRows.length}
          selected={demoChecked.length}
          onToggleAll={(all) => (demoChecked = all ? [...demoRows] : [])}
        >
          {#snippet actions()}<Button size="sm" variant="secondary">Hide</Button>{/snippet}
        </SelectionBar>
        {#each demoRows as r (r)}
          <Checkbox
            label={r}
            checked={demoChecked.includes(r)}
            onchange={(e: Event) =>
              (demoChecked = (e.currentTarget as HTMLInputElement).checked
                ? [...demoChecked, r]
                : demoChecked.filter((m) => m !== r))}
          />
        {/each}
        <CopyButton text="https://valhalla-legion.com/obs/marcador" />
      </div>
      <KeyValueEditor bind:entries={demoStats} keyLabel="Stat" valueLabel="Value" valueType="number" />
    </div>
    <DragBoard
      onMove={(item, zone) => {
        demoTiers[item] = zone;
      }}
    >
      <div class="grid">
        {#each ["pool", "s", "a"] as z (z)}
          <DropZone id={z} label={z === "pool" ? "Unranked" : `Tier ${z.toUpperCase()}`} class="demo-zone">
            <strong>{z === "pool" ? "Unranked" : `Tier ${z.toUpperCase()}`}</strong>
            {#each Object.entries(demoTiers).filter(([, zz]) => zz === z) as [item] (item)}
              <DragItem id={item} label={item} zone={z}>{item}</DragItem>
            {/each}
          </DropZone>
        {/each}
      </div>
    </DragBoard>
    <div class="stack">
      <ChatMessage role="user" content="Which build do you recommend for Nahida?" />
      <ChatMessage role="assistant" author="Valhalla assistant" content="Dendro catalyst with high elemental mastery." />
      <ChatMessage role="assistant" pending />
    </div>
  </section>

  <!-- ——— 0.4 ——— -->
  <section class="section">
    <h2>Switch · RadioGroup · Sheet · Toast · Command · ContextMenu</h2>
    <div class="grid">
      <Switch bind:checked={emailNotices} label="Email notifications" />
      <RadioGroup
        legend="Plan"
        bind:value={plan}
        orientation="horizontal"
        options={[
          { value: "free", label: "Free" },
          { value: "pro", label: "Pro", description: "With support" },
          { value: "team", label: "Team", disabled: true },
        ]}
      />
    </div>
    <div class="row">
      <Button variant="secondary" onclick={() => (sidePanel = true)}>View details</Button>
      <Button variant="secondary" onclick={() => toast.success("Saved", { description: "The changes are now live on all 4 sites" })}>Toast</Button>
      <Button variant="secondary" onclick={() => toast.error("Could not publish", { action: { label: "Retry", onClick: () => toast("Retrying…") } })}>Error toast</Button>
      <Button variant="outline" onclick={() => (palette = true)}>Palette (Ctrl+K)</Button>
      <Button variant="outline" onclick={() => (remotePalette = true)}>Search (API results)</Button>
      <span class="note">Last command: {lastCommand}</span>
    </div>
    <ContextMenu label="Row actions">
      {#snippet target(props)}<div {...props} class="context-zone">Right-click here (or Shift+F10)</div>{/snippet}
      <MenuItem onSelect={() => toast("Open")}>Open</MenuItem>
      <MenuItem onSelect={() => toast("Duplicate")}>Duplicate</MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger" onSelect={() => toast.warning("Deleted")}>Delete</MenuItem>
    </ContextMenu>
    <Sheet bind:open={sidePanel} title="Aniimo details" description="Game profile">
      <p class="dialog-text">Side panel content.</p>
      {#snippet footer()}<Button onclick={() => (sidePanel = false)}>Done</Button>{/snippet}
    </Sheet>
    <Command bind:open={palette} items={commands} />
    <Command
      bind:open={remotePalette}
      bind:query={remoteQuery}
      hotkey={false}
      filter={false}
      loading={remoteLoading}
      items={remoteResults}
      label="Search the site"
      placeholder="Search games…"
    >
      {#snippet empty(q)}
        {#if q.trim().length >= 2}<p class="note" style="text-align: center">No results for "{q}"</p>
        {:else}<p class="note" style="text-align: center">Type at least two letters</p>{/if}
      {/snippet}
      {#snippet trailing()}<span aria-hidden="true">›</span>{/snippet}
    </Command>
  </section>

  <section class="section">
    <h2>Accordion · Progress · Skeleton · Avatar</h2>
    <div class="grid-2">
      <Accordion
        single
        items={[
          { id: "a", title: "What is tallao?", content: "A component kit for Svelte 5.", open: true },
          { id: "b", title: "Does it work with SSR?", content: "Yes: ids are stable and nothing touches window on the server." },
          { id: "c", title: "Is it accessible?", content: "Every component passes axe and is tested with the keyboard." },
        ]}
      />
      <div class="stack">
        <Progress label="Image upload" value={62} showValue />
        <Progress label="Syncing" />
        <Skeleton lines={3} />
        <div class="row">
          <Avatar name="Ana López" />
          <Avatar name="Agent One" badge="AI" />
          <Avatar name="Valhalla Legion" initials={1} aria-label="Team: Valhalla Legion" />
          <Avatar name="Broken" src="/does-not-exist.png" size="lg" />
        </div>
      </div>
    </div>
  </section>
  <Toaster />

  <!-- ——— GENERATIVE LAYER ——— -->
  <section class="section">
    <h2>PromptInput + ToolCallCard</h2>
    <p class="section-note">
      Type something and press Enter: the simulated agent replies with a tool
      call that you can approve or reject.
    </p>

    <div class="chat">
      {#each messages as m, i}
        {#if m.kind === "user"}
          <p class="chat-user">{m.text}</p>
        {:else}
          <ToolCallCard
            name={m.name}
            args={m.args}
            status={m.status}
            result={m.status === "executed" ? "Post published at valhalla-legion.com/noticias" : undefined}
            onApprove={m.status === "pending" ? () => decide(i, true) : undefined}
            onReject={m.status === "pending" ? () => decide(i, false) : undefined}
          />
        {/if}
      {/each}
      {#if thinking}
        <p class="chat-thinking">The agent is thinking…</p>
      {/if}

      <PromptInput
        placeholder="Ask the agent for something… (Enter sends)"
        attachments={true}
        loading={thinking}
        onSend={sendPrompt}
        onAttach={() => alert("Attach file")}
      />
    </div>

    <div class="grid-2">
      <ToolCallCard
        name="rebuild_site"
        args={{ site: "cozy", force: true }}
        status="executing"
      />
      <ToolCallCard
        name="publish_post"
        args={{ site: "cardback", title: "Regional results" }}
        status="failed"
        result="The API returned 503 after 3 retries"
      />
    </div>
  </section>

  <!-- ——— GENERATIVE II: plan, suggestions, code, sources, usage ——— -->
  <section class="section">
    <h2>Steps · SuggestionChips · CodeBlock · Sources · UsageMeter</h2>
    <p class="section-note">
      The rest of the conversation: the step-by-step plan, single-use
      suggestions, the code the model writes, the sources it cites and the quota spent.
    </p>

    <div class="grid-2">
      <Steps
        steps={[
          { title: "Review the draft", status: "done" },
          { title: "Publish the post", status: "running", description: "Valhalla · news section" },
          { title: "Rebuild the site", status: "pending" },
          { title: "Announce on Discord", status: "failed", description: "Webhook down" },
          { title: "Update the sitemap", status: "skipped" },
        ]}
      />
      <div class="demo-col">
        <SuggestionChips
          suggestions={["Write the tournament recap", "Publish the results", "Translate into Spanish", "Schedule for tomorrow"]}
          onSelect={(s) => sendPrompt(s)}
        />
        <CodeBlock
          fileName="src/lib/plan.ts"
          language="ts"
          code={"const plan = await agent.plan(goal);\nfor (const step of plan.steps) {\n  await step.run();\n}"}
        />
        <UsageMeter used={8100} max={10000} cost="$0.42" />
      </div>
    </div>

    <Sources
      sources={[
        { url: "https://prydwen.gg/riftbound", title: "Riftbound guide: 2026 rules" },
        { url: "https://www.game8.co/archives/123", title: "Patch 4.2 notes" },
        { url: "https://esports.example.com/regional", title: "Regional results" },
      ]}
    />
  </section>

  <section class="section">
    <h2>GameMap</h2>
    <p class="section-note">
      Thin wrapper over sveaflet (Leaflet) with a dark layer (Esri) and
      markers in the theme's accent color.
    </p>
    <GameMap
      center={[40.4168, -3.7038]}
      zoom={5}
      markers={demoMarkers}
      height="22rem"
    />
  </section>

  <footer class="demo-footer">
    <p>
      tallao v0.1 — copy the components from <code>src/lib/components/</code>,
      retheme with the <code>--ta-*</code> variables in <code>src/lib/tokens.css</code>.
    </p>
  </footer>
</div>

<style>
  .icons { display: flex; gap: 0.75rem; margin: 1rem 0; color: rgb(var(--ta-text-dim)); }
  .split-frame { display: flex; height: 16rem; border: 1px solid rgb(var(--ta-border)); border-radius: var(--ta-radius-lg); overflow: hidden; }
  .split-frame > :global(:last-child) { flex: 1; min-width: 0; }
  .demo-panel { height: 100%; padding: 1rem; font-size: 0.875rem; color: rgb(var(--ta-text-dim)); }

  .demo {
    max-width: 60rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .demo-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgb(var(--ta-border));
  }

  .demo-header h1 {
    margin: 0;
    font-size: 2rem;
    letter-spacing: -0.02em;
  }

  .demo-subtitle {
    margin: 0.375rem 0 0;
    color: rgb(var(--ta-text-dim));
    max-width: 40rem;
  }

  .section {
    margin-top: 2.5rem;
  }

  .section h2 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1rem;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: 1rem;
  }

  .field { display: flex; flex-direction: column; gap: 0.375rem; }

  .field-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--ta-text-dim));
  }

  :global(.demo-zone) { display: flex; flex-direction: column; gap: 0.5rem; min-height: 6rem; padding: 0.75rem; border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius-lg); }
  .stack { display: flex; flex-direction: column; gap: 1rem; }
  /* The dashboard breaks out of the demo's 60rem column: a report wants the width. */
  .section--wide { position: relative; left: 50%; width: max(100%, min(84rem, calc(100vw - 4rem))); transform: translateX(-50%); }
  .demo-infographic { display: flex; flex-wrap: wrap; align-items: center; gap: 1.5rem 2.5rem; }
  :global(.demo-center) { align-self: center; }
  .demo-col { display: flex; flex-direction: column; gap: 0.75rem; }
  .context-zone { margin-top: 0.75rem; padding: 1.25rem; text-align: center; color: rgb(var(--ta-text-dim)); border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius-lg); }

  .note { color: rgb(var(--ta-text-dim)); font-size: 0.8125rem; }

  .dialog-text { margin: 0; color: rgb(var(--ta-text-dim)); }

  .card-text { margin: 0; color: rgb(var(--ta-text-dim)); }

  .section-note {
    margin: 0 0 1rem;
    color: rgb(var(--ta-text-dim));
    font-size: 0.875rem;
  }

  .chat {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    margin-bottom: 1rem;
  }

  .chat-user {
    align-self: flex-end;
    margin: 0;
    padding: 0.5rem 0.875rem;
    background: rgb(var(--ta-accent) / 0.15);
    border-radius: var(--ta-radius-lg);
    font-size: 0.875rem;
    max-width: 80%;
  }

  .chat-thinking {
    margin: 0;
    color: rgb(var(--ta-text-dim));
    font-size: 0.8125rem;
    font-style: italic;
  }

  .demo-footer {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgb(var(--ta-border));
    color: rgb(var(--ta-text-dim));
    font-size: 0.8125rem;
  }

  .demo-footer code {
    font-family: var(--ta-font-mono);
    background: rgb(var(--ta-elevated));
    padding: 0.125rem 0.375rem;
    border-radius: var(--ta-radius-sm);
  }
</style>
