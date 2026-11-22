<!-- layout: wide -->
<script lang="ts">
  import { EmptyState, Toaster, toast } from "tallao";

  let retrying = $state(false);
  function retry() {
    retrying = true;
    setTimeout(() => (retrying = false), 1200);
  }
</script>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: 1rem">
  <EmptyState title="No posts yet" description="Posts you write appear here." actionLabel="New post" onAction={() => toast("New post")} />
  <EmptyState variant="no-results" description="Try fewer filters, or a different search." onClearFilters={() => toast("Filters cleared")} />
  <EmptyState variant="error" description="The API answered 503. Nothing was changed." onRetry={retry} {retrying} />
</div>

<Toaster />
