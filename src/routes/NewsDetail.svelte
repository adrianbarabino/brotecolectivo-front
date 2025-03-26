<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import Header from '../components/Header.svelte';
  
    let newsItem = null;
    let error = '';
    let loading = true;
  
    const API = 'https://api.brotecolectivo.com';
    const TOKEN = 'token-secreto';
    const mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  
    onMount(async () => {
      try {
        const slug = window.location.pathname.split('/').pop();
        const news = await fetchWithCache('news', `${API}/news`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`
          }
        });
  
        newsItem = news.find(n => n.slug === slug);
        if (newsItem) {
          newsItem.image = `${mediaUrl}news/${newsItem.slug}.jpg`;
        }
  
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    });
  
    let breadcrumbs = ['Home', 'Noticias', 'Detalle'];
  </script>
  
  <Header title={newsItem ? newsItem.title : "Detalle de Noticia"} subhead="Leé la nota completa" breadcrumbs={breadcrumbs} />
  
  <section class="container">
    {#if loading}
      <div class="grid">
        <SkeletonCard lines={5} />
      </div>
    {:else if error}
      <p style="color: red">{error}</p>
    {:else if !newsItem}
      <p>Noticia no encontrada.</p>
    {:else}
      <div class="card">
        <div class="title">{newsItem.title}</div>
        <img src={newsItem.image} alt={newsItem.title} />
        <div class="content">{@html newsItem.content}</div>
  
        {#if newsItem.bands && newsItem.bands.length > 0}
          <div class="bands">
            <strong>Bandas asociadas:</strong>
            <ul>
              {#each newsItem.bands as band}
                <li>{band.name}</li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    {/if}
  </section>
  
  <style>
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 2rem;
    }
  
    img {
      max-width: 100%;
      border-radius: 10px;
      margin: 1rem 0;
    }
  
    .title {
      font-size: 1.8rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
  
    .content {
      font-size: 1rem;
      line-height: 1.6;
      color: #444;
    }
  
    .bands {
      margin-top: 2rem;
      font-size: 0.95rem;
    }
  </style>
  