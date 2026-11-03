import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // "$lib" igual que en SvelteKit: los componentes no cambian al portarlos.
    alias: { $lib: path.resolve("./src/lib") },
  },
});
