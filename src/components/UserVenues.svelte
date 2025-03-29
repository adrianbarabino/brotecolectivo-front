<script>
  import { onMount } from 'svelte';
  import { API, MEDIA_URL } from '../config.js';
  import { navigate } from 'svelte-routing';

  export let userId;
  
  let venues = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    await loadUserVenues();
  });

  async function loadUserVenues() {
    try {
      loading = true;
      // Obtener el token de acceso del localStorage
      let token = localStorage.getItem('access_token');
      
      // Si no hay token o hay problemas de autenticación, usar token de depuración
      if (!token) {
        console.log("[DEBUG] No se encontró token en localStorage, usando token de depuración");
        token = 'token-secreto';
      }
      
      console.log("[DEBUG] Usando token para autenticación:", token.substring(0, 10) + "...");
      
      const res = await fetch(`${API}/venues/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al cargar los espacios culturales');
      }

      venues = await res.json();
    } catch (err) {
      console.error('Error cargando espacios culturales:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function editVenue(id) {
    navigate(`/admin/venues/edit/${id}`);
  }
</script>

<div class="user-venues">
  <div class="header-actions">
    <h3>Mis Espacios Culturales</h3>
    <a href="/admin/venues/add" class="add-btn">Crear nuevo espacio</a>
  </div>

  {#if loading}
    <div class="loading">
      <p>Cargando espacios culturales...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
    </div>
  {:else if venues.length === 0}
    <div class="empty-state">
      <p>No tienes espacios culturales vinculados todavía.</p>
      <p>Puedes crear un nuevo espacio desde tu panel.</p>
    </div>
  {:else}
    <div class="venues-grid">
      {#each venues as venue}
        <div class="venue-card">
          <div class="venue-image">
            <img 
              src="{MEDIA_URL}venues/{venue.slug}.jpg" 
              alt="{venue.name}"
              onerror="this.src='https://via.placeholder.com/300x300?text=Sin+imagen'"
            />
          </div>
          <div class="venue-info">
            <h4>{venue.name}</h4>
            <p class="venue-address">{venue.address}</p>
            <p class="venue-city">{venue.city || 'Sin ciudad'}</p>
            <button class="edit-btn" on:click={() => editVenue(venue.id)}>
              Editar
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .user-venues {
    margin-bottom: 2rem;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .add-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
    text-decoration: none;
    display: inline-block;
  }
  
  .add-btn:hover {
    background-color: #45a049;
  }

  h3 {
    margin: 0;
  }
  
  .loading, .error, .empty-state {
    padding: 2rem;
    text-align: center;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-top: 1rem;
  }
  
  .error {
    background-color: #ffebee;
    color: #c62828;
  }
  
  .venues-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .venue-card {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .venue-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
  
  .venue-image {
    height: 180px;
    overflow: hidden;
  }
  
  .venue-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .venue-card:hover .venue-image img {
    transform: scale(1.05);
  }
  
  .venue-info {
    padding: 1rem;
  }
  
  .venue-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }
  
  .venue-address, .venue-city {
    margin: 0.2rem 0;
    font-size: 0.9rem;
    color: #666;
  }
  
  .edit-btn {
    margin-top: 0.5rem;
    padding: 0.4rem 0.8rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .edit-btn:hover {
    background-color: #0b7dda;
  }
</style>
