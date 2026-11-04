<!--
  tallao — SchemaForm
  Un formulario a partir de un JSON Schema (el subconjunto de los formularios): sirve
  para lo que define el servidor o para revisar los argumentos que propone un agente
  antes de aprobar una herramienta.
    string → Input (email, url), DatePicker (format "date"), Textarea ("x-widget": "textarea")
    enum   → Select, o RadioGroup con "x-widget": "radio"; nombres con oneOf [{ const, title }]
    number / integer → Input numérico con minimum / maximum (el valor es un número)
    boolean → Switch (o Checkbox con "x-widget": "checkbox")
    array con items.enum → Combobox múltiple
    object → <fieldset> con su <legend>
  Valida required, minLength / maxLength, pattern, minimum / maximum y el formato al
  enviar (y cada campo al salir de él, una vez tocado). Con `name`, los campos se envían
  en el envío nativo del formulario como `name.campo.subcampo`: en SvelteKit, el propio
  SchemaForm es el <form> (method="POST" y {@attach fromAction(enhance)}); un envío no
  válido no llega a la acción.
-->
<script lang="ts" module>
  export interface JsonSchema {
    type?: "object" | "string" | "number" | "integer" | "boolean" | "array";
    title?: string;
    description?: string;
    properties?: Record<string, JsonSchema>;
    required?: string[];
    enum?: (string | number)[];
    oneOf?: { const: string | number; title?: string }[];
    items?: JsonSchema;
    format?: "date" | "email" | "uri" | string;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minimum?: number;
    maximum?: number;
    default?: unknown;
    "x-widget"?: "textarea" | "radio" | "checkbox";
  }

  type Valor = Record<string, unknown>;

  /** El valor de partida: los `default` del esquema, o vacío. */
  export function defaultsOf(schema: JsonSchema): unknown {
    if (schema.default !== undefined) return structuredClone(schema.default);
    if (schema.type === "object") {
      const o: Valor = {};
      for (const [k, s] of Object.entries(schema.properties ?? {})) o[k] = defaultsOf(s);
      return o;
    }
    if (schema.type === "array") return [];
    if (schema.type === "boolean") return false;
    if (schema.type === "number" || schema.type === "integer") return null;
    return "";
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  import Button from "./button.svelte";
  import Checkbox from "./checkbox.svelte";
  import Combobox from "./combobox.svelte";
  import DatePicker from "./date-picker.svelte";
  import Field from "./field.svelte";
  import Input from "./input.svelte";
  import RadioGroup from "./radio-group.svelte";
  import Select from "./select.svelte";
  import Switch from "./switch.svelte";
  import Textarea from "./textarea.svelte";

  const L = useLabels();
  let {
    schema,
    value = $bindable({}),
    name,
    submitLabel = L.submit,
    showSubmit = true,
    descriptions = true,
    disabled = false,
    class: className = "",
    onsubmit,
    children,
    ...rest
  }: {
    schema: JsonSchema;
    value?: Valor;
    /** Prefijo de los nombres en un <form> nativo; sin él, el formulario es solo de datos. */
    name?: string;
    submitLabel?: string;
    showSubmit?: boolean;
    /** Muestra la `description` de cada campo bajo él. */
    descriptions?: boolean;
    disabled?: boolean;
    class?: string;
    /** Con el valor ya validado. */
    onsubmit?: (value: Valor) => void;
    /** Más campos tras los del esquema y antes del botón (un CodeEditor, un FileUpload…). */
    children?: import("svelte").Snippet;
    /** method, action, enctype y adjuntos ({@attach fromAction(enhance)}) van al <form>. */
    [key: string]: unknown;
  } = $props();

  const id = $props.id();
  // Lo que falte en el valor de entrada se completa con los `default` del esquema.
  untrack(() => {
    const base = defaultsOf(schema) as Valor;
    value = { ...base, ...value };
  });

  let errores = $state<Record<string, string>>({});
  let tocados = $state<Record<string, boolean>>({});
  let formulario: HTMLFormElement | undefined = $state();

  const leer = (ruta: string[]) => ruta.reduce<unknown>((o, k) => (o as Valor | undefined)?.[k], value);
  function escribir(ruta: string[], v: unknown) {
    let o = value as Valor;
    for (const k of ruta.slice(0, -1)) o = (o[k] ??= {}) as Valor;
    o[ruta.at(-1)!] = v;
    if (tocados[ruta.join(".")]) validarCampo(ruta);
  }

  const opcionesDe = (s: JsonSchema) =>
    (s.oneOf?.map((o) => ({ value: String(o.const), label: o.title ?? String(o.const) })) ??
      s.enum?.map((e) => ({ value: String(e), label: String(e) })) ??
      []) as { value: string; label: string }[];

  /** El primer problema de un valor, o null. */
  function problema(s: JsonSchema, v: unknown, obligatorio: boolean): string | null {
    const vacio = v == null || v === "" || (Array.isArray(v) && v.length === 0);
    if (vacio) return obligatorio ? L.required : null;
    if (s.type === "string" && typeof v === "string") {
      if (s.minLength != null && v.length < s.minLength) return `${L.invalid} (≥ ${s.minLength})`;
      if (s.maxLength != null && v.length > s.maxLength) return `${L.invalid} (≤ ${s.maxLength})`;
      if (s.pattern && !new RegExp(`^(?:${s.pattern})$`).test(v)) return L.invalid;
      if (s.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return L.invalid;
      if (s.format === "uri" && !/^[a-z][a-z0-9+.-]*:\/\/\S+$/i.test(v)) return L.invalid;
      if (s.format === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(v)) return L.invalid;
      if ((s.enum || s.oneOf) && !opcionesDe(s).some((o) => o.value === v)) return L.invalid;
    }
    if ((s.type === "number" || s.type === "integer") && typeof v === "number") {
      if (s.type === "integer" && !Number.isInteger(v)) return L.invalid;
      if (s.minimum != null && v < s.minimum) return `${L.invalid} (≥ ${s.minimum})`;
      if (s.maximum != null && v > s.maximum) return `${L.invalid} (≤ ${s.maximum})`;
    }
    return null;
  }

  function esquemaDe(ruta: string[]): { s: JsonSchema; obligatorio: boolean } {
    let s = schema;
    let obligatorio = false;
    for (const k of ruta) {
      obligatorio = !!s.required?.includes(k);
      s = s.properties?.[k] ?? {};
    }
    return { s, obligatorio };
  }

  function validarCampo(ruta: string[]) {
    const { s, obligatorio } = esquemaDe(ruta);
    const p = problema(s, leer(ruta), obligatorio);
    const clave = ruta.join(".");
    if (p) errores[clave] = p;
    else delete errores[clave];
  }

  function hojas(s: JsonSchema, ruta: string[] = []): string[][] {
    if (s.type !== "object") return [ruta];
    return Object.entries(s.properties ?? {}).flatMap(([k, hijo]) => hojas(hijo, [...ruta, k]));
  }

  /** Valida todo; devuelve si está bien y enfoca el primer campo con error. */
  export function validate(): boolean {
    for (const ruta of hojas(schema)) {
      tocados[ruta.join(".")] = true;
      validarCampo(ruta);
    }
    // El primero en el orden del formulario, no en el que aparecieron los errores.
    const primero = hojas(schema)
      .map((r) => r.join("."))
      .find((k) => errores[k]);
    if (primero) {
      const caja = [...(formulario?.querySelectorAll<HTMLElement>("[data-campo]") ?? [])].find(
        (e) => e.dataset.campo === primero
      );
      caja?.querySelector<HTMLElement>("input:not([type=hidden]), select, textarea, button")?.focus();
    }
    return !primero;
  }

  // En fase de captura, antes que cualquier otro oyente del <form>: el `enhance` de
  // SvelteKit no mira defaultPrevented, así que un envío no válido hay que pararlo aquí.
  function enviar(e: SubmitEvent) {
    if (!validate()) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return;
    }
    if (onsubmit) {
      e.preventDefault();
      e.stopImmediatePropagation();
      onsubmit($state.snapshot(value) as Valor);
    }
  }

  const nombreDe = (ruta: string[]) => (name ? [name, ...ruta].join(".") : undefined);
  const salir = (ruta: string[], e?: FocusEvent) => {
    // Si el foco va al botón de enviar, el envío valida. Validar aquí pintaría el error,
    // el botón bajaría entre el mousedown y el mouseup y el clic se perdería.
    const siguiente = e?.relatedTarget;
    if (siguiente instanceof HTMLElement && siguiente.matches("[type=submit]") && formulario?.contains(siguiente)) return;
    tocados[ruta.join(".")] = true;
    validarCampo(ruta);
  };
</script>

{#snippet campo(s: JsonSchema, ruta: string[], obligatorio: boolean)}
  {@const clave = ruta.join(".")}
  {@const cid = `${id}-${clave}`}
  {@const etiqueta = s.title ?? ruta.at(-1) ?? ""}
  {@const ayuda = descriptions && s.description ? `${cid}-ayuda` : undefined}
  {@const error = tocados[clave] ? errores[clave] : undefined}
  {#if s.type === "object"}
    <fieldset class="ta-schema-grupo">
      <legend>{etiqueta}</legend>
      {#if ayuda}<p class="ta-schema-ayuda" id={ayuda}>{s.description}</p>{/if}
      {#each Object.entries(s.properties ?? {}) as [k, hijo] (k)}
        {@render campo(hijo, [...ruta, k], !!s.required?.includes(k))}
      {/each}
    </fieldset>
  {:else if s.type === "boolean"}
    <div class="ta-schema-campo" data-campo={clave}>
      {#if s["x-widget"] === "checkbox"}
        <Checkbox id={cid} label={etiqueta} {disabled} name={nombreDe(ruta)} checked={!!leer(ruta)} aria-describedby={ayuda} onchange={(e: Event) => escribir(ruta, (e.currentTarget as HTMLInputElement).checked)} />
      {:else}
        <Switch label={etiqueta} {disabled} name={nombreDe(ruta)} value="true" checked={!!leer(ruta)} onchange={(v) => escribir(ruta, v)} />
      {/if}
      {#if ayuda}<p class="ta-schema-ayuda" id={ayuda}>{s.description}</p>{/if}
    </div>
  {:else if (s.enum || s.oneOf) && s["x-widget"] === "radio"}
    <div class="ta-schema-campo" data-campo={clave}>
      <RadioGroup
        legend={etiqueta}
        options={opcionesDe(s)}
        value={String(leer(ruta) ?? "")}
        name={nombreDe(ruta)}
        required={obligatorio}
        onchange={(v) => {
          escribir(ruta, v);
          salir(ruta);
        }}
      />
      {#if error}<span class="ta-schema-error" role="alert">{error}</span>{/if}
    </div>
  {:else}
    <div class="ta-schema-campo" data-campo={clave}>
      <Field label={etiqueta} required={obligatorio} {error}>
        {#if s.type === "array" && s.items && (s.items.enum || s.items.oneOf)}
          <Combobox
            multiple
            name={nombreDe(ruta)}
            options={opcionesDe(s.items)}
            values={(leer(ruta) as string[]) ?? []}
            {disabled}
            onValuesChange={(v) => escribir(ruta, v)}
          />
        {:else if s.enum || s.oneOf}
          <Select
            id={cid}
            name={nombreDe(ruta)}
            options={opcionesDe(s)}
            placeholder={obligatorio ? undefined : "—"}
            value={String(leer(ruta) ?? "")}
            {disabled}
            aria-describedby={ayuda}
            aria-invalid={error ? "true" : undefined}
            onchange={(e: Event) => {
              escribir(ruta, (e.currentTarget as HTMLSelectElement).value);
              salir(ruta);
            }}
          />
        {:else if s.type === "number" || s.type === "integer"}
          <Input
            id={cid}
            type="number"
            name={nombreDe(ruta)}
            min={s.minimum}
            max={s.maximum}
            step={s.type === "integer" ? 1 : "any"}
            value={leer(ruta) == null ? "" : String(leer(ruta))}
            {disabled}
            aria-describedby={ayuda}
            aria-invalid={error ? "true" : undefined}
            oninput={(e: Event) => {
              const t = (e.currentTarget as HTMLInputElement).value;
              escribir(ruta, t === "" ? null : Number(t));
            }}
            onblur={(e: FocusEvent) => salir(ruta, e)}
          />
        {:else if s.format === "date"}
          <DatePicker name={nombreDe(ruta)} value={(leer(ruta) as string) || null} {disabled} onchange={(v) => { escribir(ruta, v ?? ""); salir(ruta); }} />
        {:else if s["x-widget"] === "textarea"}
          <Textarea
            id={cid}
            name={nombreDe(ruta)}
            value={String(leer(ruta) ?? "")}
            maxlength={s.maxLength}
            {disabled}
            aria-describedby={ayuda}
            aria-invalid={error ? "true" : undefined}
            oninput={(e: Event) => escribir(ruta, (e.currentTarget as HTMLTextAreaElement).value)}
            onblur={(e: FocusEvent) => salir(ruta, e)}
          />
        {:else}
          <Input
            id={cid}
            type={s.format === "email" ? "email" : s.format === "uri" ? "url" : "text"}
            name={nombreDe(ruta)}
            value={String(leer(ruta) ?? "")}
            maxlength={s.maxLength}
            {disabled}
            aria-describedby={ayuda}
            aria-invalid={error ? "true" : undefined}
            oninput={(e: Event) => escribir(ruta, (e.currentTarget as HTMLInputElement).value)}
            onblur={(e: FocusEvent) => salir(ruta, e)}
          />
        {/if}
      </Field>
      {#if ayuda}<p class="ta-schema-ayuda" id={ayuda}>{s.description}</p>{/if}
    </div>
  {/if}
{/snippet}

<form {...rest} class={cn("ta-schema", className)} novalidate onsubmitcapture={enviar} bind:this={formulario}>
  {#if schema.type === "object"}
    {#each Object.entries(schema.properties ?? {}) as [k, s] (k)}
      {@render campo(s, [k], !!schema.required?.includes(k))}
    {/each}
  {/if}
  {@render children?.()}
  {#if showSubmit}
    <div class="ta-schema-acciones"><Button type="submit" {disabled}>{submitLabel}</Button></div>
  {/if}
</form>

<style>
  .ta-schema { display: flex; flex-direction: column; gap: 1rem; }
  .ta-schema-campo { display: flex; flex-direction: column; gap: 0.25rem; }
  .ta-schema-grupo {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin: 0;
    padding: 0.75rem 1rem 1rem;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
  }
  .ta-schema-grupo legend { padding: 0 0.25rem; font-size: 0.8125rem; font-weight: 600; }
  .ta-schema-ayuda { margin: 0; font-size: 0.75rem; color: rgb(var(--ta-text-dim)); }
  .ta-schema-error { font-size: 0.75rem; color: rgb(var(--ta-danger)); }
  .ta-schema-acciones { display: flex; justify-content: flex-end; }
</style>
