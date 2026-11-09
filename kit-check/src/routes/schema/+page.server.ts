// A SvelteKit form action that returns what it received: this way the test sees what
// tallao's controls submit, with and without JavaScript.
import type { Actions } from "./$types";

export const prerender = false;

export const actions: Actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const received: Record<string, string[]> = {};
    for (const [key, value] of data) {
      (received[key] ??= []).push(typeof value === "string" ? value : `file:${value.name}`);
    }
    return { received };
  },
};
