<!-- The 0.4 components together; the callbacks are observed from the tests. -->
<script lang="ts">
  import {
    Accordion,
    Avatar,
    Button,
    Command,
    ContextMenu,
    MenuItem,
    Progress,
    RadioGroup,
    Sheet,
    Skeleton,
    Switch,
    Toaster,
  } from "$lib/components";

  let { onAction = (_action: string) => {} }: { onAction?: (action: string) => void } = $props();
  let enabled = $state(false);
  let plan = $state("pro");
  let sheetOpen = $state(false);
  let paletteOpen = $state(false);
</script>

<Switch bind:checked={enabled} label="Notifications" />
<span data-testid="enabled">{enabled}</span>

<RadioGroup
  legend="Plan"
  bind:value={plan}
  options={[
    { value: "free", label: "Free" },
    { value: "pro", label: "Pro", description: "With support" },
    { value: "team", label: "Team", disabled: true },
  ]}
/>
<span data-testid="plan">{plan}</span>

<Button onclick={() => (sheetOpen = true)}>View details</Button>
<Sheet bind:open={sheetOpen} title="Details"><p>Content</p></Sheet>

<Command
  bind:open={paletteOpen}
  items={[
    { id: "new", label: "New project", group: "Projects", shortcut: "N", onSelect: () => onAction("new") },
    { id: "theme", label: "Change theme", group: "Settings", keywords: ["dark", "light"], onSelect: () => onAction("theme") },
    { id: "logout", label: "Sign out", group: "Settings", disabled: true, onSelect: () => onAction("logout") },
  ]}
/>
<span data-testid="palette">{paletteOpen}</span>

<ContextMenu label="Row actions">
  {#snippet target(props)}<div {...props} data-testid="zone">Row 1</div>{/snippet}
  <MenuItem onSelect={() => onAction("open")}>Open</MenuItem>
  <MenuItem onSelect={() => onAction("delete")}>Delete</MenuItem>
</ContextMenu>

<Accordion
  single
  items={[
    { id: "a", title: "What is it?", content: "A kit", open: true },
    { id: "b", title: "Does it cost anything?", content: "No" },
  ]}
/>

<Progress label="Upload" value={30} showValue />
<Progress label="Syncing" />
<Skeleton lines={3} />
<Avatar name="Ana López" />
<Avatar name="Agent One" src="/does-not-exist.png" badge="AI" />

<Toaster />
