<script>
    import { onMount } from 'svelte';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import SongList from '../components/SongList.svelte';
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
        loading = false;
      }
    });
   let breadcrumbs = ['Home', 'Noticias']
  </script>
    
    <Header title="Noticias Culturales" subhead="sección informativa de la cultura local y regional" breadcrumbs={breadcrumbs} />
    <section class="container">
  
    
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
      <SongList />
    </section>