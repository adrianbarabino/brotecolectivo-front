<script>
    import { onMount } from 'svelte';
    import { useLocation } from 'svelte-routing';
    import SkeletonCard from './SkeletonCard.svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import { Link } from 'svelte-routing';
  
    export let API;
    export let TOKEN;
    export let MEDIA_URL;
  
    const location = useLocation();
  
    let news = [];
    let totalNews = 0;
    let error = '';
    let loading = true;
    let currentPage = 1;
    let newsPerPage = 10;
    let totalPages = 1;
  
    $: {
      const match = $location.pathname.match(/\/news-page\/(\d+)/);
      const newPage = match ? parseInt(match[1]) : 1;
  
      if (newPage !== currentPage) {
        currentPage = newPage;
        loadData();
      }
    }
  
    onMount(() => {
      const match = $location.pathname.match(/\/news-page\/(\d+)/);
      currentPage = match ? parseInt(match[1]) : 1;
      loadData();
    });
    function getPaginationPages(current, total) {
  const pages = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push('...');
    for (let i = current - 1; i <= current + 1; i++) {
      if (i > 1 && i < total) pages.push(i);
    }
    if (current < total - 2) pages.push('...');
    pages.push(total);
  }
  return pages;
}
  
    async function loadData() {
      loading = true;
      try {
        const noticias = await fetchWithCache(`news-page-${currentPage}`, `${API}/news?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${TOKEN}` }
        });
  
        news = noticias.map(n => ({
          ...n,
          image: `${MEDIA_URL}news/${n.slug}.jpg`,
          date: formatDate(n.date),
          content: recortarContenido(n.content)
        }));
  
        const res = await fetch(`${API}/news/count`);
        const data = await res.json();
        totalNews = data.count;
        totalPages = Math.ceil(totalNews / newsPerPage);
  
      } catch (err) {
        error = err.message;
      } finally {
        loading = false;
      }
    }
  
    function formatDate(timestamp) {
      const date = new Date(Number(timestamp) * 1000);
      return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear().toString().slice(2)}`;
    }
  
    function recortarContenido(content) {
      const leermas = content.indexOf('[leermas]');
      if (leermas !== -1) return content.slice(0, leermas) + '...';
      return content.length > 300 ? content.slice(0, 300) + '...' : content;
    }
  </script>
  
  
  <div class="container">
    {#if loading}
      <div class="row">
        {#each Array(3) as _}
          <div class="col-md-6 mb-4">
            <SkeletonCard lines={4} />
          </div>
        {/each}
      </div>
    {:else if error}
      <p class="text-danger">{error}</p>
    {:else if news.length === 0}
      <p>No hay noticias disponibles.</p>
    {:else}
      <!-- Nota destacada -->
      <a href={`/news/${news[0].slug}`} class="text-decoration-none text-dark">
        <div class="card mb-4 shadow-sm border-0 position-relative">
          <div class="position-relative">
            <img src={news[0].image} class="card-img-top rounded-top" alt={news[0].title} />
            <span class="badge bg-dark position-absolute top-0 start-0 m-2">{news[0].date}</span>
          </div>
          <div class="card-body">
            <h4 class="card-title fw-bold">{news[0].title}</h4>
            <div class="card-text">{@html news[0].content}</div>
          </div>
        </div>
      </a>
  
      <!-- Noticias restantes -->
      <div class="row">
        {#each news.slice(1) as n}
          <div class="col-md-4 mb-4">
            <a href={`/news/${n.slug}`} class="text-decoration-none text-dark">
              <div class="card h-100 shadow-sm border-0 position-relative">
                <div class="position-relative">
                  <img src={n.image} class="card-img-top rounded-top" alt={n.title} />
                  <span class="badge bg-dark position-absolute top-0 start-0 m-2">{n.date}</span>
                </div>
                <div class="card-body d-flex flex-column">
                  <h6 class="card-title fw-bold">{n.title}</h6>
                </div>
              </div>
            </a>
          </div>
        {/each}
      </div>
  
      <!-- Paginación -->

      <nav class="my-4">
        <ul class="pagination justify-content-center">
          {#if totalPages > 1}
            {#each getPaginationPages(currentPage, totalPages) as p}
              {#if p === '...'}
                <li class="page-item disabled"><span class="page-link">…</span></li>
              {:else}
                <li class="page-item {p === currentPage ? 'active' : ''}">
                  <Link to={`/news-page/${p}`} class="page-link">{p}</Link>
                </li>
              {/if}
            {/each}
          {/if}
        </ul>
      </nav>
      
    {/if}
  </div>
  
  <style>
    .card-title {
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
  
    .card-text {
      font-size: 0.95rem;
      color: #333;
    }
  
    .badge {
      font-size: 0.75rem;
      padding: 0.4em 0.6em;
    }
  

  
    .pagination .page-item.active .page-link {
      background-color: #000;
      border-color: #000;
      color: #fff;
    }
    .container{
        padding-bottom:4em;
    }
  </style>
  