<script>
  import { onMount } from 'svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import Header from '../components/Header.svelte';
  import { links } from 'svelte-routing';
  import { API, TOKEN, MEDIA_URL } from '../config.js';
  import Sidebar from '../components/Sidebar.svelte';
  import { applyMetatags, generateArtistMetatags } from '../metatags.js';

  const iconClassMap = {
    facebook: 'fab fa-facebook-f',
    twitter: 'fab fa-x-twitter',
    youtube: 'fab fa-youtube',
    vimeo: 'fab fa-vimeo-v',
    soundcloud: 'fab fa-soundcloud',
    sitioweb: 'fas fa-globe',
    spotify: 'fab fa-spotify',
    instagram: 'fab fa-instagram'
  };

  const urlBaseMap = {
    facebook: 'https://facebook.com/',
    twitter: 'https://x.com/',
    youtube: 'https://youtube.com/',
    vimeo: 'https://vimeo.com/',
    soundcloud: 'https://soundcloud.com/',
    spotify: 'https://open.spotify.com/artist/',
    instagram: 'https://instagram.com/'
  };

  let bandName = 'Artista';
  let band = null;
  let error = '';
  let loading = true;
  let socialLinks = [];
  let news = [];
  let events = [];
  let videos = [];
  let currentVideo = null;

  async function fetchBandRelated(id) {
    try {
      const [newsRes, eventsRes, videosRes] = await Promise.all([
        fetchWithCache(`news-${id}`, `${API}/news/band/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        }),
        fetchWithCache(`events-${id}`, `${API}/events/band/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        }),
        fetchWithCache(`videos-${id}`, `${API}/videos/band/${id}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        })
      ]);

      news = (newsRes || []).slice(0, 5);
      events = (eventsRes || []).slice(0, 5);
      videos = (videosRes || []).filter(v => v.youtube_id).slice(0, 5);
      currentVideo = videos.length > 0 ? videos[0].youtube_id : null;
    } catch (err) {
      console.error('Error al traer datos relacionados:', err);
    }
  }

  onMount(async () => {
    const path = window.location.pathname;
    const id = path.split('/').pop();

    try {
      band = await fetchWithCache(`band-${id}`, `${API}/bands/${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      band.image = `${MEDIA_URL}bands/${band.slug}.jpg`;
      bandName = band.name;

      if (band.social && typeof band.social === 'object') {
        socialLinks = Object.entries(band.social)
          .filter(([key, val]) => val && val.toLowerCase() !== key.toLowerCase())
          .map(([key, val]) => {
            let finalUrl = val;
            if (!val.startsWith('http') && urlBaseMap[key]) {
              finalUrl = urlBaseMap[key] + val;
            }
            return {
              key,
              url: finalUrl,
              icon: iconClassMap[key] || 'fas fa-globe'
            };
          });
      }

      await fetchBandRelated(id);

      applyMetatags('artist', {
        name: band.name,
        bio: band.bio,
        image: band.image,
        id: band.id,
        slug: band.slug
      });

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  let breadcrumbs = ['Home', 'Artistas', 'Detalle'];
</script>

<Header title={bandName} subhead="información detallada del artista seleccionado" breadcrumbs={breadcrumbs} />

<section class="container my-4 row">
  <div class="col-md-8 row">
    {#if loading}
      <SkeletonCard lines={6} />
    {:else if error}
      <div class="alert alert-danger m-3">{error}</div>
    {:else if !band}
      <p class="m-3">No se encontró el artista.</p>
    {:else}
      <article class="card col-12 shadow-sm border-0 mb-4 overflow-hidden">
        <div class="position-relative">
          <img src={band.image} alt={band.name} class="card-img-top rounded-0" />

          <!-- Redes sociales sobre la imagen -->
          {#if socialLinks.length > 0}
            <div class="position-absolute top-0 end-0 m-3 d-flex flex-wrap gap-2">
              {#each socialLinks as link}
                <a href={link.url} target="_blank" class="badge bg-dark text-white rounded-pill p-2 d-flex align-items-center">
                  <i class={link.icon}></i>
                </a>
              {/each}
            </div>
          {/if}
        </div>

        <div class="card-body">
          <div class="bio mb-4">{@html band.bio}</div>
        </div>
      </article>

<!-- SECCIÓN DE VIDEOS -->
<div class="card col-12 mb-5 shadow-sm border-0">
  <div class="card-body">
    <h5 class="mb-4 fw-semibold">Videos</h5>
    {#if currentVideo}
      <div class="ratio ratio-16x9 mb-4">
        <iframe 
          src={`https://www.youtube.com/embed/${currentVideo}`} 
          title="Video del artista" 
          frameborder="0" 
          allowfullscreen
        ></iframe>
      </div>
      <div class="d-flex flex-wrap gap-2">
        {#each videos as v}
          <button class="btn btn-outline-primary btn-sm" on:click={() => currentVideo = v.youtube_id}>
            {v.title}
          </button>
        {/each}
      </div>
    {:else}
      <p>No hay videos disponibles.</p>
    {/if}
  </div>
</div>
<div class="col-md-6">

<!-- SECCIÓN DE FECHAS -->
<div class="card mb-5 shadow-sm border-0">
  <div class="card-body">
    <h5 class="mb-4 fw-semibold">Fechas</h5>
    {#if events.length === 0}
      <p>No hay eventos próximos.</p>
    {:else}
      <ul class="ps-3 mb-0">
        {#each events as e}
          <li class="mb-3">
            <a href={`/agenda-cultural/${e.slug}`} use:links class="link-primary text-decoration-none">
              <strong>{new Date(e.date_start).toLocaleDateString()}</strong> – {e.title}
            </a><br />
            <small class="text-muted">{e.venue?.name}</small>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
</div>
<div class="col-md-6">
  
<!-- SECCIÓN DE NOTICIAS -->
<div class="card  mb-5 shadow-sm border-0">
  <div class="card-body">
    <h5 class="mb-4 fw-semibold">Noticias</h5>
    {#if news.length === 0}
      <p>No hay noticias disponibles.</p>
    {:else}
      <ul class="ps-3 mb-0">
        {#each news as n}
          <li class="mb-3">
            <a href={`/noticias/${n.slug}`} use:links class="link-primary text-decoration-none">
              <strong>{new Date(Number(n.date) * 1000).toLocaleDateString()}</strong> – {n.title}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>
</div>

    {/if}
  </div>
  <div class="col-md-4">
    
<!-- SECCIÓN COMPARTIR -->
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
