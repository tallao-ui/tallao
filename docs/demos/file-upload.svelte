<!-- layout: stack -->
<script lang="ts">
  import { FileUpload, type FileRejection } from "tallao";

  let files = $state<File[]>([]);
  let rejected = $state<FileRejection[]>([]);
</script>

<FileUpload
  bind:files
  multiple
  accept="image/*,.pdf"
  maxSize={5 * 1024 * 1024}
  maxFiles={4}
  previews
  onreject={(r) => (rejected = r)}
  onfiles={() => (rejected = [])}
/>
<p style="font-size: 0.75rem; color: rgb(var(--ta-text-dim))">
  {files.length} file(s), {Math.round(files.reduce((n, f) => n + f.size, 0) / 1024)} KB. Images and PDFs up to 5 MB.
  {#if rejected.length}Rejected: {rejected.map((r) => `${r.file.name} (${r.reason})`).join(", ")}{/if}
</p>
