<!-- Popover, tooltip, menu and combobox together, with an "outside" button for outside clicks. -->
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

  let { onAction = (_action: string) => {} }: { onAction?: (action: string) => void } = $props();
  let popover = $state(false);
  let value = $state<string | null>(null);
</script>

<Button>Outside</Button>

<Popover bind:open={popover} title="Filters">
  {#snippet trigger(props)}<Button {...props}>Filters</Button>{/snippet}
  <Input aria-label="Search" />
</Popover>

<Tooltip text="Copies the link">
  {#snippet trigger(props)}<Button {...props}>Copy</Button>{/snippet}
</Tooltip>

<DropdownMenu label="Actions">
  {#snippet trigger(props)}<Button {...props}>Actions</Button>{/snippet}
  <MenuLabel>Project</MenuLabel>
  <MenuItem onSelect={() => onAction("edit")}>Edit</MenuItem>
  <MenuItem onSelect={() => onAction("duplicate")} disabled>Duplicate</MenuItem>
  <MenuItem onSelect={() => onAction("archive")}>Archive</MenuItem>
  <MenuSeparator />
  <MenuItem variant="danger" onSelect={() => onAction("remove")}>Remove</MenuItem>
</DropdownMenu>

<Combobox
  ariaLabel="Country"
  bind:value
  options={[
    { value: "es", label: "Spain" },
    { value: "re", label: "Réunion" },
    { value: "mx", label: "Mexico", disabled: true },
    { value: "co", label: "Colombia" },
  ]}
/>
<span data-testid="value">{value ?? "none"}</span>
<span data-testid="popover">{popover ? "open" : "closed"}</span>
