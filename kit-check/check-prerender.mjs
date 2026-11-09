#!/usr/bin/env node
/**
 * Checks the HTML that SvelteKit prerendered (server render with the packaged tallao).
 *
 * - The pages exist and carry the components' markup (real SSR, not an empty page
 *   painted in the browser).
 * - Nothing carries over from one request to another: /other sets the texts to Spanish and
 *   calls toast() while rendering; the home page stays in English and no page has that toast.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const build = join(import.meta.dirname, "build");
const html = (page) => readFileSync(join(build, page), "utf8");
const home = html("index.html");
const other = html("other.html");

const failures = [];
const must = (cond, msg) => cond || failures.push(msg);

must(home.includes("tallao in SvelteKit"), "the home page was not rendered on the server");
for (const marker of ['role="tablist"', 'role="switch"', 'role="combobox"', 'aria-haspopup="menu"', "<details", 'role="progressbar"', "<table", 'data-row="1"', "<article"])
  must(home.includes(marker), `${marker} is missing from the home page HTML`);
must(/id="ta-tabs-[^"]+-a"/.test(home), "Tabs has no ids in the server HTML");
must(home.includes('aria-label="Dismiss"'), "the home page should be in English");
must(!home.includes("Descartar"), "the Spanish texts of /other leaked into the home page");
must(other.includes('aria-label="Descartar"'), "/other did not come out in Spanish");
must(!home.includes("toast-from-the-server") && !other.includes("toast-from-the-server"), "a server toast() ended up in the HTML");

if (failures.length) {
  console.error(`check-prerender: ${failures.length} failure(s)\n- ${failures.join("\n- ")}`);
  process.exit(1);
}
console.log("check-prerender: the server HTML is complete and shares no state between pages");
