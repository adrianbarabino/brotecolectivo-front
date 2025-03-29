<script>
  import { onMount } from 'svelte';
  import VenueCard from '../components/VenueCard.svelte';
  import SkeletonCard from '../components/SkeletonCard.svelte';
  import { fetchWithCache } from '../utils/fetchWithCache.js';
  import { API, TOKEN, MEDIA_URL } from '../config.js';
  import Header from '../components/Header.svelte';

  let venues = [];
  let error = '';
  let loading = true;
  let breadcrumbs = ['Home', 'Espacios Culturales'];

  onMount(async () => {
    try {
      venues = await fetchWithCache('venues', `${API}/venues`, {
        headers: { Authorization: `Bearer ${TOKEN}` }
      });
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

<style>
  .venues-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 2rem;
  }

  h1 {
    color: #222;
    padding: 2rem 2rem 0;
    font-size: 2rem;
  }
</style>

<Header title="Espacios Culturales" subhead="Conocé los espacios culturales de Santa Cruz" breadcrumbs={breadcrumbs} />

{#if loading}
  <div class="venues-container">
    {#each Array(6) as _, i}
      <SkeletonCard key={i} lines={4} />
    {/each}
  </div>
{:else if error}
  <p style="color:red; padding-left:2rem">{error}</p>
{:else}
  <div class="venues-container">
    {#each venues as venue}
      <VenueCard {venue} />
    {/each}
  </div>
{/if}
