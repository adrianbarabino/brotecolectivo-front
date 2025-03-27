<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import { API, TOKEN } from '../config.js';
    import { links } from 'svelte-routing';
    let video = {};
    let loading = true;
    let error = '';
  
    async function loadRandomVideo() {
      try {
        const data = await fetchWithCache('random-video', `${API}/videos`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        const randomIndex = Math.floor(Math.random() * data.length);
        const v = data[randomIndex];
  
        video = {
          ...v,
          embed: `https://www.youtube.com/embed/${v.youtube_id}`
        };
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    onMount(loadRandomVideo);
    function refresh() {
      loading = true;
      loadRandomVideo();
    }
  </script>
  
  <div class="card border-0 mb-4">
    <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
            <h5 class="card-title mb-0">Video al azar</h5>
            <button class="btn btn-sm btn-outline-secondary" on:click={refresh}>
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
      
      {#if loading}
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      {:else if error}
        <p class="text-danger">{error}</p>
      {:else}
        
        <div class="ratio ratio-16x9 mb-3">
          <iframe
            src={video.embed}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        <h6 class="card-subtitle mb-2">{video.title}</h6>

        {#if video.bands && video.bands.length > 0}
          <p class="mb-2">

            <strong>Banda:</strong> 
            <a use:links href={`/bands/${video.bands[0].slug}`}>{video.bands[0].name}</a>
          </p>
        {/if}
  
      {/if}
    </div>
  </div>
  