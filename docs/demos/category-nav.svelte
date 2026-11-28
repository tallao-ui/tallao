<!-- layout: wide -->
<script lang="ts">
  import { CategoryNav } from "tallao";

  const groups = [
    { id: "welcome", label: "Welcome and roles", icon: "user", on: 3, all: 7 },
    { id: "levels", label: "Levels and economy", icon: "coin", on: 2, all: 7 },
    { id: "moderation", label: "Moderation", icon: "shield", on: 0, all: 5 },
    { id: "custom", label: "Custom commands", icon: "slash", on: 4, all: 4 },
  ] as const;
  let open = $state<string>("levels");
</script>

<div style="display: grid; grid-template-columns: 15rem 1fr; gap: 1.5rem">
  <CategoryNav
    ariaLabel="Module groups"
    chipsBelow={640}
    current={open}
    items={groups.map((g) => ({ id: g.id, label: g.label, icon: g.icon, count: `${g.on}/${g.all}`, lit: g.on > 0, onclick: () => (open = g.id) }))}
  />
  <p style="color: rgb(var(--ta-text-dim))">Showing {groups.find((g) => g.id === open)?.label}</p>
</div>
