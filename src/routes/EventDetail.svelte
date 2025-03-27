<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import Header from '../components/Header.svelte';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import Sidebar from '../components/Sidebar.svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';
  
    let event = null;
    let error = '';
    let loading = true;
  
    const slug = window.location.pathname.split('/').pop();
  
    onMount(async () => {
      try {
        event = await fetchWithCache(`event-${slug}`, `${API}/events/${slug}`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`
          }
        });
  
        event.image = `${MEDIA_URL}events/${event.slug}.jpg`;
      } catch (err) {
        error = err.message || 'Error al cargar el evento.';
      } finally {
        loading = false;
      }
    });
  
    let breadcrumbs = ['Home', 'Agenda Cultural', 'Detalle'];
  </script>
  
  <Header title={event?.title || "Detalle del Evento"} subhead="Toda la información sobre este evento" breadcrumbs={breadcrumbs} />
  
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
          <div class="position-relative">
            <img src={event.image} alt={event.title} class="card-img-top rounded-0" />
          </div>
  
          <div class="card-body">
            <h2 class="card-title mb-3">{event.title}</h2>
            <p class="text-muted">📅 {event.date_start} — {event.date_end}</p>
            <p class="text-muted">📍 {event.venue?.name}</p>
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
    </div>
  
    <div class="col-md-4">
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
  
      <Sidebar asideClass="" />
    </div>
  </section>
  
  <style>
    .card-img-top {
      object-fit: cover;
      height: 300px;
    }
  </style>
  