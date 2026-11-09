<!-- The 0.7 components together; the tests watch the callbacks. -->
<script lang="ts">
  import {
    BarChart,
    Breadcrumb,
    Icon,
    LineChart,
    SchemaForm,
    Sidebar,
    SplitPane,
    type JsonSchema,
  } from "$lib/components";

  let {
    onSubmit = (_v: Record<string, unknown>) => {},
    name,
  }: { onSubmit?: (v: Record<string, unknown>) => void; name?: string } = $props();

  let width = $state(40);
  let collapsed = $state(false);
  let data = $state<Record<string, unknown>>({ title: "Hello" });

  const months = [
    { month: "Jan", visits: 120, signups: 30 },
    { month: "Feb", visits: 180, signups: 45 },
    { month: "Mar", visits: 150, signups: null },
  ];

  const schema: JsonSchema = {
    type: "object",
    required: ["title", "status"],
    properties: {
      title: { type: "string", title: "Title", minLength: 3, description: "What shows at the top" },
      email: { type: "string", title: "Email", format: "email" },
      status: {
        type: "string",
        title: "Status",
        oneOf: [
          { const: "draft", title: "Draft" },
          { const: "live", title: "Published" },
        ],
      },
      level: { type: "integer", title: "Level", minimum: 1, maximum: 10 },
      active: { type: "boolean", title: "Active" },
      author: {
        type: "object",
        title: "Author",
        properties: { name: { type: "string", title: "Author name", pattern: "[A-Za-z ]+" } },
      },
    },
  };
</script>

<Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Kons", href: "/kons" }, { label: "Agile" }]} />

<Icon name="check" />
<Icon name="bot" label="Agent" />

<SplitPane bind:size={width} label="List width">
  {#snippet first()}<p>List</p>{/snippet}
  {#snippet second()}<p>Detail</p>{/snippet}
</SplitPane>
<span data-testid="width">{width}</span>

<Sidebar
  bind:collapsed={collapsed}
  current="/kons/agile"
  groups={[
    { label: "General", items: [{ id: "home", label: "Home", href: "/", icon: "home" }] },
    {
      label: "Kons",
      items: [
        {
          id: "kons",
          label: "Kons",
          children: [
            { id: "agile", label: "Agile", href: "/kons/agile" },
            { id: "blog", label: "Blog", href: "/kons/blog" },
          ],
        },
        { id: "settings", label: "Settings", children: [{ id: "account", label: "Account", href: "/account" }] },
      ],
    },
  ]}
/>
<span data-testid="collapsed">{collapsed}</span>

<BarChart
  title="Visits per month"
  data={months}
  x="month"
  series={[
    { key: "visits", label: "Visits" },
    { key: "signups", label: "Signups" },
  ]}
/>
<LineChart title="Trend" data={months} x="month" series={[{ key: "visits", label: "Visits" }]} />

<SchemaForm schema={schema} bind:value={data} name={name} onsubmit={onSubmit} />
<span data-testid="data">{JSON.stringify(data)}</span>
