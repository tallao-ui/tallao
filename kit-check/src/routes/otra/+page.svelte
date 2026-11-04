<!--
  Otra página con dos trampas para el servidor:
    - setLabels(es): los textos del kit son por petición (contexto), no se pasan a la portada;
    - toast() al renderizar: en el servidor no hace nada, así que el aviso no aparece en el
      HTML de ninguna página (el módulo de toasts es uno solo para todas las peticiones).
-->
<script lang="ts">
  import { Alert, es, setLabels, toast } from "tallao";

  setLabels(es);
  toast("aviso-desde-el-servidor");
</script>

<h1>Otra</h1>
<Alert variant="info" onDismiss={() => {}}>Aviso en español</Alert>
