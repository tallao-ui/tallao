// SvelteKit 3: la configuración va en el plugin (ya no hay svelte.config.js).
// Prerender estático: `vite build` renderiza cada página en el servidor (Node), como haría
// SvelteKit en producción, y check-prerender.mjs revisa ese HTML.
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// `fallback`: /formulario y /esquema tienen una acción de servidor y no se prerenderizan.
export default defineConfig({
  plugins: [sveltekit({ adapter: adapter({ fallback: "200.html" }) })],
  // CodeMirror se importa al montar el CodeEditor. Sin esto, `vite dev` lo descubre en la
  // primera visita a /esquema, lo vuelve a empaquetar y recarga todas las páginas abiertas:
  // el test que corriera a la vez en otro worker fallaba al perder su página.
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
