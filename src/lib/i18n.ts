/**
 * tallao — textos de los componentes
 *
 * Los textos que el kit pone por su cuenta (nombres accesibles de botones,
 * «sin resultados», estados de una llamada a herramienta…) salen de aquí. Por
 * defecto en inglés; `es` viene incluido. Para toda una aplicación (o un
 * trozo), en el componente raíz:
 *
 *   import { setLabels, es } from "tallao";
 *   setLabels(es);                        // o setLabels({ ...es, close: "Salir" })
 *
 * Una prop explícita (`closeLabel`, `emptyText`…) sigue mandando sobre esto.
 */
import { getContext, setContext } from "svelte";

export interface Labels {
  close: string;
  cancel: string;
  confirm: string;
  dismiss: string;
  noResults: string;
  send: string;
  attach: string;
  promptPlaceholder: string;
  approve: string;
  reject: string;
  pending: string;
  running: string;
  done: string;
  rejected: string;
  failed: string;
  arguments: string;
  result: string;
  map: string;
  notifications: string;
  loading: string;
  search: string;
  commandPalette: string;
  remove: string;
  previous: string;
  next: string;
  pagination: string;
  page: string;
  rowsPerPage: string;
  selectRow: string;
  selectAll: string;
  today: string;
  chooseDate: string;
  previousMonth: string;
  nextMonth: string;
  chooseFiles: string;
  dropFiles: string;
  actions: string;
  breadcrumb: string;
  resize: string;
  navigation: string;
  collapse: string;
  expand: string;
  showData: string;
  hideData: string;
  codeEditor: string;
  required: string;
  invalid: string;
  submit: string;
}

export const en: Labels = {
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  dismiss: "Dismiss",
  noResults: "No results",
  send: "Send message",
  attach: "Attach file",
  promptPlaceholder: "Write a message…",
  approve: "Approve",
  reject: "Reject",
  pending: "Pending",
  running: "Running…",
  done: "Done",
  rejected: "Rejected",
  failed: "Failed",
  arguments: "Arguments",
  result: "Result",
  map: "Map",
  notifications: "Notifications",
  loading: "Loading",
  search: "Search…",
  commandPalette: "Command palette",
  remove: "Remove",
  previous: "Previous",
  next: "Next",
  pagination: "Pagination",
  page: "Page",
  rowsPerPage: "Rows per page",
  selectRow: "Select row",
  selectAll: "Select all",
  today: "Today",
  chooseDate: "Choose date",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  chooseFiles: "Choose files",
  dropFiles: "or drop them here",
  actions: "Actions",
  breadcrumb: "Breadcrumb",
  resize: "Resize",
  navigation: "Navigation",
  collapse: "Collapse",
  expand: "Expand",
  showData: "Show data",
  hideData: "Hide data",
  codeEditor: "Code editor",
  required: "Required",
  invalid: "Invalid value",
  submit: "Save",
};

export const es: Labels = {
  close: "Cerrar",
  cancel: "Cancelar",
  confirm: "Confirmar",
  dismiss: "Descartar",
  noResults: "Sin resultados",
  send: "Enviar mensaje",
  attach: "Adjuntar archivo",
  promptPlaceholder: "Escribe un mensaje…",
  approve: "Aprobar",
  reject: "Rechazar",
  pending: "Pendiente",
  running: "Ejecutando…",
  done: "Ejecutado",
  rejected: "Rechazado",
  failed: "Fallido",
  arguments: "Argumentos",
  result: "Resultado",
  map: "Mapa",
  notifications: "Notificaciones",
  loading: "Cargando",
  search: "Buscar…",
  commandPalette: "Paleta de órdenes",
  remove: "Quitar",
  previous: "Anterior",
  next: "Siguiente",
  pagination: "Paginación",
  page: "Página",
  rowsPerPage: "Filas por página",
  selectRow: "Seleccionar fila",
  selectAll: "Seleccionar todo",
  today: "Hoy",
  chooseDate: "Elegir fecha",
  previousMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  chooseFiles: "Elegir archivos",
  dropFiles: "o suéltalos aquí",
  actions: "Acciones",
  breadcrumb: "Ruta de navegación",
  resize: "Redimensionar",
  navigation: "Navegación",
  collapse: "Contraer",
  expand: "Expandir",
  showData: "Ver datos",
  hideData: "Ocultar datos",
  codeEditor: "Editor de código",
  required: "Obligatorio",
  invalid: "Valor no válido",
  submit: "Guardar",
};

const KEY = Symbol("tallao-labels");

/** Textos para este componente y todo lo que cuelga de él (se mezcla con los heredados). */
export function setLabels(labels: Partial<Labels>): Labels {
  const merged = { ...useLabels(), ...labels };
  setContext(KEY, merged);
  return merged;
}

/** Los textos vigentes: los que fijó un ancestro con setLabels, o inglés. */
export function useLabels(): Labels {
  return getContext<Labels | undefined>(KEY) ?? en;
}
