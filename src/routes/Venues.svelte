<script>
    import { onMount } from 'svelte';
    import VenueCard from '../components/VenueCard.svelte';
  
    let venues = [];
    let error = '';
    let loading = true;
  
    onMount(async () => {
      try {
        const res = await fetch('http://www.adrianbarabino.com:3055/venues', {
          headers: {
            Authorization: 'Bearer token-secreto'
          }
        });
        if (!res.ok) throw new Error('Error al obtener venues');
        venues = await res.json();
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
      color: #fff;
      padding-left: 2rem;
    }
  </style>
  
  <h1>Espacios culturales</h1>
  
  {#if loading}
    <p>Cargando...</p>
  {:else if error}
    <p style="color:red">{error}</p>
  {:else}
    <div class="venues-container">
      {#each venues as venue}
        <VenueCard {venue} />
      {/each}
    </div>
  {/if}
  