<!-- The components brought in by the migration of the kon views (0.5), together. -->
<script lang="ts">
  import {
    Button,
    ChatMessage,
    Checkbox,
    ConfirmDialog,
    CopyButton,
    DragBoard,
    DragItem,
    DropZone,
    Input,
    KeyValueEditor,
    SelectionBar,
    Table,
    TableBody,
    TableCell,
    TableRow,
    type KeyValueEntry,
  } from "$lib/components";

  let {
    onMove = (_item: string, _zone: string) => {},
    onCancel = () => {},
    onConfirm = () => {},
    onCopy = (_text: string) => {},
  }: {
    onMove?: (item: string, zone: string) => void;
    onCancel?: () => void;
    onConfirm?: () => void;
    onCopy?: (text: string) => void;
  } = $props();

  const rows = ["a", "b", "c"];
  let marked = $state<string[]>([]);
  let pairs = $state<KeyValueEntry[]>([{ key: "hp", value: "100" }]);
  let zones = $state<Record<string, string>>({ x: "pool", y: "pool" });
  let confirming = $state(false);
  let field = $state<HTMLInputElement>();
</script>

<SelectionBar
  total={rows.length}
  selected={marked.length}
  onToggleAll={(all) => (marked = all ? [...rows] : [])}
>
  {#snippet actions()}<Button size="sm">Hide</Button>{/snippet}
</SelectionBar>
{#each rows as r (r)}
  <Checkbox
    ariaLabel={`Row ${r}`}
    checked={marked.includes(r)}
    onchange={(e: Event) =>
      (marked = (e.currentTarget as HTMLInputElement).checked ? [...marked, r] : marked.filter((m) => m !== r))}
  />
{/each}

<CopyButton text="https://kitsuden.test/obs" {onCopy} resetAfter={50} />

<KeyValueEditor bind:entries={pairs} keyLabel="Stat" valueLabel="Value" valueType="number" />
<span data-testid="pairs">{JSON.stringify(pairs)}</span>

<DragBoard
  onMove={(item, zone) => {
    zones[item] = zone;
    onMove(item, zone);
  }}
>
  {#each ["pool", "s", "a"] as z (z)}
    <DropZone id={z} label={`Zone ${z}`}>
      {#each Object.entries(zones).filter(([, zz]) => zz === z) as [item] (item)}
        <DragItem id={item} label={`Item ${item}`} zone={z}>{item}</DragItem>
      {/each}
    </DropZone>
  {/each}
</DragBoard>

<ChatMessage role="user" content={"Hello\n<b>no html</b>"} />
<ChatMessage role="assistant" pending />

<Button onclick={() => (confirming = true)}>Delete</Button>
<ConfirmDialog bind:open={confirming} title="Delete?" {onConfirm} {onCancel} />

<Input aria-label="With ref" bind:ref={field} />
<span data-testid="ref">{field?.tagName ?? "no ref"}</span>

<Table>
  <TableBody>
    <TableRow title="Row details" data-row="1"><TableCell data-cell="1">Cell</TableCell></TableRow>
  </TableBody>
</Table>
