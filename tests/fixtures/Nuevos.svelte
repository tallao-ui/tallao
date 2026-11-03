<!-- Los componentes de 0.4 juntos; los callbacks se observan desde los tests. -->
<script lang="ts">
  import {
    Accordion,
    Avatar,
    Button,
    Command,
    ContextMenu,
    MenuItem,
    Progress,
    RadioGroup,
    Sheet,
    Skeleton,
    Switch,
    Toaster,
  } from "$lib/components";

  let { onAccion = (_accion: string) => {} }: { onAccion?: (accion: string) => void } = $props();
  let activo = $state(false);
  let plan = $state("pro");
  let lateral = $state(false);
  let paleta = $state(false);
</script>

<Switch bind:checked={activo} label="Notificaciones" />
<span data-testid="activo">{activo}</span>

<RadioGroup
  legend="Plan"
  bind:value={plan}
  options={[
    { value: "free", label: "Gratis" },
    { value: "pro", label: "Pro", description: "Con soporte" },
    { value: "team", label: "Equipo", disabled: true },
  ]}
/>
<span data-testid="plan">{plan}</span>

<Button onclick={() => (lateral = true)}>Ver detalle</Button>
<Sheet bind:open={lateral} title="Detalle"><p>Contenido</p></Sheet>

<Command
  bind:open={paleta}
  items={[
    { id: "nuevo", label: "Nuevo proyecto", group: "Proyectos", shortcut: "N", onSelect: () => onAccion("nuevo") },
    { id: "tema", label: "Cambiar tema", group: "Ajustes", keywords: ["oscuro", "claro"], onSelect: () => onAccion("tema") },
    { id: "salir", label: "Cerrar sesión", group: "Ajustes", disabled: true, onSelect: () => onAccion("salir") },
  ]}
/>
<span data-testid="paleta">{paleta}</span>

<ContextMenu label="Acciones de la fila">
  {#snippet target(props)}<div {...props} data-testid="zona">Fila 1</div>{/snippet}
  <MenuItem onSelect={() => onAccion("abrir")}>Abrir</MenuItem>
  <MenuItem onSelect={() => onAccion("borrar")}>Borrar</MenuItem>
</ContextMenu>

<Accordion
  single
  items={[
    { id: "a", title: "¿Qué es?", content: "Un kit", open: true },
    { id: "b", title: "¿Cuesta?", content: "No" },
  ]}
/>

<Progress label="Subida" value={30} showValue />
<Progress label="Sincronizando" />
<Skeleton lines={3} />
<Avatar name="Ana López" />
<Avatar name="Agente Uno" src="/no-existe.png" badge="IA" />

<Toaster />
