<!-- The admin building blocks under setLabels(es): every text they add on their own comes from the labels. -->
<script lang="ts">
  import {
    AppShell,
    DataTable,
    DescriptionList,
    DiffView,
    EmptyState,
    FilterBar,
    Kbd,
    SaveBar,
    SavedViews,
    Sidebar,
  } from "$lib/components";
  import { es, setLabels } from "$lib/i18n";

  let { shell = false }: { shell?: boolean } = $props();
  setLabels(es);
</script>

{#if shell}
  <AppShell height="auto">
    {#snippet sidebar({ mobile })}
      <Sidebar ariaLabel={mobile ? "Móvil" : "Principal"} groups={[{ items: [{ id: "a", label: "Entradas", href: "#a" }] }]} />
    {/snippet}
    <p>Contenido</p>
  </AppShell>
{:else}
  <FilterBar
    value={{ estado: "Borrador" }}
    filters={[
      { key: "estado", label: "Estado", type: "select", options: ["Borrador"] },
      { key: "autor", label: "Autor", type: "text", hidden: true },
    ]}
  >
    {#snippet end()}<SavedViews views={[]} onSave={() => {}} />{/snippet}
  </FilterBar>
  <EmptyState />
  <EmptyState variant="no-results" />
  <EmptyState variant="error" onRetry={() => {}} />
  <SaveBar dirty />
  <DiffView changes={[{ field: "titulo", before: "a", after: "b" }]} />
  <DiffView changes={[]} />
  <Kbd keys={["Mod", "K"]} platform="mac" data-testid="kbd" />
  <DescriptionList items={[{ label: "Ruta", value: "/api/x", copy: true }]} />
  <DataTable caption="Tabla" rows={[{ id: "1", n: "x" }]} rowKey="id" columns={[{ key: "n", header: "N" }]} densityToggle columnChooser />
{/if}
