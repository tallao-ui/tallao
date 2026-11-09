// SvelteKit 3: the configuration goes in the plugin (there is no svelte.config.js anymore).
// Static prerender: `vite build` renders each page on the server (Node), as SvelteKit
// would in production, and check-prerender.mjs checks that HTML.
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// `fallback`: /form and /schema have a server action and are not prerendered.
export default defineConfig({
  plugins: [sveltekit({ adapter: adapter({ fallback: "200.html" }) })],
  // CodeMirror is imported when the CodeEditor mounts. Without this, `vite dev` discovers it
  // on the first visit to /schema, re-bundles it and reloads every open page:
  // a test running at the same time in another worker failed when it lost its page.
  optimizeDeps: {
    include: [
      "@codemirror/state",
      "@codemirror/view",
      "@codemirror/commands",
      "@codemirror/language",
      "@codemirror/lang-markdown",
      "@lezer/highlight",
    ],
  },
});
