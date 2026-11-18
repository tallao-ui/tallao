<!-- CodeDiff and CodeBlock with the `actions` snippet. -->
<script lang="ts">
  import { CodeBlock, CodeDiff } from "$lib/components";

  const { which = "diff" }: { which?: "diff" | "block" } = $props();
</script>

{#if which === "diff"}
  <CodeDiff before={"a\nb"} after={"a\nc"} ariaLabel="Edit">
    {#snippet actions({ added, removed })}
      <button type="button">Copy for X ({added}/{removed})</button>
    {/snippet}
  </CodeDiff>
{:else}
  <CodeBlock code="const x = 1;" language="ts">
    {#snippet actions()}
      <button type="button">Copy for X</button>
    {/snippet}
  </CodeBlock>
{/if}
