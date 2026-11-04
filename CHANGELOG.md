# Changelog

## 0.7.0 — 2026-11-04

Lo que faltaba para montar el panel de Kitsuden entero con tallao.

### Nuevo
- **Sidebar** (grupos, insignias, ramas desplegables con `aria-expanded`, página actual con
  `aria-current` y su rama abierta, plegada a iconos) y **SplitPane** (separador con el
  patrón APG: flechas, Inicio/Fin, Intro pliega y restaura, arrastre con puntero).
- **Breadcrumb** e **Icon** (iconos propios por nombre, decorativos salvo con `label`).
- **BarChart** y **LineChart**: ocho colores de serie en los tokens (`--ta-series-1..8`,
  validados para daltonismo en oscuro y claro), columnas de 24px como mucho con el extremo
  redondeado, líneas de 2px, leyenda con dos o más series, tooltip con ratón y teclado (la
  gráfica es un deslizador que lee cada categoría) y la tabla con todos los datos.
- **SchemaForm**: un formulario a partir de un JSON Schema (texto, email, url, fecha,
  números con mínimo y máximo, enum, booleano, lista de enum, objetos anidados). Valida al
  enviar y al salir de cada campo, enfoca el primer error y, con `name`, es el `<form>` de
  una acción de SvelteKit (un envío no válido no llega a `enhance`).
- **CodeEditor** en `tallao/code`: CodeMirror 6 con el tema y el resaltado del kit; en el
  servidor y sin JavaScript es un `<textarea>` que se envía. CodeMirror va en
  peerDependencies opcionales.
- `kit-check` prueba SchemaForm con CodeEditor dentro en una acción, con y sin JavaScript.
- Textos nuevos en `en`/`es`: breadcrumb, resize, navigation, collapse, expand, showData,
  hideData, codeEditor, required, invalid, submit.

## 0.6.0 — 2026-11-03

Lo que bloqueaba usar tallao en los formularios de SvelteKit y en el panel de Kitsuden.

### Nuevo
- **DataTable** (orden con `aria-sort`, paginación, selección con estado parcial, carga,
  fila vacía visible; datos en el navegador o en la API con `manual`) y **Pagination**.
- **Calendar** y **DatePicker** (patrón APG: flechas, Inicio/Fin, RePág/AvPág, fechas ISO
  calculadas en UTC, «hoy» marcado solo en el navegador).
- **FileUpload** sobre un `<input type="file">` real, con `accept`, `maxSize` y `maxFiles`.
- **Combobox**: búsqueda en la API (`loadOptions`, con espera y cancelando la anterior) y
  varios valores (`multiple` + `values`, fichas que se quitan).
- **Formularios nativos**: `name` en Switch, Combobox, KeyValueEditor y DatePicker (inputs
  ocultos que ya salen en el HTML del servidor). `kit-check` lo prueba con una acción de
  SvelteKit, con y sin JavaScript.
- TableHead pasa cualquier otro atributo (`aria-sort`, `style`…).
- Textos nuevos en `en`/`es`: remove, previous, next, pagination, page, rowsPerPage,
  selectRow, selectAll, today, chooseDate, previousMonth, nextMonth, chooseFiles, dropFiles, actions.

### Arreglo que encontraron los tests nuevos
- Calendar: tras elegir un día, cambiar de mes con el teclado lo devolvía al mes elegido.

## 0.5.1 — 2026-11-03

### SvelteKit
- `toast()` no hace nada en el servidor. El módulo de avisos es uno solo para todas las
  peticiones: un `toast()` durante el render salía en el HTML de otra página (lo
  comprobó `kit-check` antes del arreglo).
- `kit-check/`: app SvelteKit 3 que consume el paquete empaquetado. En la CI se
  prerenderiza y se revisa su HTML, y Playwright (Chromium) comprueba la hidratación: sin
  avisos de desajuste, los ids del servidor se conservan y los componentes responden.

## 0.5.0 — 2026-11-03

Lo que pidieron las vistas de administración de los kons al pasarlas a tallao.

### Nuevo
- **SelectionBar**, **KeyValueEditor**, **CopyButton**, **DragBoard** + **DropZone** +
  **DragItem** (arrastrar accesible con teclado) y **ChatMessage**.
- **ConfirmDialog**: `onCancel` y `onOpenChange` (un solo aviso por cierre).
- **Input**, **Textarea** y **Select**: `bind:ref` da el elemento nativo.
- **TableRow** y **TableCell** pasan cualquier otro atributo (`title`, `data-*`…).

