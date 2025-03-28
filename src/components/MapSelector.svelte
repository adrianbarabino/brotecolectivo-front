<script>
    import { onMount } from 'svelte';
    import L from 'leaflet';
  
    export let latlng = '';
    export let address = '';
    export let city = '';
  
    let mapDiv;
    let map, marker;
  
    // Convert latlng string a coords
    function getCoords() {
      const [lat, lng] = latlng.split(',').map(v => parseFloat(v.trim()));
      return { lat, lng };
    }
  
    async function reverseGeocode(lat, lng) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      address = data.display_name || '';
      city = data.address.city || data.address.town || data.address.village || '';
      latlng = `${lat},${lng}`;
    }
  
    async function geocodeAddress() {
      const q = encodeURIComponent(`${address} ${city}`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
      );
      const results = await res.json();
      if (results.length > 0) {
        const result = results[0];
        latlng = `${result.lat},${result.lon}`;
        updateMap(parseFloat(result.lat), parseFloat(result.lon));
      }
    }
  
    function updateMap(lat, lng) {
        
            // change image for marker to /img/marker-map.png
            const icon = L.icon({
            iconUrl: '/img/marker_map.png',
            iconSize: [48, 48],
            iconAnchor: [20, 40],
            popupAnchor: [1, -34],
        });

      if (map) map.setView([lat, lng], 15);
      if (marker) marker.setLatLng([lat, lng]);
      else marker = L.marker([lat, lng], { icon }).addTo(map);

    }
  
    onMount(() => {
      const { lat, lng } = getCoords();
      map = L.map(mapDiv).setView([lat || -51.6230, lng || -69.2168], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
  
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        reverseGeocode(lat, lng);
        updateMap(lat, lng);
      });
  
      if (lat && lng) updateMap(lat, lng);
    });
  </script>
  
  <div class="mb-2">
    <input class="form-control mb-2" placeholder="Dirección" bind:value={address} />
    <input class="form-control mb-2" placeholder="Ciudad" bind:value={city} />
    <button class="btn btn-outline-primary mb-2" type="button" on:click={geocodeAddress}>Buscar en el mapa</button>
    <input class="form-control mb-2" placeholder="LatLng" bind:value={latlng} readonly />
  </div>
  
  <div bind:this={mapDiv} style="height: 300px; width: 100%; border-radius: 8px; overflow: hidden;"></div>
  