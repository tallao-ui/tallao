// Lo leen svelte-package, svelte-check y el plugin de Vite: TypeScript en los componentes.
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

export default { preprocess: vitePreprocess() };
