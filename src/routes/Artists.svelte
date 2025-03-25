<script>
  import { onMount } from 'svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  let bands = [];
  let error = '';
  let loading = true;

  const API = 'http://www.adrianbarabino.com:3055';
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
</script>

<style>
  main {
    background-color: #f5f5f5;
    color: #222;
    min-height: 100vh;
    padding: 2rem;
    font-family: system-ui, sans-serif;
  }

  h1 {
    font-size: 2rem;
    margin-bottom: 2rem;
    text-align: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
  }

  .card {
    background: #fff;
    border-radius: 10px;
    padding: 1.5rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: transform 0.2s ease;
  }

  .card:hover {
    transform: translateY(-5px);
  }

  .name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.8rem;
  }

  .bio {
    font-size: 0.95rem;
    color: #555;
    line-height: 1.4;
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
  }

  .social {
    font-size: 0.9rem;
    margin-top: 1rem;
    color: #666;
  }

  .more-btn {
    margin-top: 1rem;
    align-self: flex-start;
    background: #0077cc;
    color: #fff;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
    font-size: 0.9rem;
    text-decoration: none;
  }

  .more-btn:hover {
    background-color: #005fa3;
  }
</style>

<main>
  <h1>Artistas</h1>

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

          <button class="more-btn">Ver más detalles</button>
        </div>
      {/each}
    </div>
  {/if}
</main>
