# tallao ⛏️

UI kit en **Svelte 5** para interfaces generativas — extraído del admin de
Kitsuden y desacoplado de Tailwind, stores y APIs. CSS puro sobre tokens.

## Uso

Los componentes se copian al proyecto (modelo shadcn/Magic UI): copia
`src/lib/components/*`, `src/lib/tokens.css`, `src/lib/base.css` y
`src/lib/utils.ts`, y arranca la demo con:

```bash
pnpm install
pnpm dev
```

## v0.1 — componentes

| Componente | Archivos |
|---|---|
| Button | `button.svelte` (5 variantes × 4 tamaños, loading, href) |
| Badge | `badge.svelte` (7 variantes × 2 tallas) |
| Input | `input.svelte` (bindable, disabled, rest props) |
| Dialog | `dialog.svelte` (Escape, cierre por fondo, retorno de foco, 4 tamaños) |
| Card | `card*.svelte` (contenedor + header/title/content/footer) |
| Table | `table*.svelte` (contenedor + header/body/row/head/cell; `colspan` en la celda) |
| Select | `select.svelte` (nativo, opciones por prop o hijos, 2 tallas) |
| Textarea | `textarea.svelte` (bindable, mismos estados que Input) |
| Checkbox | `checkbox.svelte` (bindable, etiqueta clicable) |
| Field | `field.svelte` (etiqueta + control + error, obligatorio) |
| Tabs | `tabs.svelte` (tablist accesible, flechas/Inicio/Fin, contador) |
| Alert | `alert.svelte` (4 variantes, título, cerrar) |
| Stat | `stat.svelte` (cifra + etiqueta, 4 variantes) |
| ConfirmDialog | `confirm-dialog.svelte` (sobre Dialog; `onConfirm` asíncrono) |
| ThemeScope | `theme-scope.svelte` (tokens en un contenedor: Shadow DOM, puente `--kitsuden-*`) |

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
