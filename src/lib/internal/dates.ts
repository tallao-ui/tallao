/**
 * tallao — fechas sin hora para Calendar y DatePicker
 *
 * Una fecha es un texto ISO «YYYY-MM-DD». Las cuentas se hacen en UTC: con la hora
 * local, un cambio de horario o una zona al oeste de Greenwich movían el día.
 */

export type ISODate = string;

/** «2026-11-03» → { y, m, d }, o null si no es una fecha real (31 de febrero no lo es). */
export function parseISO(texto: string | null | undefined): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((texto ?? "").trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mes = Number(m[2]);
  const d = Number(m[3]);
  const f = new Date(Date.UTC(y, mes - 1, d));
  if (f.getUTCFullYear() !== y || f.getUTCMonth() !== mes - 1 || f.getUTCDate() !== d) return null;
  return { y, m: mes, d };
}

export const toISO = (y: number, m: number, d: number): ISODate =>
  `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const aFecha = (iso: ISODate) => {
  const p = parseISO(iso)!;
  return new Date(Date.UTC(p.y, p.m - 1, p.d));
};

const deFecha = (f: Date): ISODate => toISO(f.getUTCFullYear(), f.getUTCMonth() + 1, f.getUTCDate());

export function addDays(iso: ISODate, n: number): ISODate {
  const f = aFecha(iso);
  f.setUTCDate(f.getUTCDate() + n);
  return deFecha(f);
}

/** Suma meses sin saltar de mes: 31 de enero + 1 mes = 28 (o 29) de febrero. */
export function addMonths(iso: ISODate, n: number): ISODate {
  const p = parseISO(iso)!;
  const destino = new Date(Date.UTC(p.y, p.m - 1 + n, 1));
  const ultimo = new Date(Date.UTC(destino.getUTCFullYear(), destino.getUTCMonth() + 1, 0)).getUTCDate();
  return toISO(destino.getUTCFullYear(), destino.getUTCMonth() + 1, Math.min(p.d, ultimo));
}

/** Día de la semana: 0 domingo … 6 sábado. */
export const weekday = (iso: ISODate) => aFecha(iso).getUTCDay();

export function todayISO(): ISODate {
  const f = new Date();
  return toISO(f.getFullYear(), f.getMonth() + 1, f.getDate());
}

export const sameMonth = (a: ISODate, b: ISODate) => a.slice(0, 7) === b.slice(0, 7);

export const clampISO = (iso: ISODate, min?: ISODate | null, max?: ISODate | null) =>
  min && iso < min ? min : max && iso > max ? max : iso;

/** Las semanas (de 7 fechas) que cubren el mes de `iso`, empezando en `weekStartsOn`. */
export function monthGrid(iso: ISODate, weekStartsOn: number): ISODate[][] {
  const p = parseISO(iso)!;
  const primero = toISO(p.y, p.m, 1);
  const inicio = addDays(primero, -((weekday(primero) - weekStartsOn + 7) % 7));
  const semanas: ISODate[][] = [];
  let dia = inicio;
  do {
    const semana: ISODate[] = [];
    for (let i = 0; i < 7; i++) {
      semana.push(dia);
      dia = addDays(dia, 1);
    }
    semanas.push(semana);
  } while (sameMonth(dia, primero));
  return semanas;
}

/** Formatos del idioma (Intl) para fechas sin hora: se leen en UTC para no mover el día. */
export function formatDate(iso: ISODate, locale: string | undefined, opts: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" }).format(aFecha(iso));
}
