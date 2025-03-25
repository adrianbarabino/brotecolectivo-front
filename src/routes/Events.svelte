<script>
    import { onMount } from 'svelte';
  
    let events = [];
    let error = '';
    let loading = true;
    let mediaUrl = 'https://brotecolectivo.sfo3.cdn.digitaloceanspaces.com/';
  
    const API = 'http://www.adrianbarabino.com:3055';
    const TOKEN = 'token-secreto';
  
    onMount(async () => {
      try {
        const res = await fetch(`${API}/events`, {
          headers: {
            Authorization: `Bearer ${TOKEN}`
          }
        });
        if (!res.ok) throw new Error('Error al obtener eventos');
        events = await res.json();
      } catch (err) {
        error = err.message;
      } finally {
        events = events.map(event => ({
        ...event,
        image: `${mediaUrl}events/${event.slug}.jpg`
      }));
      
        loading = false;
      }
    });
  </script>
  
  <style>
    main {
      background-color: #f5f5f5;
      color: #222;
      min-height: 100vh;
      padding: 2rem;
      font-family: system-ui, sans-serif;
    }
  
    h1 {
      font-size: 2rem;
      margin-bottom: 2rem;
      text-align: center;
    }
  
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
    }
  
    .card {
      background: #fff;
      border-radius: 10px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: transform 0.2s ease;
    }
  
    .card:hover {
      transform: translateY(-5px);
    }
  
    .title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: #333;
    }
  
    .info {
      font-size: 0.95rem;
      color: #555;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
  
    .bands {
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }
  
    .more-btn {
      margin-top: 1rem;
      align-self: flex-start;
      background: #0077cc;
      color: #fff;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: bold;
      font-size: 0.9rem;
      text-decoration: none;
    }
  
    .more-btn:hover {
      background-color: #005fa3;
    }
  </style>
  
  <main>
    <h1>Agenda Cultural</h1>
  
    {#if loading}
      <p>Cargando eventos...</p>
    {:else if error}
      <p style="color: red">{error}</p>
    {:else if events.length === 0}
      <p>No hay eventos disponibles.</p>
    {:else}
      <div class="grid">
        {#each events as event}
          <div class="card">
            <div class="title">{event.title}</div>
            <div class="info">
              <img src={event.image} alt={event.title} style="width: 100%; border-radius: 10px; margin-bottom: 0.5rem;" />
              📅 {event.date_start} — {event.date_end}<br />
              📍 {event.venue?.name}
            </div>
  
            {#if event.bands && event.bands.length}
              <div class="bands">
                <strong>Bandas:</strong>
                <ul>
                  {#each event.bands as band}
                    <li>{band.name}</li>
                  {/each}
                </ul>
              </div>
            {/if}
  
            <button class="more-btn">Ver más detalles</button>
          </div>
        {/each}
      </div>
    {/if}
  </main>
  