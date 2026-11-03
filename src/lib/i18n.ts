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
