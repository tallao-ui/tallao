<!--
  tallao — demo
  Muestra todos los componentes del v0.1 con sus variantes y estados.
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
    SelectionBar,
    KeyValueEditor,
    CopyButton,
    DragBoard,
    DropZone,
    DragItem,
    ChatMessage,
  } from "$lib/components";
  import { GameMap } from "$lib/map";
  import { es, setLabels } from "$lib/i18n";
  import { toast } from "$lib/toast.svelte";

  // La demo está en español: los textos del kit también.
  setLabels(es);

  let tema = $state<"dark" | "light">("dark");
  let dialogoAbierto = $state(false);
  let busqueda = $state("");
  let cargando = $state(false);

  // ——— Formularios y administración ———
  let rol = $state("member");
  let notas = $state("");
  let esAgente = $state(true);
  let pestana = $state("miembros");
  let confirmarAbierto = $state(false);
  let avisoVisible = $state(true);

  // ——— Capa flotante ———
  let filtroPopover = $state("");
  let ultimaAccion = $state("ninguna");
  let juegoElegido = $state<string | null>(null);

  // ——— 0.5 ———
  const filasDemo = ["Comentario de ana", "Comentario de luis", "Comentario de eva"];
  let marcadasDemo = $state<string[]>([]);
  let statsDemo = $state([{ key: "hp", value: "1200" }, { key: "atk", value: "85" }]);
  let tiersDemo = $state<Record<string, string>>({ Nahida: "pool", Raiden: "pool", Furina: "s" });

  // ——— 0.4 ———
  let avisosActivos = $state(true);
  let plan = $state("pro");
  let lateral = $state(false);
  let paleta = $state(false);
  let ultimaOrden = $state("ninguna");
  const ordenes = [
    { id: "nuevo", label: "Nuevo proyecto", group: "Proyectos", shortcut: "N", onSelect: () => (ultimaOrden = "nuevo proyecto") },
    { id: "abrir", label: "Abrir Aniimo", group: "Proyectos", keywords: ["juego"], onSelect: () => (ultimaOrden = "abrir Aniimo") },
    { id: "tema", label: "Cambiar tema", group: "Ajustes", keywords: ["oscuro", "claro"], onSelect: () => alternarTema() },
    { id: "salir", label: "Cerrar sesión", group: "Ajustes", disabled: true, onSelect: () => {} },
  ];
  const juegosCombo = [
    "Aniimo", "Cardback", "Cozy Games", "Diablo IV", "Elden Ring", "Grim Dawn", "Last Epoch",
    "Monster Hunter Wilds", "Palworld", "Path of Exile 2", "Pokémon TCG Pocket", "Star Rail",
  ].map((n) => ({ value: n.toLowerCase().replaceAll(" ", "-"), label: n }));

  $effect(() => {
    document.documentElement.dataset.tallaoTheme = tema;
  });

  const juegos = [
    { nombre: "World of Warcraft: Forever", estado: "Publicado", plataformas: 2, popularidad: 98 },
    { nombre: "Aniimo", estado: "Borrador", plataformas: 3, popularidad: 41 },
    { nombre: "Riftbound", estado: "Revisión", plataformas: 1, popularidad: 77 },
    { nombre: "Dressmaker", estado: "Publicado", plataformas: 2, popularidad: 86 },
  ];

  function alternarTema() {
    tema = tema === "dark" ? "light" : "dark";
  }

  function simularCarga() {
    cargando = true;
    setTimeout(() => (cargando = false), 1600);
  }

  // ——— Capa generativa: mini-chat de demostración ———
  type Mensaje =
    | { tipo: "usuario"; texto: string }
    | { tipo: "herramienta"; nombre: string; args: Record<string, unknown>; estado: "pending" | "executing" | "executed" | "rejected" };

  let mensajes = $state<Mensaje[]>([]);
  let pensando = $state(false);

  function enviarPrompt(texto: string) {
    mensajes = [...mensajes, { tipo: "usuario", texto }];
    pensando = true;
    setTimeout(() => {
      pensando = false;
      mensajes = [
        ...mensajes,
        {
          tipo: "herramienta",
          nombre: "publish_post",
          args: { sitio: "valhalla", titulo: texto, seccion: "noticias" },
          estado: "pending",
        },
      ];
    }, 900);
  }

  function decidir(i: number, aprobado: boolean) {
    const m = mensajes[i];
    if (m.tipo !== "herramienta") return;
    m.estado = aprobado ? "executing" : "rejected";
    if (aprobado) {
      setTimeout(() => { m.estado = "executed"; }, 1200);
    }
  }

  // ——— Mapa ———
  const marcadoresDemo = [
    { lat: 40.4168, lng: -3.7038, title: "Madrid", description: "Sede del gremio · 12 miembros" },
    { lat: 41.3874, lng: 2.1686, title: "Barcelona", description: "Torneo regional · sábado 18:00" },
    { lat: 37.3891, lng: -5.9845, title: "Sevilla", description: "Quedada de la comunidad" },
  ];
