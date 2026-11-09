<!--
  tallao — GameMap
  Thin wrapper over sveaflet (Leaflet) with the kit's theme:
  dark layer by default, Badge markers and styled popups.
  sveaflet is a dependency of the project that uses the component — this file
  is a starting point to copy, not a reimplementation of Leaflet.
-->
<script lang="ts">
  import { useLabels } from "$lib/i18n";
  import { cn } from "$lib/utils";

  interface Marker {
    lat: number;
    lng: number;
    title: string;
    description?: string;
  }

  interface Props {
    /** Initial center [lat, lng]. */
    center?: [number, number];
    zoom?: number;
    markers?: Marker[];
    /** Dark layer (Esri Dark Gray) by default; false = standard OpenStreetMap. */
    dark?: boolean;
    /** Map height (CSS). */
    height?: string;
    /** Required tile attribution. */
    attribution?: string;
    /** Accessible name of the map. */
    ariaLabel?: string;
    class?: string;
  }

  const L = useLabels();
  const {
    center = [40.4168, -3.7038],
    zoom = 5,
    markers = [],
    dark = true,
    height = "24rem",
    attribution,
    ariaLabel = L.map,
    class: className = "",
  }: Props = $props();

  // CARTO started requiring an API key for dark_all; Esri Dark Gray is free.
  const tileUrl = $derived(dark
    ? "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
    : "https://tile.openstreetmap.org/{z}/{x}/{y}.png");
  const finalAttribution = $derived(
    attribution ??
    (dark
      ? 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
      : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>')
  );

  // Leaflet touches `window` on import: it is loaded only in the browser, never
  // during the server render (SvelteKit), where the map stays an empty box.
  const loader =
    typeof window === "undefined"
      ? null
      : Promise.all([import("sveaflet"), import("leaflet")]).then(([S, L]) => ({
          S,
          // Default marker: a dot in the theme's accent (Leaflet's default PNG
          // icons do not resolve well with bundlers).
          icon: new L.DivIcon({
            className: "ta-map-pin-container",
            html: '<div class="ta-map-pin"></div>',
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          }),
        }));
</script>

<div
  class={cn("ta-map", className)}
  style={`height: ${height}`}
  role="application"
  aria-label={ariaLabel}
>
  {#if loader}
  {#await loader then { S, icon }}
    <S.Map options={{ center, zoom }}>
      <S.TileLayer url={tileUrl} options={{ attribution: finalAttribution }} />
      {#each markers as m}
        <S.Marker latLng={[m.lat, m.lng]} options={{ icon: icon }}>
          <S.Popup>
            <div class="ta-map-popup">
              <strong>{m.title}</strong>
              {#if m.description}
                <p>{m.description}</p>
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
  /* Leaflet's stylesheets come from the package:
     import "leaflet/dist/leaflet.css" wherever you mount the map. */

  .ta-map {
    width: 100%;
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius-lg);
    overflow: hidden;
    background: rgb(var(--ta-surface));
  }

  .ta-map :global(.leaflet-container) {
    width: 100%;
    height: 100%;
    font-family: var(--ta-font-sans);
  }

  /* Popups matching the theme */
  .ta-map :global(.leaflet-popup-content-wrapper) {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
    border: 1px solid rgb(var(--ta-border));
    border-radius: var(--ta-radius);
    box-shadow: 0 10px 25px rgb(0 0 0 / 0.35);
  }
  .ta-map :global(.leaflet-popup-tip) {
    background: rgb(var(--ta-surface));
    border: 1px solid rgb(var(--ta-border));
  }
  .ta-map-popup strong { display: block; }
  .ta-map-popup p { margin: 0.25rem 0 0; color: rgb(var(--ta-text-dim)); font-size: 0.8125rem; }

  /* Zoom controls with the theme */
  .ta-map :global(.leaflet-bar a) {
    background: rgb(var(--ta-surface));
    color: rgb(var(--ta-text));
    border-color: rgb(var(--ta-border));
  }
  .ta-map :global(.leaflet-bar a:hover) {
    background: rgb(var(--ta-elevated));
  }

  /* Default pin: a dot with a halo in the accent color */
  :global(.ta-map-pin) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: rgb(var(--ta-accent));
    border: 2px solid rgb(var(--ta-bg));
    box-shadow: 0 0 0 4px rgb(var(--ta-accent) / 0.3);
  }
  @media (pointer: coarse) {
    .ta-map :global(.leaflet-bar a) { width: 2.75rem; height: 2.75rem; line-height: 2.75rem; font-size: 1.25rem; }
  }
</style>
