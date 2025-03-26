<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    import Header from '../components/Header.svelte';
    import SkeletonCard from '../components/SkeletonCard.svelte';
    let event = {};
    let error = '';
    let loading = true;
    let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
    
    const API = 'https://api.brotecolectivo.com';
    const TOKEN = 'token-secreto';
    
    onMount(async () => {
        try {
        const data = await fetchWithCache('events', `${API}/events`, {
            headers: {
            Authorization: `Bearer ${TOKEN}`
            }
        });
    
        const path = window.location.pathname; // devuelve "/events/nombre-del-evento"
const slug = path.split('/').pop(); // extrae "nombre-del-evento"

        event = data.find(event => event.slug === slug);
    
        // add the image URL
        event.image = `${mediaUrl}events/${event.slug}.jpg`;
    
        } catch (err) {
        error = err.message;
        } finally {
        loading = false;
        }
    });
    
    let breadcrumbs = ['Home', 'Agenda Cultural', 'Eventos'];
</script>
<Header title="Agenda Cultural" subhead="enterate de todos los eventos próximos y pasados" breadcrumbs={breadcrumbs} />
<section class="container">
    {#if loading}
    <div class="grid">
        {#each Array(6) as _}
        <SkeletonCard lines={5} />
        {/each}
    </div>
    {:else if error}
    <p style="color: red">{error}</p>
    {:else if !event}
    <p>No se encontró el evento.</p>
    {:else}
    <div class="card">
        <div class="title">{event.title}</div>
        <div class="info">
        <img src={event.image} alt={event.title} style="width: 100%; border-radius: 10px; margin-bottom: 0.5rem;" />
        📅 {event.date_start} — {event.date_end}<br />
        📍 {event.location}<br />
        </div>
        <div class="content">{@html event.content}</div>
    </div>
    {#if event.bands && event.bands.length > 0}
        <h2>Bandas participantes</h2>
        <div class="grid">
        {#each event.bands as band}
            <div class="card">
            <div class="name">{band.name}</div>
            <img src={`${mediaUrl}bands/${band.slug}.jpg`} alt={band.name} style="width: 100%; border-radius: 10px; margin-bottom: 1rem;" />
            <div class="bio">{@html band.bio}</div>
            </div>
        {/each}
        </div>
    {/if}
    {/if}
</section>


