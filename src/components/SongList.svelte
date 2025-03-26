<script>
    import { onMount } from 'svelte';
    import SkeletonCard from './SkeletonCard.svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
  
    let songs = [];
    let error = '';
    let loading = true;
    const API = 'https://api.brotecolectivo.com';
    const TOKEN = 'token-secreto';
    const mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/songs/';
  
    onMount(async () => {
      try {
        songs = await fetchWithCache('songs', `${API}/songs`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  </script>
  
  <style>
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }
  
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
  
    .title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #333;
    }
  
    .meta {
      font-size: 0.9rem;
      color: #555;
      margin-bottom: 0.5rem;
    }
  
    audio {
      margin-top: 1rem;
      width: 100%;
    }
  </style>
  
  <h2>Canciones</h2>
  
  {#if loading}
    <div class="grid">
      {#each Array(4) as _}
        <SkeletonCard lines={3} />
      {/each}
    </div>
  {:else if error}
    <p style="color: red">{error}</p>
  {:else if songs.length === 0}
    <p>No hay canciones disponibles.</p>
  {:else}
    <div class="grid">
      {#each songs as song}
        <div class="card">
          <div class="title">{song.title}</div>
          <div class="meta">
            🎸 Banda: {song.band?.name || 'Desconocida'}<br />
            🎵 Género: {song.genre?.name || 'Sin especificar'}
          </div>
  
          <audio controls>
            <source src={`${mediaUrl}${song.slug}.mp3`} type="audio/mpeg" />
            Tu navegador no soporta audio HTML5.
          </audio>
        </div>
      {/each}
    </div>
  {/if}
  