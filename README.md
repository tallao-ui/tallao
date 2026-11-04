# tallao ⛏️

UI kit en **Svelte 5** para interfaces generativas, extraído del admin de
Kitsuden y desacoplado de Tailwind, stores y APIs. CSS puro sobre tokens,
accesible por teclado y lector de pantalla, y compatible con SSR (SvelteKit).

## Instalar

Como paquete (compila al instalar con `prepare`):

```bash
pnpm add github:Kitsuden/tallao
```

```svelte
<script>
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Button, Dialog, DropdownMenu, MenuItem } from "tallao";
</script>
```

El mapa va aparte porque arrastra Leaflet: `import { GameMap } from "tallao/map"`
(instala `leaflet` y `sveaflet`). El editor de código también, por CodeMirror:
`import { CodeEditor } from "tallao/code"` (instala `@codemirror/state`, `view`,
`commands`, `language`, `@lezer/highlight` y el `lang-*` de cada lenguaje).

También se puede **copiar** un componente al proyecto, como en shadcn: copia
`src/lib/components/<componente>.svelte`, los que importe, `src/lib/internal/`,
`src/lib/utils.ts` y los dos CSS.

Requiere Svelte 5.29 o superior.

## Componentes

| Componente | Qué es |
|---|---|
| Button | 5 variantes × 4 tamaños, `loading`, `href`; pasa al elemento cualquier atributo y adjunto |
| Badge | 7 variantes × 2 tallas |
| Input · Textarea · Select · Checkbox | controles nativos con los tokens del kit |
| Field | etiqueta + control + error, marca de obligatorio |
| Card | contenedor + header / title (`level`) / content / footer |
| Table | contenedor con scroll + header / body / row / head / cell (`colspan`) |
| Tabs | tablist accesible: flechas, Inicio y Fin, contador, ids estables en SSR |
| Alert | 4 variantes, título, cerrar |
| Stat | cifra + etiqueta |
| Switch | interruptor (`role="switch"`) para ajustes que se aplican al momento |
| RadioGroup | radios nativos en `<fieldset>` con su `<legend>`; detalle por opción |
| Dialog | `<dialog>` nativo con `showModal()`: foco contenido, Escape solo el de arriba, scroll bloqueado, foco de vuelta; centrado o pegado a un borde |
| Sheet | panel lateral modal (un Dialog pegado a un borde) |
| ConfirmDialog | sobre Dialog; `onConfirm` asíncrono, sigue abierto si falla |
| Toaster · `toast()` | avisos efímeros en una región `aria-live`; la cuenta atrás se pausa con ratón o foco; acción opcional |
| Command | paleta de órdenes (Ctrl+K / ⌘K) con grupos, palabras clave y atajos |
| ContextMenu | menú de clic derecho (o tecla Menú / Mayús+F10) con las piezas de DropdownMenu |
| Accordion | secciones plegables sobre `<details>` nativo; `single` exclusivo |
| Progress | barra con valor o indeterminada |
| Skeleton | hueco de carga (rect, círculo o líneas de texto) |
| Avatar | foto con iniciales de respaldo, color estable por nombre, insignia |
| SelectionBar | «seleccionar todo» (con estado parcial) y acciones por lotes que aparecen al marcar |
| KeyValueEditor | lista de pares clave → valor editable; clave libre o de una lista, valor texto o número |
| CopyButton | copia un texto al portapapeles y lo anuncia |
| DragBoard · DropZone · DragItem | arrastrar entre zonas con ratón **y con teclado** (Espacio coge, flechas, Espacio suelta, Escape cancela), con avisos para lector de pantalla |
| ChatMessage | un mensaje de una conversación (usuario, asistente o sistema), con estado «escribiendo» |
| DataTable | tabla de datos: orden por columna (`aria-sort`), paginación, selección con «seleccionar todo», carga; en el navegador o contra la API (`manual`) |
| Pagination | Anterior / números con «…» / Siguiente, `aria-current="page"` |
| Calendar · DatePicker | elegir un día con el teclado (patrón APG), fechas ISO, `min`/`max`, nombres del idioma; el DatePicker además se escribe |
| FileUpload | elegir o soltar archivos sobre un `<input type="file">` real; `accept`, `maxSize`, `maxFiles` con el motivo de cada rechazo |
| Breadcrumb | ruta de navegación en `<nav>` + `<ol>`; la última es `aria-current="page"` |
| Icon | iconos propios por nombre (`check`, `search`, `bot`…) o un dibujo propio; decorativo salvo que lleve `label` |
| Sidebar | navegación lateral con grupos, insignias y ramas desplegables; marca la página actual y abre su rama; se pliega a iconos |
| SplitPane | dos paneles con separador accesible (patrón APG «window splitter»): flechas, Inicio/Fin, Intro pliega |
| BarChart · LineChart | gráficas de columnas y de líneas con los colores de serie del kit: leyenda con dos o más series, tooltip al pasar el ratón **o recorrer con el teclado**, tabla con todos los datos |
| SchemaForm | formulario a partir de un JSON Schema: valida al enviar, enfoca el primer error, sirve como `<form>` de una acción de SvelteKit |
| Popover | panel no modal anclado a su disparador |
| Tooltip | descripción al pasar o enfocar; Escape la oculta (WCAG 1.4.13) |
| DropdownMenu · MenuItem · MenuSeparator · MenuLabel | menú de acciones: flechas, Inicio/Fin, búsqueda por letra |
| Combobox | campo con lista filtrable (ARIA 1.2, `aria-activedescendant`), sin mayúsculas ni acentos |
| ThemeScope | tokens en un contenedor: Shadow DOM y puente con `--kitsuden-*` |
| PromptInput · ToolCallCard | entrada de chat y llamada a herramienta con aprobar / rechazar |
| GameMap (`tallao/map`) | Leaflet con el tema del kit |
| CodeEditor (`tallao/code`) | CodeMirror 6 con el tema del kit (Markdown, JSON, JS/TS); antes de cargar, y sin JavaScript, es un `<textarea>` que se envía con el formulario |

