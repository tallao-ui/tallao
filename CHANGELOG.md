# Changelog

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
