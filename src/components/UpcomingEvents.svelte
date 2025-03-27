<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import { API, TOKEN } from '../config.js';
    import { links } from 'svelte-routing';
  
    let events = [];
    let loading = true;
    let error = '';
  
    onMount(async () => {
      try {
        const data = await fetchWithCache('upcoming-events', `${API}/events`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
        const now = new Date().toISOString();
        events = data
          .filter(e => e.date >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  </script>
  
  <div class="card mb-4 border-0 ">
    <div class="card-body">
      <h5 class="card-title">Próximos eventos</h5>
      {#if loading}
        <div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Cargando...</span></div>
      {:else if error}
        <p class="text-danger">{error}</p>
      {:else if events.length === 0}
        <p>No hay eventos futuros.</p>
      {:else}
        <ul class="list-group list-group-flush">
          {#each events as e}
            <li class="list-group-item">
              <a href={`/agenda-cultural/${e.id}`} use:links class="text-decoration-none text-dark d-block">
                <strong>{new Date(e.date).toLocaleDateString()}</strong> – {e.name}
                {#if e.venue}
                  <br /><small class="text-muted">📍 {e.venue.name}</small>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
  