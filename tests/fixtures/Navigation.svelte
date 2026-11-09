<!-- BottomNav, NavMenu and the Sidebar extensions: used by the dom and SSR tests. -->
<script lang="ts">
  import { Avatar, BottomNav, NavMenu, Sidebar, type NavMenuGroup } from "$lib/components";
  import SiteIcon from "./SiteIcon.svelte";
  import SiteNavMenu from "./SiteNavMenu.svelte";

  let {
    collapsed = $bindable(false),
    persistKey,
    tooltips = true,
    spacer = true,
  }: { collapsed?: boolean; persistKey?: string; tooltips?: boolean; spacer?: boolean } = $props();

  const gameGroups: NavMenuGroup[] = [
    {
      label: "Gacha",
      items: [
        { label: "Genshin Impact", href: "/genshin", description: "Tier list and builds", icon: "bot", badge: "New" },
        { label: "Star Rail", href: "/star-rail", description: "Teams and relics", current: true },
      ],
    },
    {
      label: "Card games",
      items: [
        { label: "Riftbound", href: "/riftbound", description: "Decks and meta" },
        { label: "Aion 2", description: "Wiki in progress", soon: true },
      ],
    },
  ];
</script>

{#snippet starIcon()}<SiteIcon shape="circle" />{/snippet}
{#snippet lucide(item: { id: string })}<SiteIcon shape={item.id === "approvals" ? "circle" : "square"} />{/snippet}

<header>
  <nav aria-label="Site">
    <NavMenu label="Games" groups={gameGroups} name="site-menus" columns="auto" data-testid="games-menu" />
    <NavMenu label="Tools" name="site-menus" align="end" columns={1} groups={[{ items: [{ label: "Calculators", href: "/tools", description: "Damage and stats", icon: starIcon }] }]} />
    <SiteNavMenu label="Sites" groups={[{ items: [{ label: "Valhalla", href: "/", description: "The hub", badge: 2 }, { label: "Cardback", href: "/cards" }] }]} />
  </nav>
</header>

<Sidebar
  bind:collapsed
  {persistKey}
  {tooltips}
  current="/posts"
  icon={lucide}
  groups={[
    {
      label: "Content",
      items: [
        { id: "posts", label: "Posts", href: "/posts" },
        { id: "approvals", label: "Approvals", href: "/approvals", badge: 4, badgeVariant: "warning", badgePulse: true },
        { id: "media", label: "Media", href: "/media", icon: starIcon, badge: "ok", badgeVariant: "success", badgeDot: true },
      ],
    },
  ]}
>
  {#snippet footer(isCollapsed)}
    {#if isCollapsed}
      <Avatar name="Ana López" size="sm" title="Ana López" data-testid="footer-avatar" />
    {:else}
      <div data-testid="footer-full"><Avatar name="Ana López" size="sm" decorative /> Ana López</div>
    {/if}
  {/snippet}
</Sidebar>

<main><p>Page</p></main>

<BottomNav
  ariaLabel="Main"
  current="/news"
  hideAbove={767}
  {spacer}
  items={[
    { id: "home", label: "Home", href: "/", icon: "home" },
    { id: "news", label: "News", href: "/news", icon: "info", badge: 3 },
    { id: "games", label: "Games", href: "/games", icon: starIcon },
    { id: "me", label: "Profile", href: "/me", icon: "user" },
  ]}
>
  {#snippet action()}<a href="/new" aria-label="New post">+</a>{/snippet}
</BottomNav>
