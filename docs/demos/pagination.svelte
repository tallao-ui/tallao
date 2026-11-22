<!-- layout: stack -->
<script lang="ts">
  import { Pagination } from "tallao";

  let page = $state(6);
</script>

<Pagination bind:page pageCount={20} />
<p style="margin: 0; text-align: center; color: rgb(var(--ta-text-dim))">Page {page} of 20 · rows {(page - 1) * 25 + 1}–{page * 25}</p>
