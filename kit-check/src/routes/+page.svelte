<!--
  Nearly all of tallao on one page: the prerender renders it on the server and the browser
  hydrates it. tests/hydration.spec.ts checks that there are no mismatches and that, once
  hydrated, everything responds.
-->
<script lang="ts">
  import {
    Accordion,
    Alert,
    Avatar,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    ChatMessage,
    Checkbox,
    Combobox,
    Command,
    ConfirmDialog,
    CopyButton,
    Dialog,
    DragBoard,
    DragItem,
    DropZone,
    DropdownMenu,
    Field,
    Input,
    KeyValueEditor,
    MenuItem,
    Popover,
    Progress,
    RadioGroup,
    Select,
    SelectionBar,
    Skeleton,
    Stat,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    Textarea,
    Tooltip,
    toast,
  } from "tallao";

  let dialogOpen = $state(false);
  let confirmOpen = $state(false);
  let paletteOpen = $state(false);
  let enabled = $state(false);
  let plan = $state("pro");
  let country = $state<string | null>(null);
  let last = $state("none");
  let checked = $state<string[]>([]);
  let pairs = $state([{ key: "hp", value: "100" }]);
  let zones = $state<Record<string, string>>({ Ahri: "pool", Zed: "s" });
  const rows = ["one", "two"];
</script>

<main>
  <h1>tallao in SvelteKit</h1>

  <section>
    <h2>Controls</h2>
    <Button onclick={() => (dialogOpen = true)}>Open dialog</Button>
    <Button href="/other" variant="ghost">Link</Button>
    <Badge variant="success">ok</Badge>
    <Field label="Name"><Input /></Field>
    <Field label="Role"><Select options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} /></Field>
    <Field label="Notes"><Textarea /></Field>
    <Checkbox label="I agree" />
    <Switch bind:checked={enabled} label="Alerts" />
    <span data-testid="switch">{enabled}</span>
    <RadioGroup legend="Plan" bind:value={plan} options={[{ value: "free", label: "Free" }, { value: "pro", label: "Pro" }]} />
    <Alert variant="info" title="Notice" onDismiss={() => {}}>Text</Alert>
  </section>

  <section>
    <h2>Tabs and table</h2>
    <Tabs items={[{ id: "a", label: "One" }, { id: "b", label: "Two", count: 2 }]} ariaLabel="Sections">
      {#snippet children(active)}<p data-testid="panel">Panel {active}</p>{/snippet}
    </Tabs>
    <Tabs items={[{ id: "x", label: "Ex" }, { id: "y", label: "Wye" }]} ariaLabel="Others" />
    <Table>
      <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
      <TableBody><TableRow title="row" data-row="1"><TableCell>Value</TableCell></TableRow></TableBody>
    </Table>
    <Card><CardHeader><CardTitle level={2}>Card</CardTitle></CardHeader><CardContent><Stat label="Cost" value="$1" /></CardContent></Card>
  </section>

  <section>
    <h2>Floating</h2>
    <Popover title="Filters">
      {#snippet trigger(props)}<Button {...props}>Filters</Button>{/snippet}
      <Input aria-label="Search" />
    </Popover>
    <Tooltip text="Copies the link">
      {#snippet trigger(props)}<Button {...props}>Copy</Button>{/snippet}
    </Tooltip>
    <DropdownMenu label="Actions">
      {#snippet trigger(props)}<Button {...props}>Actions</Button>{/snippet}
      <MenuItem onSelect={() => (last = "edit")}>Edit</MenuItem>
      <MenuItem onSelect={() => (last = "delete")}>Delete</MenuItem>
    </DropdownMenu>
    <span data-testid="last">{last}</span>
    <Combobox
      ariaLabel="Country"
      bind:value={country}
      options={[{ value: "es", label: "Spain" }, { value: "pe", label: "Peru" }]}
    />
    <span data-testid="country">{country ?? "none"}</span>
    <Button onclick={() => (paletteOpen = true)}>Palette</Button>
    <Command bind:open={paletteOpen} items={[{ id: "n", label: "New", onSelect: () => (last = "new") }]} />
    <Button onclick={() => toast.success("Saved")}>Toast</Button>
    <Button onclick={() => (confirmOpen = true)}>Confirm</Button>
    <ConfirmDialog bind:open={confirmOpen} title="Are you sure?" onConfirm={() => {}} />
  </section>

  <section>
    <h2>Lists and data</h2>
    <SelectionBar total={rows.length} selected={checked.length} onToggleAll={(t) => (checked = t ? [...rows] : [])} />
    <KeyValueEditor bind:entries={pairs} keyLabel="Stat" valueLabel="Value" />
    <CopyButton text="https://example.test/obs" />
    <DragBoard
      onMove={(item, zone) => {
        zones[item] = zone;
      }}
    >
      {#each ["pool", "s"] as z (z)}
        <DropZone id={z} label={`Zone ${z}`}>
          {#each Object.entries(zones).filter(([, zz]) => zz === z) as [item] (item)}
            <DragItem id={item} label={item} zone={z}>{item}</DragItem>
          {/each}
        </DropZone>
      {/each}
    </DragBoard>
    <Accordion single items={[{ id: "a", title: "What?", content: "A kit", open: true }, { id: "b", title: "How much?", content: "Nothing" }]} />
    <Progress label="Upload" value={40} showValue />
    <Skeleton lines={2} />
    <Avatar name="Ana López" />
    <ChatMessage role="assistant" content="Hello" />
  </section>

  <Dialog bind:open={dialogOpen} title="Dialog">
    <Input aria-label="Inside" />
  </Dialog>
</main>
