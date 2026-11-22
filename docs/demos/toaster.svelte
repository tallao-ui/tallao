<!-- layout: center; height: 14 -->
<script lang="ts">
  import { Button, Toaster, toast } from "tallao";
</script>

<Button onclick={() => toast("Event created")}>Default</Button>
<Button variant="secondary" onclick={() => toast.success("Saved", { description: "Your changes are live." })}>Success</Button>
<Button variant="outline" onclick={() => toast.error("Could not save", { description: "The API returned 503." })}>Error</Button>
<Button variant="ghost" onclick={() => toast.info("Deployed", { action: { label: "Undo", onClick: () => toast("Undone") } })}>With action</Button>

<Toaster />
