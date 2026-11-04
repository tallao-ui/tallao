#!/usr/bin/env node
/**
 * Revisa el HTML que SvelteKit prerenderizó (render en servidor con el tallao empaquetado).
 *
 * - Las páginas existen y traen el marcado de los componentes (SSR de verdad, no una
 *   página vacía que se pinta en el navegador).
 * - Nada pasa de una petición a otra: /otra fija los textos en español y llama a toast()
 *   al renderizar; la portada sigue en inglés y ninguna página lleva ese aviso.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const build = join(import.meta.dirname, "build");
const html = (page) => readFileSync(join(build, page), "utf8");
const portada = html("index.html");
const otra = html("otra.html");

const fallos = [];
const debe = (cond, msg) => cond || fallos.push(msg);

debe(portada.includes("tallao en SvelteKit"), "la portada no se renderizó en el servidor");
for (const marca of ['role="tablist"', 'role="switch"', 'role="combobox"', 'aria-haspopup="menu"', "<details", 'role="progressbar"', "<table", 'data-fila="1"', "<article"])
  debe(portada.includes(marca), `falta ${marca} en el HTML de la portada`);
debe(/id="ta-tabs-[^"]+-a"/.test(portada), "Tabs no tiene ids en el HTML del servidor");
debe(portada.includes('aria-label="Dismiss"'), "la portada debería salir en inglés");
debe(!portada.includes("Descartar"), "los textos en español de /otra se pasaron a la portada");
debe(otra.includes('aria-label="Descartar"'), "/otra no salió en español");
debe(!portada.includes("aviso-desde-el-servidor") && !otra.includes("aviso-desde-el-servidor"), "un toast() del servidor acabó en el HTML");

if (fallos.length) {
  console.error(`check-prerender: ${fallos.length} fallo(s)\n- ${fallos.join("\n- ")}`);
  process.exit(1);
}
console.log("check-prerender: el HTML del servidor está completo y no comparte estado entre páginas");
