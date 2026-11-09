// Hydration is tested against `vite dev`: SvelteKit renders each request on the server
// and Svelte, in development mode, warns in the console about any mismatch (in production it
// fixes it silently, so it would not show there).
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
