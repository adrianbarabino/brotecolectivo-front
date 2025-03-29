<script>
  import { onMount } from 'svelte';
  import { user } from '../stores/user.js';
  import { API } from '../config.js';
  import Swal from 'sweetalert2';

  let searchQuery = '';
  let searchResults = [];
  let selectedArtist = null;
  let loading = false;
  let whatsappNumber = '';
  let rol = 'colaborador';

  // Opciones de rol
  const rolOptions = [
    { value: 'colaborador', label: 'Colaborador' },
    { value: 'integrante', label: 'Integrante' },
    { value: 'manager', label: 'Manager' }
  ];

  // Buscar artistas
  async function searchArtists() {
    if (searchQuery.length < 2) {
      searchResults = [];
      return;
    }

    loading = true;
    try {
      const res = await fetch(`${API}/bands/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) {
        throw new Error('Error al buscar artistas');
      }
      searchResults = await res.json();
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los artistas. Intenta nuevamente.'
      });
    } finally {
      loading = false;
    }
  }

  // Seleccionar un artista
  function selectArtist(artist) {
    selectedArtist = artist;
    searchResults = [];
    searchQuery = artist.name;
  }

  // Enviar solicitud de vinculación
  async function submitRequest() {
    if (!selectedArtist) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un artista',
        text: 'Debes seleccionar un artista para solicitar la vinculación'
      });
      return;
    }

    if (!$user || !$user.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para solicitar la vinculación'
      });
      return;
    }

    loading = true;
    try {
      // Datos para la solicitud
      const submissionData = {
        user_id: $user.id,
        type: 'artist_link',
        data: {
          artist_id: selectedArtist.id,
          name: selectedArtist.name,
          slug: selectedArtist.slug,
          rol: rol,
          whatsapp: whatsappNumber
        }
      };

      // Enviar solicitud
      const res = await fetch(`${API}/submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
        },
        body: JSON.stringify(submissionData)
      });

      if (!res.ok) {
        throw new Error('Error al enviar la solicitud');
      }

      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: '¡Solicitud enviada!',
        text: 'Tu solicitud de vinculación ha sido enviada. Te notificaremos cuando sea aprobada.'
      });

      // Limpiar formulario
      selectedArtist = null;
      searchQuery = '';
      whatsappNumber = '';
      rol = 'colaborador';
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo enviar la solicitud. Intenta nuevamente.'
      });
    } finally {
      loading = false;
    }
  }

  // Detectar cambios en la búsqueda
  let searchTimeout;
  
  $: {
    if (searchQuery) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchArtists();
      }, 300);
    }
  }
</script>

<div class="artist-link-request">
  <h3>Solicitar vinculación a un artista existente</h3>
  
  <div class="form-group">
    <label for="artist-search">Buscar artista:</label>
    <div class="search-container">
      <input 
        type="text" 
        id="artist-search" 
        bind:value={searchQuery} 
        placeholder="Escribe el nombre del artista..." 
        autocomplete="off"
      />
      {#if loading}
        <div class="spinner"></div>
      {/if}
    </div>
    
    {#if searchResults && searchResults.length > 0}
      <div class="search-results">
        {#each searchResults as artist}
          <div class="search-result-item" on:click={() => selectArtist(artist)}>
            {artist.name}
          </div>
        {/each}
      </div>
    {/if}
  </div>

  {#if selectedArtist}
    <div class="selected-artist">
      <h4>Artista seleccionado: {selectedArtist.name}</h4>
      
      <div class="form-group">
        <label for="rol">Tu rol en este artista:</label>
        <select id="rol" bind:value={rol}>
          {#each rolOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>
      
      <div class="form-group">
        <label for="whatsapp">Número de WhatsApp (opcional):</label>
        <input 
          type="text" 
          id="whatsapp" 
          bind:value={whatsappNumber} 
          placeholder="Ej: +5491112345678"
        />
        <small>Si proporcionas tu WhatsApp, te notificaremos cuando tu solicitud sea aprobada.</small>
      </div>
      
      <button class="submit-btn" on:click={submitRequest} disabled={loading}>
        {loading ? 'Enviando...' : 'Solicitar vinculación'}
      </button>
    </div>
  {/if}
</div>

<style>
  .artist-link-request {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1rem;
    position: relative;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  input, select {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .search-container {
    position: relative;
  }

  .spinner {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0, 0, 0, 0.1);
    border-top-color: #333;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: translateY(-50%) rotate(360deg); }
  }

  .search-results {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 0 0 4px 4px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 10;
  }

  .search-result-item {
    padding: 0.75rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .search-result-item:hover {
    background-color: #f0f0f0;
  }

  .selected-artist {
    margin-top: 1.5rem;
    padding: 1rem;
    background-color: #fff;
    border: 1px solid #eee;
    border-radius: 4px;
  }

  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: #555;
  }

  small {
    display: block;
    margin-top: 0.25rem;
    color: #777;
    font-size: 0.8rem;
  }

  .submit-btn {
    display: block;
    width: 100%;
    padding: 0.75rem;
    margin-top: 1.5rem;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .submit-btn:hover {
    background-color: #45a049;
  }

  .submit-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
</style>
