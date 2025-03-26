<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import Header from '../components/Header.svelte';
  
    let band = null;
    let error = '';
    let loading = true;
    let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  
    const API = 'https://api.brotecolectivo.com';
    const TOKEN = 'token-secreto';
  
    onMount(async () => {
    const path = window.location.pathname;
    const id = path.split('/').pop(); // obtiene el ID numérico desde la URL

    try {
      band = await fetchWithCache(`band-${id}`, `${API}/bands/${id}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      band.image = `${mediaUrl}bands/${band.slug}.jpg`;
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  
    let breadcrumbs = ['Home', 'Artistas', 'Detalle'];
  </script>
  
  <Header title="Artista" subhead="información detallada del artista seleccionado" breadcrumbs={breadcrumbs} />
  
  <section class="container">
    {#if loading}
      <SkeletonCard lines={6} />
    {:else if error}
      <p style="color: red">{error}</p>
    {:else if !band}
      <p>No se encontró el artista.</p>
    {:else}
      <div class="card">
        <h2>{band.name}</h2>
        <img src={band.image} alt={band.name} style="width: 100%; border-radius: 10px; margin-bottom: 1rem;" />
        <div class="bio">{@html band.bio}</div>
  
        {#if band.social && Object.keys(band.social).length > 0}
          <div class="social">
            <h4>Redes sociales:</h4>
            <ul>
              {#each Object.entries(band.social) as [key, val]}
                <li>{key}: <a href={val} target="_blank">{val}</a></li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </section>
  