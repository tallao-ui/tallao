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
(instala `leaflet` y `sveaflet`).

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
| Popover | panel no modal anclado a su disparador |
| Tooltip | descripción al pasar o enfocar; Escape la oculta (WCAG 1.4.13) |
| DropdownMenu · MenuItem · MenuSeparator · MenuLabel | menú de acciones: flechas, Inicio/Fin, búsqueda por letra |
| Combobox | campo con lista filtrable (ARIA 1.2, `aria-activedescendant`), sin mayúsculas ni acentos |
| ThemeScope | tokens en un contenedor: Shadow DOM y puente con `--kitsuden-*` |
| PromptInput · ToolCallCard | entrada de chat y llamada a herramienta con aprobar / rechazar |
| GameMap (`tallao/map`) | Leaflet con el tema del kit |

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

## Calidad

```bash
pnpm test      # vitest: comportamiento, teclado y axe (happy-dom) + render en servidor (Node)
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
