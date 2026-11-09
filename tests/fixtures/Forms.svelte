<!-- The 0.6 components inside a native <form>, and a table with pagination. -->
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

  let notifications = $state(true);
  let country = $state<string | null>("pe");
  let tags = $state<string[]>(["bug"]);
  let date = $state<string | null>("2026-11-03");
  let day = $state<string | null>(null);
  let page = $state(1);
  let selection = $state<string[]>([]);
  let files = $state<File[]>([]);

  const rows = Array.from({ length: 7 }, (_, i) => ({ id: `r${i + 1}`, name: ["Eva", "Ana", "Luis", "Zoe", "Bea", "Ciro", "Dani"][i], points: [30, 5, 12, 50, 8, 21, 2][i] }));
</script>

<form data-testid="form">
  <Switch name="notifications" bind:checked={notifications} label="Notifications" />
  <Combobox name="country" bind:value={country} ariaLabel="Country" options={[{ value: "es", label: "Spain" }, { value: "pe", label: "Peru" }]} />
  <Combobox
    name="tags"
    multiple
    bind:values={tags}
    ariaLabel="Tags"
    options={[{ value: "bug", label: "Bug" }, { value: "ux", label: "UX" }, { value: "api", label: "API" }]}
  />
  {#if loadOptions}<Combobox ariaLabel="Remote" {loadOptions} debounce={0} />{/if}
  <KeyValueEditor name="stats" entries={[{ key: "hp", value: "100" }]} keyLabel="Stat" valueLabel="Value" />
  <DatePicker name="date" bind:value={date} ariaLabel="Date" min="2026-01-01" max="2026-12-31" />
  <FileUpload name="attachments" multiple accept="image/*,.pdf" maxSize={1000} maxFiles={2} bind:files={files} />
</form>
<span data-testid="date">{date ?? "none"}</span>
<span data-testid="files">{files.map((f) => f.name).join(",")}</span>

<Calendar bind:value={day} min="2026-11-02" />
<span data-testid="day">{day ?? "none"}</span>

<Pagination bind:page={page} pageCount={10} />
<span data-testid="page">{page}</span>

<DataTable
  caption="People"
  rows={rows}
  rowKey="id"
  rowLabel={(r) => r.name}
  columns={[
    { key: "name", header: "Name", sortable: true },
    { key: "points", header: "Points", sortable: true, align: "right" },
  ]}
  pageSize={3}
  selectable
  bind:selected={selection}
  {manual}
  total={manual ? 7 : undefined}
  {onSortChange}
/>
<span data-testid="selection">{selection.join(",")}</span>
<DataTable caption="Empty" rows={[]} rowKey="id" columns={[{ key: "x", header: "X" }]} />
