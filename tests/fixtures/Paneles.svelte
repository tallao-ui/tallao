<!-- Los componentes de 0.7 juntos; los callbacks se observan desde los tests. -->
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
    onEnviar = (_v: Record<string, unknown>) => {},
    nombre,
  }: { onEnviar?: (v: Record<string, unknown>) => void; nombre?: string } = $props();

  let ancho = $state(40);
  let plegada = $state(false);
  let datos = $state<Record<string, unknown>>({ titulo: "Hola" });

  const meses = [
    { mes: "Ene", visitas: 120, altas: 30 },
    { mes: "Feb", visitas: 180, altas: 45 },
    { mes: "Mar", visitas: 150, altas: null },
  ];

  const esquema: JsonSchema = {
    type: "object",
    required: ["titulo", "estado"],
    properties: {
      titulo: { type: "string", title: "Título", minLength: 3, description: "Lo que se ve arriba" },
      correo: { type: "string", title: "Correo", format: "email" },
      estado: {
        type: "string",
        title: "Estado",
        oneOf: [
          { const: "draft", title: "Borrador" },
          { const: "live", title: "Publicado" },
        ],
      },
      nivel: { type: "integer", title: "Nivel", minimum: 1, maximum: 10 },
      activo: { type: "boolean", title: "Activo" },
      autor: {
        type: "object",
        title: "Autor",
        properties: { nombre: { type: "string", title: "Nombre del autor", pattern: "[A-Za-z ]+" } },
      },
    },
  };
</script>

<Breadcrumb items={[{ label: "Inicio", href: "/" }, { label: "Kons", href: "/kons" }, { label: "Agile" }]} />

<Icon name="check" />
<Icon name="bot" label="Agente" />

<SplitPane bind:size={ancho} label="Ancho de la lista">
  {#snippet first()}<p>Lista</p>{/snippet}
  {#snippet second()}<p>Detalle</p>{/snippet}
</SplitPane>
<span data-testid="ancho">{ancho}</span>

<Sidebar
  bind:collapsed={plegada}
  current="/kons/agile"
  groups={[
    { label: "General", items: [{ id: "inicio", label: "Inicio", href: "/", icon: "home" }] },
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
        { id: "ajustes", label: "Ajustes", children: [{ id: "cuenta", label: "Cuenta", href: "/cuenta" }] },
      ],
    },
  ]}
/>
<span data-testid="plegada">{plegada}</span>

<BarChart
  title="Visitas por mes"
  data={meses}
  x="mes"
  series={[
    { key: "visitas", label: "Visitas" },
    { key: "altas", label: "Altas" },
  ]}
/>
<LineChart title="Tendencia" data={meses} x="mes" series={[{ key: "visitas", label: "Visitas" }]} />

<SchemaForm schema={esquema} bind:value={datos} name={nombre} onsubmit={onEnviar} />
<span data-testid="datos">{JSON.stringify(datos)}</span>
