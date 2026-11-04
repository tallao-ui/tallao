// La hidratación se prueba contra `vite dev`: SvelteKit renderiza cada petición en el servidor
// y Svelte, en modo desarrollo, avisa en consola de cualquier desajuste (en producción lo
// arregla en silencio, así que ahí no se vería).
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 60_000,
  use: { baseURL: "http://127.0.0.1:4396" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev --host 127.0.0.1",
    url: "http://127.0.0.1:4396",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
