/**
 * SSR: cada componente se renderiza en Node sin `window` y da el mismo HTML dos
 * veces. Un id con Math.random (como tenía Tabs) cambia entre renders y rompe
 * la hidratación en SvelteKit.
 */
import { render } from "svelte/server";

import GameMap from "$lib/map/game-map.svelte";
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
    const { body } = render(GameMap, { props: { markers: [{ lat: 1, lng: 2, title: "X" }] } });
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

import Nuevos from "../fixtures/Nuevos.svelte";

describe("server rendering of the 0.4 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Nuevos);
    expect(body).toContain('role="switch"');
    expect(body).toContain("<details");
    expect(body).toContain('role="progressbar"');
    expect(render(Nuevos).body).toBe(body);
  });
});

import Integrados from "../fixtures/Integrados.svelte";

describe("server rendering of the 0.5 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Integrados);
    expect(body).toContain("Select all");
    expect(body).toContain("<article");
    expect(render(Integrados).body).toBe(body);
  });
});

import { toast, toasts } from "$lib/toast.svelte";

describe("toast() on the server", () => {
  it("does nothing: the module is shared by every request, so a toast would leak to other users", () => {
    expect(toast("from a server render")).toBe(0);
    expect(toasts).toHaveLength(0);
  });
});

import Formularios from "../fixtures/Formularios.svelte";

describe("server rendering of the 0.6 components", () => {
  it("renders the form values as hidden inputs, so a form posts without JavaScript", () => {
    const { body } = render(Formularios);
    expect(body).toContain('name="avisos" value="on"');
    expect(body).toContain('name="pais" value="pe"');
    expect(body).toContain('name="etiquetas" value="bug"');
    expect(body).toContain('name="stats[hp]" value="100"');
    expect(body).toContain('name="fecha" value="2026-11-03"');
    expect(body).toContain('role="grid"');
    expect(body).toContain('aria-sort="none"');
    expect(render(Formularios).body).toBe(body);
  });
});

import CodeEditor from "$lib/code/code-editor.svelte";
import Paneles from "../fixtures/Paneles.svelte";

describe("server rendering of the 0.7 components", () => {
  it("renders them all, the same every time", () => {
    const { body } = render(Paneles, { props: { nombre: "post" } });
    expect(body).toContain('role="separator"');
    expect(body).toContain('aria-current="page"');
    expect(body).toContain('role="slider"');
    expect(body).toContain('name="post.titulo"');
    expect(body).toContain("<fieldset");
    expect(render(Paneles, { props: { nombre: "post" } }).body).toBe(body);
  });

  it("renders the code editor as a plain textarea, without loading CodeMirror", () => {
    const { body } = render(CodeEditor, { props: { value: "{ }", language: "json", name: "datos" } });
    expect(body).toMatch(/<textarea[^>]*name="datos"/);
    expect(body).toContain("{ }");
    expect(body).not.toContain("cm-editor");
  });
});
