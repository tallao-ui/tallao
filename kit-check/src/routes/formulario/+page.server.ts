// Una acción de formulario de SvelteKit que devuelve lo que recibió: así el test ve qué
// envían los controles de tallao, con y sin JavaScript.
import type { Actions } from "./$types";

export const prerender = false;

export const actions: Actions = {
  default: async ({ request }) => {
    const datos = await request.formData();
    const recibido: Record<string, string[]> = {};
    for (const [clave, valor] of datos) {
      (recibido[clave] ??= []).push(typeof valor === "string" ? valor : `archivo:${valor.name}`);
    }
    return { recibido };
  },
};
