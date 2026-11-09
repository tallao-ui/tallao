<!--
  Another page with two traps for the server:
    - setLabels(es): the kit's texts are per request (context), they do not leak into the home page;
    - toast() during render: on the server it does nothing, so the toast does not appear in the
      HTML of any page (the toasts module is a single one for every request).
-->
<script lang="ts">
  import { Alert, es, setLabels, toast } from "tallao";

  setLabels(es);
  toast("toast-from-the-server");
</script>

<h1>Other</h1>
<Alert variant="info" onDismiss={() => {}}>Alert in Spanish</Alert>
