<!--
  ChatMessage: un mensaje de una conversación, con quién lo dijo y su texto.

  Para leer conversaciones (un historial, una prueba de un bot) junto a PromptInput y
  ToolCallCard. El texto respeta saltos de línea y no se interpreta como HTML. `pending` lo marca
  como «escribiendo» (`aria-busy`) mientras llega la respuesta; `footer` lleva lo que acompaña al
  mensaje: fuentes, herramientas usadas, una hora.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  type Role = "user" | "assistant" | "system";

  interface Props {
    role?: Role;
    /** Quién habla; por defecto, el rol en inglés («You», «Assistant», «System»). */
    author?: string;
    /** El texto del mensaje; `children` lo sustituye si hace falta marcado. */
    content?: string;
    /** Mientras llega la respuesta: puntos animados y `aria-busy`. */
    pending?: boolean;
    /** Nombre accesible del indicador de espera. */
    pendingLabel?: string;
    class?: string;
    children?: import("svelte").Snippet;
    footer?: import("svelte").Snippet;
  }

  const {
    role = "assistant",
    author,
    content = "",
    pending = false,
    pendingLabel = "Writing…",
    class: className = "",
    children,
    footer,
  }: Props = $props();

  const porDefecto: Record<Role, string> = { user: "You", assistant: "Assistant", system: "System" };
  const quien = $derived(author ?? porDefecto[role]);
  const id = $props.id();
</script>

<article
  class={cn("ta-chatmsg", `ta-chatmsg--${role}`, className)}
  aria-labelledby={`${id}-autor`}
  aria-busy={pending || undefined}
>
  <header class="ta-chatmsg-autor" id={`${id}-autor`}>{quien}</header>
  <div class="ta-chatmsg-cuerpo">
    {#if pending}
      <span class="ta-chatmsg-espera" role="status" aria-label={pendingLabel}>
        <span></span><span></span><span></span>
      </span>
    {:else if children}
      {@render children()}
    {:else}
      {content}
    {/if}
  </div>
  {#if footer && !pending}
    <footer class="ta-chatmsg-pie">{@render footer()}</footer>
  {/if}
</article>

<style>
  .ta-chatmsg {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-width: min(42rem, 90%);
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
  }

  .ta-chatmsg--user {
    align-self: flex-end;
    background: rgb(var(--ta-accent) / 0.12);
    border-color: rgb(var(--ta-accent) / 0.3);
  }

  .ta-chatmsg--assistant {
    align-self: flex-start;
  }

  .ta-chatmsg--system {
    align-self: center;
    background: transparent;
    border-style: dashed;
    color: rgb(var(--ta-text-dim));
  }

  .ta-chatmsg-autor {
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(var(--ta-text-dim));
  }

  .ta-chatmsg-cuerpo {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    line-height: 1.5;
  }

  .ta-chatmsg-pie {
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
  }

  .ta-chatmsg-espera {
    display: inline-flex;
    gap: 0.25rem;
    padding: 0.25rem 0;
  }

  .ta-chatmsg-espera span {
    width: 0.375rem;
    height: 0.375rem;
    border-radius: 9999px;
    background: rgb(var(--ta-text-dim));
    animation: ta-chatmsg-punto 1.2s infinite ease-in-out;
  }

  .ta-chatmsg-espera span:nth-child(2) { animation-delay: 0.15s; }
  .ta-chatmsg-espera span:nth-child(3) { animation-delay: 0.3s; }

  @keyframes ta-chatmsg-punto {
    0%, 80%, 100% { opacity: 0.3; }
    40% { opacity: 1; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-chatmsg-espera span { animation: none; }
  }
</style>
