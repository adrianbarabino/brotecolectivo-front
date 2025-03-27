<script>
  import { onMount } from 'svelte';
  import { useLocation, Link } from 'svelte-routing';
  import Header from '../components/Header.svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import { API, TOKEN, MEDIA_URL } from '../config.js';

  let events = [];
  let upcomingEvents = [];
  let pastEvents = [];

  let pageUpcoming = 1;
  let pagePast = 1;
  const eventsPerPage = 6;

  let loading = true;
  let error = '';
  let showPast = false;

  const location = useLocation();

  onMount(() => {
    loadData();
  });

  async function loadData() {
    loading = true;
    try {
      const data = await fetchWithCache(`events`, `${API}/events?limit=1000`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });

      const now = new Date();

      events = data.map(event => ({
        ...event,
        image: `${MEDIA_URL}events/${event.slug}.jpg`,

        startDate: new Date(event.date_start)
      }));

      // create displayDate as a formatted string like "dd/mm/yyyy 20:00" 
      events.forEach(event => {
        const date = new Date(event.startDate);
        event.displayDate = date.toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        event.displayDate = event.displayDate.replace(',', ''); // remove the comma
        event.displayDate = event.displayDate.replace(' ', ' a las '); // replace space with "a las"
      });

      upcomingEvents = events.filter(e => e.startDate >= now);
      pastEvents = events.filter(e => e.startDate < now);
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function paginate(list, page) {
    const start = (page - 1) * eventsPerPage;
    return list.slice(start, start + eventsPerPage);
  }

  $: visibleUpcomingEvents = paginate(upcomingEvents, pageUpcoming);
  $: visiblePastEvents = paginate(pastEvents, pagePast);

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
  let breadcrumbs = ['Home', 'Agenda Cultural'];
</script>

<Header title="Agenda Cultural" subhead="Enterate de todos los eventos próximos y pasados" breadcrumbs={breadcrumbs} />

<section class="container my-5">
  <div class="text-center mb-4">
    <button class="btn btn-dark me-2" class:active-btn={!showPast} on:click={() => (showPast = false)}>Eventos próximos</button>
    <button class="btn btn-outline-secondary" class:active-btn={showPast} on:click={() => (showPast = true)}>Eventos pasados</button>
  </div>

  {#if loading}
    <div class="row">
      {#each Array(eventsPerPage) as _}
        <div class="col-md-4 mb-4"><SkeletonCard lines={5} /></div>
      {/each}
    </div>
  {:else if error}
    <p class="text-danger text-center">{error}</p>
  {:else if !showPast && upcomingEvents.length === 0}
    <p class="text-center">No hay eventos próximos en este momento.</p>
  {:else if showPast && pastEvents.length === 0}
    <p class="text-center">No hay eventos pasados registrados.</p>
  {:else}
    <div class="row">
      {#each showPast ? visiblePastEvents : visibleUpcomingEvents as event}
        <div class="col-md-4 mb-4">
          <Link to={`/agenda-cultural/${event.slug}`} class="card-link-wrapper">
            <div class="card h-100 shadow-sm position-relative overflow-hidden">
              <div class="date-overlay">{event.displayDate}</div>
              <img src={event.image} alt={event.title} class="card-img-top" />
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{event.title}</h5>
                <p class="card-text text-muted">
                  <i class="fa-solid fa-map-marker-alt me-1"></i> {event.venue?.name}
                </p>
              </div>
            </div>
          </Link>
        </div>
      {/each}
    </div>

    <nav class="my-4">
      <ul class="pagination justify-content-center">
        {#if (showPast ? pastEvents : upcomingEvents).length > eventsPerPage}
          {#each getPaginationPages(showPast ? pagePast : pageUpcoming, Math.ceil((showPast ? pastEvents : upcomingEvents).length / eventsPerPage)) as p}
            {#if p === '...'}
              <li class="page-item disabled"><span class="page-link">…</span></li>
            {:else}
              <li class="page-item {p === (showPast ? pagePast : pageUpcoming) ? 'active' : ''}">
                <button class="page-link" on:click={() => showPast ? pagePast = p : pageUpcoming = p}>{p}</button>
              </li>
            {/if}
          {/each}
        {/if}
      </ul>
    </nav>
    
  {/if}
</section>

<style>
  .card-img-top {
    object-fit: cover;
    height: 200px;
  }

  .card-link-wrapper {
    text-decoration: none;
    color: inherit;
    display: block;
  }

  .card-body {
    display: flex;
    flex-direction: column;
  }

  .date-overlay {
    position: absolute;
    top: 10px;
    left: 10px;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    z-index: 2;
  }

  .btn.active-btn,
  .btn:focus.active-btn {
    background-color: #000 !important;
    color: #fff !important;
    border: 1px solid #000;
  }
</style>
