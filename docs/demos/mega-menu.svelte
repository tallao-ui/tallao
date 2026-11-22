<!-- layout: wide; height: 26 -->
<script lang="ts">
  import { MegaMenu } from "tallao";

  const groups = [
    { label: "Guides", items: [
      { label: "Beginner route", href: "#route", description: "The first ten hours", icon: "home" as const },
      { label: "Boss strategies", href: "#bosses", description: "Phases, weak points, loot", icon: "shield" as const },
    ] },
    { label: "Tools", items: [
      { label: "Interactive map", href: "#map", description: "Every chest and waypoint", icon: "search" as const },
      { label: "Build planner", href: "#planner", description: "Share a loadout by link", icon: "edit" as const, badge: "Beta" },
    ] },
  ];
</script>

<!-- a header-like bar; the panel opens below it -->
<header style="display: flex; align-items: center; padding: 0.5rem 1rem; border: 1px solid rgb(var(--ta-border)); border-radius: 0.5rem">
  <strong style="margin-right: 1rem">Kitsuden</strong>
  <MegaMenu
    label="Explore"
    {groups}
    columns={2}
    featured={{ title: "Patch 5.2 guide", href: "#patch", description: "What changed and who to pull for.", cta: "Read the guide" }}
    foot={{ label: "See every game", href: "#games" }}
  />
</header>
