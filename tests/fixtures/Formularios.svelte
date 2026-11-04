<!-- Los componentes de 0.6 dentro de un <form> nativo, y una tabla con paginación. -->
<script lang="ts">
  import {
    Calendar,
    Combobox,
    DataTable,
    DatePicker,
    FileUpload,
    KeyValueEditor,
    Pagination,
    Switch,
    type ComboboxOption,
    type DataSort,
  } from "$lib/components";

  let {
    loadOptions,
    manual = false,
    onSortChange = (_s: DataSort | null) => {},
  }: {
    loadOptions?: (q: string, signal: AbortSignal) => Promise<ComboboxOption[]>;
    manual?: boolean;
    onSortChange?: (s: DataSort | null) => void;
  } = $props();

  let avisos = $state(true);
  let pais = $state<string | null>("pe");
  let etiquetas = $state<string[]>(["bug"]);
  let fecha = $state<string | null>("2026-11-03");
  let dia = $state<string | null>(null);
  let pagina = $state(1);
  let seleccion = $state<string[]>([]);
  let archivos = $state<File[]>([]);

  const filas = Array.from({ length: 7 }, (_, i) => ({ id: `r${i + 1}`, nombre: ["Eva", "Ana", "Luis", "Zoe", "Bea", "Ciro", "Dani"][i], puntos: [30, 5, 12, 50, 8, 21, 2][i] }));
</script>

<form data-testid="form">
  <Switch name="avisos" bind:checked={avisos} label="Avisos" />
  <Combobox name="pais" bind:value={pais} ariaLabel="País" options={[{ value: "es", label: "España" }, { value: "pe", label: "Perú" }]} />
  <Combobox
    name="etiquetas"
    multiple
    bind:values={etiquetas}
    ariaLabel="Etiquetas"
    options={[{ value: "bug", label: "Bug" }, { value: "ux", label: "UX" }, { value: "api", label: "API" }]}
  />
  {#if loadOptions}<Combobox ariaLabel="Remoto" {loadOptions} debounce={0} />{/if}
  <KeyValueEditor name="stats" entries={[{ key: "hp", value: "100" }]} keyLabel="Stat" valueLabel="Valor" />
  <DatePicker name="fecha" bind:value={fecha} ariaLabel="Fecha" min="2026-01-01" max="2026-12-31" />
  <FileUpload name="adjuntos" multiple accept="image/*,.pdf" maxSize={1000} maxFiles={2} bind:files={archivos} />
</form>
<span data-testid="fecha">{fecha ?? "ninguna"}</span>
<span data-testid="archivos">{archivos.map((f) => f.name).join(",")}</span>

<Calendar bind:value={dia} min="2026-11-02" />
<span data-testid="dia">{dia ?? "ninguno"}</span>

<Pagination bind:page={pagina} pageCount={10} />
<span data-testid="pagina">{pagina}</span>

<DataTable
  caption="Personas"
  rows={filas}
  rowKey="id"
  rowLabel={(r) => r.nombre}
  columns={[
    { key: "nombre", header: "Nombre", sortable: true },
    { key: "puntos", header: "Puntos", sortable: true, align: "right" },
  ]}
  pageSize={3}
  selectable
  bind:selected={seleccion}
  {manual}
  total={manual ? 7 : undefined}
  {onSortChange}
/>
<span data-testid="seleccion">{seleccion.join(",")}</span>
<DataTable caption="Vacía" rows={[]} rowKey="id" columns={[{ key: "x", header: "X" }]} />
