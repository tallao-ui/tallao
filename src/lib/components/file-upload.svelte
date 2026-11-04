<!--
  tallao — FileUpload
  Elegir archivos con el botón o soltándolos en la zona. Debajo hay un
  <input type="file"> de verdad (oculto a la vista, no al teclado): Tab llega a él,
  Enter o Espacio abren el selector del sistema, y con `name` los archivos se
  envían en un <form> nativo, también los que se sueltan (se copian al input).
  Lo que no cumple `accept`, `maxSize` o `maxFiles` no entra: se dice por qué.
-->
<script lang="ts" module>
  export interface FileRejection {
    file: File;
    reason: "type" | "size" | "count";
  }

  /** «1.4 MB». */
  export function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    const unidades = ["KB", "MB", "GB"];
    let v = n / 1024;
    let i = 0;
    while (v >= 1024 && i < unidades.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(v < 10 ? 1 : 0)} ${unidades[i]}`;
  }
</script>

<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  const L = useLabels();
  let {
    files = $bindable([]),
    name,
    accept,
    multiple = false,
    /** Tamaño máximo por archivo, en bytes. */
    maxSize,
    maxFiles,
    disabled = false,
    required = false,
    chooseLabel = L.chooseFiles,
    dropLabel = L.dropFiles,
    removeLabel = (nombre: string) => `${L.remove} ${nombre}`,
    rejectionText = (r: FileRejection) =>
      r.reason === "type"
        ? `${r.file.name}: type not allowed`
        : r.reason === "size"
          ? `${r.file.name}: larger than ${formatBytes(maxSize ?? 0)}`
          : `${r.file.name}: too many files`,
    class: className = "",
    onfiles,
    onreject,
  }: {
    files?: File[];
    name?: string;
    /** Como el atributo nativo: «image/*,.pdf». */
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    required?: boolean;
    chooseLabel?: string;
    dropLabel?: string;
    removeLabel?: (name: string) => string;
    rejectionText?: (r: FileRejection) => string;
    class?: string;
    onfiles?: (files: File[]) => void;
    onreject?: (rejected: FileRejection[]) => void;
  } = $props();

  const id = $props.id();
  let entrada: HTMLInputElement | undefined = $state();
  let encima = $state(false);
  let rechazados = $state<FileRejection[]>([]);

  /** ¿Cumple `accept`? Tipos («image/png»), familias («image/*») o extensiones («.pdf»). */
  function aceptado(f: File) {
    if (!accept) return true;
    return accept
      .split(",")
      .map((a) => a.trim().toLowerCase())
      .filter(Boolean)
      .some((a) =>
        a.startsWith(".")
          ? f.name.toLowerCase().endsWith(a)
          : a.endsWith("/*")
            ? f.type.toLowerCase().startsWith(a.slice(0, -1))
            : f.type.toLowerCase() === a
      );
  }

  /** El input nativo refleja la lista, para que un formulario envíe también lo soltado. */
  function reflejar(lista: File[]) {
    if (!entrada || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      for (const f of lista) dt.items.add(f);
      entrada.files = dt.files;
    } catch {
      // Navegador sin DataTransfer construible: lo soltado no viaja en el form nativo.
    }
  }

  function anadir(nuevos: File[]) {
    if (disabled) return;
    const fuera: FileRejection[] = [];
    let base = multiple ? [...files] : [];
    for (const f of nuevos) {
      if (!aceptado(f)) fuera.push({ file: f, reason: "type" });
      else if (maxSize != null && f.size > maxSize) fuera.push({ file: f, reason: "size" });
      else if (maxFiles != null && base.length >= maxFiles) fuera.push({ file: f, reason: "count" });
      else if (multiple) base.push(f);
      else base = [f];
    }
    rechazados = fuera;
    if (fuera.length) onreject?.(fuera);
    files = base;
    reflejar(base);
    onfiles?.(base);
  }

  function quitar(i: number) {
    files = files.filter((_, j) => j !== i);
    reflejar(files);
    onfiles?.(files);
    entrada?.focus();
  }

  function soltar(e: DragEvent) {
    e.preventDefault();
    encima = false;
    anadir([...(e.dataTransfer?.files ?? [])]);
  }
</script>

<div class={cn("ta-upload", className)}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="ta-upload-zona"
    class:ta-upload-zona--encima={encima}
    class:ta-upload-zona--off={disabled}
    ondragover={(e) => {
      e.preventDefault();
      if (!disabled) encima = true;
    }}
    ondragleave={() => (encima = false)}
    ondrop={soltar}
  >
    <input
      bind:this={entrada}
      id={`${id}-input`}
      type="file"
      class="ta-upload-input"
      {name}
      {accept}
      {multiple}
      {disabled}
      {required}
      aria-describedby={rechazados.length ? `${id}-rechazos` : undefined}
      onchange={(e) => anadir([...((e.currentTarget as HTMLInputElement).files ?? [])])}
    />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
    <label for={`${id}-input`} class="ta-upload-elegir">{chooseLabel}</label>
    <span class="ta-upload-soltar" aria-hidden="true">{dropLabel}</span>
  </div>

  {#if rechazados.length}
    <ul class="ta-upload-rechazos" id={`${id}-rechazos`} role="alert">
      {#each rechazados as r, i (i)}<li>{rejectionText(r)}</li>{/each}
    </ul>
  {/if}

  {#if files.length}
    <ul class="ta-upload-lista">
      {#each files as f, i (`${f.name}-${f.size}-${i}`)}
        <li class="ta-upload-archivo">
          <span class="ta-upload-nombre">{f.name}</span>
          <span class="ta-upload-tamano">{formatBytes(f.size)}</span>
          <button type="button" class="ta-upload-quitar" aria-label={removeLabel(f.name)} {disabled} onclick={() => quitar(i)}>×</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .ta-upload { display: flex; flex-direction: column; gap: 0.5rem; }

  .ta-upload-zona {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1.25rem 1rem;
    color: rgb(var(--ta-text-dim));
    text-align: center;
    border: 1px dashed rgb(var(--ta-muted));
    border-radius: var(--ta-radius-lg);
    transition: border-color 0.15s, background-color 0.15s;
  }
  .ta-upload-zona--encima {
    border-color: rgb(var(--ta-accent));
    background: rgb(var(--ta-accent) / 0.08);
  }
  .ta-upload-zona:focus-within {
    border-color: rgb(var(--ta-accent) / 0.7);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }
  .ta-upload-zona--off { opacity: 0.5; }

  /* Oculto a la vista, no al teclado ni a los lectores: el control real es este. */
  .ta-upload-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    overflow: hidden;
  }

  .ta-upload-elegir {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--ta-accent-hover));
    cursor: pointer;
  }
  .ta-upload-zona--off .ta-upload-elegir { cursor: not-allowed; }

  .ta-upload-soltar { font-size: 0.75rem; }

  .ta-upload-rechazos {
    margin: 0;
    padding-left: 1rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-danger));
  }

  .ta-upload-lista { display: flex; flex-direction: column; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }

  .ta-upload-archivo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    background: rgb(var(--ta-surface) / 0.6);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }
  .ta-upload-nombre { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ta-upload-tamano { color: rgb(var(--ta-text-dim)); font-variant-numeric: tabular-nums; }
  .ta-upload-quitar {
    padding: 0 0.35rem;
    font: inherit;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-upload-quitar:hover { color: rgb(var(--ta-danger)); }
  .ta-upload-quitar:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); }
</style>
