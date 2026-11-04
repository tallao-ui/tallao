// SvelteKit 3: la configuración va en el plugin (ya no hay svelte.config.js).
// Prerender estático: `vite build` renderiza cada página en el servidor (Node), como haría
// SvelteKit en producción, y check-prerender.mjs revisa ese HTML.
import adapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// `fallback`: /formulario tiene una acción de servidor y no se prerenderiza.
export default defineConfig({ plugins: [sveltekit({ adapter: adapter({ fallback: "200.html" }) })] });
