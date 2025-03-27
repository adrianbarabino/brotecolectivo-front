<script>
import { onMount, tick } from 'svelte';
import { useLocation, Link } from 'svelte-routing';
import { fetchWithCache } from '../utils/fetchWithCache.js';
import SkeletonCard from '../components/SkeletonCard.svelte';
import { links } from 'svelte-routing';
import Header from '../components/Header.svelte';
import { API, TOKEN, MEDIA_URL } from '../config.js';
import { playerStore } from '../stores/playerStore.js';
import { get } from 'svelte/store';
let bands = [];
let totalBands = 0;
let currentPage = 1;
let bandsPerPage = 9;
let totalPages = 1;
let loading = true;
let error = '';

const location = useLocation();

$: {
  const match = $location.pathname.match(/\/artists-page\/(\d+)/);
  const newPage = match ? parseInt(match[1]) : 1;

  if (newPage !== currentPage) {
    currentPage = newPage;
    loadData();
  }
}

onMount(() => {
  const match = $location.pathname.match(/\/artists-page\/(\d+)/);
  currentPage = match ? parseInt(match[1]) : 1;
  loadData();
});
async function playSong(bandId) {
      const store = get(playerStore);
      const index = store.songs.findIndex(song => song.band_id === bandId);
      if (index !== -1) {
        store.loadSong(index);
        // await tick

        await tick();
        store.playSong();
      }
    }
  
async function loadData() {
  loading = true;
  try {
    bands = await fetchWithCache(`bands-page-${currentPage}`, `${API}/bands?limit=${bandsPerPage}&offset=${(currentPage - 1) * bandsPerPage}`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });

    const res = await fetch(`${API}/bands/count`);
    const data = await res.json();
    totalBands = data.count;
    totalPages = Math.ceil(totalBands / bandsPerPage);

    bands = bands.map(band => ({
      ...band,
      bio: band.bio.slice(0, 120) + '...',
      image: `${MEDIA_URL}bands/${band.slug}.jpg`
    }));

    // remove all the br in the bio 
    bands = bands.map(band => {
      band.bio = band.bio.replace(/<br>/g, '');
      return band;
    });
    
  } catch (err) {
    error = err.message;
  } finally {
    loading = false;
  }
}

  let breadcrumbs = ['Home', 'Artistas']

</script>

  
<Header title="Nuestros artistas" subhead="conocé a los protagonistas de este sitio" breadcrumbs={breadcrumbs} />
<section class="container my-5">
  {#if loading}
    <div class="row">
      {#each Array(6) as _}
        <div class="col-md-4 mb-4">
          <SkeletonCard lines={3} />
        </div>
      {/each}
    </div>
  {:else if error}
    <p class="text-danger">{error}</p>
  {:else if bands.length === 0}
    <p>No hay artistas registrados.</p>
  {:else}
    <div class="row">
      {#each bands as band}
        <div class="col-md-4 mb-4">
          <a href={`/artists/${band.id}`} use:links class="card-link-wrapper">
            <div class="card h-100 shadow-sm">
              <img src={band.image} class="card-img-top" alt={band.name} />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{band.name}</h5>
                <p class="card-text">{@html band.bio}</p>
                <div class="d-flex justify-content-between mt-auto">
                  <span class="btn btn-outline-light btn-sm">Ver más detalles</span>
                  {#if $playerStore.songs.find(s => s.band_id === band.id)}

                  <button
                  class="btn btn-success btn-sm"
                  on:click|preventDefault|stopPropagation={() => playSong(band.id)}
                >
                <i class="fas fa-play"></i> Escuchar
                </button>
                  {/if}
                </div>
              </div>
            </div>
          </a>
        </div>
      {/each}

    </div>
  {/if}
  <nav class="my-4">
    <ul class="pagination">
      {#if currentPage > 1}
        <li class="page-item">
          <Link to={`/artists-page/${currentPage - 1}`} class="page-link">Anterior</Link>
        </li>
      {/if}
  
      {#each Array(totalPages).fill(0).map((_, i) => i + 1) as i}
        <li class="page-item {i === currentPage ? 'active' : ''}">
          <Link to={`/artists-page/${i}`} class="page-link">{i}</Link>
        </li>
      {/each}
  
      {#if currentPage < totalPages}
        <li class="page-item">
          <Link to={`/artists-page/${currentPage + 1}`} class="page-link">Siguiente</Link>
        </li>
      {/if}
    </ul>
  </nav>
  
</section>

<style>
  .card-link-wrapper {
    text-decoration: none;
    color: inherit;
    display: block;
    height: 100%;
    transition: transform 0.2s ease-in-out;
  }


  .card-link-wrapper .card {
    height: 100%;
    border: none;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .card-img-top {
    object-fit: cover;
    height: 200px;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .card-title {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .card-text {
    font-size: 0.9rem;
    color: #555;
    flex-grow: 1;
  }

  .btn-outline-light {
    border-color: #ced4da;
    color: #212529;
  }

  .btn-outline-light:hover {
    background-color: #f8f9fa;
    color: #000;
  }

  nav .pagination {
    justify-content: center;
  }

  .pagination .page-item.active .page-link {
    background-color: #000;
    border-color: #000;
    color: #fff;
  }

  .pagination .page-link {
    color: #000;
  }

  .pagination .page-link:hover {
    background-color: #f0f0f0;
  }
</style>
