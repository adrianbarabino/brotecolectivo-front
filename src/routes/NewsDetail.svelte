<script>
  import { onMount } from 'svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import Header from '../components/Header.svelte';
  import { API, TOKEN, MEDIA_URL } from '../config.js';
  import Sidebar from '../components/Sidebar.svelte';
  import { links } from 'svelte-routing';

  let newsItem = null;
  let error = '';
  let loading = true;

  onMount(async () => {
    try {
      const slug = window.location.pathname.split('/').pop();
      const news = await fetchWithCache('news', `${API}/news/${slug}`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      });

      newsItem = news;
      if (newsItem) {
        newsItem.image = `${MEDIA_URL}news/${newsItem.slug}.jpg`;
      }

      if (newsItem.content.includes('[leermas]')) {
        newsItem.content = newsItem.content.replace('[leermas]', '');
      }

    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });

  let breadcrumbs = ['Home', 'Noticias', 'Detalle'];

  function formatDate(unixTimestamp) {
    const date = new Date(unixTimestamp * 1000);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  function shareOn(platform) {
    const url = window.location.href;
    const text = newsItem.title;
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
  }
</script>

<Header title={newsItem ? newsItem.title : "Detalle de Noticia"} subhead="Leé la nota completa" breadcrumbs={breadcrumbs} />

<section class="container row">
  <div class="col-md-8">
    {#if loading}
      <div class="grid">
        <SkeletonCard lines={5} />
      </div>
    {:else if error}
      <p class="error">{error}</p>
    {:else if !newsItem}
      <p>Noticia no encontrada.</p>
    {:else}
      <article class="news">
        <figure class="news-header-image">
          <img src={newsItem.image} alt={newsItem.title} />
        </figure>

        <header>
          <h1 class="title">{newsItem.title}</h1>
          <p class="date">Publicado el {formatDate(newsItem.date)}</p>
        </header>

        <div class="content">
          {@html newsItem.content}
        </div>

        <div class="share">
          <span>Compartir:</span>
          <button on:click={() => shareOn('whatsapp')}><i class="fab fa-whatsapp"></i> WhatsApp</button>
          <button on:click={() => shareOn('facebook')}><i class="fab fa-facebook"></i> Facebook</button>
          <button on:click={() => shareOn('twitter')}><i class="fab fa-x"></i> X</button>
        </div>

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
      </article>
    {/if}
    <a href="/news" use:links class="btn btn-primary mt-2">Volver a noticias</a>
  </div>

  <Sidebar />
</section>

<style>
  .error {
    color: red;
  }

  .news {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem 1rem;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 0 10px rgba(0,0,0,0.05);
  }

  .news-header-image {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    margin: 0 0 1rem 0;
    border-radius: 12px;
  }

  .news-header-image img {
    width: 100%;
    height: auto;
    display: block;
    object-fit: cover;
  }

  .title {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 0.2rem;
  }

  .date {
    font-size: 0.9rem;
    color: #888;
    margin-bottom: 1.5rem;
  }

  .share {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .share span {
    font-weight: bold;
    margin-right: 0.5rem;
  }

  .share button {
    background: #f0f0f0;
    border: none;
    padding: 0.3rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
  }

  .share button:hover {
    background-color: #e0e0e0;
  }

  .bands {
    font-size: 0.95rem;
    color: #555;
    margin-top: 2rem;
  }

  .bands ul {
    padding-left: 1rem;
    margin-top: 0.5rem;
  }

  .bands li {
    list-style-type: disc;
  }

  @media (max-width: 600px) {
    .title {
      text-align: center;
    }

    .news-header-image img {
      max-height: 300px;
    }
  }

  .titleContainer {
    align-content: space-evenly;
  }
</style>
