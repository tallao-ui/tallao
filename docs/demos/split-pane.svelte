<!-- layout: wide -->
<script lang="ts">
  import { SplitPane } from "tallao";

  let size = $state(40);
</script>

<p style="margin: 0 0 0.5rem; color: rgb(var(--ta-text-dim))">First panel: {size}%. Drag the handle, or use the arrow keys.</p>
<div style="height: 14rem; border: 1px solid rgb(var(--ta-border)); border-radius: 0.5rem; overflow: hidden">
  <SplitPane bind:size min={20} max={80} label="Resize list and detail">
    {#snippet first()}
      <ul style="margin: 0; padding: 0.75rem 1.5rem">
        <li>run-0412 (done)</li>
        <li>run-0413 (running)</li>
        <li>run-0414 (queued)</li>
      </ul>
    {/snippet}
    {#snippet second()}
      <div style="padding: 0.75rem">
        <strong>run-0413</strong>
        <p style="color: rgb(var(--ta-text-dim))">Indexing 1,284 documents, 62% done.</p>
      </div>
    {/snippet}
  </SplitPane>
</div>
