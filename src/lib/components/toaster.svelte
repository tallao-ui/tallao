<!--
  tallao — Toaster
  Donde aparecen los avisos de `toast()`. Una región con nombre y aria-live:
  un lector de pantalla los lee sin mover el foco (los errores, como alerta).
  Pasar el ratón o enfocar un aviso pausa su cuenta atrás (WCAG 2.2.1).
  Va en la capa superior del navegador para quedar sobre el resto de la página.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";
  import { toast, toasts, type Toast } from "$lib/toast.svelte";

  const L = useLabels();
  const {
    position = "bottom-right",
    label = L.notifications,
    dismissLabel = L.dismiss,
    class: className = "",
  }: {
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
    /** Nombre de la región. */
    label?: string;
    dismissLabel?: string;
    class?: string;
  } = $props();

  let region: HTMLElement | undefined = $state();

  // Cuenta atrás por aviso, pausable.
  const relojes = new Map<number, { restante: number; desde: number; timer?: ReturnType<typeof setTimeout> }>();

  function arrancar(t: Toast) {
    const r = relojes.get(t.id) ?? { restante: t.duration ?? 5000, desde: 0 };
    relojes.set(t.id, r);
    // Ya corría (foco y ratón salen a la vez), o no caduca.
    if (r.timer || !Number.isFinite(r.restante)) return;
    r.desde = Date.now();
    r.timer = setTimeout(() => toast.dismiss(t.id), r.restante);
  }

  function pausar(t: Toast) {
    const r = relojes.get(t.id);
    if (!r?.timer) return;
    clearTimeout(r.timer);
    r.timer = undefined;
    r.restante -= Date.now() - r.desde;
  }

  // Avisos nuevos arrancan su reloj; los que se fueron sueltan el suyo.
  $effect(() => {
    const vivos = new Set(toasts.map((t) => t.id));
    for (const t of toasts) if (!relojes.has(t.id)) arrancar(t);
    for (const [id, r] of relojes) {
      if (!vivos.has(id)) {
        clearTimeout(r.timer);
        relojes.delete(id);
      }
    }
  });

  // Con avisos, la región sube a la capa superior (y vuelve arriba del todo con cada uno nuevo).
  $effect(() => {
    const r = region;
    const n = toasts.length;
    if (!r || typeof r.showPopover !== "function") return;
    try {
      if (r.matches(":popover-open")) r.hidePopover();
      if (n > 0) r.showPopover();
    } catch {
      // Sin Popover API: la región se queda fija con su z-index.
    }
  });
</script>

<section
  bind:this={region}
  popover="manual"
  aria-label={label}
  class={cn("ta-toaster", `ta-toaster--${position}`, className)}
>
  <ol class="ta-toaster-lista" aria-live="polite">
    {#each toasts as t (t.id)}
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <li
        class={cn("ta-toast", `ta-toast--${t.variant}`)}
        role={t.variant === "error" ? "alert" : undefined}
        onpointerenter={() => pausar(t)}
        onpointerleave={() => arrancar(t)}
        onfocusin={() => pausar(t)}
        onfocusout={() => arrancar(t)}
      >
        <div class="ta-toast-cuerpo">
          <p class="ta-toast-mensaje">{t.message}</p>
          {#if t.description}<p class="ta-toast-detalle">{t.description}</p>{/if}
        </div>
        {#if t.action}
          <button
            type="button"
            class="ta-toast-accion"
            onclick={() => {
              t.action?.onClick();
              toast.dismiss(t.id);
            }}>{t.action.label}</button
          >
        {/if}
        <button type="button" class="ta-toast-cerrar" aria-label={dismissLabel} onclick={() => toast.dismiss(t.id)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
        </button>
      </li>
    {/each}
  </ol>
</section>

<style>
  .ta-toaster {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 0;
    z-index: 70;
    width: min(24rem, calc(100vw - 2rem));
    background: transparent;
    border: none;
    overflow: visible;
    color: inherit;
  }

  .ta-toaster--bottom-right { right: 1rem; bottom: 1rem; }
  .ta-toaster--bottom-left { left: 1rem; bottom: 1rem; }
  .ta-toaster--top-right { right: 1rem; top: 1rem; }
  .ta-toaster--top-left { left: 1rem; top: 1rem; }
  .ta-toaster--top-center { top: 1rem; left: 50%; transform: translateX(-50%); }
  .ta-toaster--bottom-center { bottom: 1rem; left: 50%; transform: translateX(-50%); }

  .ta-toaster-lista {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .ta-toast {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 0.875rem;
    color: rgb(var(--ta-text));
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
    border-left-width: 3px;
    border-radius: var(--ta-radius);
    box-shadow: 0 12px 32px -8px rgb(0 0 0 / 0.45);
    animation: ta-toast-entra 0.18s ease-out;
  }

  .ta-toast--success { border-left-color: rgb(var(--ta-success)); }
  .ta-toast--error { border-left-color: rgb(var(--ta-danger)); }
  .ta-toast--warning { border-left-color: rgb(var(--ta-warning)); }
  .ta-toast--info { border-left-color: rgb(var(--ta-info)); }

  .ta-toast-cuerpo { flex: 1; min-width: 0; }
  .ta-toast-mensaje { margin: 0; font-size: 0.875rem; font-weight: 500; }
  .ta-toast-detalle { margin: 0.125rem 0 0; font-size: 0.8125rem; color: rgb(var(--ta-text-dim)); }

  .ta-toast-accion {
    padding: 0.25rem 0.5rem;
    font: inherit;
    font-size: 0.75rem;
    font-weight: 600;
    color: rgb(var(--ta-accent-hover));
    background: none;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }

  .ta-toast-cerrar {
    padding: 0.125rem;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-toast-cerrar:hover { color: rgb(var(--ta-text)); }
  .ta-toast-accion:focus-visible,
  .ta-toast-cerrar:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); outline-offset: 2px; }

  @keyframes ta-toast-entra {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: none; }
  }

  @media (prefers-reduced-motion: reduce) {
    .ta-toast { animation: none; }
  }
</style>
