<!--
  tallao — CalendarHeatmap
  Activity by day over weeks or months (matches played, posts published, commits): the
  calendar form of Heatmap, with weeks as columns, weekdays as rows and a shade per day.

    <CalendarHeatmap title="Matches played" unit="matches"
      data={[{ date: "2026-10-01", value: 3 }, { date: "2026-10-02", value: 7 }]} />

  - A real `<table>`: a header row with the month names (each spanning its weeks), a row
    header per weekday, and one cell per day whose text is the date and its value
    ("Oct 2, 2026: 7 matches"), hidden visually and shown as a tooltip. So the table is its
    own text alternative, and the scale under it says which shade is less and which is more.
  - It runs from `start` to `end` (by default from the first to the last date in `data`),
    padded to whole weeks; the padding days and days without data are empty cells.
  - Shades are `levels` steps of one colour (`color`, the accent by default) between 0 and
    `max` (the largest value by default); a day with 0 or no data has the track colour.
  - Wider than its container, it scrolls sideways inside a focusable, named region with the
    weekday names fixed (`--ta-heatmap-sticky-bg` sets their background, as in Heatmap).
  - With no data it shows the empty state. Same HTML on the server (dates are read in UTC).
  `data` is plain JSON: `[{ "date": "2026-10-02", "value": 7 }, …]`.
-->
<script lang="ts" module>
  export interface CalendarHeatmapDay {
    /** `YYYY-MM-DD`. */
    date: string;
    value: number;
  }
</script>

<script lang="ts">
  import ChartFigure from "$lib/internal/chart-figure.svelte";
  import { useLabels } from "$lib/i18n";
  import { compactNumber, finite } from "$lib/internal/chart";
  import { addDays, formatDate, parseISO, weekday } from "$lib/internal/dates";
  import { cn } from "$lib/utils";

  const L = useLabels();

  interface Props {
    data: CalendarHeatmapDay[];
    title: string;
    hideTitle?: boolean;
    /** First and last day shown (`YYYY-MM-DD`); by default the range of `data`. */
    start?: string;
    end?: string;
    /** First day of the week: 0 Sunday, 1 Monday (default). */
    weekStartsOn?: number;
    /** What is counted, after the figure in each day's text ("matches"). */
    unit?: string;
    /** The value of the darkest shade; by default the largest in `data`. */
    max?: number;
    /** How many shades above empty. */
    levels?: number;
    /** Any CSS colour for the shades; the accent by default. */
    color?: string;
    locale?: string;
    format?: (n: number) => string;
    lessLabel?: string;
    moreLabel?: string;
    emptyText?: string;
    class?: string;
  }

  const {
    data,
    title,
    hideTitle = false,
    start,
    end,
    weekStartsOn = 1,
    unit,
    max,
    levels = 4,
    color,
    locale,
    format = (n: number) => compactNumber(n, locale),
    lessLabel = L.less,
    moreLabel = L.more,
    emptyText,
    class: className = "",
  }: Props = $props();

  const values = $derived(new Map(data.filter((d) => parseISO(d.date) && finite(d.value) != null).map((d) => [d.date, d.value])));
  const dates = $derived([...values.keys()].sort());
  const first = $derived(start && parseISO(start) ? start : dates[0]);
  const last = $derived(end && parseISO(end) ? end : dates[dates.length - 1]);
  const top = $derived(max ?? Math.max(0, ...values.values()));
  const levelOf = (value: number | undefined) => (!value || value <= 0 || top <= 0 ? 0 : Math.min(levels, Math.max(1, Math.ceil((value / top) * levels))));

  // Whole weeks from the week of `first` to the week of `last`.
  const weeks = $derived.by(() => {
    if (!first || !last || first > last) return [] as string[][];
    let day = addDays(first, -((weekday(first) - weekStartsOn + 7) % 7));
    const out: string[][] = [];
    while (day <= last) {
      const week: string[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = addDays(day, 1);
      }
      out.push(week);
    }
    return out;
  });
  const inRange = (iso: string) => iso >= first && iso <= last;

  // Month headers: a week belongs to the month of its first day in range.
  const months = $derived.by(() => {
    const spans: { label: string; weeks: number }[] = [];
    let current = "";
    for (const week of weeks) {
      const anchor = week.find(inRange) ?? week[0];
      const key = anchor.slice(0, 7);
      if (key !== current) {
        current = key;
        spans.push({ label: formatDate(`${key}-01`, locale, { month: "short" }), weeks: 1 });
      } else spans[spans.length - 1].weeks++;
    }
    return spans;
  });

  const weekdays = $derived(
    Array.from({ length: 7 }, (_, row) => {
      const iso = weeks[0]?.[row] ?? "2026-11-02";
      return { short: formatDate(iso, locale, { weekday: "short" }), long: formatDate(iso, locale, { weekday: "long" }) };
    })
  );
  const dayText = (iso: string) => {
    const value = values.get(iso);
    return `${formatDate(iso, locale, { dateStyle: "medium" })}: ${value == null ? "—" : format(value)}${value != null && unit ? ` ${unit}` : ""}`;
  };
