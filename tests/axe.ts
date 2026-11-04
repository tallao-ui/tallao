import axe from "axe-core";

/**
 * Infracciones de accesibilidad de axe en `raiz`. jsdom no calcula estilos
 * ni posiciones, así que el contraste queda fuera (lo cubre la demo en navegador).
 */
export async function infracciones(raiz: Element) {
  const res = await axe.run(raiz, {
    rules: { "color-contrast": { enabled: false }, region: { enabled: false } },
  });
  return res.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
}
