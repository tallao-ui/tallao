/**
 * tallao dentro de SvelteKit: el servidor renderiza, el navegador hidrata, y después todo
 * responde. Cualquier aviso de hidratación, error de consola o excepción hace fallar el test.
 */
import { expect, test, type Page } from "@playwright/test";

function vigilar(page: Page) {
  const problemas: string[] = [];
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" || /hydrat/i.test(t)) problemas.push(`${m.type()}: ${t}`);
  });
  page.on("pageerror", (e) => problemas.push(`pageerror: ${e.message}`));
  return problemas;
}

async function abrir(page: Page, ruta: string) {
  await page.goto(ruta);
  // Hidratada: SvelteKit ha cargado su código y no quedan peticiones en vuelo.
  await page.waitForLoadState("networkidle");
}

test("the server's ids are the ones the browser keeps", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  const delServidor = [...html.matchAll(/id="(ta-tabs-[^"]+)"/g)].map((m) => m[1]);
  expect(delServidor.length).toBeGreaterThan(0);
  const problemas = vigilar(page);
  await abrir(page, "/");
  const enElNavegador = await page.locator('[id^="ta-tabs-"]').evaluateAll((els) => els.map((e) => e.id));
  expect(enElNavegador).toEqual(delServidor);
  expect(problemas).toEqual([]);
});

test("after hydration every component responds", async ({ page }) => {
  const problemas = vigilar(page);
  await abrir(page, "/");

  await page.getByRole("switch", { name: "Avisos" }).click();
  await expect(page.getByTestId("switch")).toHaveText("true");

  await page.getByRole("tab", { name: /Dos/ }).click();
  await expect(page.getByTestId("panel")).toHaveText("Panel b");

  await page.getByRole("button", { name: "Abrir diálogo" }).click();
  await expect(page.getByRole("dialog", { name: "Diálogo" })).toBeVisible();
  await expect(page.getByLabel("Dentro")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Diálogo" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Abrir diálogo" })).toBeFocused();

  await page.getByRole("button", { name: "Acciones" }).click();
  await expect(page.getByRole("menuitem", { name: "Editar" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("ultima")).toHaveText("borrar");

  const pais = page.getByRole("combobox", { name: "País" });
  await pais.fill("peru");
  await pais.press("Enter");
  await expect(page.getByTestId("pais")).toHaveText("pe");

  await page.getByRole("button", { name: "Filtros" }).click();
  await expect(page.getByRole("dialog", { name: "Filtros" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Toast" }).click();
  await expect(page.getByRole("region", { name: "Notifications" })).toContainText("Guardado");

  await page.keyboard.press("Control+k");
  await expect(page.getByRole("combobox", { name: "Command palette" })).toBeFocused();
  await page.keyboard.press("Escape");

  const ahri = page.getByRole("button", { name: "Ahri" });
  await ahri.focus();
  await page.keyboard.press(" ");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(" ");
  await expect(page.getByRole("group", { name: "Zona s" })).toContainText("Ahri");

  expect(problemas).toEqual([]);
});

test("labels follow each page on client navigation, and a server toast never shows", async ({ page }) => {
  const problemas = vigilar(page);
  await abrir(page, "/");
  await expect(page.getByRole("button", { name: "Dismiss" })).toBeVisible();
  await page.getByRole("link", { name: "Otra" }).click();
  await expect(page.getByRole("button", { name: "Descartar" })).toBeVisible();
  await page.getByRole("link", { name: "Inicio" }).click();
  await expect(page.getByRole("button", { name: "Dismiss" })).toBeVisible();
  // En el navegador /otra sí llama a toast() al montarse: el aviso es del cliente, no del HTML.
  await expect(page.locator("body")).not.toContainText("Descartar");
  expect(problemas).toEqual([]);
});
