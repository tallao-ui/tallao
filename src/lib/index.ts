// tallao: punto de entrada del paquete. El mapa está en "tallao/map" (depende de Leaflet).
export * from "./components/index";
export { cn } from "./utils";
export { en, es, setLabels, useLabels, type Labels } from "./i18n";
export { toast, toasts, type Toast, type ToastOptions, type ToastVariant } from "./toast.svelte";
