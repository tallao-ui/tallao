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
    <Dialog open={dialogOpen} title="Dialog" description="Details"><p>Body</p></Dialog>
    <ConfirmDialog title="Are you sure?" onConfirm={() => {}} />
  </main>
</ThemeScope>
