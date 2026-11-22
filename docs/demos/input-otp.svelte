<!-- layout: stack -->
<script lang="ts">
  import { InputOTP } from "tallao";

  let code = $state("");
  let verified = $state("");
</script>

<InputOTP bind:value={code} length={6} groupSize={3} label="Verification code" oncomplete={(v) => (verified = v)} />
<p style="margin: 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim))">
  {verified && code === verified ? `Code ${verified} sent for verification.` : "Type or paste the 6-digit code."}
</p>
