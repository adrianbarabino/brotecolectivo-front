<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import Header from '../components/Header.svelte';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';

    let event = null;
    let error = '';
    let loading = true;

    onMount(async () => {
        const slug = window.location.pathname.split('/').pop();
        try {
            event = await fetchWithCache(`event-${slug}`, `${API}/events/${slug}`, {
                headers: {
                    Authorization: `Bearer ${TOKEN}`
                }
            });

            event.image = `${MEDIA_URL}events/${event.slug}.jpg`;
        } catch (err) {
            error = err.message || 'Error al cargar el evento.';
        } finally {
            loading = false;
        }
    });

    let breadcrumbs = ['Home', 'Agenda Cultural', 'Eventos'];
</script>

<Header title="Agenda Cultural" subhead="enterate de todos los eventos próximos y pasados" breadcrumbs={breadcrumbs} />

<section class="container my-4">
    {#if loading}
        <div class="row">
            {#each Array(6) as _}
                <div class="col-md-4 mb-4">
                    <SkeletonCard lines={5} />
                </div>
            {/each}
        </div>
    {:else if error}
        <div class="alert alert-danger">{error}</div>
    {:else if !event}
        <div class="alert alert-warning">No se encontró el evento.</div>
    {:else}
        <div class="card mb-4 shadow-sm">
            <div class="card-body">
                <h2 class="card-title">{event.title}</h2>
                <div class="d-flex mb-3 align-items-start">
                    <img src={event.image} alt={event.title} class="img-thumbnail me-3" style="max-width: 200px;" />
                    <div>
                        <p class="mb-1">📅 {event.date_start} — {event.date_end}</p>
                        <p class="mb-1">📍 {event.location}</p>
                    </div>
                </div>
                <div class="card-text">{@html event.content}</div>
            </div>
        </div>

        {#if event.bands && event.bands.length > 0}
            <h3 class="mb-3">Bandas participantes</h3>
            <div class="row">
                {#each event.bands as band}
                    <div class="col-md-6 col-lg-4 mb-4">
                        <div class="card h-100 shadow-sm">
                            <div class="card-body">
                                <h5 class="card-title">{band.name}</h5>
                                <img src={`${MEDIA_URL}bands/${band.slug}.jpg`} alt={band.name} class="img-thumbnail mb-3" style="max-width: 100%;" />
                                <div class="card-text">{@html band.bio}</div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</section>
