import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";

const lib = path.resolve("./src/lib");

// The docs: a small Svelte app in docs/ that shows every component, live, with the code that makes
// it. It imports the kit the way a user does ("tallao", "tallao/motion"…), through these aliases.
// Built into site/docs/, next to the landing, and published with it.
export default defineConfig({
  root: "docs",
  base: "./",
  plugins: [
    svelte({
      onwarn(warning, defaultHandler) {
        // Code blocks and tables that scroll are focusable on purpose: a keyboard user can scroll them.
        if (warning.code === "a11y_no_noninteractive_tabindex") return;
        defaultHandler(warning);
      },
    }),
  ],
  resolve: {
    alias: [
      { find: /^tallao$/, replacement: path.join(lib, "index.ts") },
      { find: /^tallao\/motion$/, replacement: path.join(lib, "motion/index.ts") },
      { find: /^tallao\/map$/, replacement: path.join(lib, "map/index.ts") },
      { find: /^tallao\/code$/, replacement: path.join(lib, "code/index.ts") },
      { find: /^tallao\/tokens\.css$/, replacement: path.join(lib, "tokens.css") },
      { find: /^tallao\/base\.css$/, replacement: path.join(lib, "base.css") },
      { find: /^\$lib/, replacement: lib },
    ],
  },
  server: { fs: { allow: [".."] } },
  build: { outDir: "../site/docs", emptyOutDir: true, chunkSizeWarningLimit: 900 },
});
