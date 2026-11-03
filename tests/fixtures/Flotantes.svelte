<!-- Popover, tooltip, menú y combobox juntos, con un botón «fuera» para los clics externos. -->
<script lang="ts">
  import {
    Button,
    Combobox,
    DropdownMenu,
    Input,
    MenuItem,
    MenuLabel,
    MenuSeparator,
    Popover,
    Tooltip,
  } from "$lib/components";

  let { onAccion = (_accion: string) => {} }: { onAccion?: (accion: string) => void } = $props();
  let popover = $state(false);
  let valor = $state<string | null>(null);
</script>

<Button>Fuera</Button>

<Popover bind:open={popover} title="Filtros">
  {#snippet trigger(props)}<Button {...props}>Filtros</Button>{/snippet}
  <Input aria-label="Buscar" />
</Popover>

<Tooltip text="Copia el enlace">
  {#snippet trigger(props)}<Button {...props}>Copiar</Button>{/snippet}
</Tooltip>

<DropdownMenu label="Acciones">
  {#snippet trigger(props)}<Button {...props}>Acciones</Button>{/snippet}
  <MenuLabel>Proyecto</MenuLabel>
  <MenuItem onSelect={() => onAccion("editar")}>Editar</MenuItem>
  <MenuItem onSelect={() => onAccion("duplicar")} disabled>Duplicar</MenuItem>
  <MenuItem onSelect={() => onAccion("archivar")}>Archivar</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={() => onAccion("borrar")}>Borrar</MenuItem>
</DropdownMenu>

<Combobox
  ariaLabel="País"
  bind:value={valor}
  options={[
    { value: "es", label: "España" },
    { value: "pe", label: "Perú" },
    { value: "mx", label: "México", disabled: true },
    { value: "co", label: "Colombia" },
  ]}
/>
<span data-testid="valor">{valor ?? "ninguno"}</span>
<span data-testid="popover">{popover ? "abierto" : "cerrado"}</span>