</script>

<svelte:head>
  <title>tallao — componentes v0.1</title>
</svelte:head>

<div class="demo">
  <header class="demo-cabecera">
    <div>
      <h1>⛏️ tallao</h1>
      <p class="demo-subtitulo">
        UI kit en Svelte 5 extraído del admin de Kitsuden — v0.1 ·
        Button · Card · Dialog · Table · Input · Badge
      </p>
    </div>
    <Button variant="secondary" size="md" onclick={alternarTema}>
      {tema === "dark" ? "☀️ Tema claro" : "🌙 Tema oscuro"}
    </Button>
  </header>

  <!-- ——— BUTTON ——— -->
  <section class="seccion">
    <h2>Button</h2>
    <div class="fila">
      {#each ["primary", "secondary", "danger", "ghost", "outline"] as v}
        <Button variant={v as any}>{v}</Button>
      {/each}
    </div>
    <div class="fila">
      <Button size="sm">Pequeño</Button>
      <Button size="md">Mediano</Button>
      <Button size="lg">Grande</Button>
      <Button size="icon" ariaLabel="Cerrar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </Button>
    </div>
    <div class="fila">
      <Button loading={true}>Cargando…</Button>
      <Button disabled={true}>Deshabilitado</Button>
      <Button variant="outline" loading={cargando} onclick={simularCarga}>
        {cargando ? "Simulando…" : "Simular carga"}
      </Button>
      <Button href="https://svelte.dev" variant="ghost">Soy un enlace ↗</Button>
    </div>
  </section>

  <!-- ——— BADGE ——— -->
  <section class="seccion">
    <h2>Badge</h2>
    <div class="fila">
      <Badge>default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="success">success</Badge>
      <Badge variant="warning">warning</Badge>
      <Badge variant="error">error</Badge>
      <Badge variant="info">info</Badge>
      <Badge variant="purple">purple</Badge>
      <Badge size="md">talla md</Badge>
    </div>
  </section>

  <!-- ——— INPUT ——— -->
  <section class="seccion">
    <h2>Input</h2>
    <div class="cuadricula">
      <label class="campo">
        <span class="campo-etiqueta">Normal</span>
        <Input placeholder="Escribe algo…" />
      </label>
      <label class="campo">
        <span class="campo-etiqueta">Con valor ({busqueda.length} caracteres)</span>
        <Input placeholder="Busca un juego…" bind:value={busqueda} />
      </label>
      <label class="campo">
        <span class="campo-etiqueta">Deshabilitado</span>
        <Input placeholder="No puedes escribir aquí" disabled={true} />
      </label>
    </div>
  </section>

  <!-- ——— DIALOG ——— -->
  <section class="seccion">
    <h2>Dialog</h2>
    <div class="fila">
      <Button onclick={() => (dialogoAbierto = true)}>Abrir diálogo</Button>
    </div>
    <Dialog
      bind:open={dialogoAbierto}
      title="Publicar cambios"
      description="Se desplegarán en las 4 webs de la red."
      size="md"
    >
      <p class="dialogo-texto">
        Estás a punto de publicar. Esta acción reconstruye Valhalla, TodoGachas,
        Cardback y Cozy con los últimos contenidos del CMS.
      </p>
      {#snippet footer()}
        <Button variant="ghost" onclick={() => (dialogoAbierto = false)}>Cancelar</Button>
        <Button onclick={() => (dialogoAbierto = false)}>Publicar ahora</Button>
      {/snippet}
    </Dialog>
  </section>

  <!-- ——— CARD ——— -->
  <section class="seccion">
    <h2>Card</h2>
    <div class="cuadricula-2">
      <Card>
        <CardHeader>
          <CardTitle>Card con partes</CardTitle>
          <Badge variant="purple">nuevo</Badge>
        </CardHeader>
        <CardContent>
          <p class="card-texto">
            CardHeader, CardTitle, CardContent y CardFooter componen el contenedor
            completo, igual que en el dashboard del admin.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm">Descartar</Button>
          <Button size="sm">Aceptar</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardContent>
          <p class="card-texto">
            Card a pelo: solo el contenedor y su contenido. Útil para paneles y
            widgets del dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- ——— TABLE ——— -->
  <section class="seccion">
    <h2>Table</h2>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Juego</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Plataformas</TableHead>
          <TableHead>Popularidad</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {#each juegos as j}
          <TableRow>
            <TableCell><strong>{j.nombre}</strong></TableCell>
            <TableCell>
              <Badge
                variant={j.estado === "Publicado" ? "success" : j.estado === "Revisión" ? "warning" : "default"}
              >{j.estado}</Badge>
            </TableCell>
            <TableCell>{j.plataformas}</TableCell>
            <TableCell>{j.popularidad} %</TableCell>
          </TableRow>
        {/each}
      </TableBody>
    </Table>
  </section>

  <!-- ——— FORMULARIOS ——— -->
  <section class="seccion">
    <h2>Field · Select · Textarea · Checkbox</h2>
    <div class="cuadricula">
      <Field label="Rol" required>
        <Select
          bind:value={rol}
          options={[
            { value: "owner", label: "Propietario" },
            { value: "member", label: "Miembro" },
            { value: "viewer", label: "Lector" },
          ]}
        />
      </Field>
      <Field label="Notas" error={notas.length > 40 ? "Máximo 40 caracteres" : undefined}>
        <Textarea bind:value={notas} rows={2} placeholder="Para el siguiente…" />
      </Field>
      <div class="fila">
        <Checkbox bind:checked={esAgente} label="Es un agente" />
      </div>
    </div>
  </section>

  <!-- ——— ADMINISTRACIÓN ——— -->
  <section class="seccion">
    <h2>Tabs · Alert · Stat · ConfirmDialog</h2>
    <Tabs
      bind:value={pestana}
      ariaLabel="Secciones del proyecto"
      items={[
        { id: "miembros", label: "Miembros", count: 4 },
        { id: "intakes", label: "Intakes", count: 2 },
        { id: "coste", label: "Coste" },
      ]}
    >
      {#snippet children(activa)}
        {#if activa === "miembros"}
          {#if avisoVisible}
            <Alert variant="success" title="Miembro añadido" onDismiss={() => (avisoVisible = false)}>
              agent-dev-a entra como miembro.
            </Alert>
          {/if}
          <div class="fila" style="margin-top: 0.75rem">
            <Button variant="danger" onclick={() => (confirmarAbierto = true)}>Quitar miembro</Button>
          </div>
        {:else if activa === "intakes"}
          <Alert variant="warning" title="2 pendientes">Esperan decisión de una persona.</Alert>
        {:else}
          <div class="cuadricula">
            <Stat label="Trabajos hechos" value={18} variant="success" />
            <Stat label="Fallidos" value={2} variant="error" />
            <Stat label="Coste" value="$0.42" />
          </div>
        {/if}
      {/snippet}
    </Tabs>
    <ConfirmDialog
      bind:open={confirmarAbierto}
      title="¿Quitar a agent-dev-a?"
      description="Deja de ver el proyecto y su cola de trabajo."
      confirmLabel="Quitar"
      onConfirm={() => new Promise((r) => setTimeout(r, 800))}
    />
  </section>

  <!-- ——— CAPA FLOTANTE ——— -->
  <section class="seccion">
    <h2>Popover · Tooltip · DropdownMenu · Combobox</h2>
    <div class="fila">
      <Popover title="Filtros">
        {#snippet trigger(props)}<Button variant="secondary" {...props}>Filtros</Button>{/snippet}
        <Field label="Nombre contiene"><Input bind:value={filtroPopover} placeholder="Escribe…" /></Field>
      </Popover>

      <Tooltip text="Copia el enlace al portapapeles">
        {#snippet trigger(props)}<Button variant="outline" {...props}>Copiar enlace</Button>{/snippet}
      </Tooltip>

      <DropdownMenu label="Acciones del proyecto">
        {#snippet trigger(props)}<Button variant="secondary" {...props}>Acciones ▾</Button>{/snippet}
        <MenuLabel>Proyecto</MenuLabel>
        <MenuItem onSelect={() => (ultimaAccion = "editar")}>Editar</MenuItem>
        <MenuItem onSelect={() => (ultimaAccion = "duplicar")} disabled>Duplicar</MenuItem>
        <MenuItem onSelect={() => (ultimaAccion = "archivar")}>Archivar</MenuItem>
        <MenuSeparator />
        <MenuItem variant="danger" onSelect={() => (ultimaAccion = "borrar")}>Borrar</MenuItem>
      </DropdownMenu>
      <span class="nota">Última acción: {ultimaAccion}</span>
    </div>
    <div class="cuadricula">
      <Field label="Juego">
        <Combobox options={juegosCombo} bind:value={juegoElegido} placeholder="Busca un juego…" />
      </Field>
      <p class="nota">Elegido: {juegoElegido ?? "ninguno"}</p>
    </div>
  </section>

  <!-- ——— 0.5 ——— -->
  <section class="seccion">
    <h2>SelectionBar · KeyValueEditor · CopyButton · DragBoard · ChatMessage</h2>
    <div class="cuadricula-2">
      <div class="pila">
        <SelectionBar
          total={filasDemo.length}
          selected={marcadasDemo.length}
          onToggleAll={(todo) => (marcadasDemo = todo ? [...filasDemo] : [])}
        >
          {#snippet actions()}<Button size="sm" variant="secondary">Ocultar</Button>{/snippet}
        </SelectionBar>
        {#each filasDemo as f (f)}
          <Checkbox
            label={f}
            checked={marcadasDemo.includes(f)}
            onchange={(e: Event) =>
              (marcadasDemo = (e.currentTarget as HTMLInputElement).checked
                ? [...marcadasDemo, f]
                : marcadasDemo.filter((m) => m !== f))}
          />
        {/each}
        <CopyButton text="https://valhalla-legion.com/obs/marcador" />
      </div>
      <KeyValueEditor bind:entries={statsDemo} keyLabel="Estadística" valueLabel="Valor" valueType="number" />
    </div>
    <DragBoard
      onMove={(item, zona) => {
        tiersDemo[item] = zona;
      }}
    >
      <div class="cuadricula">
        {#each ["pool", "s", "a"] as z (z)}
          <DropZone id={z} label={z === "pool" ? "Sin clasificar" : `Tier ${z.toUpperCase()}`} class="zona-demo">
            <strong>{z === "pool" ? "Sin clasificar" : `Tier ${z.toUpperCase()}`}</strong>
            {#each Object.entries(tiersDemo).filter(([, zz]) => zz === z) as [item] (item)}
              <DragItem id={item} label={item} zone={z}>{item}</DragItem>
            {/each}
          </DropZone>
        {/each}
      </div>
    </DragBoard>
    <div class="pila">
      <ChatMessage role="user" content="¿Qué build recomiendas para Nahida?" />
      <ChatMessage role="assistant" author="Asistente de Valhalla" content="Dendro catalizador con maestría elemental alta." />
      <ChatMessage role="assistant" pending />
    </div>
  </section>

  <!-- ——— 0.4 ——— -->
  <section class="seccion">
    <h2>Switch · RadioGroup · Sheet · Toast · Command · ContextMenu</h2>
    <div class="cuadricula">
      <Switch bind:checked={avisosActivos} label="Avisos por correo" />
      <RadioGroup
        legend="Plan"
        bind:value={plan}
        orientation="horizontal"
        options={[
          { value: "free", label: "Gratis" },
          { value: "pro", label: "Pro", description: "Con soporte" },
          { value: "team", label: "Equipo", disabled: true },
        ]}
      />
    </div>
    <div class="fila">
      <Button variant="secondary" onclick={() => (lateral = true)}>Ver detalle</Button>
      <Button variant="secondary" onclick={() => toast.success("Guardado", { description: "Los cambios ya están en las 4 webs" })}>Toast</Button>
      <Button variant="secondary" onclick={() => toast.error("No se pudo publicar", { action: { label: "Reintentar", onClick: () => toast("Reintentando…") } })}>Toast de error</Button>
      <Button variant="outline" onclick={() => (paleta = true)}>Paleta (Ctrl+K)</Button>
      <span class="nota">Última orden: {ultimaOrden}</span>
    </div>
    <ContextMenu label="Acciones de la fila">
      {#snippet target(props)}<div {...props} class="zona-contexto">Clic derecho aquí (o Mayús+F10)</div>{/snippet}
      <MenuItem onSelect={() => toast("Abrir")}>Abrir</MenuItem>
      <MenuItem onSelect={() => toast("Duplicar")}>Duplicar</MenuItem>
      <MenuSeparator />
      <MenuItem variant="danger" onSelect={() => toast.warning("Borrado")}>Borrar</MenuItem>
    </ContextMenu>
    <Sheet bind:open={lateral} title="Detalle de Aniimo" description="Ficha del juego">
      <p class="dialogo-texto">Contenido del panel lateral.</p>
      {#snippet footer()}<Button onclick={() => (lateral = false)}>Listo</Button>{/snippet}
    </Sheet>
    <Command bind:open={paleta} items={ordenes} />
  </section>

  <section class="seccion">
    <h2>Accordion · Progress · Skeleton · Avatar</h2>
    <div class="cuadricula-2">
      <Accordion
        single
        items={[
          { id: "a", title: "¿Qué es tallao?", content: "Un kit de componentes en Svelte 5.", open: true },
          { id: "b", title: "¿Funciona con SSR?", content: "Sí: los ids son estables y nada toca window en el servidor." },
          { id: "c", title: "¿Es accesible?", content: "Cada componente pasa axe y se prueba con teclado." },
        ]}
      />
      <div class="pila">
        <Progress label="Subida de imágenes" value={62} showValue />
        <Progress label="Sincronizando" />
        <Skeleton lines={3} />
        <div class="fila">
          <Avatar name="Ana López" />
          <Avatar name="Agente Uno" badge="IA" />
          <Avatar name="Rota" src="/no-existe.png" size="lg" />
        </div>
      </div>
    </div>
  </section>
  <Toaster />

  <!-- ——— CAPA GENERATIVA ——— -->
  <section class="seccion">
    <h2>PromptInput + ToolCallCard</h2>
    <p class="seccion-nota">
      Escribe algo y pulsa Enter: el agente simulado responde con una llamada a
      herramienta que puedes aprobar o rechazar.
    </p>

    <div class="chat">
      {#each mensajes as m, i}
        {#if m.tipo === "usuario"}
          <p class="chat-usuario">{m.texto}</p>
        {:else}
          <ToolCallCard
            name={m.nombre}
            args={m.args}
            status={m.estado}
            result={m.estado === "executed" ? "Entrada publicada en valhalla-legion.com/noticias" : undefined}
            onApprove={m.estado === "pending" ? () => decidir(i, true) : undefined}
            onReject={m.estado === "pending" ? () => decidir(i, false) : undefined}
          />
        {/if}
      {/each}
      {#if pensando}
        <p class="chat-pensando">El agente está pensando…</p>
      {/if}

      <PromptInput
        placeholder="Pídele algo al agente… (Enter envía)"
        attachments={true}
        loading={pensando}
        onSend={enviarPrompt}
        onAttach={() => alert("Adjuntar archivo")}
      />
    </div>

    <div class="cuadricula-2">
      <ToolCallCard
        name="rebuild_site"
        args={{ sitio: "cozy", forzar: true }}
        status="executing"
      />
      <ToolCallCard
        name="publish_post"
        args={{ sitio: "cardback", titulo: "Resultados del regional" }}
        status="failed"
        result="La API devolvió 503 tras 3 reintentos"
      />
    </div>
  </section>

  <!-- ——— MAPA ——— -->
  <section class="seccion">
    <h2>GameMap</h2>
    <p class="seccion-nota">
      Envoltura fina sobre sveaflet (Leaflet) con capa oscura (Esri) y
      marcadores del color de acento del tema.
    </p>
    <GameMap
      center={[40.4168, -3.7038]}
      zoom={5}
      markers={marcadoresDemo}
      height="22rem"
    />
  </section>

  <footer class="demo-pie">
    <p>
      tallao v0.1 — copia los componentes de <code>src/lib/components/</code>,
      retemadiza con las variables <code>--ta-*</code> en <code>src/lib/tokens.css</code>.
    </p>
  </footer>
</div>

<style>
  .demo {
    max-width: 60rem;
    margin: 0 auto;
    padding: 2.5rem 1.5rem 4rem;
  }

  .demo-cabecera {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1.5rem;
    flex-wrap: wrap;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgb(var(--ta-border));
  }

  .demo-cabecera h1 {
    margin: 0;
    font-size: 2rem;
    letter-spacing: -0.02em;
  }

  .demo-subtitulo {
    margin: 0.375rem 0 0;
    color: rgb(var(--ta-text-dim));
    max-width: 40rem;
  }

  .seccion {
    margin-top: 2.5rem;
  }

  .seccion h2 {
    margin: 0 0 1rem;
    font-size: 1.125rem;
    font-weight: 600;
  }

  .fila {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .cuadricula {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
    gap: 1rem;
  }

  .cuadricula-2 {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
    gap: 1rem;
  }

  .campo { display: flex; flex-direction: column; gap: 0.375rem; }

  .campo-etiqueta {
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--ta-text-dim));
  }

  :global(.zona-demo) { display: flex; flex-direction: column; gap: 0.5rem; min-height: 6rem; padding: 0.75rem; border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius-lg); }
  .pila { display: flex; flex-direction: column; gap: 1rem; }
  .zona-contexto { margin-top: 0.75rem; padding: 1.25rem; text-align: center; color: rgb(var(--ta-text-dim)); border: 1px dashed rgb(var(--ta-border)); border-radius: var(--ta-radius-lg); }

  .nota { color: rgb(var(--ta-text-dim)); font-size: 0.8125rem; }

  .dialogo-texto { margin: 0; color: rgb(var(--ta-text-dim)); }

  .card-texto { margin: 0; color: rgb(var(--ta-text-dim)); }

  .seccion-nota {
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

  .chat-usuario {
    align-self: flex-end;
    margin: 0;
    padding: 0.5rem 0.875rem;
    background: rgb(var(--ta-accent) / 0.15);
    border-radius: var(--ta-radius-lg);
    font-size: 0.875rem;
    max-width: 80%;
  }

  .chat-pensando {
    margin: 0;
    color: rgb(var(--ta-text-dim));
    font-size: 0.8125rem;
    font-style: italic;
  }

  .demo-pie {
    margin-top: 3rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgb(var(--ta-border));
    color: rgb(var(--ta-text-dim));
    font-size: 0.8125rem;
  }

  .demo-pie code {
    font-family: var(--ta-font-mono);
    background: rgb(var(--ta-elevated));
    padding: 0.125rem 0.375rem;
    border-radius: var(--ta-radius-sm);
  }
</style>
