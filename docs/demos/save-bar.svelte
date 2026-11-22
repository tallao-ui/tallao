<!-- layout: stack; height: 18 -->
<script lang="ts">
  import { Field, Input, SaveBar } from "tallao";

  let title = $state("Patch 1.2 notes");
  let saved = $state("Patch 1.2 notes");
  let saving = $state(false);
  const dirty = $derived(title !== saved);

  function save(event: SubmitEvent) {
    event.preventDefault();
    saving = true;
    setTimeout(() => {
      saving = false;
      saved = title;
    }, 900);
  }
</script>

<!-- The box keeps the sticky bar inside the demo. -->
<div style="height: 15rem; overflow: auto; border: 1px solid rgb(var(--ta-border)); border-radius: var(--ta-radius-lg)">
  <form id="post-form" onsubmit={save} style="padding: 1rem; min-height: 14rem">
    <Field label="Title"><Input bind:value={title} /></Field>
  </form>
  <SaveBar form="post-form" {dirty} {saving} savedText="All changes saved" cancelLabel="Discard" onCancel={dirty ? () => (title = saved) : undefined} />
</div>
