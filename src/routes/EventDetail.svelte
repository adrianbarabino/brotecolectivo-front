<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';

    import Header from '../components/Header.svelte';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import Sidebar from '../components/Sidebar.svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';
    import {links} from 'svelte-routing';
    import CountdownTimer from '../components/CountdownTimer.svelte';
    import L from 'leaflet';

  
    let event = null;
    let error = '';
    let loading = true;
    let intervalId;
  
    const slug = window.location.pathname.split('/').pop();
  
    let mapContainer;
    let mapInitialized = false;
  
    function initMap() {
      if (!event?.venue?.latlng || !mapContainer) return;
      const [lat, lng] = event.venue.latlng.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) return;
  
      const map = L.map(mapContainer).setView([lat, lng], 15);
  
      L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors, HOT'
      }).addTo(map);
  
      // change image for marker to /img/marker-map.png
        const icon = L.icon({
            iconUrl: '/img/marker_map.png',
            iconSize: [48, 48],
            iconAnchor: [20, 40],
            popupAnchor: [1, -34],
        });
        L.marker([lat, lng], { icon }).addTo(map).bindPopup(event.venue.name).openPopup();
        // hide zoom control
        map.zoomControl.setPosition('bottomright');
    }
  

  
    $: if (!loading && event?.venue?.latlng && mapContainer && !mapInitialized) {
      mapInitialized = true;
      initMap();
    }
  
    onMount(async () => {
      try {
        event = await fetchWithCache(`event-${slug}`, `${API}/events/${slug}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        event.image = `${MEDIA_URL}events/${event.slug}.jpg`;
      } catch (err) {
        error = err.message || 'Error al cargar el evento.';
      } finally {
        loading = false;
        const date = new Date(event.date_start);
        event.displayDate = date.toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        event.displayDate = event.displayDate.replace(',', ''); // remove the comma
        event.displayDate = event.displayDate.replace(' ', ' a las '); // replace space with "a las"
      }
    });
  
    let breadcrumbs = ['Home', 'Agenda Cultural', 'Detalle'];
  </script>
    <Header title={event?.title || 'Detalle del Evento'} subhead="Toda la información sobre este evento" breadcrumbs={breadcrumbs} />

  {#if !loading && event?.venue?.latlng}
    <div class="map-header position-relative w-100">
      <div bind:this={mapContainer} class="map-container"></div>
      <div class="map-overlay text-white p-4">
        <h4>{event.title}</h4>
        <h5>{event.venue.name}</h5>
        <p>{event.displayDate}</p>
        {#if event.venue.address}<p>{event.venue.address}, {event.venue.city}</p>{/if}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${event.venue.latlng}`}
          class="btn btn-light btn-sm mt-2"
          target="_blank"
          >Cómo llegar</a
        >
      </div>
    </div>
  {/if}
  
  
  <section class="container my-4 row">
    <div class="col-md-8">
      {#if loading}
        <SkeletonCard lines={6} />
      {:else if error}
        <div class="alert alert-danger">{error}</div>
      {:else if !event}
        <div class="alert alert-warning">No se encontró el evento.</div>
      {:else}
        <article class="card shadow-sm border-0 mb-4">
          <img src={event.image} alt={event.title} class="card-img-top rounded-0" />
          <div class="card-body">
            <h2 class="card-title mb-3">{event.title}</h2>

            <div class="card-text mt-3">{@html event.content}</div>
          </div>
        </article>
  
        {#if event.bands && event.bands.length > 0}
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-body">
              <h5 class="mb-4 fw-semibold">Bandas participantes</h5>
              <div class="row">
                {#each event.bands as band}
                  <div class="col-md-6 mb-4">
                    <div class="d-flex gap-3 align-items-start">
                      <img src={`${MEDIA_URL}bands/${band.slug}.jpg`} alt={band.name} style="width: 100px; height: 100px; object-fit: cover;" class="rounded" />
                      <div>
                        <h6 class="fw-bold">{band.name}</h6>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/if}
      {#if event}
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <CountdownTimer date={event.date_start} />

        </div>
      </div>

      {#if event.bands && event.bands.length > 0}
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <h6 class="fw-semibold mb-3">Bandas</h6>
            <ul class="list-unstyled">
              {#each event.bands as band}
                <li class="mb-2">
                  <a href={`/bandas/${band.slug}`} use:links class="text-decoration-none d-flex align-items-center gap-2">
                    <img src={`${MEDIA_URL}bands/${band.slug}.jpg`} alt={band.name} style="width: 32px; height: 32px; object-fit: cover;" class="rounded-circle" />
                    <span>{band.name}</span>
                  </a>
                </li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}
    {/if}

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body">
        <h6 class="fw-semibold mb-3">Compartir esta página</h6>
        <div class="d-flex align-items-center gap-3">
          <a class="text-secondary" href={`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`} target="_blank"><i class="fab fa-facebook-f fa-lg"></i></a>
          <a class="text-secondary" href={`https://x.com/intent/tweet?url=${window.location.href}`} target="_blank"><i class="fab fa-x-twitter fa-lg"></i></a>
          <a class="text-secondary" href={`https://wa.me/?text=${encodeURIComponent(window.location.href)}`} target="_blank"><i class="fab fa-whatsapp fa-lg"></i></a>
          <button class="btn btn-sm btn-outline-secondary" on:click={() => navigator.clipboard.writeText(window.location.href)}>
            <i class="fas fa-link"></i>
          </button>
        </div>
      </div>
    </div>

    </div>
  
    <div class="col-md-4">

      <Sidebar asideClass="" />
    </div>
  </section>
  
  <style global>
    @import 'leaflet/dist/leaflet.css';
  
    .map-container {
      width: 100%;
      height: 400px;
    }
  
    .map-overlay {
      position: absolute;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 0.5rem;
      padding: 1rem;
      max-width: 300px;
      z-index: 999;
    }
  

    h4, h5{
        color:white!important;
    }
  </style>
  