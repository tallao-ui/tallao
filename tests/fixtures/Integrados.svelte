<!-- Los componentes que trajo la migración de las vistas de kon (0.5), juntos. -->
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

  const filas = ["a", "b", "c"];
  let marcadas = $state<string[]>([]);
  let pares = $state<KeyValueEntry[]>([{ key: "hp", value: "100" }]);
  let zonas = $state<Record<string, string>>({ x: "pool", y: "pool" });
  let confirmar = $state(false);
  let campo = $state<HTMLInputElement>();
</script>

<SelectionBar
  total={filas.length}
  selected={marcadas.length}
  onToggleAll={(todo) => (marcadas = todo ? [...filas] : [])}
>
  {#snippet actions()}<Button size="sm">Ocultar</Button>{/snippet}
</SelectionBar>
{#each filas as f (f)}
  <Checkbox
    ariaLabel={`Fila ${f}`}
    checked={marcadas.includes(f)}
    onchange={(e: Event) =>
      (marcadas = (e.currentTarget as HTMLInputElement).checked ? [...marcadas, f] : marcadas.filter((m) => m !== f))}
  />
{/each}

<CopyButton text="https://kitsuden.test/obs" {onCopy} resetAfter={50} />

<KeyValueEditor bind:entries={pares} keyLabel="Stat" valueLabel="Valor" valueType="number" />
<span data-testid="pares">{JSON.stringify(pares)}</span>

<DragBoard
  onMove={(item, zona) => {
    zonas[item] = zona;
    onMove(item, zona);
  }}
>
  {#each ["pool", "s", "a"] as z (z)}
    <DropZone id={z} label={`Zona ${z}`}>
      {#each Object.entries(zonas).filter(([, zz]) => zz === z) as [item] (item)}
        <DragItem id={item} label={`Item ${item}`} zone={z}>{item}</DragItem>
      {/each}
    </DropZone>
  {/each}
</DragBoard>

<ChatMessage role="user" content={"Hola\n<b>no html</b>"} />
<ChatMessage role="assistant" pending />

<Button onclick={() => (confirmar = true)}>Borrar</Button>
<ConfirmDialog bind:open={confirmar} title="¿Borrar?" {onConfirm} {onCancel} />

<Input aria-label="Con ref" bind:ref={campo} />
<span data-testid="ref">{campo?.tagName ?? "sin ref"}</span>

<Table>
  <TableBody>
    <TableRow title="Detalle de la fila" data-fila="1"><TableCell data-celda="1">Celda</TableCell></TableRow>
  </TableBody>
</Table>
