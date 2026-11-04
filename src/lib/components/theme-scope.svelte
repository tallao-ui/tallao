<!--
  tallao — ThemeScope
  Define los tokens `--ta-*` en un contenedor en vez de en `:root`.

  Hace falta donde tokens.css no llega: dentro de un Shadow DOM (una vista de
  kon en el admin de Kitsuden es un custom element) `:root` no aplica, pero las
  variables del documento SÍ cruzan por herencia. Con `source="kitsuden"` cada
  token toma la variable del admin (`--kitsuden-*`, mismos canales RGB), así la
  vista sigue el tema del admin; sin el admin, caen al tema oscuro de tallao.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Props {
    source?: "kitsuden" | "tallao";
    class?: string;
    children?: import("svelte").Snippet;
  }

  const { source = "kitsuden", class: className = "", children }: Props = $props();
</script>

<div class={cn("ta-scope", `ta-scope--${source}`, className)}>
  {@render children?.()}
</div>

<style>
  /* Base común: lo que base.css pone en <body>. */
  .ta-scope {
    color: rgb(var(--ta-text));
    font-family: var(--ta-font-sans);
    font-size: 0.875rem;
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
  }
  .ta-scope :global(*),
  .ta-scope :global(*::before),
  .ta-scope :global(*::after) {
    box-sizing: border-box;
  }

  /* Valores propios de tallao (tema oscuro), para usarlo fuera de un admin. */
  .ta-scope--tallao {
    --ta-accent: 168 85 247;
    --ta-accent-hover: 192 132 252;
    --ta-accent-dim: 126 58 194;
    --ta-accent-2: 255 45 111;
    --ta-accent-2-dim: 214 31 90;
    --ta-success: 52 211 153;
    --ta-warning: 251 191 36;
    --ta-info: 96 165 250;
    --ta-danger: 248 113 113;
    --ta-bg: 9 9 11;
    --ta-surface: 24 24 27;
    --ta-elevated: 39 39 42;
    --ta-border: 39 39 42;
    --ta-muted: 63 63 70;
    --ta-subtle: 82 82 91;
    --ta-text: 250 250 250;
    --ta-text-dim: 161 161 170;
    --ta-backdrop: 0 0 0;
    --ta-radius-sm: 0.375rem;
    --ta-radius: 0.5rem;
    --ta-radius-lg: 0.75rem;
    --ta-font-sans: "Inter", system-ui, -apple-system, sans-serif;
    --ta-font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
    --ta-series-1: 57 135 229;
    --ta-series-2: 217 89 38;
    --ta-series-3: 25 158 112;
    --ta-series-4: 201 133 0;
    --ta-series-5: 213 81 129;
    --ta-series-6: 0 131 0;
    --ta-series-7: 144 133 233;
    --ta-series-8: 230 103 103;
  }

  /*
   * Puente con el admin de Kitsuden (packages/admin/src/style.css). El admin
   * llama `card` a lo que tallao llama `surface`, y no tiene `info` ni
   * `elevated`: esos se quedan con el valor de tallao o con su vecino.
   */
  .ta-scope--kitsuden {
    --ta-accent: var(--kitsuden-accent, 168 85 247);
    --ta-accent-hover: var(--kitsuden-accent-hover, 192 132 252);
    --ta-accent-dim: var(--kitsuden-accent-dim, 126 58 194);
    --ta-accent-2: var(--kitsuden-accent-2, 255 45 111);
    --ta-accent-2-dim: var(--kitsuden-accent-2-dim, 214 31 90);
    --ta-success: var(--kitsuden-green, 52 211 153);
    --ta-warning: var(--kitsuden-amber, 251 191 36);
    --ta-info: 96 165 250;
    --ta-danger: var(--kitsuden-danger, 248 113 113);
    --ta-bg: var(--kitsuden-bg, 9 9 11);
    --ta-surface: var(--kitsuden-card, 24 24 27);
    --ta-elevated: var(--kitsuden-border, 39 39 42);
    --ta-border: var(--kitsuden-border, 39 39 42);
    --ta-muted: var(--kitsuden-muted, 63 63 70);
    --ta-subtle: var(--kitsuden-subtle, 82 82 91);
    --ta-text: var(--kitsuden-text, 250 250 250);
    --ta-text-dim: var(--kitsuden-text-dim, 161 161 170);
    --ta-backdrop: 0 0 0;
    --ta-radius-sm: 0.375rem;
    --ta-radius: 0.5rem;
    --ta-radius-lg: 0.75rem;
    --ta-font-sans: var(--kitsuden-font-sans, "Inter", system-ui, -apple-system, sans-serif);
    --ta-font-mono: var(--kitsuden-font-mono, "JetBrains Mono", "Fira Code", ui-monospace, monospace);
    /* El admin no define series de gráficas: van las de tallao para fondo oscuro. */
    --ta-series-1: 57 135 229;
    --ta-series-2: 217 89 38;
    --ta-series-3: 25 158 112;
    --ta-series-4: 201 133 0;
    --ta-series-5: 213 81 129;
    --ta-series-6: 0 131 0;
    --ta-series-7: 144 133 233;
    --ta-series-8: 230 103 103;
  }
</style>
