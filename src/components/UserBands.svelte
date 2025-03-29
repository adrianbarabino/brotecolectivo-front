<script>
  import { onMount } from 'svelte';
  import { user } from '../stores/user.js';
  import { API, MEDIA_URL } from '../config.js';
  import { navigate } from 'svelte-routing';
  import Swal from 'sweetalert2';
  import ArtistLinkRequest from './ArtistLinkRequest.svelte';

  export let userId;
  
  let bands = [];
  let loading = true;
  let error = null;
  let showLinkRequest = false;

  onMount(async () => {
    await loadUserBands();
  });

  async function loadUserBands() {
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
      
      const res = await fetch(`${API}/bands/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al cargar los artistas');
      }

      bands = await res.json();
    } catch (err) {
      console.error('Error cargando artistas:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function editBand(id) {
    navigate(`/admin/artists/edit/${id}`);
  }

  function toggleLinkRequest() {
    showLinkRequest = !showLinkRequest;
  }
</script>

<div class="user-bands">
  <div class="header-actions">
    <h3>Mis Artistas</h3>
    <button class="link-request-btn" on:click={toggleLinkRequest}>
      {showLinkRequest ? 'Ocultar formulario' : 'Solicitar vinculación'}
    </button>
  </div>

  {#if showLinkRequest}
    <ArtistLinkRequest />
  {/if}

  {#if loading}
    <div class="loading">
      <p>Cargando artistas...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
    </div>
  {:else if bands.length === 0}
    <div class="empty-state">
      <p>No tienes artistas vinculados todavía.</p>
      <p>Puedes solicitar vinculación a un artista existente o crear uno nuevo.</p>
    </div>
  {:else}
    <div class="bands-grid">
      {#each bands as band}
        <div class="band-card">
          <div class="band-image">
            <img 
              src="{MEDIA_URL}bands/{band.slug}.jpg" 
              alt="{band.name}"
              onerror="this.src='https://via.placeholder.com/300x300?text=Sin+imagen'"
            />
          </div>
          <div class="band-info">
            <h4>{band.name}</h4>
            {#if band.social && band.social.rol}
              <span class="rol-badge">{band.social.rol}</span>
            {/if}
            <button class="edit-btn" on:click={() => editBand(band.id)}>
              Editar
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .user-bands {
    margin-bottom: 2rem;
  }
  
  .header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .link-request-btn {
    padding: 0.5rem 1rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }
  
  .link-request-btn:hover {
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
  
  .bands-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .band-card {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .band-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
  
  .band-image {
    height: 180px;
    overflow: hidden;
  }
  
  .band-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .band-card:hover .band-image img {
    transform: scale(1.05);
  }
  
  .band-info {
    padding: 1rem;
  }
  
  .band-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }
  
  .rol-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background-color: #e0f2f1;
    color: #00796b;
    border-radius: 4px;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
  
  .edit-btn {
    display: block;
    width: 100%;
    padding: 0.5rem;
    background-color: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .edit-btn:hover {
    background-color: #1976D2;
  }
</style>
