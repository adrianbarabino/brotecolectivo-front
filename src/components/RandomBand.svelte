<script>
    import { onMount } from 'svelte';
    import { fetchWithCache } from '../utils/fetchWithCache.js';
    let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
    
    let band = {};
    let loading = true;
    let error = '';
    
    async function loadRandomBand() {
        try {
        const API = 'https://api.brotecolectivo.com';
        const TOKEN = 'token-secreto';
        const data = await fetchWithCache('random-band', `${API}/bands`, {
            headers: {
            Authorization: `Bearer ${TOKEN}`
            }
        });

        // pick a random band from data and replace the data with it    
        const randomIndex = Math.floor(Math.random() * data.length);
        const randomBand = data[randomIndex];
        band = {
            ...randomBand,
            image: `${mediaUrl}bands/${randomBand.slug}.jpg`
        };

        // and cut the bio to 200 characters
        band.bio = band.bio.slice(0, 200) + '...';
        } catch (err) {
        error = err.message;
        } finally {
        loading = false;
        }
    }
    
    onMount(loadRandomBand);
    
    function refresh() {
        loading = true;
        loadRandomBand();
    }
</script>

<div class="card">
    {#if loading}
    <p>Cargando...</p>
    {:else if error}
    <p style="color: red">{error}</p>
    {:else}
    <div class="name">{band.name}</div>
    <img src={band.image} alt={band.name} style="width: 100%; border-radius: 10px; margin-bottom: 1rem;" />
    <div class="bio">{@html band.bio}</div>


    <button on:click={refresh}>Refrescar</button>
    {/if}
</div>