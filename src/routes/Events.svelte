<script>
  import { link } from 'svelte-routing';
import { onMount } from 'svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import Header from '../components/Header.svelte';

  let events = [];
  let error = '';
  let loading = true;
  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';

  const API = 'https://api.brotecolectivo.com';
  const TOKEN = 'token-secreto';

  onMount(async () => {
    try {
      const data = await fetchWithCache('events', `${API}/events`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      // Agregamos las URLs de imagen
      events = data.map(event => ({
        ...event,
        image: `${mediaUrl}events/${event.slug}.jpg`
      }));

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  let breadcrumbs = ['Home', 'Agenda Cultural']

</script>


  
<Header title="Agenda Cultural" subhead="enterate de todos los eventos próximos y pasados" breadcrumbs={breadcrumbs} />
<section class="container">
  {#if loading}
    <div class="grid">
      {#each Array(6) as _}
        <SkeletonCard lines={5} />
      {/each}
    </div>
  {:else if error}
    <p style="color: red">{error}</p>
  {:else if events.length === 0}
    <p>No hay eventos disponibles.</p>
  {:else}
    <div class="grid">
      {#each events as event}
        <div class="card">
          <div class="title">{event.title}</div>
          <div class="info">
            <img src={event.image} alt={event.title} style="width: 100%; border-radius: 10px; margin-bottom: 0.5rem;" />
            📅 {event.date_start} — {event.date_end}<br />
            📍 {event.venue?.name}
          </div>

          {#if event.bands && event.bands.length}
            <div class="bands">
              <strong>Bandas:</strong>
              <ul>
                {#each event.bands as band}
                  <li>{band.name}</li>
                {/each}
              </ul>
            </div>
          {/if}
            <a  href={`/events/${event.slug}`} use:link class="more-btn">Ver más detalles</a>


        </div>
      {/each}
    </div>
  {/if}
</section>