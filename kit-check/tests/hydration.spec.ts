/**
 * tallao inside SvelteKit: the server renders, the browser hydrates, and then everything
 * responds. Any hydration warning, console error or exception fails the test.
 */
import { expect, test, type Page } from "@playwright/test";

function watch(page: Page) {
  const problems: string[] = [];
  page.on("console", (m) => {
    const t = m.text();
    if (m.type() === "error" || /hydrat/i.test(t)) problems.push(`${m.type()}: ${t}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

async function open(page: Page, route: string) {
  await page.goto(route);
  // Hydrated: SvelteKit has loaded its code and there are no requests in flight.
  await page.waitForLoadState("networkidle");
}

test("the server's ids are the ones the browser keeps", async ({ page, request }) => {
  const html = await (await request.get("/")).text();
  const fromServer = [...html.matchAll(/id="(ta-tabs-[^"]+)"/g)].map((m) => m[1]);
  expect(fromServer.length).toBeGreaterThan(0);
  const problems = watch(page);
  await open(page, "/");
  const inBrowser = await page.locator('[id^="ta-tabs-"]').evaluateAll((els) => els.map((e) => e.id));
  expect(inBrowser).toEqual(fromServer);
  expect(problems).toEqual([]);
});

test("after hydration every component responds", async ({ page }) => {
  const problems = watch(page);
  await open(page, "/");

  await page.getByRole("switch", { name: "Alerts" }).click();
  await expect(page.getByTestId("switch")).toHaveText("true");

  await page.getByRole("tab", { name: /Two/ }).click();
  await expect(page.getByTestId("panel")).toHaveText("Panel b");

  await page.getByRole("button", { name: "Open dialog" }).click();
  await expect(page.getByRole("dialog", { name: "Dialog" })).toBeVisible();
  await expect(page.getByLabel("Inside")).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Dialog" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Open dialog" })).toBeFocused();

  await page.getByRole("button", { name: "Actions" }).click();
  await expect(page.getByRole("menuitem", { name: "Edit" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("last")).toHaveText("delete");

  const country = page.getByRole("combobox", { name: "Country" });
  await country.fill("peru");
  await country.press("Enter");
  await expect(page.getByTestId("country")).toHaveText("pe");

  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Toast" }).click();
  await expect(page.getByRole("region", { name: "Notifications" })).toContainText("Saved");

  await page.keyboard.press("Control+k");
  await expect(page.getByRole("combobox", { name: "Command palette" })).toBeFocused();
  await page.keyboard.press("Escape");

  const ahri = page.getByRole("button", { name: "Ahri" });
  await ahri.focus();
  await page.keyboard.press(" ");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press(" ");
  await expect(page.getByRole("group", { name: "Zone s" })).toContainText("Ahri");

  expect(problems).toEqual([]);
});

test("labels follow each page on client navigation, and a server toast never shows", async ({ page }) => {
  const problems = watch(page);
  // The Alert's own button: /other's client toast also has a "Dismiss" and can still be on
  // screen when the test comes back to "/" (it lives 5 s), which made an unscoped locator flaky.
  const alertDismiss = (name: string) => page.locator(".ta-alert").getByRole("button", { name });
  await open(page, "/");
  await expect(alertDismiss("Dismiss")).toBeVisible();
  await page.getByRole("link", { name: "Other" }).click();
  await expect(alertDismiss("Descartar")).toBeVisible();
  await page.getByRole("link", { name: "Home" }).click();
  await expect(alertDismiss("Dismiss")).toBeVisible();
  // In the browser /other does call toast() when it mounts: the toast belongs to the client, not to the HTML.
  await expect(page.locator("body")).not.toContainText("Descartar");
  expect(problems).toEqual([]);
});

const EXPECTED = {
  alerts: ["on"],
  country: ["pe"],
  tags: ["bug", "ux"],
  date: ["2026-11-03"],
  "stats[hp]": ["100"],
};

test.describe("a SvelteKit form action receives every tallao control", () => {
  test("with JavaScript and use:enhance", async ({ page }) => {
    const problems = watch(page);
    await open(page, "/form");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByTestId("received")).toHaveText(JSON.stringify(EXPECTED));
    expect(problems).toEqual([]);
  });

  test.describe("without JavaScript (progressive enhancement)", () => {
    test.use({ javaScriptEnabled: false });
    test("the server-rendered form posts the same values", async ({ page }) => {
      await page.goto("/form");
      await page.getByRole("button", { name: "Send" }).click();
      await expect(page.getByTestId("received")).toHaveText(JSON.stringify(EXPECTED));
    });
  });
});

const EXPECTED_SCHEMA = {
  "post.title": ["Hello"],
  "post.status": ["live"],
  "post.level": ["3"],
  "post.publish": ["2026-11-04"],
  "post.active": ["true"],
  "post.tags": ["guide", "event"],
  body: ["# Notes"],
};

test.describe("SchemaForm as the form of a SvelteKit action", () => {
  test("with JavaScript: posts the schema's fields and the code editor", async ({ page }) => {
    const problems = watch(page);
    await open(page, "/schema");
    await expect(page.locator(".cm-content")).toContainText("# Notes");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.getByTestId("received")).toHaveText(JSON.stringify(EXPECTED_SCHEMA));
    expect(problems).toEqual([]);
  });

  test("with JavaScript: an invalid form never reaches the action", async ({ page }) => {
    const requests: string[] = [];
    page.on("request", (r) => r.method() === "POST" && requests.push(r.url()));
    await open(page, "/schema");
    const title = page.getByLabel(/Title/);
    await title.fill("ab");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(title).toBeFocused();
    await expect(title).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("received")).toHaveCount(0);
    expect(requests).toEqual([]);
  });

  test.describe("without JavaScript (progressive enhancement)", () => {
    test.use({ javaScriptEnabled: false });
    test("the server-rendered form posts the same values", async ({ page }) => {
      await page.goto("/schema");
      await page.getByRole("button", { name: "Send" }).click();
      await expect(page.getByTestId("received")).toHaveText(JSON.stringify(EXPECTED_SCHEMA));
    });
  });
});
