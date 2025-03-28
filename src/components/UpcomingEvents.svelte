<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import { API, TOKEN, MEDIA_URL } from '../config.js';
    import { links } from 'svelte-routing';
  
    let events = [];
    let loading = true;
    let error = '';
  
    onMount(async () => {
      try {
        const data = await fetchWithCache('upcoming-events', `${API}/events`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
  
        const now = new Date();
        events = data
          .map(e => ({ ...e, startDate: new Date(e.date_start) }))
          .filter(e => e.startDate >= now)
          .sort((a, b) => a.startDate - b.startDate)
          .slice(0, 5);
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  </script>
  
  <div class="card mb-4 border-0">
    <div class="card-body">
      <h5 class="card-title mb-4">Próximos eventos</h5>
      
      {#if loading}
        <div class="spinner-border text-secondary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      {:else if error}
        <p class="text-danger">{error}</p>
      {:else if events.length === 0}
        <p>No hay eventos futuros.</p>
      {:else}
        <div class="list-group list-group-flush">
          {#each events as e}
            <a href={`/agenda-cultural/${e.slug}`} use:links class="list-group-item list-group-item-action py-3 px-0 border-0">
              <div class="row g-3 align-items-center">
                <div class="col-md-4 col-5">
                  <img src={`${MEDIA_URL}events/${e.slug}.jpg`} alt={e.title} class="img-fluid rounded" style="object-fit: cover; width: 100%; height: 100px;" />
                </div>
                <div class="col-md-8 col-7">
                  <div class="fw-bold">{e.title}</div>
                  <small class="text-muted">{e.startDate.toLocaleDateString()}</small><br />
                  {#if e.venue}
                    <small class="text-muted">
                      <i class="fa fa-map-marker-alt me-1"></i> {e.venue.name}
                    </small>
                  {/if}
                </div>
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </div>
  