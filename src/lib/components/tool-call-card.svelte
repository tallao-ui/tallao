<!--
  tallao — ToolCallCard
  Tarjeta que muestra una llamada a herramienta de un agente: nombre,
  argumentos, resultado y — si está pendiente — acciones de aprobar/rechazar.
  Inspirada en el ProposalInbox y ChatInterface del admin de Kitsuden.
-->
<script lang="ts">
  import { cn } from "$lib/utils";
  import Badge from "./badge.svelte";
  import Button from "./button.svelte";

  type Estado = "pending" | "executing" | "executed" | "rejected" | "failed";

  interface Props {
    /** Nombre de la herramienta (p. ej. "publish_post"). */
    nombre: string;
    /** Argumentos de la llamada; se muestran como JSON. */
    args?: Record<string, unknown>;
    /** Resultado de la ejecución, si lo hay. */
    resultado?: string;
    estado?: Estado;
    /** Si está pendiente: botones de decisión. */
    onApprove?: () => void;
    onReject?: () => void;
    /** Textos personalizables (el kit no impone idioma). */
    textos?: {
      aprobar?: string;
      rechazar?: string;
      ejecutando?: string;
      ejecutado?: string;
      rechazado?: string;
      fallido?: string;
      pendiente?: string;
      argumentos?: string;
      resultado?: string;
    };
    class?: string;
  }

  const {
    nombre,
    args = {},
    resultado,
    estado = "pending",
    onApprove,
    onReject,
    textos = {},
    class: className = "",
  }: Props = $props();

  const T = {
    aprobar: "Aprobar",
    rechazar: "Rechazar",
    ejecutando: "Ejecutando…",
    ejecutado: "Ejecutado",
    rechazado: "Rechazado",
    fallido: "Fallido",
    pendiente: "Pendiente",
    argumentos: "Argumentos",
    resultado: "Resultado",
    ...textos,
  };

  const estadoBadge: Record<Estado, { variant: "warning" | "info" | "success" | "default" | "error"; texto: keyof typeof T }> = {
    pending: { variant: "warning", texto: "pendiente" },
    executing: { variant: "info", texto: "ejecutando" },
    executed: { variant: "success", texto: "ejecutado" },
    rejected: { variant: "default", texto: "rechazado" },
    failed: { variant: "error", texto: "fallido" },
  };

  let argsAbiertos = $state(false);
  const argsJson = $derived(JSON.stringify(args, null, 2));
  const argsLargos = $derived(argsJson.length > 120);
</script>

<div class={cn("ta-toolcall", `ta-toolcall--${estado}`, className)}>
  <div class="ta-toolcall-cabecera">
    <span class="ta-toolcall-icono" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
    </span>
    <span class="ta-toolcall-nombre">{nombre}</span>
    <Badge variant={estadoBadge[estado].variant}>{T[estadoBadge[estado].texto]}</Badge>
  </div>

  {#if Object.keys(args).length > 0}
    <div class="ta-toolcall-bloque">
      <button
        type="button"
        class="ta-toolcall-plegable"
        onclick={() => (argsAbiertos = !argsAbiertos)}
        aria-expanded={argsAbiertos}
      >
        {T.argumentos}
        {#if argsLargos}
          <span class="ta-toolcall-mas">{argsAbiertos ? "▾" : "▸"}</span>
        {/if}
      </button>
      <pre class="ta-toolcall-json" class:ta-toolcall-json--cerrado={!argsAbiertos && argsLargos}>{argsJson}</pre>
    </div>
  {/if}

  {#if resultado}
    <div class="ta-toolcall-bloque">
      <span class="ta-toolcall-etiqueta">{T.resultado}</span>
      <p class="ta-toolcall-resultado">{resultado}</p>
    </div>
  {/if}

  {#if estado === "pending" && (onApprove || onReject)}
    <div class="ta-toolcall-acciones">
      {#if onReject}
        <Button variant="ghost" size="sm" onclick={onReject}>{T.rechazar}</Button>
      {/if}
      {#if onApprove}
        <Button variant="primary" size="sm" onclick={onApprove}>{T.aprobar}</Button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .ta-toolcall {
    background: rgb(var(--ta-bg) / 0.6);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    padding: 0.75rem;
    font-size: 0.8125rem;
  }

  .ta-toolcall--executing {
    border-color: rgb(var(--ta-info) / 0.4);
  }

  .ta-toolcall-cabecera {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .ta-toolcall-icono {
    display: flex;
    padding: 0.375rem;
    border-radius: var(--ta-radius-sm);
    background: rgb(var(--ta-accent) / 0.1);
    color: rgb(var(--ta-accent-hover));
  }

  .ta-toolcall-nombre {
    font-weight: 600;
    font-family: var(--ta-font-mono);
    font-size: 0.8125rem;
    color: rgb(var(--ta-text));
  }

  .ta-toolcall-cabecera :global(.ta-badge) {
    margin-left: auto;
  }

  .ta-toolcall-bloque {
    margin-top: 0.625rem;
  }

  .ta-toolcall-etiqueta,
  .ta-toolcall-plegable {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.6875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
  }

  .ta-toolcall-json {
    margin: 0.375rem 0 0;
    padding: 0.5rem 0.625rem;
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    font-family: var(--ta-font-mono);
    font-size: 0.75rem;
    color: rgb(var(--ta-text-dim));
    overflow-x: auto;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .ta-toolcall-json--cerrado {
    max-height: 2.75rem;
    overflow: hidden;
    mask-image: linear-gradient(to bottom, black 50%, transparent);
  }

  .ta-toolcall-resultado {
    margin: 0.25rem 0 0;
    color: rgb(var(--ta-text-dim));
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .ta-toolcall-acciones {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding-top: 0.625rem;
    border-top: 1px solid rgb(var(--ta-border));
  }
</style>
