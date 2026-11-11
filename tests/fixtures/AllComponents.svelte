<!-- Every component with sample content: used by the axe and SSR tests. -->
<script lang="ts">
  import {
    Alert,
    Badge,
    Button,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Checkbox,
    ConfirmDialog,
    Dialog,
    Field,
    Input,
    PromptInput,
    Select,
    Stat,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    Textarea,
    ThemeScope,
    ToolCallCard,
    Steps,
    SuggestionChips,
    CodeBlock,
    Sources,
    UsageMeter,
    InputOTP,
    NavMenu,
    BottomNav,
    DataTable,
    BarChart,
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
    LineChart,
    ScatterChart,
    Sparkline,
    Timeline,
  } from "$lib/components";

  let { dialogOpen = false }: { dialogOpen?: boolean } = $props();
</script>

<ThemeScope source="tallao">
  <main>
    <h1>Demo</h1>
    <Button>Save</Button>
    <Button href="/x" disabled>Link</Button>
    <Badge variant="success">ok</Badge>
    <Alert variant="error" title="Error" onDismiss={() => {}}>Something went wrong</Alert>
    <Field label="Name" required><Input /></Field>
    <Field label="Role"><Select options={[{ value: "a", label: "A" }]} /></Field>
    <Field label="Notes"><Textarea /></Field>
    <Checkbox label="Agent" />
    <Stat label="Cost" value="$1" />
    <Card>
      <CardHeader><CardTitle level={2}>Title</CardTitle></CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter><Button>Accept</Button></CardFooter>
    </Card>
    <Table>
      <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>Value</TableCell></TableRow></TableBody>
    </Table>
    <Tabs items={[{ id: "a", label: "One" }, { id: "b", label: "Two", count: 2 }]} ariaLabel="Sections">
      {#snippet children(active)}<p>Panel {active}</p>{/snippet}
    </Tabs>
    <ToolCallCard name="publish_post" args={{ title: "Hello" }} onApprove={() => {}} onReject={() => {}} />
    <PromptInput />
    <Steps steps={[
      { title: "Review the draft", status: "done" },
      { title: "Publish the post", status: "running", description: "On Valhalla" },
      { title: "Rebuild the site", status: "pending" },
      { title: "Announce it on Discord", status: "failed" },
    ]} />
    <SuggestionChips suggestions={["Write the recap", "Publish on Cardback"]} onSelect={() => {}} />
    <CodeBlock code={"const x = 1;"} language="ts" fileName="app.ts" />
    <Sources sources={[
      { url: "https://example.com/guide", title: "Tournament guide", domain: "example.com" },
      { url: "https://other.com/note", title: "Patch notes" },
    ]} />
    <UsageMeter used={8100} max={10000} cost="$0.42" />
    <InputOTP groupSize={3} />
    <NavMenu label="More" groups={[{ label: "Sites", items: [{ label: "Valhalla", href: "/", description: "The hub", icon: "home" }, { label: "Later", soon: true }] }]} />
    <BottomNav ariaLabel="Bottom bar" current="home" items={[{ id: "home", label: "Home", href: "/", icon: "home" }, { id: "me", label: "Me", href: "/me", icon: "user" }]} />
    <DataTable
      caption="Filtered"
      rows={[{ id: "a", name: "Ana", points: 3 }, { id: "b", name: "Bea", points: 7 }]}
      rowKey="id"
      columns={[
        { key: "name", header: "Name", filter: "text" },
        { key: "points", header: "Points", filter: "range" },
      ]}
    />
    <DashboardGrid>
      <KpiCard label="Win rate" value={52.4} unit="%" delta={1.8} deltaLabel="vs last patch" trend={[49, 50, 52.4]} target={55} locale="en" />
      <ChartCard title="Role share" description="By patch" source="Match API" sourceHref="/source" span={2}>
        <BarChart title="Role share by patch" hideTitle data={[{ patch: "1.0", dps: 50, tank: 20 }, { patch: "1.1", dps: 55, tank: 25 }]} x="patch" series={[{ key: "dps", label: "DPS" }, { key: "tank", label: "Tank" }]} stacked orientation="horizontal" locale="en" />
      </ChartCard>
      <DashboardItem span="full"><BigNumber value={1240000} unit="matches" label="analysed this patch" locale="en" /></DashboardItem>
    </DashboardGrid>
    <LineChart title="Stacked roles" data={[{ patch: "1.0", dps: 50, tank: 20 }, { patch: "1.1", dps: 55, tank: 25 }]} x="patch" series={[{ key: "dps", label: "DPS" }, { key: "tank", label: "Tank" }]} stacked locale="en" />
    <DonutChart title="Picks by element" data={[{ label: "Fire", value: 40 }, { label: "Water", value: 30 }]} locale="en" />
    <DonutChart title="Nothing yet" data={[]} />
    <ScatterChart title="Pick rate against win rate" data={[{ x: 18, y: 54, label: "Kaela", group: "Fire" }, { x: 6, y: 47, label: "Moss", group: "Grass" }]} xLabel="Pick rate" yLabel="Win rate" yRef={50} showLabels locale="en" />
    <Heatmap title="Matchups" data={[{ x: "Fire", y: "Water", value: 62 }, { x: "Water", y: "Fire", value: 38 }]} cornerLabel="Attacker" locale="en" />
    <Funnel title="New players" data={[{ label: "Visited", value: 1000 }, { label: "Signed up", value: 400 }]} locale="en" />
    <BarList title="Most picked" ranked data={[{ label: "Kaela", value: 18, href: "/kaela", note: "Fire" }, { label: "Tide", value: 12 }]} locale="en" />
    <p>Trend <Sparkline data={[12, 9, 11, 18]} label="Pick rate" locale="en" /></p>
    <Gauge value={52.4} label="Win rate" target={55} locale="en" />
    <Gauge value={80} label="Completion" variant="ring" locale="en" />
    <IconArray value={7} total={10} label="players pick a Fire lead" />
    <IconArray value={3} total={5} label="wins" shape="person" showSummary={false} />
    <Timeline ariaLabel="Season" locale="en" items={[{ date: "2026-11-03", title: "Patch 1.2", tag: "Patch", tone: "accent", href: "/patch" }, { date: "Season 3", title: "Ladder reset", current: true }]} />
    <ComparisonBar title="Side win rate" left={{ label: "Blue side", value: 5230 }} right={{ label: "Red side", value: 4770 }} locale="en" />
    <ChartLegend items={[{ label: "Fire", value: "40%" }, { label: "Water" }]} aria-label="Elements" />
    <Dialog open={dialogOpen} title="Dialog" description="Details"><p>Body</p></Dialog>
    <ConfirmDialog title="Are you sure?" onConfirm={() => {}} />
  </main>
</ThemeScope>