## Idioma de los textos

Los textos que pone el kit (botones de cerrar, «sin resultados», estados de una
herramienta…) están en inglés por defecto; el español viene incluido. Para toda
la aplicación, en el componente raíz:

```svelte
<script>
  import { setLabels, es } from "tallao";
  setLabels(es); // o setLabels({ ...es, close: "Salir" })
</script>
```

Una prop explícita (`closeLabel`, `emptyText`, `labels` de ToolCallCard…) manda sobre esto.

### Disparadores

Popover, Tooltip y DropdownMenu reciben su disparador como snippet, con las
props que debe llevar (`aria-*`, eventos y la referencia del elemento):

```svelte
<DropdownMenu label="Acciones del proyecto">
  {#snippet trigger(props)}<Button {...props}>Acciones</Button>{/snippet}
  <MenuItem onSelect={editar}>Editar</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={borrar}>Borrar</MenuItem>
</DropdownMenu>
```

## La capa flotante

Popover, Tooltip, DropdownMenu y Combobox comparten `src/lib/internal/`:

- **Capa superior del navegador** (Popover API, `popover="manual"`): el panel
  queda por encima de cualquier `z-index` u `overflow: hidden` sin moverse en el
  DOM, así que hereda los tokens y funciona dentro de un Shadow DOM.
- **Posición** con [Floating UI](https://floating-ui.com): voltea y se desplaza
  en los bordes, y se recoloca al hacer scroll o redimensionar.
- **Pila de capas**: Escape cierra solo la de arriba (y no el `<dialog>` que la
  contiene); un clic fuera cierra las que no lo contienen.

## SvelteKit

tallao funciona en SvelteKit tal cual (probado con SvelteKit 3; SvelteKit 2 consume
el mismo formato, pero no se prueba): se publica con `svelte-package`, así que
SvelteKit compila los componentes para el servidor y para el navegador. Los ids salen de
`$props.id()` (iguales en los dos lados), nada toca `window` al importarse, los textos de
`setLabels` van por contexto (por petición) y `toast()` no hace nada en el servidor (allí el
módulo es uno solo para todas las peticiones).

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import "tallao/tokens.css";
  import "tallao/base.css";
  import { Toaster } from "tallao";
  let { children } = $props();
</script>

{@render children()}
<Toaster />
```

**Formularios de SvelteKit.** Con `name`, cada control se envía en un `<form method="POST">`
como uno nativo, también sin JavaScript: Switch (como un checkbox), Combobox (uno o varios
valores), KeyValueEditor (`name[clave]`), DatePicker (ISO), FileUpload (los archivos,
también los soltados) y CodeEditor.

SchemaForm es el propio `<form>`: con `name`, sus campos se envían como `name.campo`, y un
envío no válido se para antes de que `enhance` lo mande.

```svelte
<script>
  import { enhance } from "$app/forms";
  import { fromAction } from "svelte/attachments";
  import { SchemaForm } from "tallao";
</script>

<SchemaForm {schema} name="post" method="POST" {@attach fromAction(enhance)} />
```

`kit-check/` es una app SvelteKit 3 que usa el paquete como cualquier proyecto y lo prueba
en la CI: el prerender sale completo y sin estado compartido entre páginas
(`check-prerender.mjs`), y en Chromium la hidratación no da desajustes, los ids del servidor
son los que se quedan y todo responde después (`tests/hydration.spec.ts`).

```bash
pnpm kit:check
```

## Calidad

```bash
pnpm test      # vitest: comportamiento, teclado y axe (jsdom) + render en servidor (Node)
pnpm check     # svelte-check
pnpm package   # compila el paquete en dist/ y lo revisa con publint
pnpm dev       # la demo
```

La CI (`.github/workflows/ci.yml`) corre las cuatro en cada push.

## Dentro de un Shadow DOM

`tokens.css` define los tokens en `:root`, que no llega dentro de un Shadow
DOM. Envuelve la vista en `<ThemeScope>`: con `source="kitsuden"` (por
defecto) cada `--ta-*` toma la variable `--kitsuden-*` del admin de Kitsuden,
que sí cruza por herencia; con `source="tallao"` usa los valores del kit.
Así se hacen las vistas de kon (custom elements) con tallao.

## Temas

Todos los colores son variables `--ta-*` en `tokens.css`. Tema oscuro por
defecto; `data-tallao-theme="light"` en `<html>` invierte a claro. Cambia una
variable y todo el kit se retematiza.

## Licencia

MIT.
