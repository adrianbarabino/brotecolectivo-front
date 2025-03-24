<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';
    import 'leaflet/dist/leaflet.css';
  
    export let venue;
  
    let showMap = false;
    let map;
    let mapContainer;
  
    const openMap = () => {
      showMap = true;
    };
  
    const closeMap = () => {
      showMap = false;
      if (map) {
        map.remove();
        map = null;
      }
    };
  
    const openInGoogleMaps = () => {
      const [lat, lng] = venue.latlng.split(',').map(Number);
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, '_blank');
    };
  
    $: if (showMap && mapContainer) {
      setTimeout(() => {
        const [lat, lng] = venue.latlng.split(',').map(Number);
  
        map = L.map(mapContainer, {
          center: [lat, lng],
          zoom: 16,
          zoomControl: false,
          dragging: false,
          scrollWheelZoom: false,
        });
  
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
  
        L.marker([lat, lng]).addTo(map);
      }, 100);
    }
  </script>
  
  <style>
    .venue-card {
      background: #fff;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      color: #222;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  
    h2 {
      margin: 0;
      font-size: 1.3rem;
      color: #0077cc;
    }
  
    .info {
      font-size: 0.95rem;
      line-height: 1.4;
    }
  
    .button-row {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      flex-wrap: wrap;
    }
  
    button {
      background: #0077cc;
      color: #fff;
      padding: 0.5rem 1rem;
      font-weight: bold;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    }
  
    button:hover {
      background: #005fa3;
    }
  
    .map-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0,0,0,0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
  
    .map-container {
      width: 90vw;
      height: 80vh;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 0 15px rgba(0,0,0,0.4);
    }
  
    .close-btn {
      position: absolute;
      top: 2rem;
      right: 2rem;
      background: #fff;
      color: #000;
      border: none;
      padding: 0.5rem 1rem;
      font-weight: bold;
      border-radius: 4px;
      cursor: pointer;
      z-index: 1001;
    }
  </style>
  
  <div class="venue-card">
    <h2>{venue.name}</h2>
    <div class="info">
      <p><strong>Dirección:</strong> {venue.address}</p>
      <p><strong>Ciudad:</strong> {venue.city}</p>
      <p>{@html venue.description}</p>
    </div>
  
    <div class="button-row">
      <button on:click={openMap}>Ver en el mapa</button>
      <button on:click={openInGoogleMaps}>Abrir en Google Maps</button>
    </div>
  </div>
  
  {#if showMap}
    <div class="map-modal">
      <button class="close-btn" on:click={closeMap}>Cerrar</button>
      <div bind:this={mapContainer} class="map-container"></div>
    </div>
  {/if}
  