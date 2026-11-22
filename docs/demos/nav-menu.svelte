<!-- layout: wide; height: 22 -->
<script lang="ts">
  import { NavMenu } from "tallao";

  const games = [
    { label: "Live", items: [
      { label: "Genshin Impact", href: "#genshin", description: "Tier list and builds", icon: "bot" as const, current: true },
      { label: "Honkai: Star Rail", href: "#hsr", description: "Relics and teams", icon: "sparkle" as const, badge: "New" },
    ] },
    { label: "Soon", items: [{ label: "Aion 2", description: "Wiki in progress", icon: "database" as const, soon: true }] },
  ];
  const tools = [{ items: [
    { label: "Damage calculator", href: "#calc", icon: "settings" as const },
    { label: "Interactive map", href: "#map", icon: "search" as const },
  ] }];
</script>

<!-- a header-like bar; `name` makes the menus exclusive -->
<header style="display: flex; gap: 0.5rem; align-items: center; padding: 0.5rem 1rem; border: 1px solid rgb(var(--ta-border)); border-radius: 0.5rem">
  <strong style="margin-right: auto">Kitsuden</strong>
  <NavMenu label="Games" name="site" groups={games} columns={1} />
  <NavMenu label="Tools" name="site" groups={tools} align="end" />
</header>
