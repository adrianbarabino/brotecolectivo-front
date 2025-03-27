<script>
    import Header from '../components/Header.svelte';
    import { user } from '../stores/user.js';
    import { onMount } from 'svelte';
    import { API, TOKEN, MEDIA_URL } from '../config.js';

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
  
      const res = await fetch('${API}/artist-link-request', {
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
    <h2>Hola, {loggedUser.name}</h2>
    <p><strong>Email:</strong> {loggedUser.email}</p>
    <p><strong>Rol general:</strong> {loggedUser.role}</p>
  
    <h3>Artistas vinculados</h3>
  
    {#if loading}
      <p>Cargando...</p>
    {:else if error}
      <p>{error}</p>
    {:else if artistLinks.length === 0}
      <p>No estás vinculado con ningún artista todavía.</p>
    {:else}
      <ul>
        {#each artistLinks as link}
          <li>
            <strong>{link.artist_name}</strong> — Rol: {link.rol} — Estado: {link.estado}
          </li>
        {/each}
      </ul>
    {/if}
  
    <button on:click={solicitarVinculacion}>Solicitar vinculación con un artista</button>
  </section>
  
  <style>
    section.container {
      max-width: 700px;
      margin: 2rem auto;
      padding: 1rem;
    }
  </style>
  