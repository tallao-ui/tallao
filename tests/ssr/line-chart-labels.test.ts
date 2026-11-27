/**
 * LineChart's x labels at its default width (640, what the server draws before it is measured):
 * the last label is always drawn, and no regular label is printed over it.
 */
import { render } from "svelte/server";

import LineChart from "$lib/components/line-chart.svelte";

/** The x of every axis label whose text starts with "L", in order. */
function labelXs(length: number): Array<{ text: string; x: number }> {
  const data = Array.from({ length }, (_, i) => ({ t: `L${i}`, v: i % 5 }));
  const { body } = render(LineChart, {
    props: { data, x: "t", series: [{ key: "v", label: "V" }], title: "Labels" },
  });
  return [...body.matchAll(/<text x="([\d.]+)"[^>]*class="ta-chart-axis"[^>]*>(L\d+)<\/text>/g)].map(
    (m) => ({ x: Number(m[1]), text: m[2]! })
  );
}

describe("LineChart x labels", () => {
  it("keeps the last label and leaves room before it", () => {
    for (const length of [7, 14, 30, 60, 61, 97]) {
      const labels = labelXs(length);
      expect(labels.at(-1)?.text).toBe(`L${length - 1}`);
      if (labels.length < 3) continue;
      const step = labels[1]!.x - labels[0]!.x;
      // The last label is anchored at its end: it needs about one and a half steps of room.
      expect(labels.at(-1)!.x - labels.at(-2)!.x).toBeGreaterThanOrEqual(step * 1.4);
    }
  });
});
