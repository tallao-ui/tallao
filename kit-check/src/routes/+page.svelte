<!--
  Casi todo tallao en una página: el prerender la renderiza en el servidor y el navegador
  la hidrata. tests/hydration.spec.ts comprueba que no hay desajustes y que, ya hidratada,
  todo responde.
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

  let dialogo = $state(false);
  let confirmar = $state(false);
  let paleta = $state(false);
  let activo = $state(false);
  let plan = $state("pro");
  let pais = $state<string | null>(null);
  let ultima = $state("ninguna");
  let marcadas = $state<string[]>([]);
  let pares = $state([{ key: "hp", value: "100" }]);
  let zonas = $state<Record<string, string>>({ Ahri: "pool", Zed: "s" });
  const filas = ["uno", "dos"];
</script>

<main>
  <h1>tallao en SvelteKit</h1>

  <section>
    <h2>Controles</h2>
    <Button onclick={() => (dialogo = true)}>Abrir diálogo</Button>
    <Button href="/otra" variant="ghost">Enlace</Button>
    <Badge variant="success">ok</Badge>
    <Field label="Nombre"><Input /></Field>
    <Field label="Rol"><Select options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} /></Field>
    <Field label="Notas"><Textarea /></Field>
    <Checkbox label="Acepto" />
    <Switch bind:checked={activo} label="Avisos" />
    <span data-testid="switch">{activo}</span>
    <RadioGroup legend="Plan" bind:value={plan} options={[{ value: "free", label: "Gratis" }, { value: "pro", label: "Pro" }]} />
    <Alert variant="info" title="Aviso" onDismiss={() => {}}>Texto</Alert>
  </section>

  <section>
    <h2>Pestañas y tabla</h2>
    <Tabs items={[{ id: "a", label: "Uno" }, { id: "b", label: "Dos", count: 2 }]} ariaLabel="Secciones">
      {#snippet children(activa)}<p data-testid="panel">Panel {activa}</p>{/snippet}
    </Tabs>
    <Tabs items={[{ id: "x", label: "Equis" }, { id: "y", label: "Ye" }]} ariaLabel="Otras" />
    <Table>
      <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
      <TableBody><TableRow title="fila" data-fila="1"><TableCell>Valor</TableCell></TableRow></TableBody>
    </Table>
    <Card><CardHeader><CardTitle level={2}>Tarjeta</CardTitle></CardHeader><CardContent><Stat label="Coste" value="$1" /></CardContent></Card>
  </section>

  <section>
    <h2>Flotantes</h2>
    <Popover title="Filtros">
      {#snippet trigger(props)}<Button {...props}>Filtros</Button>{/snippet}
      <Input aria-label="Buscar" />
    </Popover>
    <Tooltip text="Copia el enlace">
      {#snippet trigger(props)}<Button {...props}>Copiar</Button>{/snippet}
    </Tooltip>
    <DropdownMenu label="Acciones">
      {#snippet trigger(props)}<Button {...props}>Acciones</Button>{/snippet}
      <MenuItem onSelect={() => (ultima = "editar")}>Editar</MenuItem>
      <MenuItem onSelect={() => (ultima = "borrar")}>Borrar</MenuItem>
    </DropdownMenu>
    <span data-testid="ultima">{ultima}</span>
    <Combobox
      ariaLabel="País"
      bind:value={pais}
      options={[{ value: "es", label: "España" }, { value: "pe", label: "Perú" }]}
    />
    <span data-testid="pais">{pais ?? "ninguno"}</span>
    <Button onclick={() => (paleta = true)}>Paleta</Button>
    <Command bind:open={paleta} items={[{ id: "n", label: "Nuevo", onSelect: () => (ultima = "nuevo") }]} />
    <Button onclick={() => toast.success("Guardado")}>Toast</Button>
    <Button onclick={() => (confirmar = true)}>Confirmar</Button>
    <ConfirmDialog bind:open={confirmar} title="¿Seguro?" onConfirm={() => {}} />
  </section>

  <section>
    <h2>Listas y datos</h2>
    <SelectionBar total={filas.length} selected={marcadas.length} onToggleAll={(t) => (marcadas = t ? [...filas] : [])} />
    <KeyValueEditor bind:entries={pares} keyLabel="Stat" valueLabel="Valor" />
    <CopyButton text="https://example.test/obs" />
    <DragBoard
      onMove={(item, zona) => {
        zonas[item] = zona;
      }}
    >
      {#each ["pool", "s"] as z (z)}
        <DropZone id={z} label={`Zona ${z}`}>
          {#each Object.entries(zonas).filter(([, zz]) => zz === z) as [item] (item)}
            <DragItem id={item} label={item} zone={z}>{item}</DragItem>
          {/each}
        </DropZone>
      {/each}
    </DragBoard>
    <Accordion single items={[{ id: "a", title: "¿Qué?", content: "Un kit", open: true }, { id: "b", title: "¿Cuánto?", content: "Nada" }]} />
    <Progress label="Subida" value={40} showValue />
    <Skeleton lines={2} />
    <Avatar name="Ana López" />
    <ChatMessage role="assistant" content="Hola" />
  </section>

  <Dialog bind:open={dialogo} title="Diálogo">
    <Input aria-label="Dentro" />
  </Dialog>
</main>
