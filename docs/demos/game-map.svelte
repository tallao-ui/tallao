<!-- layout: wide -->
<script lang="ts">
  import { GameMap } from "tallao/map";
</script>

<GameMap
  center={[40.4168, -3.7038]}
  zoom={5}
  height="22rem"
  ariaLabel="Tournament venues"
  markers={[
    { lat: 40.4168, lng: -3.7038, title: "Madrid Arena", description: "Finals, 14 Dec" },
    { lat: 41.3874, lng: 2.1686, title: "Barcelona Hub", description: "Group stage" },
    { lat: 37.3891, lng: -5.9845, title: "Sevilla Cup", description: "Qualifiers" },
  ]}
/>
