import axe from "axe-core";

/**
 * axe accessibility violations in `root`. jsdom computes no styles or
 * positions, so contrast is left out (the browser demo covers it).
 */
export async function axeViolations(root: Element) {
  const res = await axe.run(root, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
