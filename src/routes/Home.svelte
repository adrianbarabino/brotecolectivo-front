<script>
  import { onMount } from 'svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import RandomBand from '../components/RandomBand.svelte';
  import Header from '../components/Header.svelte';
  let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';

  let news = [];
  let error = '';
  let loading = true;

  const API = 'https://api.brotecolectivo.com';
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

      // recortar las notas a los 300 caracteres o hasta encontrar un [leermas] como shortcode para leer más
      news = news.map(n => {
        let content = n.content;
        if (content.length > 300) {
          content = content.slice(0, 300);
          const readMoreIndex = content.indexOf('[leermas]');
          if (readMoreIndex !== -1) {
            content = content.slice(0, readMoreIndex);
          }
          content += '...';
        }
        return {
          ...n,
          content
        };
      });
      loading = false;
    }
  });
 let breadcrumbs = ['Home', 'Noticias']
</script>
  
  <Header title="Bienvenido a Brote Colectivo" subhead="sitio de difusión cultural en Santa Cruz, Argentina" breadcrumbs={breadcrumbs} />
  <section class="container row">
    <div class="col-md-8">

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
  
            <a class="more-btn" href={`/news/${n.slug}`}>Ver más detalles</a>
          </div>
        {/each}
      </div>
    {/if}

    </div>
    <aside class="col-md-4">
      <RandomBand />
    </aside>
  
  </section>

  <style>
    .row {
      display: flex;
      flex-wrap: wrap;
    }

    .col-md-8 {
      flex: 0 0 66.6666666667%;
      max-width: 66.6666666667%;
    }
    .col-md-4 {
      flex: 0 0 33.3333333333%;
      max-width: 33.3333333333%;
    }
  </style>