/**
 * tallao — utilidades comunes
 */

type Clase = string | false | null | undefined;

/** Une clases CSS ignorando valores vacíos. */
export function cn(...clases: Clase[]): string {
  return clases.filter(Boolean).join(" ");
}