### Tests
- El entorno `dom` pasa de happy-dom a jsdom: happy-dom descarta `<tr>`/`<td>` dentro
  de un `<template>` (Svelte construye el DOM con plantillas) y rompía una fila con
  atributos esparcidos, que en un navegador real funciona. jsdom no tiene `<dialog>`
  modal: `tests/setup.ts` pone lo mínimo; el comportamiento real se prueba en Chrome.

## 0.4.0 — 2026-11-03

### Cambios que rompen
- Los textos por defecto pasan a inglés. `setLabels(es)` (exportado junto con `en`
  y `useLabels`) los vuelve al español en todo lo que cuelga del componente.
- Props públicas en inglés:
  - **PromptInput**: `conAdjuntos` → `attachments`, `enviarConEnter` → `submitOnEnter`;
    nuevas `ariaLabel`, `sendLabel`, `attachLabel`.
  - **ToolCallCard**: `nombre` → `name`, `estado` → `status`, `resultado` → `result`,
    `textos` → `labels` (con claves en inglés).
  - **MapaDelJuego** → **GameMap**: `centro` → `center`, `marcadores` → `markers`
    (`titulo`/`descripcion` → `title`/`description`), `oscuro` → `dark`, `alto` →
    `height`, `atribucion` → `attribution`.

### Nuevo
- **Switch**, **RadioGroup**, **Sheet**, **Toaster** + `toast()`, **Command**
  (paleta Ctrl+K), **ContextMenu**, **Accordion**, **Progress**, **Skeleton**, **Avatar**.
- **Dialog**: `placement` (`center`, `left`, `right`, `top`, `bottom`).
- La capa flotante puede anclar a un punto de la pantalla (`pointAnchor`) y
  DropdownMenu y ContextMenu comparten el teclado del menú (`internal/menu.ts`).

### Arreglos que encontraron los tests nuevos
- RadioGroup: el detalle de una opción ya no se suma a su nombre accesible.
- Command: escribir en el buscador ya no lo vaciaba en cada tecla.

## 0.3.0 — 2026-11-03

### Paquete
- Se instala como paquete: `exports` (`tallao`, `tallao/map`, `tallao/tokens.css`,
  `tallao/base.css`), tipos generados, `svelte-package` + publint, `prepare` para
  instalar desde git. Licencia MIT.
- Svelte pasa a peer dependency (`^5.29`). Leaflet y sveaflet salen del núcleo:
  el mapa vive en `tallao/map` con peer dependencies opcionales.
- Tests (vitest: happy-dom con axe, y render en servidor en Node), svelte-check y CI.

### Accesibilidad
- **Dialog** usa `<dialog>` nativo con `showModal()`: el Tab no sale del diálogo,
  Escape cierra solo el de arriba, scroll de la página bloqueado (con varios
  abiertos, hasta cerrar el último), foco inicial y vuelta al disparador,
  `aria-labelledby` / `aria-describedby`, `prefers-reduced-motion`.
- **Button** con `href` y `disabled` pierde el `href` (no navega ni recibe Tab) y
  queda `role="link"` + `aria-disabled`.
- **CardTitle** (`level`) y el título de **Dialog** (`titleLevel`, h2 por
  defecto) ya no fuerzan un `<h3>` que rompía el orden de encabezados.

### SSR
- **Tabs** genera sus ids con `$props.id()`: con `Math.random` el HTML del servidor
  no casaba con el de la hidratación.
- **MapaDelJuego** carga Leaflet solo en el navegador (antes rompía el render en servidor).
- El mapa y **ToolCallCard** siguen los cambios de sus props (antes leían algunas una sola vez).

### Capa flotante (nuevo)
- Pila de capas (Escape y clic fuera), posición con Floating UI y capa superior
  con la Popover API.
- **Popover**, **Tooltip**, **DropdownMenu** (+ MenuItem, MenuSeparator,
  MenuLabel) y **Combobox**.
- **Button** pasa al elemento cualquier atributo y adjunto, para servir de disparador.

## 0.2.0 — 2026-11-03

- Select, Textarea, Checkbox, Field, Tabs, Alert, Stat, ConfirmDialog y ThemeScope.
- Dialog: `closeLabel`, tamaño `2xl`, scroll interno. TableCell: `colspan`.
