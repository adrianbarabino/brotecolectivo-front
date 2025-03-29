<script>
  import { onMount } from 'svelte';
  import { API, MEDIA_URL } from '../config.js';
  import { navigate } from 'svelte-routing';

  export let userId;
  
  let events = [];
  let loading = true;
  let error = null;

  onMount(async () => {
    await loadUserEvents();
  });

  async function loadUserEvents() {
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
      
      const res = await fetch(`${API}/events/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Error al cargar los eventos');
      }

      events = await res.json();
      
      // Formatear las fechas para mejor visualización
      events = events.map(event => {
        try {
          // Formato simple de fecha sin usar date-fns
          const startDate = new Date(event.date_start);
          const day = startDate.getDate();
          const month = startDate.getMonth() + 1;
          const year = startDate.getFullYear();
          event.formattedDate = `${day}/${month}/${year}`;
        } catch (e) {
          event.formattedDate = event.date_start;
        }
        return event;
      });
    } catch (err) {
      console.error('Error cargando eventos:', err);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function editEvent(id) {
    navigate(`/admin/events/edit/${id}`);
  }
</script>

<div class="user-events">
  <div class="header-actions">
    <h3>Mis Eventos</h3>
    <a href="/admin/events/add" class="add-btn">Crear nuevo evento</a>
  </div>

  {#if loading}
    <div class="loading">
      <p>Cargando eventos...</p>
    </div>
  {:else if error}
    <div class="error">
      <p>Error: {error}</p>
    </div>
  {:else if events.length === 0}
    <div class="empty-state">
      <p>No tienes eventos vinculados todavía.</p>
      <p>Puedes crear un nuevo evento desde tu panel.</p>
    </div>
  {:else}
    <div class="events-grid">
      {#each events as event}
        <div class="event-card">
          <div class="event-image">
            <img 
              src="{MEDIA_URL}events/{event.slug}.jpg" 
              alt="{event.title}"
              onerror="this.src='https://via.placeholder.com/300x300?text=Sin+imagen'"
            />
          </div>
          <div class="event-info">
            <h4>{event.title}</h4>
            <p class="event-date">{event.formattedDate}</p>
            <p class="event-venue">{event.venue ? event.venue.name : 'Sin venue'}</p>
            <button class="edit-btn" on:click={() => editEvent(event.id)}>
              Editar
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .user-events {
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
  
  .events-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .event-card {
    background-color: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .event-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  }
  
  .event-image {
    height: 180px;
    overflow: hidden;
  }
  
  .event-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s;
  }
  
  .event-card:hover .event-image img {
    transform: scale(1.05);
  }
  
  .event-info {
    padding: 1rem;
  }
  
  .event-info h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.2rem;
  }
  
  .event-date, .event-venue {
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
