<script>
  import { onMount } from 'svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import Header from '../components/Header.svelte';

  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  let bands = [];
  let error = '';
  let loading = true;

  const API = 'https://api.brotecolectivo.com';
  const TOKEN = 'token-secreto';

  onMount(async () => {
    try {
      bands = await fetchWithCache('bands', `${API}/bands`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });
    } catch (err) {
      error = err.message;
    } finally {
      bands = bands.map(band => ({
        ...band,
        image: `${mediaUrl}bands/${band.slug}.jpg`
      }));
      
      
      loading = false;
    }
  });
  let breadcrumbs = ['Home', 'Artistas']

</script>

  
<Header title="Nuestros artistas" subhead="conocé a los protagonistas de este sitio" breadcrumbs={breadcrumbs} />
  <section class="container">
  {#if loading}
    <div class="grid">
      {#each Array(6) as _}
        <SkeletonCard lines={3} />
      {/each}
    </div>
  {:else if error}
    <p style="color: red">{error}</p>
  {:else if bands.length === 0}
    <p>No hay artistas registrados.</p>
  {:else}
    <div class="grid">
      {#each bands as band}
        <div class="card">
          <div class="name">{band.name}</div>
          <img src={band.image} alt={band.name} style="width: 100%; border-radius: 10px; margin-bottom: 1rem;" />
          <div class="bio">{@html band.bio}</div>

          {#if band.social && Object.keys(band.social).length > 0}
            <div class="social">
              Redes: {Object.entries(band.social).map(([key, val]) => `${key}: ${val}`).join(' | ')}
            </div>
          {/if}

          <a class="more-btn" href={`/artists/${band.id}`}>Ver más detalles</a>
        </div>
      {/each}
    </div>
  {/if}
  </section>