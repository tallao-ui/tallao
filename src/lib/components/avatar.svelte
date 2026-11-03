<!--
  tallao — Avatar
  Foto de una persona o agente con sus iniciales de respaldo: si no hay `src`
  o la imagen falla, quedan las iniciales sobre un color estable (sale del
  nombre, así la misma persona tiene siempre el mismo). `name` es su nombre
  accesible; con `decorative` se oculta (cuando el nombre ya está al lado).
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  const {
    name,
    src,
    size = "md",
    shape = "circle",
    decorative = false,
    /** Insignia en la esquina (p. ej. «IA» para un agente). */
    badge,
    class: className = "",
  }: {
    name: string;
    src?: string | null;
    size?: "sm" | "md" | "lg";
    shape?: "circle" | "square";
    decorative?: boolean;
    badge?: string;
    class?: string;
  } = $props();

  let fallo = $state(false);
  // Una imagen nueva merece otro intento.
  $effect(() => {
    void src;
    fallo = false;
  });

  const iniciales = $derived(
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
  const tono = $derived([...name].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
</script>

<span
  class={cn("ta-avatar", `ta-avatar--${size}`, `ta-avatar--${shape}`, className)}
  role={decorative ? undefined : "img"}
  aria-label={decorative ? undefined : name}
  aria-hidden={decorative ? "true" : undefined}
  style:--ta-avatar-tono={tono}
>
  {#if src && !fallo}
    <img {src} alt="" onerror={() => (fallo = true)} />
  {:else}
    <span class="ta-avatar-iniciales" aria-hidden="true">{iniciales}</span>
  {/if}
  {#if badge}<span class="ta-avatar-insignia" aria-hidden="true">{badge}</span>{/if}
</span>

<style>
  .ta-avatar {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: white;
    background: hsl(var(--ta-avatar-tono) 45% 40%);
    font-weight: 600;
    user-select: none;
  }

  .ta-avatar--sm { width: 1.5rem; height: 1.5rem; font-size: 0.625rem; }
  .ta-avatar--md { width: 2.25rem; height: 2.25rem; font-size: 0.8125rem; }
  .ta-avatar--lg { width: 3rem; height: 3rem; font-size: 1rem; }

  .ta-avatar--circle,
  .ta-avatar--circle img { border-radius: 9999px; }
  .ta-avatar--square,
  .ta-avatar--square img { border-radius: var(--ta-radius); }

  .ta-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .ta-avatar-insignia {
    position: absolute;
    right: -0.25rem;
    bottom: -0.25rem;
    padding: 0 0.25rem;
    font-size: 0.5625rem;
    line-height: 1rem;
    color: white;
    background: rgb(var(--ta-accent));
    border: 2px solid rgb(var(--ta-bg));
    border-radius: 9999px;
  }
</style>
