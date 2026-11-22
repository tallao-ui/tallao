<!-- layout: wide -->
<script lang="ts">
  import { CodeDiff } from "tallao";

  const before = `export function dashCooldown(character: string) {
  if (character === "kaela") return 4;
  return 6;
}

export const resetOnTakedown = true;
`;
  const after = `export function dashCooldown(character: string) {
  if (character === "kaela") return 5;
  return 6;
}

export const resetOnTakedown = false;
`;
  let mode = $state<"unified" | "split">("split");
</script>

<div style="display: grid; gap: 0.75rem">
  <label style="font-size: 0.875rem">
    View
    <select bind:value={mode}>
      <option value="split">Split</option>
      <option value="unified">Unified</option>
    </select>
  </label>
  <CodeDiff {before} {after} {mode} beforeLabel="patch-1.1" afterLabel="patch-1.2" ariaLabel="Changes to dash.ts" />
</div>
