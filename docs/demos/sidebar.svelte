<!-- layout: wide -->
<script lang="ts">
  import { Sidebar } from "tallao";

  let collapsed = $state(false);
  let current = $state("agile");
  const groups = [
    {
      items: [
        { id: "home", label: "Home", icon: "home" as const, onclick: () => (current = "home") },
        { id: "users", label: "Users", icon: "user" as const, badge: 4, onclick: () => (current = "users") },
        { id: "approvals", label: "Approvals", icon: "check" as const, badge: 2, badgeVariant: "warning" as const, badgePulse: true, onclick: () => (current = "approvals") },
      ],
    },
    {
      label: "Workspace",
      items: [
        {
          id: "kons",
          label: "Kons",
          icon: "settings" as const,
          children: [
            { id: "agile", label: "Agile", onclick: () => (current = "agile") },
            { id: "blog", label: "Blog", onclick: () => (current = "blog") },
          ],
        },
      ],
    },
  ];
</script>

<div style="display: flex; gap: 1rem; height: 22rem">
  <Sidebar bind:collapsed {groups} {current} />
  <p style="color: rgb(var(--ta-text-dim))">Current: {current} · {collapsed ? "collapsed" : "expanded"}</p>
</div>
