<!-- layout: stack -->
<script lang="ts">
  import { Accordion } from "tallao";
</script>

<Accordion
  single
  items={[
    { id: "a", title: "What is tallao?", content: "A component kit for Svelte 5.", open: true },
    { id: "b", title: "Does it work with SSR?", content: "Yes: ids are stable and nothing touches window on the server." },
    { id: "c", title: "Is it accessible?", content: "Every component passes axe and is tested with the keyboard." },
    { id: "d", title: "Enterprise plan", content: "Not available yet.", disabled: true },
  ]}
/>
