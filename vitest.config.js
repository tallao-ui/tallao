/**
 * Dos proyectos de tests:
 *   dom: componentes montados en happy-dom (comportamiento, teclado, axe).
 *   ssr: los mismos componentes compilados para servidor y renderizados con
 *        svelte/server en Node, sin `window`, como en SvelteKit.
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
          environment: "happy-dom",
          globals: true,
          include: ["tests/dom/**/*.test.ts"],
          setupFiles: ["tests/setup.ts"],
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
