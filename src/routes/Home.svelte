<script>
  import { onMount } from 'svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
 
  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';

  let news = [];
  let error = '';
  let loading = true;

  const API = 'http://www.adrianbarabino.com:3055';
  const TOKEN = 'token-secreto';

  onMount(async () => {
    try {
      news = await fetchWithCache('news', `${API}/news`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });
    } catch (err) {
      error = err.message;
    } finally {
      news = news.map(newsSingle => ({
        ...newsSingle,
        image: `${mediaUrl}news/${newsSingle.slug}.jpg`
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
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
  
    .title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #333;
    }
  
    .content {
      font-size: 0.95rem;
      color: #555;
      line-height: 1.4;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 6;
      -webkit-box-orient: vertical;
    }
  
    .bands {
      margin-top: 0.8rem;
      font-size: 0.9rem;
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
    <h1>Noticias</h1>
  
    {#if loading}
      <div class="grid">
        {#each Array(6) as _}
          <SkeletonCard lines={4} />
        {/each}
      </div>
    {:else if error}
      <p style="color: red">{error}</p>
    {:else if news.length === 0}
      <p>No hay noticias disponibles.</p>
    {:else}
      <div class="grid">
        {#each news as n}
          <div class="card">
            <div class="title">{n.title}</div>

              <img src={n.image} alt={n.title} />
            <div class="content">{@html n.content}</div>

  
            {#if n.bands && n.bands.length > 0}
              <div class="bands">
                <strong>Bandas asociadas:</strong>
                <ul>
                  {#each n.bands as b}
                    <li>{b.name}</li>
                  {/each}
                </ul>
              </div>
            {/if}
  
            <button class="more-btn">Ver más detalles</button>
          </div>
        {/each}
      </div>
    {/if}
  </main>
  