/**
 * tallao — lo común de BarChart y LineChart
 *
 * Escalas con números redondos (0 / 250 / 500…), cifras compactas a partir de 10 000
 * (12K, 4.2M), y los colores de serie por posición fija (nunca reciclados: más de ocho
 * series se agrupan en «Otros» o se parten en varias gráficas).
 */

export interface ChartSeries {
  key: string;
  label: string;
}

export const MAX_SERIES = 8;

/** Color de la serie i (0-based) desde los tokens. */
export const seriesColor = (i: number) => `rgb(var(--ta-series-${(i % MAX_SERIES) + 1}))`;

/** Un tope «bonito» y sus marcas: el menor 1·2·2.5·5·10 × 10ⁿ que cubre `max`. */
export function niceScale(max: number, ticks = 4): { max: number; ticks: number[] } {
  if (!(max > 0)) return { max: 1, ticks: [0, 1] };
  const crudo = max / ticks;
  const potencia = 10 ** Math.floor(Math.log10(crudo));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= crudo) ?? 10 * potencia;
  const tope = Math.ceil(max / paso) * paso;
  const marcas: number[] = [];
  for (let v = 0; v <= tope + paso / 1e6; v += paso) marcas.push(Math.round(v * 1e6) / 1e6);
  return { max: tope, ticks: marcas };
}

/** Cifras de eje: enteras bajo 10 000 (1,250), compactas desde ahí (12K, 3.4M). */
export function compactNumber(n: number, locale?: string, compact = Math.abs(n) >= 10_000) {
  return new Intl.NumberFormat(locale, compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 2 }).format(n);
}

/** Valor numérico de una fila para una serie; lo que no es número cuenta como vacío. */
export function valueOf(row: Record<string, unknown>, key: string): number | null {
  const v = row[key];
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
