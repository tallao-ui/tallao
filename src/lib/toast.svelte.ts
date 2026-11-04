/**
 * tallao — avisos efímeros (toasts)
 *
 *   import { toast } from "tallao";
 *   toast.success("Guardado");
 *   toast.error("No se pudo guardar", { description: "La API devolvió 503" });
 *   const id = toast("Subiendo…", { duration: Infinity });  toast.dismiss(id);
 *
 * Se muestran en el <Toaster /> que haya en la página (uno basta).
 */

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  description?: string;
  /** Milisegundos a la vista; Infinity = hasta que se cierre. Por defecto 5 s (8 s un error). */
  duration?: number;
  action?: ToastAction;
}

export interface Toast extends ToastOptions {
  id: number;
  message: string;
  variant: ToastVariant;
}

let nextId = 1;

/** Los avisos abiertos; los lee el Toaster. */
export const toasts = $state<Toast[]>([]);

// En el servidor este módulo es uno solo para todas las peticiones (SvelteKit): un aviso
// guardado aquí durante un render saldría en la página de otro usuario. Un aviso es algo
// que pasa en el navegador, así que en el servidor toast() no hace nada.
const enServidor = typeof window === "undefined";

function show(variant: ToastVariant, message: string, opts: ToastOptions = {}): number {
  if (enServidor) return 0;
  const t: Toast = { id: nextId++, message, variant, ...opts };
  t.duration ??= variant === "error" ? 8000 : 5000;
  toasts.push(t);
  return t.id;
}

function dismiss(id?: number) {
  if (id === undefined) toasts.splice(0, toasts.length);
  else {
    const i = toasts.findIndex((t) => t.id === id);
    if (i >= 0) toasts.splice(i, 1);
  }
}

type ToastFn = ((message: string, opts?: ToastOptions) => number) & {
  success: (message: string, opts?: ToastOptions) => number;
  error: (message: string, opts?: ToastOptions) => number;
  warning: (message: string, opts?: ToastOptions) => number;
  info: (message: string, opts?: ToastOptions) => number;
  /** Cierra uno, o todos sin argumento. */
  dismiss: (id?: number) => void;
};

export const toast: ToastFn = Object.assign((message: string, opts?: ToastOptions) => show("default", message, opts), {
  success: (m: string, o?: ToastOptions) => show("success", m, o),
  error: (m: string, o?: ToastOptions) => show("error", m, o),
  warning: (m: string, o?: ToastOptions) => show("warning", m, o),
  info: (m: string, o?: ToastOptions) => show("info", m, o),
  dismiss,
});
