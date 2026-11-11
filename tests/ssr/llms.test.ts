/**
 * llms.txt is generated from the component sources (`pnpm llms`). This keeps it from going
 * stale: a component, a prop or a header comment that changes without regenerating it fails here.
 */
import fs from "node:fs";

// @ts-expect-error a plain Node script, with no type declarations
import { generate, isCurrent } from "../../scripts/llms.mjs";

describe("llms.txt", () => {
  const { text, count } = generate() as { text: string; count: number };

  it("is up to date with the sources (run `pnpm llms` if this fails)", () => {
    expect(isCurrent()).toBe(true);
  });

  it("lists every exported component with a usage example and its props", () => {
    const index = fs.readFileSync("src/lib/components/index.ts", "utf8");
    const exported = [...index.matchAll(/export \{ default as (\w+)/g)].map((m) => m[1]);
    expect(count).toBe(exported.length + 2);
    for (const name of exported) expect(text, name).toContain(`### ${name}\n`);
    expect(text).toContain("### GameMap\n");
    expect(text).toContain("### CodeEditor\n");
    // Types and doc comments come through, also for the inline `$props()` style.
    expect(text).toContain('- `variant?: "primary" | "secondary" | "danger" | "danger-ghost" | "ghost" | "outline" | "soft"`');
    expect(text).toContain("- `rowKey: keyof T | ((row: T) => string)` — Field or function that gives each row's unique key.");
    expect(text).toContain("- `title: string` — What will happen if approved, as one sentence.");
    // The example is the header comment's own snippet when it has one.
    expect(text).toMatch(/### ApprovalCard\n\n[^\n]+\n\n```svelte\n<ApprovalCard\n {2}requester="Publisher agent"/);
    // Every entry has a fenced example.
    expect(text.match(/^### /gm)!.length).toBe(text.match(/^```svelte$/gm)!.length - 1);
  });
});
