/**
 * FlowNode's tokens are read with a fallback, never declared on the node itself: a declaration
 * there would win over the value an ancestor sets (a builder's own glow), so the token would do
 * nothing.
 */
import fs from "node:fs";

import { compile } from "svelte/compiler";

const file = "src/lib/components/flow-node.svelte";
const css = compile(fs.readFileSync(file, "utf8"), { filename: file, generate: "client", css: "external" }).css?.code ?? "";

describe("FlowNode tokens", () => {
  it.each(["--ta-flow-node-glow", "--ta-flow-node-tone"])("%s is read with a fallback and not declared by the node", (token) => {
    expect(css).not.toMatch(new RegExp(`${token}\s*:`));
    expect(css).toContain(`var(${token},`);
  });
});
