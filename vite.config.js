import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // "$lib" as in SvelteKit: components need no changes when ported.
    alias: { $lib: path.resolve("./src/lib") },
  },
  // The demo; svelte-package builds the package into dist/.
  build: { outDir: "demo-dist" },
});
