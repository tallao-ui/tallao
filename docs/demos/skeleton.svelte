<!-- layout: stack -->
<script lang="ts">
  import { Skeleton } from "tallao";
</script>

<div style="display: flex; gap: 0.75rem; align-items: center">
  <Skeleton shape="circle" width="2.5rem" height="2.5rem" />
  <div style="flex: 1; display: grid; gap: 0.5rem">
    <Skeleton width="45%" />
    <Skeleton width="30%" height="0.75rem" />
  </div>
</div>
<Skeleton shape="text" lines={3} />
<Skeleton height="6rem" />
