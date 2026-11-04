<!--
  tallao — BarChart
  Columnas por categoría, una o varias series agrupadas. Sigue las reglas de marca del
  kit: columnas de 24px como mucho, extremo de datos redondeado (4px) y base recta, 2px
  de aire entre columnas vecinas, rejilla y ejes finos y discretos, una sola escala.
  - Con dos o más series hay leyenda; con una, el título dice qué se mide.
  - Pasar el ratón o recorrer con ← → (la gráfica recibe el foco) muestra la categoría
    con el valor de cada serie; un lector de pantalla lo oye.
  - «Ver datos» abre la tabla con todos los valores: nada queda solo en el color.
  `data` son filas: `{ mes: "Ene", visitas: 120, altas: 30 }`, `x="mes"`,
  `series=[{ key: "visitas", label: "Visitas" }, …]`.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { compactNumber, niceScale, seriesColor, valueOf, type ChartSeries } from "$lib/internal/chart";

  import Table from "./table.svelte";
  import TableBody from "./table-body.svelte";
  import TableCell from "./table-cell.svelte";
  import TableHead from "./table-head.svelte";
  import TableHeader from "./table-header.svelte";
  import TableRow from "./table-row.svelte";

  const L = useLabels();
  const {
    data,
    x,
    series,
    title,
    /** Cabecera de la primera columna de la tabla de datos (por defecto, `x`). */
    xLabel,
    height = 240,
    locale,
    format = (n: number) => compactNumber(n, locale),
    showDataLabel = L.showData,
    hideDataLabel = L.hideData,
    class: className = "",
  }: {
    data: Record<string, unknown>[];
    x: string;
    series: ChartSeries[];
    /** Qué muestra la gráfica: su nombre accesible y el pie de la figura. */
    title: string;
    xLabel?: string;
    height?: number;
    locale?: string;
    /** Formato de los valores en ejes, tooltip y tabla. */
    format?: (n: number) => string;
    showDataLabel?: string;
    hideDataLabel?: string;
    class?: string;
  } = $props();

  const id = $props.id();
  let ancho = $state(640);
  let activa = $state<number | null>(null);
  let tabla = $state(false);
  let lienzo: HTMLElement | undefined = $state();

  const M = { top: 12, right: 8, bottom: 26, left: 48 };
  const dentroAncho = $derived(Math.max(40, ancho - M.left - M.right));
  const dentroAlto = $derived(Math.max(40, height - M.top - M.bottom));

  const maximo = $derived(Math.max(0, ...data.flatMap((d) => series.map((s) => valueOf(d, s.key) ?? 0))));
  const escala = $derived(niceScale(maximo));
  const yDe = (v: number) => M.top + dentroAlto - (v / escala.max) * dentroAlto;

  const banda = $derived(dentroAncho / Math.max(1, data.length));
  const grosor = $derived(Math.min(24, Math.max(2, (banda * 0.7 - (series.length - 1) * 2) / series.length)));
  const grupo = $derived(series.length * grosor + (series.length - 1) * 2);
  // Con muchas categorías, solo se rotula una de cada `salto` en el eje.
  const salto = $derived(Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(dentroAncho / 56)))));

  /** Columna con el extremo de datos redondeado y la base recta. */
  function columna(xi: number, v: number) {
    const y0 = yDe(0);
    const y = yDe(v);
    const alto = y0 - y;
    if (alto <= 0) return "";
    const r = Math.min(4, alto, grosor / 2);
    return `M${xi},${y0}V${y + r}Q${xi},${y} ${xi + r},${y}H${xi + grosor - r}Q${xi + grosor},${y} ${xi + grosor},${y + r}V${y0}Z`;
  }

  const xDe = (i: number, s: number) => M.left + banda * i + (banda - grupo) / 2 + s * (grosor + 2);

  const lectura = $derived(
    activa == null
      ? ""
      : `${String(data[activa]?.[x] ?? "")}: ${series.map((s) => `${s.label} ${fmt(valueOf(data[activa!], s.key))}`).join(", ")}`
  );
  const fmt = (v: number | null) => (v == null ? "—" : format(v));

  // La zona que responde al ratón es la banda entera de cada categoría, no solo la columna.
  function alMover(e: PointerEvent) {
    if (!lienzo || data.length === 0) return;
    const r = lienzo.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * ancho - M.left;
    activa = Math.min(data.length - 1, Math.max(0, Math.floor(px / banda)));
  }

  function tecla(e: KeyboardEvent) {
    if (!data.length) return;
    if (e.key === "ArrowRight") activa = activa == null ? 0 : Math.min(data.length - 1, activa + 1);
    else if (e.key === "ArrowLeft") activa = activa == null ? data.length - 1 : Math.max(0, activa - 1);
    else if (e.key === "Home") activa = 0;
    else if (e.key === "End") activa = data.length - 1;
    else if (e.key === "Escape") activa = null;
    else return;
    e.preventDefault();
  }
</script>

