<!-- Un botón que abre un diálogo con un campo; el segundo diálogo va anidado. -->
<script lang="ts">
  import { Button, Dialog, Input } from "$lib/components";

  let { anidado = false }: { anidado?: boolean } = $props();
  let abierto = $state(false);
  let segundo = $state(false);
</script>

<Button onclick={() => (abierto = true)}>Abrir</Button>
<p>Fuera</p>
<Dialog bind:open={abierto} title="Editar" closeLabel="Cerrar">
  <Input aria-label="Nombre" />
  {#if anidado}
    <Button onclick={() => (segundo = true)}>Otro</Button>
    <Dialog bind:open={segundo} title="Segundo"><Input aria-label="Interno" /></Dialog>
  {/if}
</Dialog>
<span data-testid="estado">{abierto ? "abierto" : "cerrado"}/{segundo ? "abierto" : "cerrado"}</span>
