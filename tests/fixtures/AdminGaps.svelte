<!-- Label, Badge dot, Avatar attributes, Tabs without panels and number binding: dom and SSR tests. -->
<script lang="ts">
  import { Avatar, Badge, Input, Label, NumberInput, Tabs } from "$lib/components";

  let tab = $state("posts");
  let amount = $state<number | null>(null);
  // Typed as the prop is (string); at runtime Svelte hands back a number or null.
  let raw = $state("");
</script>

<Label for="email" required>E-mail</Label>
<input id="email" type="email" required />
<Label for="locked" disabled class="extra" data-testid="locked-label">Locked</Label>
<input id="locked" disabled />

<Badge variant="success" dot data-testid="published">Published</Badge>
<Badge variant="info" pulse data-testid="running">Running</Badge>
<Badge data-testid="plain">Plain</Badge>

<Avatar name="Ana López" data-testid="ana" title="Ana" />
<Avatar name="Agent Smith" aria-label="Agent: Smith" initials={1} />

<Tabs
  ariaLabel="Admin sections"
  panels={false}
  bind:value={tab}
  items={[
    { id: "posts", label: "Posts", controls: "panel-posts", tabId: "tab-posts" },
    { id: "users", label: "Users", controls: "panel-users", tabId: "tab-users" },
    { id: "logs", label: "Logs" },
  ]}
/>
<span data-testid="tab">{tab}</span>
<div id="panel-posts" role="tabpanel" aria-labelledby="tab-posts" hidden={tab !== "posts"}>Post list</div>
<div id="panel-users" role="tabpanel" aria-labelledby="tab-users" hidden={tab !== "users"}>User list</div>

<NumberInput bind:value={amount} ariaLabel="Amount" />
<span data-testid="amount">{amount === null ? "null" : `${typeof amount}:${amount}`}</span>
<Input type="number" bind:value={raw} aria-label="Raw number" />
<span data-testid="raw">{(raw as unknown) === null ? "null" : `${typeof raw}:${raw}`}</span>