<figure class={cn("ta-chart", className)}>
  <figcaption class="ta-chart-titulo">{title}</figcaption>
  {#if series.length > 1}
    <ul class="ta-chart-leyenda">
      {#each series as s, i (s.key)}
        <li><span class="ta-chart-muestra" style:background={seriesColor(i)} aria-hidden="true"></span>{s.label}</li>
      {/each}
    </ul>
  {/if}

  <!-- Un deslizador sobre las categorías: ← → recorren los datos y aria-valuetext los lee. -->
  <div
    class="ta-chart-lienzo"
    bind:clientWidth={ancho}
    bind:this={lienzo}
    role="slider"
    tabindex="0"
    aria-label={title}
    aria-valuemin={0}
    aria-valuemax={Math.max(0, data.length - 1)}
    aria-valuenow={activa ?? 0}
    aria-valuetext={lectura || title}
    onkeydown={tecla}
    onfocus={() => (activa ??= data.length ? 0 : null)}
    onblur={() => (activa = null)}
    onpointermove={alMover}
    onpointerleave={() => (activa = null)}
  >
    <svg width="100%" {height} viewBox={`0 0 ${ancho} ${height}`} class="ta-chart-svg" aria-hidden="true">
      {#each escala.ticks as t (t)}
        <line x1={M.left} x2={M.left + dentroAncho} y1={yDe(t)} y2={yDe(t)} class={t === 0 ? "ta-chart-base" : "ta-chart-rejilla"} />
        <text x={M.left - 8} y={yDe(t)} class="ta-chart-eje" text-anchor="end" dominant-baseline="middle">{format(t)}</text>
      {/each}

      {#each data as d, i (i)}
        <g class="ta-chart-grupo" class:ta-chart-grupo--activo={activa === i}>
          {#each series as s, si (s.key)}
            {@const v = valueOf(d, s.key)}
            {#if v != null && v > 0}<path d={columna(xDe(i, si), v)} fill={seriesColor(si)} />{/if}
          {/each}
          {#if i % salto === 0}
            <text x={M.left + banda * i + banda / 2} y={height - 8} class="ta-chart-eje" text-anchor="middle">{String(d[x] ?? "")}</text>
          {/if}
        </g>
      {/each}
    </svg>

    {#if activa != null && data[activa]}
      <div
        class="ta-chart-tooltip"
        style:left={`${Math.min(ancho - 160, Math.max(0, M.left + banda * activa + banda / 2 - 80))}px`}
        aria-hidden="true"
      >
        <span class="ta-chart-tooltip-x">{String(data[activa][x] ?? "")}</span>
        {#each series as s, si (s.key)}
          <span class="ta-chart-tooltip-fila">
            <span class="ta-chart-clave" style:background={seriesColor(si)}></span>
            <strong>{fmt(valueOf(data[activa], s.key))}</strong>
            <span>{s.label}</span>
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <button type="button" class="ta-chart-datos" aria-expanded={tabla} aria-controls={`${id}-tabla`} onclick={() => (tabla = !tabla)}>
    {tabla ? hideDataLabel : showDataLabel}
  </button>
  {#if tabla}
    <div id={`${id}-tabla`}>
      <Table>
        <caption class="ta-oculto">{title}</caption>
        <TableHeader>
          <TableRow>
            <TableHead>{xLabel ?? x}</TableHead>
            {#each series as s (s.key)}<TableHead style="text-align: right">{s.label}</TableHead>{/each}
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each data as d, i (i)}
            <TableRow>
              <TableCell>{String(d[x] ?? "")}</TableCell>
              {#each series as s (s.key)}<TableCell class="ta-chart-num">{fmt(valueOf(d, s.key))}</TableCell>{/each}
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </div>
  {/if}
</figure>

<style>
  .ta-chart { margin: 0; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0; color: rgb(var(--ta-text)); }
  .ta-chart-titulo { font-size: 0.875rem; font-weight: 600; }

  .ta-chart-leyenda { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 0; padding: 0; list-style: none; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); }
  .ta-chart-leyenda li { display: inline-flex; align-items: center; gap: 0.375rem; }
  .ta-chart-muestra { width: 0.625rem; height: 0.625rem; border-radius: 2px; }

  .ta-chart-lienzo { position: relative; width: 100%; outline: none; border-radius: var(--ta-radius-sm); }
  .ta-chart-lienzo:focus-visible { box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.6); }
  .ta-chart-svg { display: block; overflow: visible; }

  .ta-chart-rejilla { stroke: rgb(var(--ta-border)); stroke-width: 1; shape-rendering: crispEdges; }
  .ta-chart-base { stroke: rgb(var(--ta-muted)); stroke-width: 1; shape-rendering: crispEdges; }
  .ta-chart-eje { fill: rgb(var(--ta-text-dim)); font-size: 11px; font-variant-numeric: tabular-nums; }

  .ta-chart-grupo--activo path { filter: brightness(1.15); }

  .ta-chart-tooltip {
    position: absolute;
    top: 0;
    width: 160px;
    padding: 0.5rem 0.625rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 8px 24px -8px rgb(0 0 0 / 0.5);
    pointer-events: none;
  }
  .ta-chart-tooltip-x { color: rgb(var(--ta-text-dim)); }
  .ta-chart-tooltip-fila { display: flex; align-items: center; gap: 0.375rem; }
  .ta-chart-tooltip-fila strong { font-variant-numeric: tabular-nums; }
  .ta-chart-tooltip-fila span:last-child { color: rgb(var(--ta-text-dim)); }
  .ta-chart-clave { width: 0.625rem; height: 0.625rem; border-radius: 2px; flex-shrink: 0; }

  .ta-chart-datos {
    align-self: flex-start;
    padding: 0.125rem 0;
    font: inherit;
    font-size: 0.75rem;
    color: rgb(var(--ta-accent-hover));
    background: none;
    border: none;
    cursor: pointer;
  }
  .ta-chart-datos:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }
  .ta-chart :global(.ta-chart-num) { text-align: right; font-variant-numeric: tabular-nums; }

  .ta-oculto { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
</style>
