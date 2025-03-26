<script>
  import { onMount } from 'svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import Header from '../components/Header.svelte';
  import { links } from 'svelte-routing';

  const iconClassMap = {
    facebook: 'fab fa-facebook',
    twitter: 'fab fa-x',
    youtube: 'fab fa-youtube',
    vimeo: 'fab fa-vimeo',
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
  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  let socialLinks = [];
  let news = [];
  let events = [];
  let videos = [];
  let currentVideo = null;

  const API = 'https://api.brotecolectivo.com';
  const TOKEN = 'token-secreto';

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

      band.image = `${mediaUrl}bands/${band.slug}.jpg`;
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

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  let breadcrumbs = ['Home', 'Artistas', 'Detalle'];
</script>

<Header title={bandName} subhead="información detallada del artista seleccionado" breadcrumbs={breadcrumbs} />

<section class="container my-4">
  {#if loading}
    <SkeletonCard lines={6} />
  {:else if error}
    <div class="alert alert-danger">{error}</div>
  {:else if !band}
    <p>No se encontró el artista.</p>
  {:else}
    <figure class="band-image float-start me-4 mb-3">
      <img src={band.image} alt={band.name} class="img-fluid rounded" />
    </figure>

    <div class="bio mb-4">{@html band.bio}</div>

    {#if socialLinks.length > 0}
      <div class="social mb-4">
        <h4>Redes sociales:</h4>
        <div class="d-flex flex-wrap gap-2 mt-2">
          {#each socialLinks as link}
            <a href={link.url} target="_blank" class="btn btn-light btn-sm d-flex align-items-center gap-2">
              <i class={link.icon}></i> {link.key}
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <div class="row">
      <div class="col-12 mb-4">
        <div class="box p-3 rounded shadow-sm bg-light">
          <h3 class="h5 mb-3">🎥 Videos</h3>
          {#if currentVideo}
            <div class="ratio ratio-16x9 mb-3">
              <iframe src={`https://www.youtube.com/embed/${currentVideo}`} frameborder="0" allowfullscreen></iframe>
            </div>
            <div class="d-flex flex-wrap gap-2">
              {#each videos as v}
                <button class="btn btn-secondary btn-sm" on:click={() => currentVideo = v.youtube_id}>{v.title}</button>
              {/each}
            </div>
          {:else}
            <p>No hay videos disponibles.</p>
          {/if}
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="box p-3 rounded shadow-sm bg-light">
          <h3 class="h5 mb-3">📅 Fechas</h3>
          {#if events.length === 0}
            <p>No hay eventos próximos.</p>
          {:else}
            <ul class="ps-3">
              {#each events as e}
                <li class="mb-2">
                  <a href={`/events/${e.slug}`} use:links class="link-primary">
                    <strong>{new Date(e.date_start).toLocaleDateString()}</strong> – {e.title}
                  </a><br />
                  <small>{e.venue?.name}</small>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="box p-3 rounded shadow-sm bg-light">
          <h3 class="h5 mb-3">📰 Noticias</h3>
          {#if news.length === 0}
            <p>No hay noticias.</p>
          {:else}
            <ul class="ps-3">
              {#each news as n}
                <li>
                  <a href={`/news/${n.slug}`} use:links class="link-primary">
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
</section>

<style>
  .band-image {
    max-width: 350px;
  }
</style>
