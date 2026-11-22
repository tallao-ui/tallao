<!-- layout: wide -->
<script lang="ts">
  import { BottomNav } from "tallao";

  let current = $state("runs");
  const items = [
    { id: "home", label: "Home", icon: "home" as const, onclick: () => (current = "home") },
    { id: "runs", label: "Runs", icon: "bot" as const, badge: 3, onclick: () => (current = "runs") },
    { id: "search", label: "Search", icon: "search" as const, onclick: () => (current = "search") },
    { id: "profile", label: "Profile", icon: "user" as const, onclick: () => (current = "profile") },
  ];
</script>

<!-- BottomNav is position: fixed to the screen; transform makes this box its containing block -->
<div style="position: relative; height: 12rem; max-width: 24rem; margin: 0 auto; transform: translateZ(0); overflow: hidden; border: 1px solid rgb(var(--ta-border)); border-radius: 0.75rem">
  <p style="margin: 1rem; color: rgb(var(--ta-text-dim))">Selected: {current}</p>
  <BottomNav {items} {current} spacer={false} ariaLabel="Main" />
</div>
