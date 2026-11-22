<!-- layout: stack -->
<script lang="ts">
  import { Steps } from "tallao";
</script>

<Steps
  label="Release plan"
  steps={[
    { title: "Read the draft", description: "posts/patch-1-2.md", status: "done" },
    { title: "Compare the meta", description: "Pick rate for 31 characters", status: "running" },
    { title: "Publish the post", description: "Needs an approval", status: "pending" },
    { title: "Announce on Discord", status: "skipped" },
    { title: "Update the tier list", status: "failed" },
  ]}
/>
