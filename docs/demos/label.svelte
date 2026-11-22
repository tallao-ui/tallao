<!-- layout: stack -->
<script lang="ts">
  import { Input, Label } from "tallao";

  let email = $state("");
</script>

<div>
  <Label for="owner-email" required>Owner e-mail</Label>
  <Input id="owner-email" type="email" required bind:value={email} placeholder="you@example.com" />
</div>
<div>
  <Label for="nickname">Nickname</Label>
  <Input id="nickname" placeholder="Optional" />
</div>
<div>
  <Label for="legacy-id" disabled>Legacy id</Label>
  <Input id="legacy-id" value="A-1042" disabled />
</div>