</script>

<ChartFigure {title} {hideTitle} empty={weeks.length === 0} {emptyText} class={cn("ta-calheat", className)}>
  <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
  <div class="ta-calheat-scroll" role="region" aria-label={title} tabindex="0" style:--ta-calheat-color={color}>
    <table class="ta-calheat-table">
      <thead>
        <tr>
          <td></td>
          {#each months as month, i (i)}<th scope="colgroup" colspan={month.weeks} class="ta-calheat-month">{month.weeks > 1 ? month.label : ""}<span class="ta-calheat-hidden">{month.weeks > 1 ? "" : month.label}</span></th>{/each}
        </tr>
      </thead>
      <tbody>
        {#each weekdays as name, row (row)}
          <tr>
            <th scope="row" class="ta-calheat-weekday"><span aria-hidden="true">{row % 2 === 0 ? name.short : ""}</span><span class="ta-calheat-hidden">{name.long}</span></th>
            {#each weeks as week, w (w)}
              {@const iso = week[row]}
              {#if inRange(iso)}
                <td class={cn("ta-calheat-day", `ta-calheat-day--${levelOf(values.get(iso))}`)} style:--ta-calheat-level={levelOf(values.get(iso)) / levels} title={dayText(iso)}><span class="ta-calheat-hidden">{dayText(iso)}</span></td>
              {:else}
                <td class="ta-calheat-pad"></td>
              {/if}
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="ta-calheat-scale" style:--ta-calheat-color={color}>
    {lessLabel}
    <span class="ta-calheat-steps" aria-hidden="true">
      {#each Array.from({ length: levels + 1 }) as _, l (l)}<span class={cn("ta-calheat-day", `ta-calheat-day--${l}`)} style:--ta-calheat-level={l / levels}></span>{/each}
    </span>
    {moreLabel}
  </p>
</ChartFigure>

<style>
  .ta-calheat-scroll {
    max-width: 100%;
    overflow-x: auto;
    padding-bottom: 0.25rem;
    border-radius: var(--ta-radius-sm);
    --ta-calheat-tone: var(--ta-calheat-color, rgb(var(--ta-accent)));
  }
  .ta-calheat-scroll:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

  .ta-calheat-table { border-collapse: separate; border-spacing: 3px; font-size: 0.6875rem; color: rgb(var(--ta-text-dim)); }
  .ta-calheat-table th { padding: 0; font-weight: 500; text-align: left; white-space: nowrap; }
  .ta-calheat-table td { padding: 0; }
  .ta-calheat-month { height: 1rem; }
  .ta-calheat-table th.ta-calheat-weekday {
    position: sticky;
    left: 0;
    z-index: 1;
    padding-right: 0.375rem;
    line-height: 0.75rem;
    background: var(--ta-heatmap-sticky-bg, rgb(var(--ta-bg)));
  }

  .ta-calheat-day {
    position: relative;
    width: 0.75rem;
    min-width: 0.75rem;
    height: 0.75rem;
    border-radius: 3px;
    background: color-mix(in srgb, var(--ta-calheat-tone, rgb(var(--ta-accent))) calc(var(--ta-calheat-level, 0) * 85% + 15%), rgb(var(--ta-bg)));
  }
  .ta-calheat-day--0 { background: rgb(var(--ta-elevated)); box-shadow: inset 0 0 0 1px rgb(var(--ta-border)); }
  .ta-calheat-pad { width: 0.75rem; height: 0.75rem; }

  .ta-calheat-scale { display: flex; align-items: center; gap: 0.375rem; margin: 0; font-size: 0.6875rem; color: rgb(var(--ta-text-dim)); }
  .ta-calheat-steps { display: inline-flex; gap: 3px; --ta-calheat-tone: var(--ta-calheat-color, rgb(var(--ta-accent))); }
  .ta-calheat-steps .ta-calheat-day { display: inline-block; }

  .ta-calheat-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  /* The scrolling region is the only control: it needs no bigger target, but the cells grow
     a little under a finger so a day can be pressed for its tooltip. */
  @media (pointer: coarse) {
    .ta-calheat-day,
    .ta-calheat-pad { width: 0.875rem; min-width: 0.875rem; height: 0.875rem; }
    .ta-calheat-scroll { min-height: 2.75rem; }
  }
</style>
