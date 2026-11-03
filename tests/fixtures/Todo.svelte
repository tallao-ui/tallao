<!-- Todos los componentes con contenido de ejemplo: lo usan los tests de axe y de SSR. -->
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
  } from "$lib/components";

  let { abierto = false }: { abierto?: boolean } = $props();
</script>

<ThemeScope source="tallao">
  <main>
    <h1>Demo</h1>
    <Button>Guardar</Button>
    <Button href="/x" disabled>Enlace</Button>
    <Badge variant="success">ok</Badge>
    <Alert variant="error" title="Fallo" onDismiss={() => {}}>Algo salió mal</Alert>
    <Field label="Nombre" required><Input /></Field>
    <Field label="Rol"><Select options={[{ value: "a", label: "A" }]} /></Field>
    <Field label="Notas"><Textarea /></Field>
    <Checkbox label="Agente" />
    <Stat label="Coste" value="$1" />
    <Card>
      <CardHeader><CardTitle level={2}>Título</CardTitle></CardHeader>
      <CardContent>Contenido</CardContent>
      <CardFooter><Button>Aceptar</Button></CardFooter>
    </Card>
    <Table>
      <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
      <TableBody><TableRow><TableCell>Valor</TableCell></TableRow></TableBody>
    </Table>
    <Tabs items={[{ id: "a", label: "Uno" }, { id: "b", label: "Dos", count: 2 }]} ariaLabel="Secciones">
      {#snippet children(activa)}<p>Panel {activa}</p>{/snippet}
    </Tabs>
    <ToolCallCard name="publish_post" args={{ titulo: "Hola" }} onApprove={() => {}} onReject={() => {}} />
    <PromptInput />
    <Dialog open={abierto} title="Diálogo" description="Detalle"><p>Cuerpo</p></Dialog>
    <ConfirmDialog title="¿Seguro?" onConfirm={() => {}} />
  </main>
</ThemeScope>
