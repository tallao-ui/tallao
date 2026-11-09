/**
 * Two test projects:
 *   dom: components mounted in jsdom (behaviour, keyboard, axe).
 *   ssr: the same components compiled for the server and rendered with
 *        svelte/server in Node, without `window`, as in SvelteKit.
 */
import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { svelteTesting } from "@testing-library/svelte/vite";
import { defineConfig } from "vitest/config";

const alias = { $lib: path.resolve("./src/lib") };

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [svelte(), svelteTesting()],
        resolve: { alias },
        test: {
          name: "dom",
          environment: "jsdom",
          globals: true,
          include: ["tests/dom/**/*.test.ts"],
          setupFiles: ["tests/setup.ts"],
          // jsdom is slower than happy-dom: the keyboard and axe tests take longer than 5 s.
          testTimeout: 30_000,
        },
      },
      {
        plugins: [svelte()],
        resolve: { alias },
        test: { name: "ssr", environment: "node", globals: true, include: ["tests/ssr/**/*.test.ts"] },
      },
    ],
  },
});
