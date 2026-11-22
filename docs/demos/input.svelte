<!-- layout: stack -->
<script lang="ts">
  import { Input, Label } from "tallao";

  let name = $state("Release 2.4");
  let token = $state("");
</script>

<div>
  <Label for="run-name">Run name</Label>
  <Input id="run-name" bind:value={name} placeholder="Name this run" />
  <p style="margin: 0.35rem 0 0; font-size: 0.8125rem; opacity: 0.7">Name: {name || "(empty)"}</p>
</div>
<div>
  <Label for="api-token">API token</Label>
  <Input id="api-token" type="password" bind:value={token} placeholder="Paste a token" />
</div>
<div>
  <Label for="region" disabled>Region</Label>
  <Input id="region" value="eu-west-1" disabled />
</div>
