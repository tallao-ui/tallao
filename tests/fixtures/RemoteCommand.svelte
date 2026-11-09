<!-- Command with results from the page (like the sites' search): unfiltered, with loading and links. -->
<script lang="ts">
  import { Command, type CommandItem } from "$lib/components";

  let {
    search,
    onChoose = () => {},
    onClose = () => {},
  }: {
    search: (q: string) => Promise<CommandItem[]>;
    onChoose?: (id: string) => void;
    onClose?: () => void;
  } = $props();

  let open = $state(true);
  let query = $state("");
  let loading = $state(false);
  let results = $state<CommandItem[]>([]);
  let modal = $state(false);
  let modalQuery = $state("");

  $effect(() => {
    const q = query;
    if (q.length < 2) {
      results = [];
      loading = false;
      return;
    }
    loading = true;
    search(q).then((r) => {
      if (q !== query) return;
      results = r;
      loading = false;
    });
  });

  function close() {
    open = false;
    onClose();
  }
</script>

{#if open}
  <div data-testid="overlay">
    <Command
      inline
      autofocus
      bind:query={query}
      filter={false}
      loading={loading}
      items={results}
      label="Search the site"
      placeholder="Search games…"
      onSelect={(it) => onChoose(it.id)}
      onOpenChange={(v) => !v && close()}
    >
      {#snippet empty(q)}
        {#if !q}<p>Type to search</p>{:else if q.length >= 2}<p>No results for "{q}"</p>{/if}
      {/snippet}
      {#snippet trailing()}<span aria-hidden="true">›</span>{/snippet}
    </Command>
  </div>
{/if}
<span data-testid="query">{query}</span>

<button type="button" onclick={() => (modal = true)}>Open palette</button>
<Command
  bind:open={modal}
  bind:query={modalQuery}
  hotkey={false}
  filter={false}
  emptyText={'Nothing for "{query}"'}
  items={modalQuery ? [{ id: "echo", label: `Echo: ${modalQuery}`, href: "#echo", description: "What you typed" }] : []}
/>
<span data-testid="modal">{modal}</span>
