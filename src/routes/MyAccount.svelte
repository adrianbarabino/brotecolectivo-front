<script>
    import Header from '../components/Header.svelte';
    import { user } from '../stores/user.js';
    import { onMount } from 'svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';
    import { links } from 'svelte-routing';
  
    let artistLinks = [];
    let loading = true;
    let error = '';
  
    $: loggedUser = $user;
  
    onMount(async () => {
      if (!loggedUser.loggedIn) return;
  
      try {
        const res = await fetch(`${API}/users/${loggedUser.id}/artists`);
        if (!res.ok) throw new Error('Error al obtener datos');
  
        artistLinks = await res.json();
      } catch (err) {
        error = 'No se pudo obtener la info del usuario';
      } finally {
        loading = false;
      }
    });
  
    async function solicitarVinculacion() {
      const artistId = prompt('Ingresá el ID del artista con el que querés vincularte:');
      if (!artistId) return;
  
      const res = await fetch(`${API}/artist-link-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: loggedUser.id,
          artist_id: artistId,
          rol: 'colaborador'
        })
      });
  
      if (res.ok) {
        alert('Solicitud enviada');
      } else {
        alert('Error al enviar solicitud');
      }
    }
  </script>
  
  <Header title="Mi Cuenta" subhead="Tu información y vinculación artística" />
  
  <section class="container">
    <div class="card">
      <h2 class="title">Hola, {loggedUser.name}</h2>
      <p><strong>Email:</strong> {loggedUser.email}</p>
      <p><strong>Rol general:</strong> {loggedUser.role}</p>
    </div>
  
    <div class="card">
      <h3>Artistas vinculados</h3>
  
      {#if loading}
        <p class="info">Cargando...</p>
      {:else if error}
        <p class="error">{error}</p>
      {:else if artistLinks.length === 0}
        <p class="info">No estás vinculado con ningún artista todavía.</p>
      {:else}
        <ul class="artist-list">
          {#each artistLinks as link}
            <li class="artist-item">
              <span class="artist-name">{link.artist_name}</span>
              <span class="rol">Rol: {link.rol}</span>
              <span class="estado">Estado: {link.estado}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  
    <div class="actions">
      <button class="btn" on:click={solicitarVinculacion}>Solicitar vinculación con un artista</button>
      <a href="/admin/artists/add" use:links class="btn btn-primary">Solicitar creación de artista</a>
      <a href="/admin/events/add" use:links class="btn btn-primary">Solicitar creación de evento</a>
    </div>
  </section>
  
  <style>
    section.container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
  
    .card {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 10px;
      box-shadow: 0 1px 5px rgba(0, 0, 0, 0.1);
    }
  
    .title {
      margin-bottom: 1rem;
    }
  
    .artist-list {
      list-style: none;
      padding: 0;
      margin-top: 1rem;
    }
  
    .artist-item {
      padding: 1rem;
      background: #fff;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin-bottom: 0.5rem;
      display: flex;
      flex-direction: column;
    }
  
    .artist-name {
      font-weight: bold;
      margin-bottom: 0.3rem;
    }
  
    .rol,
    .estado {
      font-size: 0.9rem;
      color: #555;
    }
  
    .info {
      color: #666;
    }
  
    .error {
      color: red;
      font-weight: bold;
    }
  
    .actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
  
    .btn {
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 6px;
      background-color: #444;
      color: white;
      cursor: pointer;
      font-size: 1rem;
      transition: background-color 0.2s;
      text-align: center;
      text-decoration: none;
    }
  
    .btn:hover {
      background-color: #222;
    }
  
    .btn-primary {
      background-color: #007BFF;
    }
  
    .btn-primary:hover {
      background-color: #0056b3;
    }
  </style>
  