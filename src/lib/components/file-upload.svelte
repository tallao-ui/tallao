<!--
  tallao — FileUpload
  Choose files with the button or by dropping them on the zone. Underneath there is
  a real <input type="file"> (hidden from view, not from the keyboard): Tab reaches it,
  Enter or Space open the system picker, and with `name` the files are submitted
  in a native <form>, including dropped ones (they are copied to the input).
  Whatever does not meet `accept`, `maxSize` or `maxFiles` is left out, with the reason.

  - `paste`: files on the clipboard are taken too (a screenshot copied with Print Screen,
    an image copied from another page). `true` listens while focus is inside the zone;
    `"document"` listens on the whole page, except while the user pastes into a text field
    that would take the paste itself. A paste with only text is never taken. Pasted files
    with no useful name ("image.png") are named "Pasted image 1.png", "Pasted image 2.png"…
  - `previews`: image files get a thumbnail in the list (an object URL, freed when the file is
    removed or the component goes away). The thumbnail is decorative: the name still says
    which file it is.
-->
<script lang="ts" module>
  export interface FileRejection {
    file: File;
    reason: "type" | "size" | "count";
  }

  /** "1.4 MB". */
  export function formatBytes(n: number) {
    if (n < 1024) return `${n} B`;
    const units = ["KB", "MB", "GB"];
    let v = n / 1024;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
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
    /** Maximum size per file, in bytes. */
    maxSize,
    maxFiles,
    disabled = false,
    required = false,
    chooseLabel = L.chooseFiles,
    dropLabel = L.dropFiles,
    paste = false,
    previews = false,
    pasteLabel = L.pasteFiles,
    pastedName = (n: number) => L.pastedFileName.replace("{n}", String(n)),
    removeLabel = (fileName: string) => `${L.remove} ${fileName}`,
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
    /** Like the native attribute: "image/*,.pdf". */
    accept?: string;
    multiple?: boolean;
    maxSize?: number;
    maxFiles?: number;
    disabled?: boolean;
    required?: boolean;
    chooseLabel?: string;
    dropLabel?: string;
    /** Takes files from the clipboard: `true` while focus is in the zone, `"document"` anywhere on the page. */
    paste?: boolean | "document";
    /** Shows a thumbnail for image files. */
    previews?: boolean;
    /** Hint shown under the drop text when `paste` is on. */
    pasteLabel?: string;
    /** Name for a pasted file that has none of its own (without extension). */
    pastedName?: (n: number) => string;
    removeLabel?: (name: string) => string;
    rejectionText?: (r: FileRejection) => string;
    class?: string;
    onfiles?: (files: File[]) => void;
    onreject?: (rejected: FileRejection[]) => void;
  } = $props();

  const id = $props.id();
  let inputEl: HTMLInputElement | undefined = $state();
  let zoneEl: HTMLElement | undefined = $state();
  let isOver = $state(false);
  let rejected = $state<FileRejection[]>([]);

  /** Does it meet `accept`? Types ("image/png"), families ("image/*") or extensions (".pdf"). */
  function isAccepted(f: File) {
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

  /** The native input mirrors the list, so a form also submits what was dropped. */
  function syncInput(list: File[]) {
    if (!inputEl || typeof DataTransfer === "undefined") return;
    try {
      const dt = new DataTransfer();
      for (const f of list) dt.items.add(f);
      inputEl.files = dt.files;
    } catch {
      // Browser without a constructible DataTransfer: dropped files do not travel in the native form.
    }
  }

  function addFiles(incoming: File[]) {
    if (disabled) return;
    const rejections: FileRejection[] = [];
    let base = multiple ? [...files] : [];
    for (const f of incoming) {
      if (!isAccepted(f)) rejections.push({ file: f, reason: "type" });
      else if (maxSize != null && f.size > maxSize) rejections.push({ file: f, reason: "size" });
      else if (maxFiles != null && base.length >= maxFiles) rejections.push({ file: f, reason: "count" });
      else if (multiple) base.push(f);
      else base = [f];
    }
    rejected = rejections;
    if (rejections.length) onreject?.(rejections);
    files = base;
    syncInput(base);
    onfiles?.(base);
  }

  function removeAt(i: number) {
    files = files.filter((_, j) => j !== i);
    syncInput(files);
    onfiles?.(files);
    inputEl?.focus();
  }

  // Pasted images usually arrive as "image.png": give them a name the user can tell apart.
  let pastedCount = 0;
  function fromClipboard(data: DataTransfer | null): File[] {
    const out: File[] = [];
    for (const item of data?.items ?? []) {
      if (item.kind !== "file") continue;
      const f = item.getAsFile();
      if (!f) continue;
      if (!f.name || /^image\.\w+$/i.test(f.name)) {
        const ext = (f.type.split("/")[1] || "png").replace("jpeg", "jpg");
        out.push(new File([f], `${pastedName(++pastedCount)}.${ext}`, { type: f.type, lastModified: f.lastModified }));
      } else out.push(f);
    }
    return out;
  }

  function onPaste(e: ClipboardEvent) {
    if (!paste || disabled) return;
    const pasted = fromClipboard(e.clipboardData);
    if (!pasted.length) return; // only text: leave it to whoever has focus
    e.preventDefault();
    addFiles(pasted);
  }

  /** Is the target a field that takes text pastes itself? */
  function takesText(t: EventTarget | null) {
    const el = t as HTMLElement | null;
    if (!el || !el.tagName) return false;
    if (el.isContentEditable) return true;
    if (el.tagName === "TEXTAREA") return true;
    return el.tagName === "INPUT" && !["file", "checkbox", "radio", "button", "submit", "range", "color"].includes((el as HTMLInputElement).type);
  }

  $effect(() => {
    if (paste !== "document") return;
    const listener = (e: ClipboardEvent) => {
      if (zoneEl?.contains(e.target as Node)) return; // the zone's own handler takes it
      if (takesText(e.target) && !fromClipboard(e.clipboardData).length) return;
      onPaste(e);
    };
    document.addEventListener("paste", listener);
    return () => document.removeEventListener("paste", listener);
  });

  // Thumbnails: one object URL per file, freed when the file leaves or the component unmounts.
  const urls = new Map<File, string>();
  const thumbs = $derived.by(() => {
    if (!previews || typeof URL === "undefined" || !URL.createObjectURL) return [] as (string | undefined)[];
    for (const [f, u] of urls) if (!files.includes(f)) (URL.revokeObjectURL(u), urls.delete(f));
    return files.map((f) => {
      if (!f.type.startsWith("image/")) return undefined;
      if (!urls.has(f)) urls.set(f, URL.createObjectURL(f));
      return urls.get(f);
    });
  });
  $effect(() => () => {
    for (const u of urls.values()) URL.revokeObjectURL(u);
    urls.clear();
  });

  function onDrop(e: DragEvent) {
    e.preventDefault();
    isOver = false;
    addFiles([...(e.dataTransfer?.files ?? [])]);
  }
</script>

<div class={cn("ta-upload", className)}>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={zoneEl}
    class="ta-upload-zone"
    class:ta-upload-zone--over={isOver}
    class:ta-upload-zone--off={disabled}
    ondragover={(e) => {
      e.preventDefault();
      if (!disabled) isOver = true;
    }}
    ondragleave={() => (isOver = false)}
    ondrop={onDrop}
    onpaste={onPaste}
  >
    <input
      bind:this={inputEl}
      id={`${id}-input`}
      type="file"
      class="ta-upload-input"
      {name}
      {accept}
      {multiple}
      {disabled}
      {required}
      aria-describedby={[paste ? `${id}-paste` : "", rejected.length ? `${id}-rejections` : ""].filter(Boolean).join(" ") || undefined}
      onchange={(e) => addFiles([...((e.currentTarget as HTMLInputElement).files ?? [])])}
    />
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m17 8-5-5-5 5" /><path d="M12 3v12" /></svg>
    <label for={`${id}-input`} class="ta-upload-choose">{chooseLabel}</label>
    <span class="ta-upload-drop" aria-hidden="true">{dropLabel}</span>
    {#if paste}<span class="ta-upload-drop" id={`${id}-paste`}>{pasteLabel}</span>{/if}
  </div>

  {#if rejected.length}
    <ul class="ta-upload-rejections" id={`${id}-rejections`} role="alert">
      {#each rejected as r, i (i)}<li>{rejectionText(r)}</li>{/each}
    </ul>
  {/if}

  {#if files.length}
    <ul class="ta-upload-list">
      {#each files as f, i (`${f.name}-${f.size}-${i}`)}
        <li class="ta-upload-file">
          {#if thumbs[i]}<img class="ta-upload-thumb" src={thumbs[i]} alt="" />{/if}
          <span class="ta-upload-name">{f.name}</span>
          <span class="ta-upload-size">{formatBytes(f.size)}</span>
          <button type="button" class="ta-upload-remove" aria-label={removeLabel(f.name)} {disabled} onclick={() => removeAt(i)}>×</button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .ta-upload { display: flex; flex-direction: column; gap: 0.5rem; }

  .ta-upload-zone {
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
  .ta-upload-zone--over {
    border-color: rgb(var(--ta-accent));
    background: rgb(var(--ta-accent) / 0.08);
  }
  .ta-upload-zone:focus-within {
    border-color: rgb(var(--ta-accent) / 0.7);
    box-shadow: 0 0 0 2px rgb(var(--ta-accent) / 0.15);
  }
  .ta-upload-zone--off { opacity: 0.5; }

  /* Hidden from view, not from the keyboard or screen readers: this is the real control. */
  .ta-upload-input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    overflow: hidden;
  }

  .ta-upload-choose {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgb(var(--ta-accent-hover));
    cursor: pointer;
  }
  .ta-upload-zone--off .ta-upload-choose { cursor: not-allowed; }

  .ta-upload-drop { font-size: 0.75rem; }

  .ta-upload-rejections {
    margin: 0;
    padding-left: 1rem;
    font-size: 0.75rem;
    color: rgb(var(--ta-danger));
  }

  .ta-upload-list { display: flex; flex-direction: column; gap: 0.25rem; margin: 0; padding: 0; list-style: none; }

  .ta-upload-file {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem 0.5rem;
    font-size: 0.8125rem;
    background: rgb(var(--ta-surface) / 0.6);
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
  }
  .ta-upload-thumb {
    flex: none;
    width: 2.5rem;
    height: 2.5rem;
    object-fit: cover;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-sm);
    background: rgb(var(--ta-surface));
  }
  .ta-upload-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ta-upload-size { color: rgb(var(--ta-text-dim)); font-variant-numeric: tabular-nums; }
  .ta-upload-remove {
    padding: 0 0.35rem;
    font: inherit;
    color: rgb(var(--ta-text-dim));
    background: none;
    border: none;
    border-radius: var(--ta-radius-sm);
    cursor: pointer;
  }
  .ta-upload-remove:hover { color: rgb(var(--ta-danger)); }
  .ta-upload-remove:focus-visible { outline: 2px solid rgb(var(--ta-accent) / 0.6); }
  @media (pointer: coarse) {
    .ta-upload-choose { display: inline-block; }
    .ta-upload-choose { position: relative; }
    .ta-upload-choose::after { content: ""; position: absolute; top: 50%; left: 50%; width: max(100%, 2.75rem); height: max(100%, 2.75rem); transform: translate(-50%, -50%); }
    .ta-upload-remove { position: relative; }
    .ta-upload-remove::after { content: ""; position: absolute; top: 50%; left: 50%; width: max(100%, 2.75rem); height: max(100%, 2.75rem); transform: translate(-50%, -50%); }
  }
</style>
