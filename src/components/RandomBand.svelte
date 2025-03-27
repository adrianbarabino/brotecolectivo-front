<script>
    import { onMount, tick} from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import SkeletonCard from './SkeletonCard.svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';
    import { links } from 'svelte-routing';
    import { get } from 'svelte/store';
    import { playerStore } from '../stores/playerStore.js';
  
    let band = {};
    let loading = true;
    let error = '';
  
    async function loadRandomBand() {
      try {
        const data = await fetchWithCache('random-band', `${API}/bands`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
  
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomBand = data[randomIndex];
        band = {
          ...randomBand,
          image: `${MEDIA_URL}bands/${randomBand.slug}.jpg`,
          bio: randomBand.bio?.slice(0, 200) + '...'
        };
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    function refresh() {
      loading = true;
      loadRandomBand();
    }
  
    async function playSong(bandId) {
      const store = get(playerStore);
      const index = store.songs.findIndex(song => song.band_id === bandId);
      if (index !== -1) {
        store.loadSong(index);

        await tick();
        store.playSong();
     }
    }
  
    onMount(loadRandomBand);
  </script>
  
  <div class="card mb-4 border-0 shadow-sm">
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h5 class="card-title mb-0">Banda al azar</h5>
        <button class="btn btn-sm btn-outline-secondary" on:click={refresh}>
          <i class="fas fa-sync-alt"></i>
        </button>
      </div>
  
      {#if loading}
        <SkeletonCard lines={4} />
      {:else if error}
        <p class="text-danger">{error}</p>
      {:else}
        <img src={band.image} alt={band.name} class="img-fluid rounded mb-2" />
        <p class="card-text">{@html band.bio}</p>
        <div class="d-flex justify-content-between">
          <a href={`/artistas/${band.slug}`} use:links class="btn btn-outline-primary btn-sm">Ver más</a>
          {#if $playerStore.songs.find(s => s.band_id === band.id)}
            <button class="btn btn-success btn-sm" on:click={() => playSong(band.id)}>
              <i class="fas fa-play"></i> Escuchar
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>
  