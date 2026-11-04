<!--
  tallao — Calendar
  Un mes para elegir un día (cuadrícula del patrón «date picker» de la WAI-ARIA APG).
    - ← → día anterior / siguiente; ↑ ↓ semana anterior / siguiente.
    - Inicio / Fin: primer / último día de la semana.
    - RePág / AvPág: mes anterior / siguiente (con Mayús, año).
    - Enter o Espacio eligen el día.
  Un solo día recibe el Tab (tabindex itinerante). Hoy lleva aria-current="date";
  los días fuera de [min, max] o que `isDisabled` rechaza no se pueden elegir.
  Fechas ISO «YYYY-MM-DD»; nombres de meses y días del idioma (`locale`, Intl).
-->
<script lang="ts">
  import { tick, untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import {
    addDays,
    addMonths,
    clampISO,
    formatDate,
    monthGrid,
    parseISO,
    sameMonth,
    todayISO,
    weekday,
    type ISODate,
  } from "$lib/internal/dates";

  const L = useLabels();
  let {
    value = $bindable(null),
    min,
    max,
    locale,
    /** Primer día de la semana: 0 domingo, 1 lunes (por defecto). */
    weekStartsOn = 1,
    isDisabled,
    previousLabel = L.previousMonth,
    nextLabel = L.nextMonth,
    class: className = "",
    onselect,
  }: {
    value?: ISODate | null;
    min?: ISODate;
    max?: ISODate;
    locale?: string;
    weekStartsOn?: number;
    isDisabled?: (iso: ISODate) => boolean;
    previousLabel?: string;
    nextLabel?: string;
    class?: string;
    onselect?: (iso: ISODate) => void;
  } = $props();

  const id = $props.id();
  // «Hoy» se calcula en el navegador: el servidor puede estar en otra zona horaria y su
  // «hoy» ser otro día, y la marca no casaría al hidratar.
  let hoy = $state<ISODate | null>(null);
  $effect(() => {
    hoy = todayISO();
  });
  // El día con el foco (y por tanto el mes que se ve); arranca en el valor, o en hoy.
  let foco = $state<ISODate>(untrack(() => clampISO(parseISO(value) ? value! : todayISO(), min, max)));
  let rejilla: HTMLElement | undefined = $state();

  // Si el valor cambia desde fuera, el calendario va a ese mes. Solo sigue al valor: si
  // dependiera también del día con el foco, pasar de mes con el teclado lo devolvería.
  $effect(() => {
    const v = value;
    untrack(() => {
      if (parseISO(v) && !sameMonth(v!, foco)) foco = v!;
    });
  });

  const semanas = $derived(monthGrid(foco, weekStartsOn));
  const titulo = $derived(formatDate(foco, locale, { month: "long", year: "numeric" }));
  const cabeceras = $derived(
    semanas[0].map((d) => ({
      corto: formatDate(d, locale, { weekday: "short" }),
      largo: formatDate(d, locale, { weekday: "long" }),
    }))
  );

  const bloqueado = (iso: ISODate) => (min != null && iso < min) || (max != null && iso > max) || !!isDisabled?.(iso);

  async function enfocar(iso: ISODate) {
    foco = clampISO(iso, min, max);
    await tick();
    rejilla?.querySelector<HTMLElement>(`[data-dia="${foco}"]`)?.focus();
  }

  function elegir(iso: ISODate) {
    if (bloqueado(iso)) return;
    value = iso;
    foco = iso;
    onselect?.(iso);
  }

  function tecla(e: KeyboardEvent, iso: ISODate) {
    const inicioSemana = addDays(iso, -((weekday(iso) - weekStartsOn + 7) % 7));
    const destino =
      e.key === "ArrowLeft" ? addDays(iso, -1)
      : e.key === "ArrowRight" ? addDays(iso, 1)
      : e.key === "ArrowUp" ? addDays(iso, -7)
      : e.key === "ArrowDown" ? addDays(iso, 7)
      : e.key === "Home" ? inicioSemana
      : e.key === "End" ? addDays(inicioSemana, 6)
      : e.key === "PageUp" ? addMonths(iso, e.shiftKey ? -12 : -1)
      : e.key === "PageDown" ? addMonths(iso, e.shiftKey ? 12 : 1)
      : null;
    if (destino) {
      e.preventDefault();
      enfocar(destino);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      elegir(iso);
    }
  }

  /** Para que el foco no quede en un botón que ya no se pinta, al cambiar de mes con las flechas. */
  const mes = (n: number) => enfocar(addMonths(foco, n));

  const etiquetaDia = (iso: ISODate) => formatDate(iso, locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
</script>

<div class={cn("ta-calendar", className)}>
  <div class="ta-calendar-cabecera">
    <button type="button" class="ta-calendar-mes" aria-label={previousLabel} onclick={() => mes(-1)}>‹</button>
    <h2 class="ta-calendar-titulo" id={`${id}-titulo`} aria-live="polite">{titulo}</h2>
    <button type="button" class="ta-calendar-mes" aria-label={nextLabel} onclick={() => mes(1)}>›</button>
  </div>
  <table class="ta-calendar-rejilla" role="grid" aria-labelledby={`${id}-titulo`} bind:this={rejilla}>
    <thead>
      <tr>
        {#each cabeceras as c, i (i)}<th scope="col" abbr={c.largo}>{c.corto}</th>{/each}
      </tr>
    </thead>
    <tbody>
      {#each semanas as semana, s (s)}
        <tr>
          {#each semana as dia (dia)}
            <td role="gridcell" aria-selected={dia === value} class:ta-calendar-fuera={!sameMonth(dia, foco)}>
              <button
                type="button"
                class="ta-calendar-dia"
                data-dia={dia}
                tabindex={dia === foco ? 0 : -1}
                aria-label={etiquetaDia(dia)}
                aria-current={dia === hoy ? "date" : undefined}
                aria-disabled={bloqueado(dia) ? "true" : undefined}
                onclick={() => elegir(dia)}
                onkeydown={(e) => tecla(e, dia)}
              >
                {parseISO(dia)!.d}
              </button>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .ta-calendar {
    display: inline-flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.5rem;
    color: rgb(var(--ta-text));
  }

  .ta-calendar-cabecera {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .ta-calendar-titulo {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: capitalize;
  }

  .ta-calendar-mes {
    width: 1.75rem;
    height: 1.75rem;
    font: inherit;
    font-size: 1rem;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: 1px solid transparent;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-calendar-mes:hover { color: rgb(var(--ta-text)); background: rgb(var(--ta-elevated)); }

  .ta-calendar-rejilla { border-collapse: collapse; }

  .ta-calendar-rejilla th {
    padding: 0.25rem 0;
    font-size: 0.6875rem;
    font-weight: 500;
    color: rgb(var(--ta-text-dim));
    text-transform: capitalize;
  }

  .ta-calendar-rejilla td { padding: 1px; text-align: center; }

  .ta-calendar-dia {
    width: 2rem;
    height: 2rem;
    font: inherit;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    color: inherit;
    background: none;
    border: 1px solid transparent;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-calendar-dia:hover { background: rgb(var(--ta-elevated)); }
  .ta-calendar-dia:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.7); outline-offset: 1px; }
  .ta-calendar-dia[aria-current="date"] { border-color: rgb(var(--ta-accent) / 0.6); }
  .ta-calendar-dia[aria-disabled="true"] { opacity: 0.35; cursor: not-allowed; }

  .ta-calendar-fuera .ta-calendar-dia { color: rgb(var(--ta-text-dim) / 0.7); }

  td[aria-selected="true"] .ta-calendar-dia {
    color: white;
    background: rgb(var(--ta-accent));
    border-color: rgb(var(--ta-accent));
  }
</style>
