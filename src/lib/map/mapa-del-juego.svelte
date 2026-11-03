<!--
  tallao — MapaDelJuego
  Envoltura fina sobre sveaflet (Leaflet) con el tema del kit:
  capa oscura por defecto, marcadores con Badge y popups estilados.
  sveaflet es dependencia del proyecto que usa el componente — este archivo
  es un punto de partida para copiar, no una reimplementación de Leaflet.
-->
<script lang="ts">
  import { cn } from "$lib/utils";

  interface Marcador {
    lat: number;
    lng: number;
    titulo: string;
    descripcion?: string;
  }

  interface Props {
    /** Centro inicial [lat, lng]. */
    centro?: [number, number];
    zoom?: number;
    marcadores?: Marcador[];
    /** Capa oscura (Esri Dark Gray) por defecto; false = OpenStreetMap estándar. */
    oscuro?: boolean;
    /** Alto del mapa (CSS). */
    alto?: string;
    /** Atribución obligatoria de los tiles. */
    atribucion?: string;
    /** Nombre accesible del mapa. */
    ariaLabel?: string;
    class?: string;
  }

  const {
    centro = [40.4168, -3.7038],
    zoom = 5,
    marcadores = [],
    oscuro = true,
    alto = "24rem",
    atribucion,
    ariaLabel = "Mapa",
    class: className = "",
  }: Props = $props();

  // CARTO empezó a pedir API key para dark_all; Esri Dark Gray es libre.
  const urlTiles = $derived(oscuro
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  const atribucionFinal = $derived(
    atribucion ??
    (oscuro
      ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
  );

  // Leaflet toca `window` al importarse: se carga solo en el navegador, nunca
  // en el render del servidor (SvelteKit), donde el mapa queda como caja vacía.
  const cargando =
    typeof window === "undefined"
      ? null
      : Promise.all([import("sveaflet"), import("leaflet")]).then(([S, L]) => ({
          S,
          // Marcador por defecto: un punto con el acento del tema (los iconos PNG
          // por defecto de Leaflet no resuelven bien con bundlers).
          icono: new L.DivIcon({
            className: "ta-mapa-pin-contenedor",
            html: '<div class="ta-mapa-pin"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        }));
</script>

<div
  class={cn("ta-mapa", className)}
  style={`height: ${alto}`}
  role="application"
  aria-label={ariaLabel}
>
  {#if cargando}
  {#await cargando then { S, icono }}
    <S.Map options={{ center: centro, zoom }}>
      <S.TileLayer url={urlTiles} options={{ attribution: atribucionFinal }} />
      {#each marcadores as m}
        <S.Marker latLng={[m.lat, m.lng]} options={{ icon: icono }}>
          <S.Popup>
            <div class="ta-mapa-popup">
              <strong>{m.titulo}</strong>
              {#if m.descripcion}
                <p>{m.descripcion}</p>
              {/if}
            </div>
          </S.Popup>
        </S.Marker>
      {/each}
    </S.Map>
  {/await}
  {/if}
</div>

<style>
  /* Las hojas de estilo de Leaflet vienen del paquete:
     import "leaflet/dist/leaflet.css" donde montes el mapa. */

  .ta-mapa {
    width: 100%;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
    background: rgb(var(--ta-surface));
  }

  .ta-mapa :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    font-family: var(--ta-font-sans);
  }

  /* Popups acordes al tema */
  .ta-mapa :global(.leaflet-popup-content-wrapper) {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 10px 25px rgb(0 0 0 / 0.35);
  }
  .ta-mapa :global(.leaflet-popup-tip) {
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
  }
  .ta-mapa-popup strong { display: block; }
  .ta-mapa-popup p { margin: 0.25rem 0 0; color: rgb(var(--ta-text-dim)); font-size: 0.8125rem; }

  /* Controles de zoom con el tema */
  .ta-mapa :global(.leaflet-bar a) {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-border));
  }
  .ta-mapa :global(.leaflet-bar a:hover) {
    background: rgb(var(--ta-elevated));
  }

  /* Pin por defecto: punto con halo del color de acento */
  :global(.ta-mapa-pin) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(var(--ta-accent));
    border: 2px solid rgb(var(--ta-bg));
    box-shadow: 0 0 0 4px rgb(var(--ta-accent) / 0.3);
  }
</style>
