/**
 * SSR: cada componente se renderiza en Node sin `window` y da el mismo HTML dos
 * veces. Un id con Math.random (como tenía Tabs) cambia entre renders y rompe
 * la hidratación en SvelteKit.
 */
import { render } from "svelte/server";

import MapaDelJuego from "$lib/map/mapa-del-juego.svelte";
import Flotantes from "../fixtures/Flotantes.svelte";
import Todo from "../fixtures/Todo.svelte";

describe("server rendering", () => {
  it("renders every component without touching window", () => {
    expect(typeof window).toBe("undefined");
    const { body } = render(Todo, { props: { abierto: true } });
    expect(body).toContain("Guardar");
    expect(body).toContain('role="tablist"');
    expect(body).toContain("Diálogo");
  });

  it("gives the same HTML on every render (stable ids)", () => {
    const a = render(Todo).body;
    const b = render(Todo).body;
    expect(a).toBe(b);
    expect(a).toMatch(/id="ta-tabs-[^"]+-a"/);
  });

  it("renders the map as an empty box without loading Leaflet", () => {
    const { body } = render(MapaDelJuego, { props: { marcadores: [{ lat: 1, lng: 2, titulo: "X" }] } });
    expect(body).toContain('role="application"');
    expect(body).not.toContain("leaflet-container");
  });
});

describe("server rendering of the floating components", () => {
  it("renders the triggers closed, without Floating UI or the Popover API", () => {
    const { body } = render(Flotantes);
    expect(body).toContain('aria-haspopup="menu"');
    expect(body).toContain('role="combobox"');
    expect(body).not.toContain('role="menu"');
    expect(render(Flotantes).body).toBe(body);
  });
});
